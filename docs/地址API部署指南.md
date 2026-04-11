# 收货地址API部署指南

## 问题原因

404错误表示后端服务没有加载 `AddressController`。这通常是因为：
1. 后端服务没有重启
2. 新添加的类没有被编译
3. 数据库表未创建

## 解决步骤

### 步骤1：创建数据库表

**注意**：确保 `users` 表已存在（注意是复数形式 `users`，不是 `user`）。

然后在MySQL客户端中执行：

```sql
-- 收货地址表
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
```

### 步骤2：重新编译并启动后端服务

在IDEA中：
1. 打开 Maven 面板
2. 找到 `backend` 项目
3. 展开 `Lifecycle`
4. 双击 `clean`
5. 双击 `compile`
6. 右键点击 `Application` 类，选择 `Restart`

或者使用命令行：

```bash
cd d:/work/项目/food_wx/backend

# 停止当前服务（如果有）

# 清理并编译
mvn clean compile

# 启动服务
mvn spring-boot:run
```

### 步骤3：验证API是否可用

启动后，在浏览器或Postman中测试：

```
GET http://localhost:8080/api/address/list
```

应该返回：
```json
{
  "code": 401,
  "message": "请先登录",
  "data": null
}
```

如果返回404，说明Controller没有加载成功，请检查：
1. 控制台是否有编译错误
2. AddressController.java 是否在正确的包路径下
3. 服务是否完全重启

### 步骤4：测试完整流程

1. 先登录获取token
2. 访问地址列表：`GET /api/address/list`
3. 添加地址：`POST /api/address/add`
4. 查看地址是否保存成功

## 常见问题

### Q: 编译报错 "找不到符号 Address"
A: 确保所有文件都在正确的包路径下，执行 `mvn clean compile`

### Q: 启动报错 "Table 'food_wx.address' doesn't exist"
A: 先执行数据库脚本创建表

### Q: 还是404错误
A: 检查：
- 服务是否完全重启（不是热部署）
- AddressController 是否有 `@RestController` 注解
- 请求URL是否正确（注意 `/api` 前缀）

## API端点列表

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /api/address/list | 获取地址列表 |
| GET | /api/address/{id} | 获取地址详情 |
| GET | /api/address/default | 获取默认地址 |
| POST | /api/address/add | 添加地址 |
| PUT | /api/address/update | 更新地址 |
| DELETE | /api/address/delete/{id} | 删除地址 |
| PUT | /api/address/set-default/{id} | 设置默认地址 |
