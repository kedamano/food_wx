# 美食小程序后端部署说明

## 系统要求

- JDK 1.8+
- Maven 3.6+
- MySQL 8.0+
- 2GB+ 内存

## 部署步骤

### 1. 数据库部署

```bash
# 登录MySQL
mysql -u root -p

# 执行建表脚本
source /path/to/food_wx/backend/sql/schema.sql

# 执行数据脚本
source /path/to/food_wx/backend/sql/data.sql
```

### 2. 应用配置

编辑 `application.yml` 文件：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/food_wx?useUnicode=true&characterEncoding=utf8mb4&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
```

### 3. 打包应用

```bash
cd /path/to/food_wx/backend
mvn clean package -DskipTests
```

### 4. 运行应用

```bash
# 方式1：直接运行
java -jar target/food-wx-backend-1.0.0.jar

# 方式2：后台运行
nohup java -jar target/food-wx-backend-1.0.0.jar > food-wx.log 2>&1 &

# 方式3：指定配置文件
java -jar target/food-wx-backend-1.0.0.jar --spring.config.location=application.yml
```

### 5. Docker部署

```bash
# 构建镜像
docker build -t food-wx-backend:1.0.0 .

# 运行容器
docker run -d -p 8080:8080 --name food-wx-backend food-wx-backend:1.0.0

# 查看日志
docker logs -f food-wx-backend
```

### 6. 验证部署

```bash
# 检查应用状态
curl http://localhost:8080/api/test/health

# 访问API文档
open http://localhost:8080/api/swagger-ui.html

# 测试用户注册
curl -X POST http://localhost:8080/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","phone":"13800138001"}'
```

## 生产环境建议

### 1. 数据库优化
- 配置主从复制
- 定期备份
- 性能调优

### 2. 应用优化
- 使用JVM参数优化
- 配置缓存（Redis）
- 启用Gzip压缩

### 3. 监控配置
- 集成Prometheus + Grafana
- 配置日志收集
- 设置告警机制

### 4. 安全配置
- 配置HTTPS
- 限制访问IP
- 定期更新依赖

## 常见问题解决

### 1. 端口占用
```bash
# 查找占用端口的进程
netstat -ano | grep 8080

# 结束进程
kill -9 <PID>
```

### 2. 数据库连接失败
- 检查MySQL服务状态：`service mysql status`
- 检查连接配置
- 检查防火墙设置

### 3. 内存不足
```bash
# 增加JVM内存
java -Xmx1024m -Xms512m -jar food-wx-backend-1.0.0.jar
```

### 4. 应用无法启动
- 检查日志文件
- 检查配置文件
- 检查依赖完整性

## 运维脚本

### 启动脚本 `start.sh`
```bash
#!/bin/bash
nohup java -jar food-wx-backend-1.0.0.jar > food-wx.log 2>&1 &
echo "Application started successfully"
```

### 停止脚本 `stop.sh`
```bash
#!/bin/bash
PID=$(ps -ef | grep food-wx-backend | grep -v grep | awk '{print $2}')
if [ -z "$PID" ]; then
    echo "Application is not running"
else
    kill -9 $PID
    echo "Application stopped successfully"
fi
```

### 重启脚本 `restart.sh`
```bash
#!/bin/bash
./stop.sh
sleep 2
./start.sh
```

## 性能监控

### 1. 应用监控
- 访问日志分析
- 接口响应时间监控
- 错误率统计

### 2. 数据库监控
- 慢查询日志
- 连接数监控
- 锁等待监控

### 3. 服务器监控
- CPU使用率
- 内存使用率
- 磁盘使用率
- 网络流量

## 备份恢复

### 数据库备份
```bash
# 全量备份
mysqldump -u root -p food_wx > food_wx_backup_$(date +%Y%m%d).sql

# 增量备份（需要配置binlog）
mysqlbinlog --start-datetime="2024-01-01 00:00:00" /var/lib/mysql/binlog.000001
```

### 应用备份
```bash
# 备份应用文件
tar -czf food-wx-backend_$(date +%Y%m%d).tar.gz /path/to/food_wx/backend
```

## 升级维护

### 版本升级
1. 备份当前版本
2. 停止应用
3. 替换新版本
4. 启动应用
5. 验证功能

### 数据库迁移
1. 导出数据
2. 修改表结构
3. 导入数据
4. 验证数据完整性

## 技术支持

- 项目文档：[README.md]
- 问题反馈：[GitHub Issues]
- 紧急联系：food@example.com