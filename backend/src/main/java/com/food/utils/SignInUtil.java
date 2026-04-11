package com.food.utils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 签到工具类
 * 管理用户每日签到记录，防止重复签到
 */
public class SignInUtil {

    // 存储用户签到记录，key为用户ID_日期，value为签到时间戳
    private static final ConcurrentHashMap<String, Long> signInCache = new ConcurrentHashMap<>();

    // 日期格式化器
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // 签到奖励积分
    public static final int SIGN_IN_POINTS = 20;

    /**
     * 检查用户今天是否已经签到
     * @param userId 用户ID
     * @return 是否已经签到
     */
    public static boolean hasSignedInToday(Integer userId) {
        String key = buildKey(userId);
        return signInCache.containsKey(key);
    }

    /**
     * 记录用户签到
     * @param userId 用户ID
     * @return 是否签到成功（如果已签到则返回false）
     */
    public static boolean recordSignIn(Integer userId) {
        String key = buildKey(userId);
        if (signInCache.containsKey(key)) {
            return false; // 已经签到过了
        }
        signInCache.put(key, System.currentTimeMillis());
        return true;
    }

    /**
     * 获取用户今天的签到时间
     * @param userId 用户ID
     * @return 签到时间戳，未签到返回null
     */
    public static Long getSignInTime(Integer userId) {
        String key = buildKey(userId);
        return signInCache.get(key);
    }

    /**
     * 获取用户连续签到天数
     * @param userId 用户ID
     * @return 连续签到天数
     */
    public static int getConsecutiveDays(Integer userId) {
        int consecutiveDays = 0;
        LocalDate today = LocalDate.now();

        // 检查今天是否签到
        if (hasSignedInToday(userId)) {
            consecutiveDays++;
        }

        // 检查之前连续签到的天数
        for (int i = 1; i <= 30; i++) { // 最多检查30天
            LocalDate checkDate = today.minusDays(i);
            String key = userId + "_" + checkDate.format(DATE_FORMATTER);
            if (signInCache.containsKey(key)) {
                consecutiveDays++;
            } else {
                break; // 不连续则停止
            }
        }

        return consecutiveDays;
    }

    /**
     * 清理过期签到记录（保留最近30天）
     */
    public static void cleanExpiredRecords() {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        String cutoffDate = thirtyDaysAgo.format(DATE_FORMATTER);

        signInCache.entrySet().removeIf(entry -> {
            String key = entry.getKey();
            // key格式: userId_yyyy-MM-dd
            int lastUnderscoreIndex = key.lastIndexOf('_');
            if (lastUnderscoreIndex > 0) {
                String dateStr = key.substring(lastUnderscoreIndex + 1);
                return dateStr.compareTo(cutoffDate) < 0;
            }
            return false;
        });
    }

    /**
     * 构建缓存key
     * @param userId 用户ID
     * @return key字符串
     */
    private static String buildKey(Integer userId) {
        return userId + "_" + LocalDate.now().format(DATE_FORMATTER);
    }
}
