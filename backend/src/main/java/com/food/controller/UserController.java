package com.food.controller;

import com.food.annotation.RequireRole;
import com.food.dto.BaseResult;
import com.food.dto.UserDTO;
import com.food.entity.PointsLog;
import com.food.entity.User;
import com.food.mapper.PointsLogMapper;
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

    @Autowired
    private PointsLogMapper pointsLogMapper;

    /**
     * 从请求中提取Token（去掉Bearer前缀）
     */
    private String extractToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return token;
    }

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
    @ApiOperation(value = "验证验证码", notes = "验证手机验证码是否正确（验证成功后立即清除验证码）")
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

        // 验证成功后立即清除验证码，防止重放攻击
        com.food.utils.VerifyCodeUtil.clearVerifyCode(phone);

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
    @ApiOperation(value = "用户注册", notes = "用户注册接口（需要先发送并验证手机验证码）")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "username", value = "用户名", required = true, paramType = "body"),
            @ApiImplicitParam(name = "password", value = "密码", required = true, paramType = "body"),
            @ApiImplicitParam(name = "phone", value = "手机号", required = true, paramType = "body"),
            @ApiImplicitParam(name = "verifyCode", value = "验证码", required = true, paramType = "body"),
            @ApiImplicitParam(name = "inviteCode", value = "邀请码", required = false, paramType = "body")
    })
    public BaseResult register(@RequestBody Map<String, String> requestBody) {
        String phone = requestBody.get("phone");
        String verifyCode = requestBody.get("verifyCode");

        // 验证手机号格式
        if (!isValidPhone(phone)) {
            return BaseResult.error(400, "手机号格式不正确");
        }

        // 验证验证码
        if (verifyCode == null || verifyCode.isEmpty()) {
            return BaseResult.error(400, "请输入验证码");
        }
        if (!com.food.utils.VerifyCodeUtil.verifyCode(phone, verifyCode)) {
            return BaseResult.error(400, "验证码错误或已过期");
        }
        // 验证成功立即清除，防止重放
        com.food.utils.VerifyCodeUtil.clearVerifyCode(phone);

        // 构建 User 对象
        User user = new User();
        user.setUsername(requestBody.get("username"));
        user.setPassword(requestBody.get("password"));
        user.setPhone(phone);
        String inviteCode = requestBody.get("inviteCode");
        if (inviteCode != null && !inviteCode.isEmpty()) {
            user.setInviteCode(inviteCode);
        }

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
        String token = extractToken(request);
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
    public BaseResult getUserById(@PathVariable Integer userId, HttpServletRequest request) {
        try {
            // 验证登录状态
            String token = extractToken(request);
            if (token == null || token.isEmpty()) {
                return BaseResult.error(401, "未登录");
            }

            Integer currentUserId = jwtUtil.getUserIdFromToken(token);
            if (currentUserId == null) {
                return BaseResult.error(401, "Token无效");
            }

            User user = userService.getUserById(userId);
            if (user == null) {
                return BaseResult.error(404, "用户不存在");
            }

            // 只能查看自己的信息，除非是管理员
            User currentUser = userService.getUserById(currentUserId);
            boolean isAdmin = currentUser != null && "ADMIN".equals(currentUser.getRole());
            if (!currentUserId.equals(userId) && !isAdmin) {
                return BaseResult.error(403, "无权查看其他用户信息");
            }

            // 转换为DTO，脱敏敏感信息
            UserDTO userDTO = new UserDTO();
            userDTO.setUserId(user.getUserId());
            userDTO.setUsername(user.getUsername());
            userDTO.setAvatar(user.getAvatar());
            userDTO.setLevel(user.getLevel());
            userDTO.setPoints(user.getPoints());
            // 管理员可以看到完整手机号，普通用户只能看到脱敏后的
            if (isAdmin || currentUserId.equals(userId)) {
                userDTO.setPhone(UserDTO.maskPhone(user.getPhone()));
            }
            userDTO.setRegisterSource(user.getRegisterSource());
            userDTO.setCreateTime(user.getCreateTime());
            userDTO.setUpdateTime(user.getUpdateTime());

            return BaseResult.success(userDTO);
        } catch (Exception e) {
            return BaseResult.error("获取用户信息失败: " + e.getMessage());
        }
    }

    @PutMapping("/{userId}/password")
    @ApiOperation(value = "修改密码", notes = "修改用户密码")
    public BaseResult updatePassword(@PathVariable Integer userId, @RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String token = extractToken(httpRequest);
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
        String token = extractToken(request);
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
    @ApiOperation(value = "更新用户积分", notes = "增加或减少用户积分（仅管理员可用）")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "userId", value = "目标用户ID", required = true, paramType = "body"),
            @ApiImplicitParam(name = "points", value = "积分变化值", required = true, paramType = "body"),
            @ApiImplicitParam(name = "type", value = "操作类型：add-增加，subtract-减少", required = true, paramType = "body"),
            @ApiImplicitParam(name = "reason", value = "操作原因", required = false, paramType = "body")
    })
    @RequireRole("ADMIN")
    public BaseResult updateUserPoints(@RequestBody PointsRequest pointsRequest, HttpServletRequest request) {
        // 从AOP中获取当前管理员信息
        User adminUser = (User) request.getAttribute("currentUser");
        Integer adminUserId = adminUser != null ? adminUser.getUserId() : null;

        Integer targetUserId = pointsRequest.getUserId();
        if (targetUserId == null) {
            return BaseResult.error(400, "目标用户ID不能为空");
        }

        // 验证目标用户是否存在
        User targetUser = userService.getUserById(targetUserId);
        if (targetUser == null) {
            return BaseResult.error(404, "目标用户不存在");
        }

        // 计算积分变化
        Integer pointsChange = pointsRequest.getPoints();
        if ("subtract".equals(pointsRequest.getType())) {
            pointsChange = -pointsChange;
            // 检查积分是否足够
            if (targetUser.getPoints() + pointsChange < 0) {
                return BaseResult.error(400, "用户积分不足");
            }
        }

        // 记录积分变动日志（写入数据库）
        String reason = pointsRequest.getReason();
        if (reason == null || reason.isEmpty()) {
            reason = "管理员操作";
        }

        return userService.updateUserPoints(targetUserId, pointsChange, "ADMIN", reason);
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
            
            // 从数据库查询今日和本月实际积分
            Integer todayPoints = pointsLogMapper.getTodayPoints(userId);
            Integer monthlyPoints = pointsLogMapper.getMonthlyPoints(userId);
            result.put("todayPoints", todayPoints != null ? todayPoints : 0);
            result.put("monthlyPoints", monthlyPoints != null ? monthlyPoints : 0);
            
            return BaseResult.success(result);
        } catch (Exception e) {
            return BaseResult.error("获取积分信息失败: " + e.getMessage());
        }
    }

    @GetMapping("/points-history/{userId}")
    @ApiOperation(value = "获取用户积分历史", notes = "获取用户积分变动记录")
    public BaseResult getPointsHistory(@PathVariable Integer userId, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            if (token == null || token.isEmpty()) {
                return BaseResult.error(401, "未登录");
            }
            Integer currentUserId = jwtUtil.getUserIdFromToken(token);
            if (currentUserId == null) {
                return BaseResult.error(401, "Token无效");
            }
            // 只能查自己的记录，管理员可以查所有
            User currentUser = userService.getUserById(currentUserId);
            boolean isAdmin = currentUser != null && "ADMIN".equals(currentUser.getRole());
            if (!currentUserId.equals(userId) && !isAdmin) {
                return BaseResult.error(403, "无权查看他人积分记录");
            }
            List<PointsLog> logs = pointsLogMapper.selectByUserId(userId);
            // 转为前端友好格式
            List<Map<String, Object>> result = new java.util.ArrayList<>();
            for (PointsLog log : logs) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", log.getId());
                item.put("change", log.getChange());
                item.put("type", log.getChange() > 0 ? "收入" : "支出");
                item.put("points", log.getChange() > 0 ? "+" + log.getChange() : String.valueOf(log.getChange()));
                item.put("desc", log.getReason());
                item.put("reason", log.getReason());
                item.put("balance", log.getBalance());
                item.put("createTime", log.getCreateTime() != null ? log.getCreateTime().toString() : "");
                item.put("time", log.getCreateTime() != null ? log.getCreateTime().toString() : "");
                result.add(item);
            }
            return BaseResult.success(result);
        } catch (Exception e) {
            return BaseResult.error("获取积分记录失败: " + e.getMessage());
        }
    }

    @PostMapping("/sign-in/{userId}")
    @ApiOperation(value = "用户签到", notes = "用户每日签到获取积分（每天只能签到一次，基于数据库防重）")
    public BaseResult signIn(@PathVariable Integer userId, HttpServletRequest request) {
        try {
            // 验证登录状态
            String token = extractToken(request);
            if (token == null || token.isEmpty()) {
                return BaseResult.error(401, "未登录");
            }

            Integer currentUserId = jwtUtil.getUserIdFromToken(token);
            if (currentUserId == null) {
                return BaseResult.error(401, "Token无效");
            }

            // 只能为自己签到
            if (!currentUserId.equals(userId)) {
                return BaseResult.error(403, "无权为他人签到");
            }

            // 通过数据库检查今天是否已经签到（持久化防重）
            Integer todaySignInCount = pointsLogMapper.countTodayByType(userId, "SIGN_IN");
            if (todaySignInCount != null && todaySignInCount > 0) {
                return BaseResult.error(400, "今天已经签到过了，明天再来吧~");
            }

            // 计算连续签到天数（基于数据库历史记录）
            int consecutiveDays = calculateConsecutiveDays(userId);

            // 计算奖励积分（连续签到有额外奖励）
            int basePoints = com.food.utils.SignInUtil.SIGN_IN_POINTS;
            int bonusPoints = 0;
            if (consecutiveDays >= 7) {
                bonusPoints = 10; // 连续7天额外奖励10积分
            } else if (consecutiveDays >= 3) {
                bonusPoints = 5;  // 连续3天额外奖励5积分
            }
            int totalPoints = basePoints + bonusPoints;

            String reason = bonusPoints > 0
                    ? "每日签到（连续" + consecutiveDays + "天，含奖励" + bonusPoints + "分）"
                    : "每日签到";

            // 给用户增加积分并写日志（type=SIGN_IN）
            BaseResult result = userService.updateUserPoints(userId, totalPoints, "SIGN_IN", reason);

            if (result.getCode() == 200) {
                Map<String, Object> response = new HashMap<>();
                response.put("points", totalPoints);
                response.put("basePoints", basePoints);
                response.put("bonusPoints", bonusPoints);
                response.put("consecutiveDays", consecutiveDays);
                response.put("totalPoints", result.getData());
                response.put("message", bonusPoints > 0
                        ? "连续签到" + consecutiveDays + "天，获得" + totalPoints + "积分（含" + bonusPoints + "积分奖励）"
                        : "签到成功，获得" + totalPoints + "积分");
                return BaseResult.success(response);
            }

            return result;
        } catch (Exception e) {
            return BaseResult.error("签到失败: " + e.getMessage());
        }
    }

    /**
     * 基于数据库积分日志计算连续签到天数
     */
    private int calculateConsecutiveDays(Integer userId) {
        int days = 0;
        java.time.LocalDate today = java.time.LocalDate.now();
        for (int i = 0; i <= 30; i++) {
            java.time.LocalDate checkDate = today.minusDays(i);
            // 查询该日期是否有签到记录
            Integer count = pointsLogMapper.countSignInByDate(userId, checkDate.toString());
            if (count != null && count > 0) {
                days++;
            } else if (i > 0) {
                break; // 不连续则停止
            }
        }
        return days;
    }

    @GetMapping("/all")
    @ApiOperation(value = "获取所有用户", notes = "管理员获取所有用户列表")
    @RequireRole("ADMIN")
    public BaseResult getAllUsers(HttpServletRequest request) {
        List<User> users = userService.getAllUsers();
        // 清除密码信息
        for (User user : users) {
            user.setPassword(null);
        }
        return BaseResult.success(users);
    }

    @DeleteMapping("/{userId}")
    @ApiOperation(value = "删除用户", notes = "管理员删除用户")
    @RequireRole("ADMIN")
    public BaseResult deleteUser(@PathVariable Integer userId, HttpServletRequest request) {
        // 防止管理员删除自己
        Integer currentUserId = (Integer) request.getAttribute("currentUserId");
        if (currentUserId != null && currentUserId.equals(userId)) {
            return BaseResult.error(400, "不能删除当前登录的管理员账号");
        }
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
        private Integer userId;      // 目标用户ID
        private Integer points;      // 积分变化值
        private String type;         // 操作类型
        private String reason;       // 操作原因

        public Integer getUserId() {
            return userId;
        }

        public void setUserId(Integer userId) {
            this.userId = userId;
        }

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

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
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