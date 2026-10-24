package com.food.service;

import com.food.dto.BaseResult;
import com.food.entity.PointsLog;
import com.food.entity.User;
import com.food.mapper.PointsLogMapper;
import com.food.mapper.UserMapper;
import com.food.utils.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

/**
 * UserService 单元测试 (Mockito 隔离测试)
 *
 * TDD 红-绿-重构:
 * 这些测试验证 UserService 的核心业务逻辑,
 * 使用 Mockito mock 所有外部依赖 (Mapper, JwtUtil)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService 用户服务测试")
class UserServiceTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private PointsLogMapper pointsLogMapper;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    // BCrypt 需要手动注入 (不是 Spring Bean)
    @BeforeEach
    void setUp() {
        // UserService 内部 new BCryptPasswordEncoder(), 不需要额外设置
    }

    @Nested
    @DisplayName("注册测试")
    class RegisterTests {

        @Test
        @DisplayName("正常注册应返回成功并包含 Token")
        void shouldRegisterSuccessfully() {
            User user = new User();
            user.setUserId(100); // 模拟数据库自增ID
            user.setUsername("newuser");
            user.setPhone("13800138000");
            user.setPassword("password123");

            when(userMapper.selectByUsername("newuser")).thenReturn(null);
            when(userMapper.selectByPhone("13800138000")).thenReturn(null);
            when(userMapper.insert(any(User.class))).thenReturn(1);
            when(jwtUtil.generateToken(100)).thenReturn("mock-jwt-token");

            BaseResult result = userService.register(user);

            assertEquals(200, result.getCode());
            assertTrue(result.getMessage().contains("注册成功"));
        }

        @Test
        @DisplayName("用户名已存在应返回 400")
        void shouldRejectDuplicateUsername() {
            User existingUser = new User();
            existingUser.setUsername("existing");

            User newUser = new User();
            newUser.setUsername("existing");
            newUser.setPhone("13800138000");
            newUser.setPassword("password123");

            when(userMapper.selectByUsername("existing")).thenReturn(existingUser);

            BaseResult result = userService.register(newUser);

            assertEquals(400, result.getCode());
            assertTrue(result.getMessage().contains("用户名已存在"));
            verify(userMapper, never()).insert(any());
        }

        @Test
        @DisplayName("手机号已注册应返回 400")
        void shouldRejectDuplicatePhone() {
            User existingUser = new User();
            existingUser.setPhone("13800138000");

            User newUser = new User();
            newUser.setUsername("newuser");
            newUser.setPhone("13800138000");
            newUser.setPassword("password123");

            when(userMapper.selectByUsername("newuser")).thenReturn(null);
            when(userMapper.selectByPhone("13800138000")).thenReturn(existingUser);

            BaseResult result = userService.register(newUser);

            assertEquals(400, result.getCode());
            assertTrue(result.getMessage().contains("手机号已注册"));
            verify(userMapper, never()).insert(any());
        }

        @Test
        @DisplayName("注册密码应被 BCrypt 加密")
        void shouldEncryptPassword() {
            User user = new User();
            user.setUsername("cryptouser");
            user.setPhone("13800138000");
            user.setPassword("plaintext");

            when(userMapper.selectByUsername("cryptouser")).thenReturn(null);
            when(userMapper.selectByPhone("13800138000")).thenReturn(null);
            when(userMapper.insert(any(User.class))).thenReturn(1);
            when(jwtUtil.generateToken(anyInt())).thenReturn("token");

            userService.register(user);

            // 验证密码已被加密 (不再是明文)
            verify(userMapper).insert(argThat(u ->
                    u.getPassword() != null && !"plaintext".equals(u.getPassword())));
        }
    }

    @Nested
    @DisplayName("登录测试")
    class LoginTests {

        @Test
        @DisplayName("正确凭据登录应返回 Token")
        void shouldLoginWithCorrectCredentials() {
            User dbUser = new User();
            dbUser.setUserId(1);
            dbUser.setUsername("testuser");
            dbUser.setPassword(new BCryptPasswordEncoder().encode("correct_password"));

            when(userMapper.selectByUsername("testuser")).thenReturn(dbUser);
            when(jwtUtil.generateToken(1)).thenReturn("login-token");

            BaseResult result = userService.login("testuser", "correct_password");

            assertEquals(200, result.getCode());
        }

        @Test
        @DisplayName("错误密码登录应返回 400")
        void shouldRejectWrongPassword() {
            User dbUser = new User();
            dbUser.setUserId(1);
            dbUser.setUsername("testuser");
            dbUser.setPassword(new BCryptPasswordEncoder().encode("correct_password"));

            when(userMapper.selectByUsername("testuser")).thenReturn(dbUser);

            BaseResult result = userService.login("testuser", "wrong_password");

            assertEquals(400, result.getCode());
            assertTrue(result.getMessage().contains("密码错误"));
        }

        @Test
        @DisplayName("不存在的用户登录应返回 400")
        void shouldRejectNonexistentUser() {
            when(userMapper.selectByUsername("nobody")).thenReturn(null);
            when(userMapper.selectByPhone("nobody")).thenReturn(null);

            BaseResult result = userService.login("nobody", "any_password");

            assertEquals(400, result.getCode());
            assertTrue(result.getMessage().contains("用户不存在"));
        }

        @Test
        @DisplayName("手机号登录应成功")
        void shouldLoginWithPhone() {
            User dbUser = new User();
            dbUser.setUserId(2);
            dbUser.setUsername("phoneuser");
            dbUser.setPhone("13800138000");
            dbUser.setPassword(new BCryptPasswordEncoder().encode("pass123"));

            when(userMapper.selectByUsername("13800138000")).thenReturn(null);
            when(userMapper.selectByPhone("13800138000")).thenReturn(dbUser);
            when(jwtUtil.generateToken(2)).thenReturn("phone-token");

            BaseResult result = userService.login("13800138000", "pass123");

            assertEquals(200, result.getCode());
        }
    }

    @Nested
    @DisplayName("获取用户信息测试")
    class GetUserInfoTests {

        @Test
        @DisplayName("获取存在的用户应返回用户信息 (不含密码)")
        void shouldReturnUserInfoWithoutPassword() {
            User dbUser = new User();
            dbUser.setUserId(1);
            dbUser.setUsername("testuser");
            dbUser.setPassword("secret");

            when(userMapper.selectById(1)).thenReturn(dbUser);

            BaseResult result = userService.getUserInfo(1);

            assertEquals(200, result.getCode());
            User returnedUser = (User) result.getData();
            assertNull(returnedUser.getPassword(), "返回信息不应包含密码");
        }

        @Test
        @DisplayName("获取不存在的用户应返回 404")
        void shouldReturn404ForNonexistentUser() {
            when(userMapper.selectById(999)).thenReturn(null);

            BaseResult result = userService.getUserInfo(999);

            assertEquals(404, result.getCode());
        }
    }

    @Nested
    @DisplayName("更新积分测试")
    class UpdatePointsTests {

        @Test
        @DisplayName("正常增加积分应成功并记录日志")
        void shouldAddPointsAndLog() {
            User dbUser = new User();
            dbUser.setUserId(1);
            dbUser.setPoints(100);

            when(userMapper.selectById(1)).thenReturn(dbUser);
            when(userMapper.update(any(User.class))).thenReturn(1);
            when(pointsLogMapper.insert(any())).thenReturn(1);

            BaseResult result = userService.updateUserPoints(1, 50, "ADMIN", "测试加分");

            assertEquals(200, result.getCode());
            verify(pointsLogMapper, times(1)).insert(any());
        }

        @Test
        @DisplayName("用户不存在时更新积分应返回 404")
        void shouldReturn404ForNonexistentUserOnPointsUpdate() {
            when(userMapper.selectById(999)).thenReturn(null);

            BaseResult result = userService.updateUserPoints(999, 50);

            assertEquals(404, result.getCode());
        }
    }

    @Nested
    @DisplayName("邀请码测试")
    class InviteTests {

        @Test
        @DisplayName("注册携带邀请码应关联邀请人并给邀请人加100积分")
        void shouldRewardInviterOnRegister() {
            User invitee = new User();
            invitee.setUsername("invitee");
            invitee.setPhone("13800138001");
            invitee.setPassword("password123");
            invitee.setInviteCode("ABCD1234"); // 传入的是邀请人的邀请码

            User inviter = new User();
            inviter.setUserId(9);
            inviter.setPoints(50);

            when(userMapper.selectByUsername("invitee")).thenReturn(null);
            when(userMapper.selectByPhone("13800138001")).thenReturn(null);
            when(userMapper.selectByInviteCode("ABCD1234")).thenReturn(inviter);
            when(userMapper.insert(any(User.class))).thenReturn(1);
            when(jwtUtil.generateToken(any())).thenReturn("token");
            // updateUserPoints（邀请人加积分）内部调用
            when(userMapper.selectById(9)).thenReturn(inviter);
            when(userMapper.update(any(User.class))).thenReturn(1);
            when(pointsLogMapper.insert(any(PointsLog.class))).thenReturn(1);

            BaseResult result = userService.register(invitee);

            assertEquals(200, result.getCode());
            // 被邀请人应关联邀请人
            assertEquals(9, invitee.getInvitedBy());
            // 自己的邀请码应重新生成，而不是沿用邀请人的
            assertNotNull(invitee.getInviteCode());
            assertNotEquals("ABCD1234", invitee.getInviteCode());
            // 邀请人 +100 积分并落积分日志
            assertEquals(150, inviter.getPoints());
            verify(pointsLogMapper).insert(argThat(log ->
                    log.getUserId() == 9 && log.getChange() == 100));
        }

        @Test
        @DisplayName("无效邀请码不应阻断注册也不发奖励")
        void shouldIgnoreInvalidInviteCode() {
            User user = new User();
            user.setUsername("lonelyuser");
            user.setPhone("13800138002");
            user.setPassword("password123");
            user.setInviteCode("NOTEXIST");

            when(userMapper.selectByUsername("lonelyuser")).thenReturn(null);
            when(userMapper.selectByPhone("13800138002")).thenReturn(null);
            when(userMapper.selectByInviteCode("NOTEXIST")).thenReturn(null);
            when(userMapper.insert(any(User.class))).thenReturn(1);
            when(jwtUtil.generateToken(any())).thenReturn("token");

            BaseResult result = userService.register(user);

            assertEquals(200, result.getCode());
            assertNull(user.getInvitedBy());
            verify(pointsLogMapper, never()).insert(any(PointsLog.class));
        }
    }
}
