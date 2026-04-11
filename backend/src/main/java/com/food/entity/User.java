package com.food.entity;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;

@Data
public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer userId;
    private String username;
    private String password;
    private String avatar;
    private String level;
    private Integer points;
    private String phone;
    private String verifyCode; // 验证码（用于注册）
    private String openid; // 微信 openid
    private String registerSource; // 注册来源：normal-普通注册，wechat-微信注册
    private String inviteCode; // 邀请码
    private Integer invitedBy; // 邀请人ID
    private String role; // 用户角色：ADMIN-管理员，USER-普通用户，MERCHANT-商家
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

}