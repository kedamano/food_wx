package com.food;

import com.food.entity.User;
import com.food.mapper.UserMapper;
import com.food.service.UserService;
import com.food.utils.JwtUtil;
import com.food.utils.VerifyCodeUtil;
import com.food.dto.BaseResult;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 注册功能测试类
 * 用于测试完整的注册流程
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = FoodApplication.class)
public class RegisterTest {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserMapper userMapper;

    /**
     * 测试完整的注册流程
     * 步骤：
     * 1. 生成并发送验证码
     * 2. 填写注册信息
     * 3. 验证注册
     */
    @Test
    public void testCompleteRegisterProcess() {
        System.out.println("=== 开始测试完整注册流程 ===");

        // 步骤1: 生成验证码
        String phone = "138" + String.format("%08d", (int)(Math.random() * 100000000));
        String verifyCode = VerifyCodeUtil.generateVerifyCode();
        VerifyCodeUtil.storeVerifyCode(phone, verifyCode);
        System.out.println("生成的验证码: " + verifyCode + " 手机号: " + phone);

        // 步骤2: 准备注册数据
        User user = new User();
        user.setUsername("testuser_" + System.currentTimeMillis());
        user.setPhone(phone);
        user.setPassword("123456");
        user.setVerifyCode(verifyCode);
        user.setInviteCode(""); // 可选的邀请码

        // 步骤3: 调用注册接口
        BaseResult result = userService.register(user);
        System.out.println("注册结果: " + result);

        if (result.getCode() == 200) {
            System.out.println("注册成功！Token: " + result.getData());
            
            // 验证用户已存入数据库
            User registeredUser = userMapper.selectByPhone(phone);
            if (registeredUser != null) {
                System.out.println("用户已成功存入数据库: " + registeredUser.getUsername());
                System.out.println("用户邀请码: " + registeredUser.getInviteCode());
                
                // 验证token
                String token = (String) result.getData();
                Integer userId = jwtUtil.getUserIdFromToken(token);
                System.out.println("从Token中获取的用户ID: " + userId);
                System.out.println("注册用户的ID: " + registeredUser.getUserId());
                
                if (userId.equals(registeredUser.getUserId())) {
                    System.out.println("Token验证通过！");
                } else {
                    System.out.println("Token验证失败！");
                }
            } else {
                System.out.println("错误：用户未存入数据库！");
            }
        } else {
            System.out.println("注册失败: " + result.getMessage());
        }

        // 清理测试数据
        User testUser = userMapper.selectByPhone(phone);
        if (testUser != null) {
            userMapper.deleteById(testUser.getUserId());
            System.out.println("清理测试数据完成");
        }
        
        // 清除验证码
        VerifyCodeUtil.clearVerifyCode(phone);

        System.out.println("=== 测试完成 ===");
    }

    /**
     * 测试邀请码功能
     */
    @Test
    public void testInviteCodeFunctionality() {
        System.out.println("=== 开始测试邀请码功能 ===");

        // 先创建一个邀请人
        User inviter = createTestUser("inviter_" + System.currentTimeMillis(), "138" + String.format("%08d", (int)(Math.random() * 100000000)));
        System.out.println("创建邀请人: " + inviter.getUsername() + " 邀请码: " + inviter.getInviteCode());
        
        // 获取邀请人原始积分
        Integer originalPoints = inviter.getPoints();
        System.out.println("邀请人原始积分: " + originalPoints);

        // 被邀请人注册
        String phone = "138" + String.format("%08d", (int)(Math.random() * 100000000));
        String verifyCode = VerifyCodeUtil.generateVerifyCode();
        VerifyCodeUtil.storeVerifyCode(phone, verifyCode);

        User invitee = new User();
        invitee.setUsername("invitee_" + System.currentTimeMillis());
        invitee.setPhone(phone);
        invitee.setPassword("123456");
        invitee.setVerifyCode(verifyCode);
        invitee.setInviteCode(inviter.getInviteCode());

        BaseResult result = userService.register(invitee);
        
        if (result.getCode() == 200) {
            System.out.println("被邀请人注册成功！");
            
            // 检查邀请人积分是否增加
            User updatedInviter = userMapper.selectById(inviter.getUserId());
            System.out.println("邀请人当前积分: " + updatedInviter.getPoints());
            
            if (updatedInviter.getPoints() == originalPoints + 100) {
                System.out.println("邀请奖励发放成功！");
            } else {
                System.out.println("邀请奖励发放失败！");
            }
            
            // 检查被邀请人是否关联了邀请人
            User registeredInvitee = userMapper.selectByPhone(phone);
            System.out.println("被邀请人的邀请人ID: " + registeredInvitee.getInvitedBy());
            
            if (registeredInvitee.getInvitedBy() != null && registeredInvitee.getInvitedBy().equals(inviter.getUserId())) {
                System.out.println("邀请关系关联成功！");
            } else {
                System.out.println("邀请关系关联失败！");
            }
        }

        // 清理数据
        cleanUpTestUsers(inviter, phone);
        System.out.println("=== 邀请码测试完成 ===");
    }

    /**
     * 测试验证码功能
     */
    @Test
    public void testVerifyCodeFunctionality() {
        System.out.println("=== 开始测试验证码功能 ===");

        String phone = "138" + String.format("%08d", (int)(Math.random() * 100000000));
        
        // 测试生成验证码
        String code1 = VerifyCodeUtil.generateVerifyCode();
        System.out.println("生成的验证码: " + code1);
        
        // 测试存储和验证
        VerifyCodeUtil.storeVerifyCode(phone, code1);
        
        boolean isValid = VerifyCodeUtil.verifyCode(phone, code1);
        System.out.println("验证码验证结果: " + isValid);
        
        if (isValid) {
            System.out.println("验证码验证功能正常！");
        } else {
            System.out.println("验证码验证功能异常！");
        }
        
        // 测试错误的验证码
        boolean isInvalid = VerifyCodeUtil.verifyCode(phone, "000000");
        System.out.println("错误验证码验证结果: " + isInvalid);
        
        if (!isInvalid) {
            System.out.println("错误验证码验证正确！");
        } else {
            System.out.println("错误验证码验证异常！");
        }
        
        // 测试频率限制
        long remainingTime = VerifyCodeUtil.getRemainingWaitTime(phone);
        System.out.println("剩余等待时间: " + remainingTime + "秒");
        
        // 测试能否发送
        boolean canSend = VerifyCodeUtil.canSendCode(phone);
        System.out.println("能否发送验证码: " + canSend);
        
        // 清理
        VerifyCodeUtil.clearVerifyCode(phone);
        
        System.out.println("=== 验证码测试完成 ===");
    }

    /**
     * 创建测试用户
     */
    private User createTestUser(String username, String phone) {
        User user = new User();
        user.setUsername(username);
        user.setPhone(phone);
        user.setPassword("123456");
        
        BaseResult result = userService.register(user);
        if (result.getCode() == 200) {
            return userMapper.selectByPhone(phone);
        }
        return null;
    }

    /**
     * 清理测试用户
     */
    private void cleanUpTestUsers(User... users) {
        for (User user : users) {
            if (user != null) {
                userMapper.deleteById(user.getUserId());
            }
        }
    }

    /**
     * 测试用户已存在的情况
     */
    @Test
    public void testUserAlreadyExists() {
        System.out.println("=== 开始测试用户已存在的情况 ===");

        String phone = "138" + String.format("%08d", (int)(Math.random() * 100000000));
        
        // 先创建一个用户
        User user = createTestUser("existsuser_" + System.currentTimeMillis(), phone);
        if (user == null) {
            System.out.println("创建测试用户失败！");
            return;
        }
        
        // 尝试用相同的手机号注册
        User newUser = new User();
        newUser.setUsername("newuser_" + System.currentTimeMillis());
        newUser.setPhone(phone);
        newUser.setPassword("123456");
        
        BaseResult result = userService.register(newUser);
        System.out.println("重复注册结果: " + result);
        
        if (result.getCode() == 400 && result.getMessage().contains("手机号已注册")) {
            System.out.println("手机号重复验证通过！");
        } else {
            System.out.println("手机号重复验证失败！");
        }
        
        // 清理
        cleanUpTestUsers(user);
        System.out.println("=== 重复注册测试完成 ===");
    }

    /**
     * 测试验证码错误的情况
     */
    @Test
    public void testWrongVerifyCode() {
        System.out.println("=== 开始测试验证码错误的情况 ===");

        String phone = "138" + String.format("%08d", (int)(Math.random() * 100000000));
        String correctCode = VerifyCodeUtil.generateVerifyCode();
        VerifyCodeUtil.storeVerifyCode(phone, correctCode);
        
        // 用错误的验证码注册
        User user = new User();
        user.setUsername("wrongcode_" + System.currentTimeMillis());
        user.setPhone(phone);
        user.setPassword("123456");
        user.setVerifyCode("999999"); // 错误的验证码
        
        BaseResult result = userService.register(user);
        System.out.println("错误验证码注册结果: " + result);
        
        if (result.getCode() == 400 && result.getMessage().contains("验证码")) {
            System.out.println("验证码验证通过！");
        } else {
            System.out.println("验证码验证失败！");
        }
        
        // 清理
        VerifyCodeUtil.clearVerifyCode(phone);
        System.out.println("=== 错误验证码测试完成 ===");
    }
}