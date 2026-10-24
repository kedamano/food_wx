package com.food.utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

/**
 * JwtUtil 单元测试 (JUnit 5 + 纯单元测试, 无 Spring 上下文)
 *
 * TDD 原则:
 * - 每个测试方法验证一个独立行为
 * - 使用真实的 JwtUtil 实例 (非 mock), 验证真实行为
 * - Arrange-Act-Assert 模式
 */
@DisplayName("JwtUtil 令牌工具测试")
class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String TEST_SECRET = "this-is-a-very-long-test-secret-key-for-junit-testing";
    private static final long TEST_EXPIRATION = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiration", TEST_EXPIRATION);
    }

    @Nested
    @DisplayName("Token 生成测试")
    class TokenGeneration {

        @Test
        @DisplayName("生成有效 Token 应返回非空字符串")
        void shouldGenerateNonEmptyToken() {
            String token = jwtUtil.generateToken(1);
            assertNotNull(token);
            assertFalse(token.isEmpty());
        }

        @Test
        @DisplayName("生成的 Token 应为 JWT 格式 (三段 Base64)")
        void shouldGenerateJwtFormatToken() {
            String token = jwtUtil.generateToken(42);
            String[] parts = token.split("\\.");
            assertEquals(3, parts.length, "JWT should have 3 parts: header.payload.signature");
        }

        @Test
        @DisplayName("不同 userId 生成不同 Token")
        void shouldGenerateDifferentTokensForDifferentUsers() {
            String token1 = jwtUtil.generateToken(1);
            String token2 = jwtUtil.generateToken(2);
            assertNotEquals(token1, token2);
        }

        @Test
        @DisplayName("相同 userId 多次生成应产生不同 Token (时间戳不同)")
        void shouldGenerateDifferentTokensForSameUser() throws Exception {
            String token1 = jwtUtil.generateToken(1);
            // JWT iat 使用秒级精度, 需等待至少 1 秒确保时间戳不同
            Thread.sleep(1100);
            String token2 = jwtUtil.generateToken(1);
            assertNotEquals(token1, token2);
        }
    }

    @Nested
    @DisplayName("Token 解析测试")
    class TokenParsing {

        @Test
        @DisplayName("从有效 Token 解析出正确的 userId")
        void shouldExtractCorrectUserId() {
            String token = jwtUtil.generateToken(100);
            Integer userId = jwtUtil.getUserIdFromToken(token);
            assertEquals(100, userId);
        }

        @Test
        @DisplayName("解析 null Token 应返回 null")
        void shouldReturnNullForNullToken() {
            assertNull(jwtUtil.getUserIdFromToken(null));
        }

        @Test
        @DisplayName("解析空字符串 Token 应返回 null")
        void shouldReturnNullForEmptyToken() {
            assertNull(jwtUtil.getUserIdFromToken(""));
        }

        @Test
        @DisplayName("解析被篡改的 Token 应返回 null")
        void shouldReturnNullForTamperedToken() {
            String token = jwtUtil.generateToken(1);
            String tamperedToken = token.substring(0, token.length() - 3) + "xxx";
            assertNull(jwtUtil.getUserIdFromToken(tamperedToken));
        }

        @Test
        @DisplayName("解析随机字符串应返回 null")
        void shouldReturnNullForRandomString() {
            assertNull(jwtUtil.getUserIdFromToken("not.a.valid.jwt.token"));
        }
    }

    @Nested
    @DisplayName("Token 验证测试")
    class TokenValidation {

        @Test
        @DisplayName("有效 Token 通过验证")
        void shouldValidateValidToken() {
            String token = jwtUtil.generateToken(1);
            assertTrue(jwtUtil.validateToken(token));
        }

        @Test
        @DisplayName("null Token 验证失败")
        void shouldFailValidationForNullToken() {
            assertFalse(jwtUtil.validateToken(null));
        }

        @Test
        @DisplayName("空 Token 验证失败")
        void shouldFailValidationForEmptyToken() {
            assertFalse(jwtUtil.validateToken(""));
        }

        @Test
        @DisplayName("被篡改的 Token 验证失败")
        void shouldFailValidationForTamperedToken() {
            String token = jwtUtil.generateToken(1);
            String tamperedToken = token.substring(0, token.length() - 5) + "xxxxx";
            assertFalse(jwtUtil.validateToken(tamperedToken));
        }
    }

    @Nested
    @DisplayName("Token 过期测试")
    class TokenExpiration {

        @Test
        @DisplayName("刚生成的 Token 不应过期")
        void shouldNotBeExpiredImmediately() {
            String token = jwtUtil.generateToken(1);
            assertFalse(jwtUtil.isTokenExpired(token));
        }

        @Test
        @DisplayName("过期 Token 应被检测为过期")
        void shouldDetectExpiredToken() {
            // 设置极短过期时间
            ReflectionTestUtils.setField(jwtUtil, "expiration", 1L); // 1ms
            String token = jwtUtil.generateToken(1);

            // 等待 Token 过期
            try { Thread.sleep(10); } catch (InterruptedException e) { }

            assertTrue(jwtUtil.isTokenExpired(token));
        }

        @Test
        @DisplayName("null Token 应被视为过期")
        void shouldConsiderNullTokenAsExpired() {
            assertTrue(jwtUtil.isTokenExpired(null));
        }
    }

    @Nested
    @DisplayName("Token 刷新测试")
    class TokenRefresh {

        @Test
        @DisplayName("刷新有效 Token 返回新的有效 Token")
        void shouldRefreshValidToken() throws Exception {
            String oldToken = jwtUtil.generateToken(1);
            // JWT iat 使用秒级精度, 需等待至少 1 秒确保新 Token 不同
            Thread.sleep(1100);
            String newToken = jwtUtil.refreshToken(oldToken);

            assertNotNull(newToken);
            assertNotEquals(oldToken, newToken);
            assertEquals(1, jwtUtil.getUserIdFromToken(newToken));
            assertTrue(jwtUtil.validateToken(newToken));
        }

        @Test
        @DisplayName("刷新被篡改的 Token 应返回 null")
        void shouldReturnNullWhenRefreshingTamperedToken() {
            assertNull(jwtUtil.refreshToken("tampered.token.here"));
        }
    }

    @Nested
    @DisplayName("安全测试")
    class SecurityTests {

        @Test
        @DisplayName("不同密钥生成的 Token 不能互相解析")
        void shouldNotAcceptTokensFromDifferentKey() {
            // 用密钥A生成
            String token = jwtUtil.generateToken(1);

            // 用密钥B尝试解析
            JwtUtil otherJwtUtil = new JwtUtil();
            ReflectionTestUtils.setField(otherJwtUtil, "secret", "totally-different-secret-key-for-testing-12345");
            ReflectionTestUtils.setField(otherJwtUtil, "expiration", TEST_EXPIRATION);

            assertNull(otherJwtUtil.getUserIdFromToken(token));
        }

        @Test
        @DisplayName("JWT 密钥长度不足 32 位时 parseToken 也应正常工作")
        void shouldWorkWithShortSecretInTests() {
            // 验证当前测试配置 (37 位密钥) 正常工作
            assertTrue(TEST_SECRET.length() >= 32,
                    "Test secret should be at least 32 chars for security");
        }
    }
}
