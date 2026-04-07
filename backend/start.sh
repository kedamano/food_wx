#!/bin/bash

# 启动脚本
echo "Starting Food WX Backend..."

# 检查jar包是否存在
if [ ! -f "target/food-wx-backend-1.0.0.jar" ]; then
    echo "Jar file not found, building..."
    mvn clean package -DskipTests
fi

# 检查应用是否已在运行
PID=$(ps -ef | grep food-wx-backend | grep -v grep | awk '{print $2}')
if [ -n "$PID" ]; then
    echo "Application is already running with PID: $PID"
    echo "Please stop it first using ./stop.sh"
    exit 1
fi

# 启动应用
nohup java -jar target/food-wx-backend-1.0.0.jar > food-wx.log 2>&1 &

# 等待几秒检查是否启动成功
sleep 5

# 检查进程
PID=$(ps -ef | grep food-wx-backend | grep -v grep | awk '{print $2}')
if [ -n "$PID" ]; then
    echo "Application started successfully with PID: $PID"
    echo "Logs can be found in food-wx.log"
    echo "API文档: http://localhost:8080/api/swagger-ui.html"
else
    echo "Failed to start application, please check logs"
    exit 1
fi