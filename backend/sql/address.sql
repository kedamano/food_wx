-- 收货地址表
-- 外键引用 users 表 (注意是复数形式)

-- 创建收货地址表
CREATE TABLE IF NOT EXISTS `address` (
    `address_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '地址ID',
    `user_id` INT NOT NULL COMMENT '用户ID',
    `name` VARCHAR(50) NOT NULL COMMENT '收货人姓名',
    `phone` VARCHAR(20) NOT NULL COMMENT '收货人手机号',
    `province` VARCHAR(50) DEFAULT NULL COMMENT '省份',
    `city` VARCHAR(50) DEFAULT NULL COMMENT '城市',
    `district` VARCHAR(50) DEFAULT NULL COMMENT '区县',
    `detail` VARCHAR(255) NOT NULL COMMENT '详细地址',
    `full_address` VARCHAR(500) DEFAULT NULL COMMENT '完整地址',
    `tag` VARCHAR(20) DEFAULT 'other' COMMENT '地址标签：home-家，work-公司，other-其他',
    `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认：0-否，1-是',
    `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0-否，1-是',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_is_default` (`is_default`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收货地址表';
