package com.food.interceptor;

import com.food.dto.BaseResult;
import com.food.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.alibaba.fastjson.JSON;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 获取请求头中的token
        String token = request.getHeader("Authorization");
        
        // 对于某些不需要验证的路径，直接放行（包括静态资源）
        String uri = request.getRequestURI();
        System.out.println("=== JwtInterceptor: uri = " + uri);
        if (uri.contains("/user/register") || uri.contains("/user/login") || 
            uri.contains("/food/all") || uri.contains("/food/popular") || 
            uri.contains("/food/recommend") || uri.contains("/food/*/rating") ||
            uri.contains("/images/") || uri.endsWith(".png") || uri.endsWith(".jpg") || uri.endsWith(".jpeg")) {
            System.out.println("=== JwtInterceptor: 放行（静态资源）");
            return true;
        }

        // 验证token
        if (token == null || token.isEmpty()) {
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json");
            BaseResult result = BaseResult.error(401, "未登录");
            response.getWriter().write(JSON.toJSONString(result));
            return false;
        }

        // 去掉 "Bearer " 前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        // 验证token有效性
        System.out.println("=== JwtInterceptor 验证Token ===");
        System.out.println("token: " + token);
        boolean isExpired = jwtUtil.isTokenExpired(token);
        System.out.println("isTokenExpired结果: " + isExpired);
        if (isExpired) {
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json");
            BaseResult result = BaseResult.error(401, "Token已过期");
            response.getWriter().write(JSON.toJSONString(result));
            System.out.println("原因: Token已过期");
            System.out.println("================================");
            return false;
        }
        System.out.println("================================");

        // Token验证通过，将用户ID放入request中供后续使用
        Integer userId = jwtUtil.getUserIdFromToken(token);
        request.setAttribute("userId", userId);

        return true;
    }
}