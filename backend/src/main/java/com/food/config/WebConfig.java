package com.food.config;

import com.food.interceptor.JwtInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import java.nio.file.Paths;

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
                // 通配源不允许携带凭据，避免不安全组合
                .maxAge(3600);
    }

    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
        // JWT拦截器配置 - 只拦截特定路径
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/user/**", "/cart/**", "/order/**", "/review/**")
                .excludePathPatterns("/user/register", "/user/login");
    }

    @Value("${file.image-dir:file:///D:/work/项目/food_wx/images/}")
    private String imageDir;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 静态资源处理 - 可通过 file.image-dir / file.upload-dir 配置
        registry.addResourceHandler("/images/**")
                .addResourceLocations(ensureTrailingSlash(imageDir));
        registry.addResourceHandler("/upload/**")
                .addResourceLocations(ensureTrailingSlash("file:" + uploadDir));
        
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
        
        registry.addResourceHandler("swagger-ui.html")
                .addResourceLocations("classpath:/META-INF/resources/");
        
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
    }

    private String ensureTrailingSlash(String path) {
        return path.endsWith("/") ? path : path + "/";
    }
}
