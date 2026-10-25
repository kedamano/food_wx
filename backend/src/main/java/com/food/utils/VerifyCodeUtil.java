package com.food.utils;

import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * 验证码工具类
 * 生成验证码并管理验证码的有效期
 */
public class VerifyCodeUtil {

    /**
     * 验证码存储：默认 JVM 内存；cache.type=redis 时由 VerifyCodeRedisBridge
     * 在启动时切换为 Redis 实现（多实例部署共享限频/防重放数据）。
     */
    public interface CodeStore {
        void save(String phone, String code, int ttlSeconds);
        String get(String phone);
        void remove(String phone);
        void saveSentAt(String phone, long epochMilli, int ttlSeconds);
        Long getSentAt(String phone);
    }

    /** 默认内存实现（带 TTL 判定，单实例开发/部署） */
    static class MemoryStore implements CodeStore {
        private final ConcurrentHashMap<String, String> codes = new ConcurrentHashMap<>();
        private final ConcurrentHashMap<String, Long> sentAt = new ConcurrentHashMap<>();
        private final ConcurrentHashMap<String, Long> codeDeadline = new ConcurrentHashMap<>();

        public void save(String phone, String code, int ttlSeconds) {
            codes.put(phone, code);
            codeDeadline.put(phone, System.currentTimeMillis() + ttlSeconds * 1000L);
        }
        public String get(String phone) {
            Long dl = codeDeadline.get(phone);
            if (dl != null && dl < System.currentTimeMillis()) {
                codes.remove(phone);
                codeDeadline.remove(phone);
                return null;
            }
            return codes.get(phone);
        }
        public void remove(String phone) {
            codes.remove(phone);
            codeDeadline.remove(phone);
            sentAt.remove(phone);
        }
        public void saveSentAt(String phone, long epochMilli, int ttlSeconds) {
            sentAt.put(phone, epochMilli);
        }
        public Long getSentAt(String phone) {
            Long at = sentAt.get(phone);
            if (at != null && System.currentTimeMillis() - at > 24 * 3600 * 1000L) {
                sentAt.remove(phone);
                return null;
            }
            return at;
        }
    }

    private static volatile CodeStore store = new MemoryStore();

    /** 供 Spring 启动时注入 Redis 实现（见 VerifyCodeRedisBridge） */
    public static void setStore(CodeStore externalStore) {
        store = externalStore;
    }


    // 验证码有效期（分钟）
    private static final int CODE_EXPIRE_MINUTES = 5;

    // 发送间隔限制（秒）
    private static final int SEND_INTERVAL_SECONDS = 60;

    // 定时清理过期验证码的线程池
    private static final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    static {
        // 启动定时任务，每分钟清理一次过期的验证码
        scheduler.scheduleAtFixedRate(VerifyCodeUtil::cleanExpiredCodes, 1, 1, TimeUnit.MINUTES);
    }

    /**
     * 生成6位数字验证码
     * @return 验证码字符串
     */
    public static String generateVerifyCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }

    /**
     * 存储验证码到缓存
     * @param phone 手机号
     * @param code 验证码
     */
    public static void storeVerifyCode(String phone, String code) {
        int ttl = CODE_EXPIRE_MINUTES * 60 + 60;
        store.save(phone, code, ttl);
        store.saveSentAt(phone, System.currentTimeMillis(), ttl);
    }

    /**
     * 验证验证码是否正确
     * @param phone 手机号
     * @param code 用户输入的验证码
     * @return 验证是否成功
     */
    public static boolean verifyCode(String phone, String code) {
        if (phone == null || code == null) {
            return false;
        }
        String storedCode = store.get(phone);
        if (storedCode == null) {
            return false;
        }
        return storedCode.equals(code);
    }

    /**
     * 清除验证码
     * @param phone 手机号
     */
    public static void clearVerifyCode(String phone) {
        store.remove(phone);
    }

    /**
     * 检查是否可以发送验证码
     * @param phone 手机号
     * @return 是否可以发送
     */
    public static boolean canSendCode(String phone) {
        Long lastSendTime = store.getSentAt(phone);
        if (lastSendTime == null) {
            return true;
        }
        long currentTime = System.currentTimeMillis();
        return (currentTime - lastSendTime) >= SEND_INTERVAL_SECONDS * 1000;
    }

    /**
     * 获取剩余等待时间
     * @param phone 手机号
     * @return 剩余等待时间（秒）
     */
    public static long getRemainingWaitTime(String phone) {
        Long lastSendTime = store.getSentAt(phone);
        if (lastSendTime == null) {
            return 0;
        }
        long currentTime = System.currentTimeMillis();
        long elapsedSeconds = (currentTime - lastSendTime) / 1000;
        return Math.max(0, SEND_INTERVAL_SECONDS - elapsedSeconds);
    }

    /**
     * 清理过期的验证码
     */
    private static void cleanExpiredCodes() {
        // 过期清理由存储层 TTL 负责：MemoryStore 由 save 时记录的时间判定（见 get 判空逻辑演进），
        // RedisStore 由 key TTL 自动过期。此处保留空实现以兼容既有调度线程。
    }

    /**
     * 关闭资源
     */
    public static void shutdown() {
        scheduler.shutdown();
    }
}