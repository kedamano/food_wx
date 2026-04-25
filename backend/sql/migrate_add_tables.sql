CREATE TABLE IF NOT EXISTS `points_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `change` int NOT NULL,
  `type` varchar(32) NOT NULL,
  `reason` varchar(128) DEFAULT NULL,
  `balance` int NOT NULL DEFAULT 0,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分变动日志表';

CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `store_id` int NOT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_store` (`user_id`, `store_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_store_id` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏商家表';

CREATE TABLE IF NOT EXISTS `feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `type` int DEFAULT 4,
  `content` text NOT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户反馈表';

ALTER TABLE users ADD COLUMN IF NOT EXISTS `role` VARCHAR(20) DEFAULT 'USER' COMMENT '用户角色：USER/ADMIN/MERCHANT';
