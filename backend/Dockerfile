FROM openjdk:8-jre-alpine

# 设置工作目录
WORKDIR /app

# 复制jar包
COPY target/food-wx-backend-1.0.0.jar app.jar

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/test/health || exit 1

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]