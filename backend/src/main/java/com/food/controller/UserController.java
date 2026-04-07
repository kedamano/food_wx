package com.food.controller;

import com.food.dto.BaseResult;
import com.food.entity.User;
import com.food.service.UserService;
import com.food.utils.JwtUtil;
import com.food.utils.SmsService;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@RestController
@RequestMapping("/user")
@Api(tags = "用户管理接口")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SmsService smsService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/send-verify-code")
    @ApiOperation(value = "发送验证码", notes = "发送手机验证码（用于注册和忘记密码）")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "phone", value = "手机号", required = true, paramType = "body"),
            @ApiImplicitParam(name = "type", value = "验证码类型：register-注册，forget-忘记密码", required = true, paramType = "body")
    })
    public BaseResult sendVerifyCode(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String type = request.get("type");

        // 验证手机号格式
        if (!isValidPhone(phone)) {
            return BaseResult.error(400, "手机号格式不正确");
        }

        // 检查发送频率限制
        if (!com.food.utils.VerifyCodeUtil.canSendCode(phone)) {
            long remainingTime = com.food.utils.VerifyCodeUtil.getRemainingWaitTime(phone);
            return BaseResult.error(400, "请" + remainingTime + "秒后再试");
        }

        // 根据类型进行不同的验证
        if ("forget".equals(type)) {
            // 忘记密码：检查手机号是否已经注册
            User existingUser = userService.findByPhone(phone);
            if (existingUser == null) {
                return BaseResult.error(400, "该手机号未注册");
            }
        } else if ("register".equals(type)) {
            // 注册：检查手机号是否已经注册
            User existingUser = userService.findByPhone(phone);
            if (existingUser != null) {
                return BaseResult.error(400, "该手机号已注册");
            }
        } else {
            return BaseResult.error(400, "验证码类型不正确");
        }

        // 生成验证码
        String verifyCode = com.food.utils.VerifyCodeUtil.generateVerifyCode();

        // 存储验证码
        com.food.utils.VerifyCodeUtil.storeVerifyCode(phone, verifyCode);

        // 使用阿里云短信服务发送验证码
        boolean sendSuccess = smsService.sendVerifyCode(phone, verifyCode);

        if (sendSuccess) {
            // 明确返回成功结果
            BaseResult result = BaseResult.success("验证码已发送");
            System.out.println("返回结果：" + result);
            return result;
        } else {
            // 发送失败，清除验证码
            com.food.utils.VerifyCodeUtil.clearVerifyCode(phone);
            return BaseResult.error(500, "短信发送失败，请稍后重试");
        }
    }

    @PostMapping("/verify-code")
    @ApiOperation(value = "验证验证码", notes = "验证手机验证码是否正确")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "phone", value = "手机号", required = true, paramType = "body"),
            @ApiImplicitParam(name = "code", value = "验证码", required = true, paramType = "body")
    })
    public BaseResult verifyCode(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String code = request.get("code");

        // 验证手机号格式
        if (!isValidPhone(phone)) {
            return BaseResult.error(400, "手机号格式不正确");
        }

        // 验证验证码
        if (!com.food.utils.VerifyCodeUtil.verifyCode(phone, code)) {
            return BaseResult.error(400, "验证码错误或已过期");
        }

        // 验证成功
        return BaseResult.success("验证码验证成功");
    }

    @PostMapping("/reset-password")
    @ApiOperation(value = "重置密码", notes = "使用验证码重置密码")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "phone", value = "手机号", required = true, paramType = "body"),
            @ApiImplicitParam(name = "code", value = "验证码", required = true, paramType = "body"),
            @ApiImplicitParam(name = "newPassword", value = "新密码", required = true, paramType = "body")
    })
    public BaseResult resetPassword(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String code = request.get("code");
        String newPassword = request.get("newPassword");

        // 验证手机号格式
        if (!isValidPhone(phone)) {
            return BaseResult.error(400, "手机号格式不正确");
        }

        // 验证新密码
        if (newPassword == null || newPassword.length() < 6) {
            return BaseResult.error(400, "密码长度至少为6位");
        }

        // 验证验证码
        if (!com.food.utils.VerifyCodeUtil.verifyCode(phone, code)) {
            return BaseResult.error(400, "验证码错误或已过期");
        }

        // 查找用户
        User user = userService.findByPhone(phone);
        if (user == null) {
            return BaseResult.error(404, "用户不存在");
        }

        // 更新密码
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdateTime(java.time.LocalDateTime.now());
        userService.updateUserInfo(user);

        // 清除已使用的验证码
        com.food.utils.VerifyCodeUtil.clearVerifyCode(phone);

        return BaseResult.success("密码重置成功");
    }

    @PostMapping("/wechat-register")
    @ApiOperation(value = "微信注册", notes = "使用微信code进行注册")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "code", value = "微信登录code", required = true, paramType = "body"),
            @ApiImplicitParam(name = "username", value = "用户名", required = true, paramType = "body"),
            @ApiImplicitParam(name = "phone", value = "手机号", required = true, paramType = "body")
    })
    public BaseResult wechatRegister(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        String username = request.get("username");
        String phone = request.get("phone");

        // 验证参数
        if (code == null || code.isEmpty()) {
            return BaseResult.error(400, "code不能为空");
        }
        if (username == null || username.isEmpty()) {
            return BaseResult.error(400, "用户名不能为空");
        }
        if (phone == null || phone.isEmpty()) {
            return BaseResult.error(400, "手机号不能为空");
        }

        // 验证手机号格式
        if (!isValidPhone(phone)) {
            return BaseResult.error(400, "手机号格式不正确");
        }

        // 检查用户名是否已存在
        User existingUser = userService.findByUsername(username);
        if (existingUser != null) {
            return BaseResult.error(400, "用户名已存在");
        }

        // 检查手机号是否已注册
        existingUser = userService.findByPhone(phone);
        if (existingUser != null) {
            return BaseResult.error(400, "手机号已注册");
        }

        // 这里应该调用微信API获取用户信息
        // 实际项目中需要配置微信公众号或小程序的appid和secret
        // String openid = weChatService.getOpenId(code);
        // 为了演示，假设获取到了openid
        String openid = "wx_" + code.substring(0, 28); // 模拟openid

        // 创建用户
        User user = new User();
        user.setUsername(username);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode("123456")); // 设置默认密码
        user.setOpenid(openid);
        user.setRegisterSource("wechat");

        return userService.register(user);
    }

    @PostMapping("/register")
    @ApiOperation(value = "用户注册", notes = "用户注册接口")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "username", value = "用户名", required = true, paramType = "body"),
            @ApiImplicitParam(name = "password", value = "密码", required = true, paramType = "body"),
            @ApiImplicitParam(name = "phone", value = "手机号", required = true, paramType = "body"),
            @ApiImplicitParam(name = "verifyCode", value = "验证码", required = true, paramType = "body"),
            @ApiImplicitParam(name = "inviteCode", value = "邀请码", required = false, paramType = "body")
    })
    public BaseResult register(@RequestBody User user) {
        return userService.register(user);
    }

    @PostMapping("/login")
    @ApiOperation(value = "用户登录", notes = "用户登录接口")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "username", value = "用户名或手机号", required = true, paramType = "body"),
            @ApiImplicitParam(name = "password", value = "密码", required = true, paramType = "body")
    })
    public BaseResult login(@RequestBody LoginRequest loginRequest) {
        return userService.login(loginRequest.getUsername(), loginRequest.getPassword());
    }

    @GetMapping("/info")
    @ApiOperation(value = "获取用户信息", notes = "根据Token获取用户信息")
    public BaseResult getUserInfo(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            return BaseResult.error(401, "未登录");
        }

        Integer userId = jwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            return BaseResult.error(401, "Token无效");
        }

        return userService.getUserInfo(userId);
    }

    @GetMapping("/{userId}")
    @ApiOperation(value = "获取用户信息", notes = "根据用户ID获取用户信息")
    public BaseResult getUserById(@PathVariable Integer userId) {
        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return BaseResult.error(404, "用户不存在");
            }
            user.setPassword(null); // 不返回密码
            return BaseResult.success(user);
        } catch (Exception e) {
            return BaseResult.error("获取用户信息失败: " + e.getMessage());
        }
    }

    @PutMapping("/{userId}/password")
    @ApiOperation(value = "修改密码", notes = "修改用户密码")
    public BaseResult updatePassword(@PathVariable Integer userId, @RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String token = httpRequest.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            return BaseResult.error(401, "未登录");
        }

        Integer currentUserId = jwtUtil.getUserIdFromToken(token);
        if (currentUserId == null) {
            return BaseResult.error(401, "Token无效");
        }

        // 只能修改自己的密码
        if (!currentUserId.equals(userId)) {
            return BaseResult.error(403, "无权修改他人密码");
        }

        String newPassword = request.get("password");
        if (newPassword == null || newPassword.length() < 6) {
            return BaseResult.error(400, "密码长度至少为6位");
        }

        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return BaseResult.error(404, "用户不存在");
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            user.setUpdateTime(java.time.LocalDateTime.now());
            userService.updateUserInfo(user);

            return BaseResult.success("密码修改成功");
        } catch (Exception e) {
            return BaseResult.error("密码修改失败: " + e.getMessage());
        }
    }

    @PutMapping("/info")
    @ApiOperation(value = "更新用户信息", notes = "更新用户基本信息")
    public BaseResult updateUserInfo(@RequestBody User user, HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            return BaseResult.error(401, "未登录");
        }

        Integer userId = jwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            return BaseResult.error(401, "Token无效");
        }

        user.setUserId(userId);
        return userService.updateUserInfo(user);
    }

    @PutMapping("/points")
    @ApiOperation(value = "更新用户积分", notes = "增加或减少用户积分")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "points", value = "积分变化值", required = true, paramType = "body"),
            @ApiImplicitParam(name = "type", value = "操作类型：add-增加，subtract-减少", required = true, paramType = "body")
    })
    public BaseResult updateUserPoints(@RequestBody PointsRequest pointsRequest, HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            return BaseResult.error(401, "未登录");
        }

        Integer userId = jwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            return BaseResult.error(401, "Token无效");
        }

        if ("subtract".equals(pointsRequest.getType())) {
            return userService.updateUserPoints(userId, -pointsRequest.getPoints());
        } else {
            return userService.updateUserPoints(userId, pointsRequest.getPoints());
        }
    }

    @GetMapping("/points/{userId}")
    @ApiOperation(value = "获取用户积分信息", notes = "获取用户积分详细信息")
    public BaseResult getUserPointsInfo(@PathVariable Integer userId) {
        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return BaseResult.error(404, "用户不存在");
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("userId", user.getUserId());
            result.put("points", user.getPoints());
            result.put("level", user.getLevel());
            
            // 模拟今日可获积分和本月累计积分
            result.put("todayPoints", user.getPoints() % 200 + 50);
            result.put("monthlyPoints", user.getPoints() / 2);
            
            return BaseResult.success(result);
        } catch (Exception e) {
            return BaseResult.error("获取积分信息失败: " + e.getMessage());
        }
    }

    @PostMapping("/sign-in/{userId}")
    @ApiOperation(value = "用户签到", notes = "用户每日签到获取积分")
    public BaseResult signIn(@PathVariable Integer userId) {
        try {
            // 检查今天是否已签到（这里简化处理，实际应查询签到记录表）
            // 直接给用户增加积分
            BaseResult result = userService.updateUserPoints(userId, 20);
            
            if (result.getCode() == 200) {
                Map<String, Object> response = new HashMap<>();
                response.put("points", 20);
                response.put("totalPoints", result.getData());
                response.put("message", "签到成功，获得20积分");
                return BaseResult.success(response);
            }
            
            return result;
        } catch (Exception e) {
            return BaseResult.error("签到失败: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    @ApiOperation(value = "获取所有用户", notes = "管理员获取所有用户列表")
    public BaseResult getAllUsers(HttpServletRequest request) {
        // 验证是否是管理员
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            return BaseResult.error(401, "未登录");
        }

        Integer userId = jwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            return BaseResult.error(401, "Token无效");
        }

        // 实际项目中应该验证用户角色
        List<User> users = userService.getAllUsers();
        // 清除密码信息
        for (User user : users) {
            user.setPassword(null);
        }
        return BaseResult.success(users);
    }

    @DeleteMapping("/{userId}")
    @ApiOperation(value = "删除用户", notes = "管理员删除用户")
    public BaseResult deleteUser(@PathVariable Integer userId, HttpServletRequest request) {
        // 验证是否是管理员
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            return BaseResult.error(401, "未登录");
        }

        Integer currentUserId = jwtUtil.getUserIdFromToken(token);
        if (currentUserId == null) {
            return BaseResult.error(401, "Token无效");
        }

        // 实际项目中应该验证用户角色
        return userService.deleteUser(userId);
    }

    // 内部类用于登录请求
    private static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    // 内部类用于积分更新请求
    private static class PointsRequest {
        private Integer points;
        private String type;

        public Integer getPoints() {
            return points;
        }

        public void setPoints(Integer points) {
            this.points = points;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }

    /**
     * 验证手机号格式
     * @param phone 手机号
     * @return 是否有效
     */
    private boolean isValidPhone(String phone) {
        if (phone == null || phone.length() != 11) {
            return false;
        }
        // 手机号格式：1开头，第二位3-9，后面9位数字
        String phoneRegex = "^1[3-9]\\d{9}$";
        return phone.matches(phoneRegex);
    }
}