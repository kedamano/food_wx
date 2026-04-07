package com.food.controller;

import com.food.dto.BaseResult;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
@Api(tags = "测试接口")
public class TestController {

    @GetMapping("/hello")
    @ApiOperation(value = "测试接口", notes = "返回欢迎信息")
    public BaseResult hello() {
        return BaseResult.success("欢迎使用美食小程序后端API！");
    }

    @GetMapping("/health")
    @ApiOperation(value = "健康检查", notes = "系统健康状态检查")
    public BaseResult health() {
        System.out.println("Health check: System is running normally");
        return BaseResult.success("系统运行正常", null);
    }

    @GetMapping("/config")
    @ApiOperation(value = "获取配置信息", notes = "返回系统配置信息")
    public BaseResult getConfig() {
        return BaseResult.success("系统配置信息", new ConfigInfo());
    }

    private static class ConfigInfo {
        public String version = "1.0.0";
        public String environment = "development";
        public String database = "MySQL 8.0";
        public String framework = "Spring Boot 2.7.14";
    }
}