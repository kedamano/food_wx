#!/bin/bash

# 停止脚本
echo "Stopping Food WX Backend..."

# 查找进程ID
PID=$(ps -ef | grep food-wx-backend | grep -v grep | awk '{print $2}')

if [ -z "$PID" ]; then
    echo "Application is not running"
    exit 0
fi

# 停止进程
kill -15 $PID

# 等待进程停止
sleep 3

# 检查是否停止成功
PID=$(ps -ef | grep food-wx-backend | grep -v grep | awk '{print $2}')
if [ -z "$PID" ]; then
    echo "Application stopped successfully"
else
    echo "Failed to stop gracefully, forcing kill..."
    kill -9 $PID
    echo "Application forced to stop"
fi