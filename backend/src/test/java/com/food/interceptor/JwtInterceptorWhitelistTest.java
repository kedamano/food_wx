package com.food.interceptor;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 白名单精确匹配单元测试：锁定 AntPathMatcher 行为，
 * 防止 uri.contains() 式前缀伪造回归（如 /user/registerHACK 被误放行）。
 */
@DisplayName("Jwt 白名单精确匹配")
class JwtInterceptorWhitelistTest {

    private final JwtInterceptor interceptor = new JwtInterceptor();

    @Test
    @DisplayName("精确路径命中白名单")
    void exactPathsWhitelisted() {
        assertTrue(interceptor.isWhitelisted("/user/register"));
        assertTrue(interceptor.isWhitelisted("/user/login"));
        assertTrue(interceptor.isWhitelisted("/user/refresh-token"));
        assertTrue(interceptor.isWhitelisted("/order/pay-notify"));
        assertTrue(interceptor.isWhitelisted("/food/banners"));
    }

    @Test
    @DisplayName("前缀伪造路径不放行（旧 contains 实现会放行）")
    void prefixSpoofsBlocked() {
        assertFalse(interceptor.isWhitelisted("/user/registerHACK"));
        assertFalse(interceptor.isWhitelisted("/user/login-history"));
        assertFalse(interceptor.isWhitelisted("/order/pay-notify-evil"));
    }

    @Test
    @DisplayName("通配与静态资源命中")
    void wildcardsMatch() {
        assertTrue(interceptor.isWhitelisted("/store/1"));
        assertTrue(interceptor.isWhitelisted("/images/foods/a.png"));
        assertTrue(interceptor.isWhitelisted("/region/tree"));
    }

    @Test
    @DisplayName("受保护接口不在白名单")
    void protectedPathsBlocked() {
        assertFalse(interceptor.isWhitelisted("/order/1"));
        assertFalse(interceptor.isWhitelisted("/order/user/1"));
        assertFalse(interceptor.isWhitelisted("/cart/user/1"));
        assertFalse(interceptor.isWhitelisted("/review/food/1"));
    }
}
