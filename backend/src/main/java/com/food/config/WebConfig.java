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
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
/**
 * 实现 WebMvcConfigurer（而非继承 WebMvcConfigurationSupport），
 * 保留 Boot MVC 自动配置，使 spring.jackson.* 等配置对 HTTP 消息转换器生效。
 */
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private JwtInterceptor jwtInterceptor;

    /** 允许的源：默认 *（开发），生产用 cors.allowed-origins 配置收敛为具体域名 */
    @Value("${cors.allowed-origins:*}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                // 通配源不允许携带凭据，避免不安全组合
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
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
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
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
