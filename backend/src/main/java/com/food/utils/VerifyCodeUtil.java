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

    // 存储验证码的缓存，key为手机号，value为验证码
    private static final ConcurrentHashMap<String, String> verifyCodeCache = new ConcurrentHashMap<>();

    // 存储验证码发送时间的缓存，用于限制发送频率
    private static final ConcurrentHashMap<String, Long> lastSendTimeCache = new ConcurrentHashMap<>();

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
        verifyCodeCache.put(phone, code);
        lastSendTimeCache.put(phone, System.currentTimeMillis());
    }

    /**
     * 验证验证码是否正确
     * @param phone 手机号
     * @param code 用户输入的验证码
     * @return 验证是否成功
     */
    public static boolean verifyCode(String phone, String code) {
        String storedCode = verifyCodeCache.get(phone);
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
        verifyCodeCache.remove(phone);
        lastSendTimeCache.remove(phone);
    }

    /**
     * 检查是否可以发送验证码
     * @param phone 手机号
     * @return 是否可以发送
     */
    public static boolean canSendCode(String phone) {
        Long lastSendTime = lastSendTimeCache.get(phone);
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
        Long lastSendTime = lastSendTimeCache.get(phone);
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
        long currentTime = System.currentTimeMillis();
        verifyCodeCache.forEach((phone, code) -> {
            Long lastSendTime = lastSendTimeCache.get(phone);
            if (lastSendTime != null) {
                long elapsedMinutes = (currentTime - lastSendTime) / (60 * 1000);
                if (elapsedMinutes >= CODE_EXPIRE_MINUTES) {
                    verifyCodeCache.remove(phone);
                    lastSendTimeCache.remove(phone);
                }
            }
        });
    }

    /**
     * 关闭资源
     */
    public static void shutdown() {
        scheduler.shutdown();
    }
}