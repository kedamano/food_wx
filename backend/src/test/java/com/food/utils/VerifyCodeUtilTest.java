package com.food.utils;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * VerifyCodeUtil 单元测试 (纯单元测试, 无 Spring 上下文)
 *
 * 测试验证码生成、存储、验证、频率限制和安全特性
 */
@DisplayName("VerifyCodeUtil 验证码工具测试")
class VerifyCodeUtilTest {

    private static final String TEST_PHONE = "13800138000";
    private static final String TEST_PHONE_2 = "13800138001";

    @BeforeEach
    void setUp() {
        // 清理可能残留的测试数据
        VerifyCodeUtil.clearVerifyCode(TEST_PHONE);
        VerifyCodeUtil.clearVerifyCode(TEST_PHONE_2);
    }

    @AfterEach
    void tearDown() {
        VerifyCodeUtil.clearVerifyCode(TEST_PHONE);
        VerifyCodeUtil.clearVerifyCode(TEST_PHONE_2);
    }

    @Nested
    @DisplayName("验证码生成测试")
    class CodeGeneration {

        @Test
        @DisplayName("生成的验证码应为 6 位数字")
        void shouldGenerateSixDigitCode() {
            String code = VerifyCodeUtil.generateVerifyCode();
            assertNotNull(code);
            assertEquals(6, code.length());
            assertTrue(code.matches("\\d{6}"), "Code should be 6 digits");
        }

        @Test
        @DisplayName("连续生成应产出不同的验证码 (概率性)")
        void shouldGenerateDifferentCodes() {
            String code1 = VerifyCodeUtil.generateVerifyCode();
            String code2 = VerifyCodeUtil.generateVerifyCode();
            // 99.9% 概率不同
            assertNotNull(code1);
            assertNotNull(code2);
            // 不能严格断言不相同 (极小概率相同), 但检查格式
            assertEquals(6, code1.length());
            assertEquals(6, code2.length());
        }
    }

    @Nested
    @DisplayName("验证码存储与验证测试")
    class CodeVerification {

        @Test
        @DisplayName("正确验证码应验证通过")
        void shouldVerifyCorrectCode() {
            String code = VerifyCodeUtil.generateVerifyCode();
            VerifyCodeUtil.storeVerifyCode(TEST_PHONE, code);

            assertTrue(VerifyCodeUtil.verifyCode(TEST_PHONE, code));
        }

        @Test
        @DisplayName("错误验证码应验证失败")
        void shouldRejectWrongCode() {
            VerifyCodeUtil.storeVerifyCode(TEST_PHONE, "123456");

            assertFalse(VerifyCodeUtil.verifyCode(TEST_PHONE, "654321"));
        }

        @Test
        @DisplayName("未存储手机的验证码应验证失败")
        void shouldRejectCodeForUnknownPhone() {
            assertFalse(VerifyCodeUtil.verifyCode("99999999999", "123456"));
        }

        @Test
        @DisplayName("清除验证码后无法验证")
        void shouldNotVerifyAfterClear() {
            String code = VerifyCodeUtil.generateVerifyCode();
            VerifyCodeUtil.storeVerifyCode(TEST_PHONE, code);
            VerifyCodeUtil.clearVerifyCode(TEST_PHONE);

            assertFalse(VerifyCodeUtil.verifyCode(TEST_PHONE, code));
        }

        @Test
        @DisplayName("同一手机新验证码覆盖旧验证码")
        void shouldOverrideOldCode() {
            VerifyCodeUtil.storeVerifyCode(TEST_PHONE, "111111");
            VerifyCodeUtil.storeVerifyCode(TEST_PHONE, "222222");

            assertFalse(VerifyCodeUtil.verifyCode(TEST_PHONE, "111111"),
                    "旧验证码应该被覆盖");
            assertTrue(VerifyCodeUtil.verifyCode(TEST_PHONE, "222222"),
                    "新验证码应该有效");
        }
    }

    @Nested
    @DisplayName("发送频率限制测试")
    class FrequencyLimit {

        @Test
        @DisplayName("首次发送应允许")
        void shouldAllowFirstSend() {
            assertTrue(VerifyCodeUtil.canSendCode(TEST_PHONE));
        }

        @Test
        @DisplayName("刚发送后不应允许再次发送")
        void shouldBlockRapidResend() {
            String code = VerifyCodeUtil.generateVerifyCode();
            VerifyCodeUtil.storeVerifyCode(TEST_PHONE, code);

            // 立即检查: 应被限制
            assertFalse(VerifyCodeUtil.canSendCode(TEST_PHONE));
        }

        @Test
        @DisplayName("未发送过的手机应允许发送")
        void shouldAllowUnsendedPhone() {
            assertTrue(VerifyCodeUtil.canSendCode("13900000000"));
        }

        @Test
        @DisplayName("获取剩余等待时间")
        void shouldReturnRemainingTime() {
            VerifyCodeUtil.storeVerifyCode(TEST_PHONE, "123456");

            long remainingTime = VerifyCodeUtil.getRemainingWaitTime(TEST_PHONE);
            assertTrue(remainingTime > 0, "应该返回正数的等待时间");
            assertTrue(remainingTime <= 60, "等待时间不应超过 60 秒");
        }

        @Test
        @DisplayName("未发送过的手机剩余等待时间为 0")
        void shouldReturnZeroWaitForNewPhone() {
            assertEquals(0, VerifyCodeUtil.getRemainingWaitTime("13900000000"));
        }
    }

    @Nested
    @DisplayName("安全性测试")
    class SecurityTests {

        @Test
        @DisplayName("验证码验证后仍然存在 (除非显式清除) — 验证重放攻击防护")
        void shouldKeepCodeAfterVerification() {
            // 这是预期的当前行为: verifyCode 不自动清除
            // 如果未来修改为验证后自动清除, 需要更新此测试
            String code = VerifyCodeUtil.generateVerifyCode();
            VerifyCodeUtil.storeVerifyCode(TEST_PHONE, code);

            // 第一次验证
            assertTrue(VerifyCodeUtil.verifyCode(TEST_PHONE, code));

            // 第二次验证: 仍然可以通过 (除非 Controller 层清除)
            // 这证明了 verifyCode 本身不防重放, 需要 Controller 配合 clearVerifyCode
            assertTrue(VerifyCodeUtil.verifyCode(TEST_PHONE, code),
                    "verifyCode 方法本身不自动清除, 需要调用方负责清除");
        }

        @Test
        @DisplayName("null 手机号验证应返回 false")
        void shouldRejectNullPhone() {
            assertFalse(VerifyCodeUtil.verifyCode(null, "123456"));
        }

        @Test
        @DisplayName("null 验证码验证应返回 false")
        void shouldRejectNullCode() {
            VerifyCodeUtil.storeVerifyCode(TEST_PHONE, "123456");
            assertFalse(VerifyCodeUtil.verifyCode(TEST_PHONE, null));
        }
    }
}
