package com.food;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
@MapperScan("com.food.mapper")
@EnableSwagger2
public class FoodApplication {
    public static void main(String[] args) {
        SpringApplication.run(FoodApplication.class, args);
    }
}