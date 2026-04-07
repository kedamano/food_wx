package com.food.config;

import com.food.interceptor.JwtInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

@Configuration
public class WebConfig extends WebMvcConfigurationSupport {

    @Autowired
    private JwtInterceptor jwtInterceptor;

    @Override
    protected void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
        // JWT拦截器配置
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/user/**", "/food/**", "/cart/**", "/order/**", "/review/**")
                .excludePathPatterns("/user/register", "/user/login", "/food/all", "/food/popular", "/food/recommend", "/food/*/rating");
    }

    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 静态资源处理
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:./images/");
        
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
        
        registry.addResourceHandler("swagger-ui.html")
                .addResourceLocations("classpath:/META-INF/resources/");
        
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
    }
}