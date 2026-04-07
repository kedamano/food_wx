package com.food.controller;

import com.food.dto.BaseResult;
import com.food.entity.User;
import com.food.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/debug")
public class DebugController {

    @Autowired
    private UserMapper userMapper;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @GetMapping("/reset-password")
    public BaseResult resetPassword() {
        try {
            User user = userMapper.selectByUsername("zhangsan");
            if (user != null) {
                String newPassword = "123456";
                user.setPassword(passwordEncoder.encode(newPassword));
                userMapper.update(user);
                return BaseResult.success("Password reset successfully", newPassword);
            }
            return BaseResult.error(404, "User not found");
        } catch (Exception e) {
            return BaseResult.error(500, "Error resetting password: " + e.getMessage());
        }
    }

    @GetMapping("/test-bcrypt")
    public BaseResult testBCrypt() {
        try {
            String rawPassword = "123456";
            String encoded = passwordEncoder.encode(rawPassword);
            boolean matches = passwordEncoder.matches(rawPassword, encoded);

            // Create result data
            StringBuilder result = new StringBuilder();
            result.append("Raw: ").append(rawPassword).append("<br>");
            result.append("Encoded: ").append(encoded).append("<br>");
            result.append("Matches: ").append(matches);

            return BaseResult.success("BCrypt test completed", result.toString());
        } catch (Exception e) {
            return BaseResult.error(500, "Error testing BCrypt: " + e.getMessage());
        }
    }
}