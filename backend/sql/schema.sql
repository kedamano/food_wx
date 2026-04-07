-- 美食小程序数据库建表脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS food_wx DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE food_wx;

-- 用户表
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码（加密）',
    avatar VARCHAR(255) COMMENT '用户头像',
    level VARCHAR(20) DEFAULT '普通会员' COMMENT '会员等级',
    points INT DEFAULT 0 COMMENT '积分',
    phone VARCHAR(20) COMMENT '手机号',
    openid VARCHAR(100) COMMENT '微信openid',
    register_source VARCHAR(20) DEFAULT 'normal' COMMENT '注册来源：normal-普通注册，wechat-微信注册',
    invite_code VARCHAR(20) COMMENT '邀请码',
    invited_by INT COMMENT '邀请人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_phone (phone),
    INDEX idx_openid (openid),
    INDEX idx_invite_code (invite_code),
    INDEX idx_invited_by (invited_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 商家表
CREATE TABLE stores (
    store_id INT PRIMARY KEY AUTO_INCREMENT,
    store_name VARCHAR(100) NOT NULL COMMENT '商家名称',
    logo VARCHAR(255) COMMENT '商家logo',
    address VARCHAR(255) COMMENT '商家地址',
    phone VARCHAR(20) COMMENT '商家电话',
    rating DECIMAL(3,1) DEFAULT 0 COMMENT '商家评分',
    delivery_time INT COMMENT '预计配送时间（分钟）',
    delivery_fee DECIMAL(10,2) DEFAULT 0 COMMENT '配送费',
    status TINYINT DEFAULT 1 COMMENT '状态：1-营业中，0-休息中',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_store_name (store_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家表';

-- 美食分类表
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL COMMENT '分类名称',
    icon VARCHAR(50) COMMENT '分类图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='美食分类表';

-- 菜品表
CREATE TABLE foods (
    food_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '菜品名称',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    description TEXT COMMENT '菜品描述',
    image VARCHAR(255) COMMENT '菜品图片',
    category_id INT COMMENT '分类ID',
    store_id INT COMMENT '商家ID',
    rating DECIMAL(3,1) DEFAULT 0 COMMENT '评分',
    sales INT DEFAULT 0 COMMENT '销量',
    tags JSON COMMENT '标签（热销、经典等）',
    status TINYINT DEFAULT 1 COMMENT '状态：1-在售，0-下架',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    INDEX idx_name (name),
    INDEX idx_category (category_id),
    INDEX idx_store (store_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品表';

-- 购物车表
CREATE TABLE cart (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    food_id INT NOT NULL COMMENT '菜品ID',
    quantity INT DEFAULT 1 COMMENT '数量',
    store_id INT COMMENT '商家ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (food_id) REFERENCES foods(food_id),
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    INDEX idx_user (user_id),
    UNIQUE KEY uk_user_food (user_id, food_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- 订单表
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) NOT NULL COMMENT '订单号',
    user_id INT NOT NULL COMMENT '用户ID',
    store_id INT NOT NULL COMMENT '商家ID',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
    delivery_fee DECIMAL(10,2) DEFAULT 0 COMMENT '配送费',
    discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
    pay_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
    status VARCHAR(20) DEFAULT '待付款' COMMENT '订单状态',
    address VARCHAR(255) COMMENT '配送地址',
    phone VARCHAR(20) COMMENT '联系电话',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    INDEX idx_user (user_id),
    INDEX idx_order_no (order_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 订单详情表
CREATE TABLE order_details (
    detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL COMMENT '订单ID',
    food_id INT NOT NULL COMMENT '菜品ID',
    food_name VARCHAR(100) NOT NULL COMMENT '菜品名称',
    price DECIMAL(10,2) NOT NULL COMMENT '单价',
    quantity INT NOT NULL COMMENT '数量',
    total_price DECIMAL(10,2) NOT NULL COMMENT '小计',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (food_id) REFERENCES foods(food_id),
    INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单详情表';

-- 评价表
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL COMMENT '订单ID',
    user_id INT NOT NULL COMMENT '用户ID',
    food_id INT NOT NULL COMMENT '菜品ID',
    rating INT NOT NULL COMMENT '评分（1-5分）',
    content TEXT COMMENT '评价内容',
    images JSON COMMENT '评价图片',
    status TINYINT DEFAULT 1 COMMENT '状态：1-显示，0-隐藏',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (food_id) REFERENCES foods(food_id),
    INDEX idx_order (order_id),
    INDEX idx_user (user_id),
    INDEX idx_food (food_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价表';

-- 用户地址表
CREATE TABLE user_addresses (
    address_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    receiver_name VARCHAR(50) NOT NULL COMMENT '收货人姓名',
    phone VARCHAR(20) NOT NULL COMMENT '收货人电话',
    address VARCHAR(255) NOT NULL COMMENT '详细地址',
    is_default TINYINT DEFAULT 0 COMMENT '是否默认地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户地址表';

-- 优惠券表
CREATE TABLE coupons (
    coupon_id INT PRIMARY KEY AUTO_INCREMENT,
    coupon_name VARCHAR(100) NOT NULL COMMENT '优惠券名称',
    discount_amount DECIMAL(10,2) NOT NULL COMMENT '优惠金额',
    min_amount DECIMAL(10,2) NOT NULL COMMENT '最低使用金额',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1-可用，0-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_time (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券表';

-- 用户优惠券表
CREATE TABLE user_coupons (
    user_coupon_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    coupon_id INT NOT NULL COMMENT '优惠券ID',
    is_used TINYINT DEFAULT 0 COMMENT '是否已使用',
    used_time DATETIME COMMENT '使用时间',
    order_id INT COMMENT '使用订单ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    INDEX idx_user (user_id),
    INDEX idx_coupon (coupon_id),
    INDEX idx_used (is_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券表';

-- 支付记录表
CREATE TABLE payment_records (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL COMMENT '订单ID',
    payment_no VARCHAR(100) NOT NULL COMMENT '支付流水号',
    payment_method VARCHAR(20) COMMENT '支付方式',
    amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    status VARCHAR(20) DEFAULT '待支付' COMMENT '支付状态',
    pay_time DATETIME COMMENT '支付时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    INDEX idx_order (order_id),
    INDEX idx_payment_no (payment_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录表';