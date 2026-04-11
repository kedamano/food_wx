package com.food.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户数据传输对象
 * 用于返回用户信息时脱敏敏感数据
 */
@Data
public class UserDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer userId;
    private String username;
    private String avatar;
    private String level;
    private Integer points;
    private String phone; // 脱敏后的手机号
    private String registerSource;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    /**
     * 脱敏手机号
     * 将 13812345678 转换为 138****5678
     */
    public static String maskPhone(String phone) {
        if (phone == null || phone.length() != 11) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(7);
    }
}
