#!/bin/bash

# 重启脚本
echo "Restarting Food WX Backend..."

# 停止应用
./stop.sh

# 等待停止完成
sleep 2

# 启动应用
./start.sh

echo "Application restarted successfully"