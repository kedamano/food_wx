import subprocess

def run_sql(sql):
    proc = subprocess.Popen(
        ['D:/program/mysql-8.0.26-winx64/bin/mysql.exe', '-u', 'root', '-p123456', 'food_wx', '-e', sql],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    out, err = proc.communicate()
    msg = err.decode('utf-8', errors='replace')
    if 'ERROR' in msg:
        print('FAIL:', msg[:300])
    else:
        print('OK:', sql[:60])

sqls = [
    """CREATE TABLE IF NOT EXISTS `points_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `change` int NOT NULL,
  `type` varchar(32) NOT NULL,
  `reason` varchar(128) DEFAULT NULL,
  `balance` int NOT NULL DEFAULT 0,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分变动日志表'""",

    """CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `store_id` int NOT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_store` (`user_id`, `store_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏商家表'""",

    """CREATE TABLE IF NOT EXISTS `feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `type` int DEFAULT 4,
  `content` text NOT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户反馈表'""",

    # 添加 role 字段（兼容旧版MySQL）
    """ALTER TABLE users ADD COLUMN `role` VARCHAR(20) DEFAULT 'USER' COMMENT '用户角色'"""
]

for sql in sqls:
    run_sql(sql)
