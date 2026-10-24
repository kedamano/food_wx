-- 测试数据 (安全回归测试用)
-- BCrypt 加密的密码: "123456" = $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM0YgYF/Cql4NRMUJ.mC

-- 测试用户
INSERT INTO users (user_id, username, password, phone, role, points, level, invite_code) VALUES
(1, 'normal_user', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM0YgYF/Cql4NRMUJ.mC', '13800000001', 'USER', 100, '普通会员', 'ABC12345'),
(2, 'admin_user', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM0YgYF/Cql4NRMUJ.mC', '13800000002', 'ADMIN', 9999, '超级会员', 'ADMIN001'),
(3, 'another_user', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM0YgYF/Cql4NRMUJ.mC', '13800000003', 'USER', 50, '普通会员', 'USER0003');

-- 测试商家
INSERT INTO stores (store_id, store_name, status, delivery_fee) VALUES
(1, '测试商家A', 1, 5.00),
(2, '测试商家B', 1, 3.00);

-- 测试分类
INSERT INTO categories (category_id, category_name) VALUES
(1, '热销'),
(2, '主食');

-- 测试菜品
INSERT INTO foods (food_id, name, price, category_id, store_id, status) VALUES
(1, '测试菜品1', 20.00, 1, 1, 1),
(2, '测试菜品2', 15.00, 2, 1, 1);

-- 测试订单 (不同状态)
INSERT INTO orders (order_id, order_no, user_id, store_id, total_amount, pay_amount, status) VALUES
(1, 'ORD-TEST-001', 1, 1, 25.00, 25.00, '待付款'),
(2, 'ORD-TEST-002', 1, 1, 35.00, 35.00, '制作中'),
(3, 'ORD-TEST-003', 1, 1, 45.00, 45.00, '已完成'),
(4, 'ORD-TEST-004', 3, 1, 15.00, 15.00, '待付款');
