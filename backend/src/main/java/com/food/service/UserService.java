package com.food.service;

import com.food.dto.BaseResult;
import com.food.entity.PointsLog;
import com.food.entity.User;
import com.food.mapper.PointsLogMapper;
import com.food.mapper.UserMapper;
import com.food.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PointsLogMapper pointsLogMapper;

    @Autowired
    private JwtUtil jwtUtil;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User findByPhone(String phone) {
        return userMapper.selectByPhone(phone);
    }

    public User findByUsername(String username) {
        return userMapper.selectByUsername(username);
    }

    public BaseResult register(User user) {
        try {
            // 检查用户名是否已存在
            User existingUser = userMapper.selectByUsername(user.getUsername());
            if (existingUser != null) {
                return BaseResult.error(400, "用户名已存在");
            }

            // 检查手机号是否已注册
            if (user.getPhone() != null) {
                existingUser = userMapper.selectByPhone(user.getPhone());
                if (existingUser != null) {
                    return BaseResult.error(400, "手机号已注册");
                }
            }

            // 加密密码
            if (user.getPassword() != null) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }

            // 设置默认值
            user.setCreateTime(LocalDateTime.now());
            user.setUpdateTime(LocalDateTime.now());
            if (user.getPoints() == null) {
                user.setPoints(0);
            }
            if (user.getLevel() == null) {
                user.setLevel("普通会员");
            }
            if (user.getRole() == null) {
                user.setRole("USER");
            }

            // 请求里携带的 inviteCode 是邀请人的邀请码，解析出邀请人并建立关联；
            // 自己的邀请码统一重新生成，避免把邀请人的码存成自己的
            User inviter = null;
            if (user.getInviteCode() != null && !user.getInviteCode().isEmpty()) {
                inviter = userMapper.selectByInviteCode(user.getInviteCode());
                if (inviter != null) {
                    user.setInvitedBy(inviter.getUserId());
                }
                user.setInviteCode(null);
            }

            // 生成邀请码
            user.setInviteCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());

            int result = userMapper.insert(user);
            if (result > 0) {
                // 邀请奖励：邀请人 +100 积分
                if (inviter != null) {
                    updateUserPoints(inviter.getUserId(), 100, "INVITE", "邀请好友注册奖励");
                }

                // 生成Token
                String token = jwtUtil.generateToken(user.getUserId());
                Map<String, Object> data = new HashMap<>();
                data.put("token", token);
                data.put("userId", user.getUserId());
                data.put("username", user.getUsername());
                user.setPassword(null);
                data.put("user", user);
                return BaseResult.success("注册成功", data);
            }
            return BaseResult.error("注册失败");
        } catch (Exception e) {
            return BaseResult.error("注册失败: " + e.getMessage());
        }
    }

    public BaseResult login(String username, String password) {
        try {
            // 支持用户名或手机号登录
            User user = userMapper.selectByUsername(username);
            if (user == null) {
                user = userMapper.selectByPhone(username);
            }
            if (user == null) {
                return BaseResult.error(400, "用户不存在");
            }

            // 验证密码
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return BaseResult.error(400, "密码错误");
            }

            // 生成Token
            String token = jwtUtil.generateToken(user.getUserId());
            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("userId", user.getUserId());
            data.put("username", user.getUsername());
            user.setPassword(null);
            data.put("user", user);
            return BaseResult.success("登录成功", data);
        } catch (Exception e) {
            return BaseResult.error("登录失败: " + e.getMessage());
        }
    }

    public BaseResult getUserInfo(Integer userId) {
        try {
            User user = userMapper.selectById(userId);
            if (user == null) {
                return BaseResult.error(404, "用户不存在");
            }
            user.setPassword(null); // 不返回密码
            return BaseResult.success(user);
        } catch (Exception e) {
            return BaseResult.error("获取用户信息失败: " + e.getMessage());
        }
    }

    public User getUserById(Integer userId) {
        return userMapper.selectById(userId);
    }

    public BaseResult updateUserInfo(User user) {
        try {
            user.setUpdateTime(LocalDateTime.now());
            int result = userMapper.update(user);
            if (result > 0) {
                return BaseResult.success("更新成功");
            }
            return BaseResult.error("更新失败");
        } catch (Exception e) {
            return BaseResult.error("更新用户信息失败: " + e.getMessage());
        }
    }

    public BaseResult updateUserPoints(Integer userId, Integer points) {
        return updateUserPoints(userId, points, "ADMIN", "积分更新");
    }

    public BaseResult updateUserPoints(Integer userId, Integer points, String type, String reason) {
        try {
            User user = userMapper.selectById(userId);
            if (user == null) {
                return BaseResult.error(404, "用户不存在");
            }
            int newBalance = (user.getPoints() != null ? user.getPoints() : 0) + points;
            user.setPoints(newBalance);
            user.setUpdateTime(LocalDateTime.now());
            int result = userMapper.update(user);
            if (result > 0) {
                // 写入积分日志
                PointsLog log = new PointsLog();
                log.setUserId(userId);
                log.setChange(points);
                log.setType(type);
                log.setReason(reason);
                log.setBalance(newBalance);
                log.setCreateTime(LocalDateTime.now());
                pointsLogMapper.insert(log);
                return BaseResult.success("积分更新成功", newBalance);
            }
            return BaseResult.error("积分更新失败");
        } catch (Exception e) {
            return BaseResult.error("积分更新失败: " + e.getMessage());
        }
    }

    public List<User> getAllUsers() {
        return userMapper.selectAll();
    }

    public BaseResult deleteUser(Integer userId) {
        try {
            int result = userMapper.deleteById(userId);
            if (result > 0) {
                return BaseResult.success("删除成功");
            }
            return BaseResult.error("删除失败，用户不存在");
        } catch (Exception e) {
            return BaseResult.error("删除用户失败: " + e.getMessage());
        }
    }
}
