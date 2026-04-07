package com.food.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.*;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;
import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableSwagger2
public class SwaggerConfig {

    @Bean
    public Docket createRestApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.food.controller"))
                .paths(PathSelectors.any())
                .build()
                .securitySchemes(securitySchemes());
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("美食小程序API文档")
                .description("美食小程序后端API接口文档")
                .contact(new Contact("Food Team", "https://example.com", "food@example.com"))
                .version("1.0.0")
                .build();
    }

    private List<SecurityScheme> securitySchemes() {
        List<SecurityScheme> schemes = new ArrayList<>();
        schemes.add(new ApiKey("Authorization", "Authorization", "header"));
        return schemes;
    }
}