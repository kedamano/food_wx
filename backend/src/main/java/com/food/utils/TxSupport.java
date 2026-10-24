package com.food.utils;

import org.springframework.transaction.interceptor.TransactionAspectSupport;

/**
 * 事务辅助：在 catch 中安全标记回滚。
 * 方法被 @Transactional 代理时生效；无事务上下文（如纯单元测试）时静默跳过。
 */
public final class TxSupport {

    private TxSupport() {
    }

    public static void rollbackIfActive() {
        try {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        } catch (org.springframework.transaction.NoTransactionException ignored) {
            // 当前无事务上下文，无需回滚
        }
    }
}
