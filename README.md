# 🍜 美食外卖小程序 (Food Delivery Mini Program)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7.14-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![WeChat Mini Program](https://img.shields.io/badge/WeChat-Mini%20Program-blue.svg)](https://developers.weixin.qq.com/miniprogram/dev/framework/)

一个功能完整的美食外卖小程序，包含用户端微信小程序和 Spring Boot 后端服务。

## ✨ 功能特性

### 用户模块
- 🔐 用户注册/登录（支持手机号+验证码）
- 👤 个人信息管理（头像、昵称、手机号、邮箱）
- 🔒 密码修改与安全设置
- 📱 登录设备管理

### 美食浏览
- 🏠 首页轮播图与分类展示
- 🍔 美食详情（图片、价格、评分、评价）
- 🏪 商家详情与店铺信息
- 🔍 分类筛选与搜索

### 购物车
- 🛒 添加/删除商品
- ➕ 数量增减
- 💰 实时价格计算

### 订单系统
- 📝 下单流程
- 📋 订单列表（待支付、待发货、待收货、已完成）
- 📦 订单详情与配送追踪
- ⭐ 订单评价

### 优惠券
- 🎫 优惠券领取
- 💳 优惠券使用
- 📊 优惠券统计

### 积分系统
- 🎁 积分获取与使用
- 📅 每日签到
- 🏆 积分商城

### 系统设置
- ⚙️ 账号信息管理
- 🔐 安全设置
- 🔏 隐私设置
- ❓ 帮助中心
- 💬 意见反馈
- ℹ️ 关于我们

## 🛠️ 技术栈

### 后端 (backend/)
- **框架**: Spring Boot 2.7.14
- **ORM**: MyBatis Plus 3.5.3.1
- **数据库**: MySQL 8.0
- **安全**: JWT 认证
- **文档**: Swagger 2.9.2
- **工具**: Lombok, Maven

### 前端 (floor/)
- **平台**: 微信小程序
- **语言**: JavaScript
- **样式**: WXSS
- **图标**: Font Awesome

## 📁 项目结构

```
food_wx/
├── backend/                    # Spring Boot 后端
│   ├── src/main/java/com/food/
│   │   ├── controller/         # API 控制器
│   │   ├── entity/             # 实体类
│   │   ├── service/            # 业务逻辑
│   │   ├── mapper/             # 数据访问层
│   │   ├── config/             # 配置类
│   │   └── utils/              # 工具类
│   ├── src/main/resources/
│   │   ├── mapper/             # MyBatis XML
│   │   └── application.yml     # 配置文件
│   └── sql/                    # 数据库脚本
│       ├── schema.sql          # 表结构
│       └── data.sql            # 初始数据
├── floor/                      # 微信小程序前端
│   ├── pages/                  # 页面目录
│   │   ├── index/              # 首页
│   │   ├── category/           # 分类页
│   │   ├── cart/               # 购物车
│   │   ├── orders/             # 订单列表
│   │   ├── profile/            # 个人中心
│   │   └── ...                 # 其他页面
│   ├── api/                    # API 封装
│   ├── utils/                  # 工具函数
│   ├── app.js                  # 小程序入口
│   ├── app.json                # 全局配置
│   └── app.wxss                # 全局样式
├── docs/                       # 项目文档
└── mock/                       # Mock 数据
```

## 🚀 快速开始

### 环境要求
- Java 8+
- Maven 3.6+
- MySQL 8.0
- 微信开发者工具

### 后端部署

1. **创建数据库**
```sql
CREATE DATABASE food_wx CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **导入数据库脚本**
```bash
# 执行 schema.sql 创建表结构
# 执行 data.sql 导入初始数据
```

3. **修改配置**
编辑 `backend/src/main/resources/application.yml`：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/food_wx?useUnicode=true&characterEncoding=utf-8
    username: your_username
    password: your_password
```

4. **启动服务**
```bash
cd backend
mvn spring-boot:run
```

服务将在 `http://localhost:8080/api` 启动

### 前端部署

1. **打开微信开发者工具**

2. **导入项目**
   - 选择 `floor` 目录
   - 填写自己的 AppID（或选择测试号）

3. **修改 API 配置**
编辑 `floor/api/config.js`：
```javascript
const config = {
  baseURL: 'http://localhost:8080/api',  // 后端地址
  // ...
}
```

4. **编译运行**
   - 点击「编译」按钮
   - 使用微信开发者工具预览

## 📱 页面预览

| 首页 | 分类 | 购物车 | 个人中心 |
|------|------|--------|----------|
| ![首页](docs/images/home.png) | ![分类](docs/images/category.png) | ![购物车](docs/images/cart.png) | ![个人中心](docs/images/profile.png) |

| 美食详情 | 商家详情 | 订单列表 | 订单详情 |
|----------|----------|----------|----------|
| ![美食详情](docs/images/food-detail.png) | ![商家详情](docs/images/store-detail.png) | ![订单列表](docs/images/orders.png) | ![订单详情](docs/images/order-detail.png) |

## 🔌 API 接口

### 用户模块
- `POST /user/register` - 用户注册
- `POST /user/login` - 用户登录
- `GET /user/info` - 获取用户信息
- `GET /user/{userId}` - 根据ID获取用户
- `PUT /user/{userId}` - 更新用户信息
- `PUT /user/{userId}/password` - 修改密码

### 美食模块
- `GET /food/list` - 美食列表
- `GET /food/{foodId}` - 美食详情
- `GET /food/banners` - 轮播图
- `GET /food/categories` - 分类列表
- `GET /food/recommend` - 推荐美食

### 商家模块
- `GET /store/list` - 商家列表
- `GET /store/{storeId}` - 商家详情
- `GET /store/{storeId}/foods` - 商家美食

### 购物车模块
- `GET /cart/{userId}` - 获取购物车
- `POST /cart/add` - 添加商品
- `PUT /cart/update` - 更新数量
- `DELETE /cart/{cartId}` - 删除商品

### 订单模块
- `POST /order/create` - 创建订单
- `GET /order/user/{userId}` - 用户订单
- `GET /order/{orderId}` - 订单详情
- `PUT /order/{orderId}/status` - 更新状态
- `GET /order/statistics` - 订单统计

### 优惠券模块
- `GET /coupon/all` - 所有优惠券
- `GET /coupon/user/{userId}` - 用户优惠券
- `POST /coupon/exchange` - 兑换优惠券

### 评价模块
- `GET /review/food/{foodId}` - 美食评价
- `GET /review/user/{userId}` - 用户评价
- `POST /review/create` - 创建评价

## 📄 数据库设计

### 核心表结构

| 表名 | 说明 |
|------|------|
| `users` | 用户表 |
| `stores` | 商家表 |
| `foods` | 美食表 |
| `categories` | 分类表 |
| `carts` | 购物车表 |
| `orders` | 订单表 |
| `order_details` | 订单详情表 |
| `coupons` | 优惠券表 |
| `user_coupons` | 用户优惠券表 |
| `reviews` | 评价表 |
| `user_addresses` | 用户地址表 |
| `payment_records` | 支付记录表 |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📜 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

## 🙏 致谢

- [Spring Boot](https://spring.io/projects/spring-boot)
- [MyBatis Plus](https://baomidou.com/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Font Awesome](https://fontawesome.com/)

---

<p align="center">
  Made with ❤️ by kedamano
</p>
