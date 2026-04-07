# 美食小程序后端项目

## 项目简介

美食小程序后端是基于Spring Boot + MyBatis + MySQL技术栈开发的外卖订餐系统后端。

## 技术栈

- **后端框架**: Spring Boot 2.7.14
- **数据库**: MySQL 8.0
- **ORM框架**: MyBatis Plus
- **API文档**: Swagger 3.0
- **安全框架**: JWT Token
- **其他**: Lombok, FastJSON, Apache Commons

## 项目结构

```
food_wx/backend/
├── src/main/java/com/food/
│   ├── controller/     # RESTful API控制器
│   ├── service/        # 业务逻辑层
│   ├── mapper/         # MyBatis映射接口
│   ├── entity/         # 实体类
│   ├── dto/            # 数据传输对象
│   ├── config/         # 配置类
│   ├── interceptor/    # 拦截器
│   └── FoodApplication.java # 主启动类
├── src/main/resources/
│   ├── mapper/         # MyBatis XML映射文件
│   ├── application.yml # 配置文件
│   └── static/         # 静态资源
├── sql/                # 数据库脚本
│   ├── schema.sql      # 建表脚本
│   └── data.sql        # 测试数据
├── pom.xml            # Maven依赖配置
└── README.md          # 项目说明
```

## 快速开始

### 1. 环境准备

- JDK 1.8+
- Maven 3.6+
- MySQL 8.0+
- IntelliJ IDEA / Eclipse

### 2. 数据库配置

```bash
# 创建数据库
mysql -u root -p < sql/schema.sql

# 导入测试数据
mysql -u root -p < sql/data.sql
```

### 3. 修改配置文件

编辑 `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/food_wx?useUnicode=true&characterEncoding=utf8mb4&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: root  # 修改为你的MySQL密码
```

### 4. 运行项目

```bash
# Maven方式运行
mvn clean package
mvn spring-boot:run

# 或者直接运行
java -jar target/food-wx-backend-1.0.0.jar
```

### 5. 访问API文档

启动后访问: http://localhost:8080/api/swagger-ui.html

## 主要接口,

### 用户管理
- POST `/user/register` - 用户注册
- POST `/user/login` - 用户登录
- GET `/user/info` - 获取用户信息
- PUT `/user/info` - 更新用户信息

### 菜品管理
- GET `/food/all` - 获取所有菜品
- GET `/food/{foodId}` - 获取菜品详情
- GET `/food/category/{categoryId}` - 按分类获取菜品
- GET `/food/search?name=xxx` - 搜索菜品
- GET `/food/popular` - 获取热门菜品

### 购物车管理
- POST `/cart` - 添加到购物车
- GET `/cart/user/{userId}` - 获取购物车
- PUT `/cart/{cartId}` - 更新购物车项
- DELETE `/cart/{cartId}` - 删除购物车项

### 订单管理
- POST `/order` - 创建订单
- GET `/order/user/{userId}` - 获取用户订单
- GET `/order/{orderId}` - 获取订单详情
- PUT `/order/{orderId}/pay` - 支付订单

### 评价管理
- POST `/review` - 添加评价
- GET `/review/food/{foodId}` - 获取菜品评价
- GET `/review/user/{userId}` - 获取用户评价

## API响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## 状态码说明

- `200` - 成功
- `400` - 请求参数错误
- `401` - 未登录或Token无效
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器错误

## 部署说明

### 1. 打包项目

```bash
mvn clean package -DskipTests
```

### 2. 运行Jar包

```bash
java -jar food-wx-backend-1.0.0.jar --spring.profiles.active=prod
```

### 3. 使用Docker

```dockerfile
FROM openjdk:8-jre-alpine
COPY target/food-wx-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
```

## 开发规范

### 1. 代码规范
- 使用Lombok简化代码
- 遵循RESTful API设计规范
- 统一的异常处理和响应格式

### 2. 安全规范
- 使用JWT进行身份验证
- 敏感信息加密存储
- 接口访问权限控制

### 3. 数据库规范
- 使用UTF-8编码
- 适当的索引优化
- 逻辑删除字段

## 测试说明

### 1. 单元测试
```bash
mvn test
```

### 2. API测试
使用Postman或Swagger UI进行接口测试

## 性能优化

### 1. 数据库优化
- 合理的索引设计
- 查询语句优化
- 连接池配置

### 2. 缓存优化
- Redis缓存热点数据
- 页面缓存
- CDN加速

### 3. 代码优化
- 异步处理
- 连接池
- 代码复用

## 监控和维护

### 1. 日志监控
- 系统日志
- 访问日志
- 错误日志

### 2. 性能监控
- JVM监控
- 数据库监控
- 接口响应监控

## 常见问题

### 1. 数据库连接失败
检查application.yml中的数据库配置

### 2. Token验证失败
检查JWT配置和请求头

### 3. 接口访问失败
检查拦截器配置和权限设置

## 联系方式

- 项目地址: https://github.com/food-wx/backend
- 邮箱: 1392806889@qq.com

## 许可证

MIT License