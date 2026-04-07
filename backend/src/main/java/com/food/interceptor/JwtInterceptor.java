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
        
        // 对于某些不需要验证的路径，直接放行
        String uri = request.getRequestURI();
        if (uri.contains("/user/register") || uri.contains("/user/login") || 
            uri.contains("/food/all") || uri.contains("/food/popular") || 
            uri.contains("/food/recommend") || uri.contains("/food/*/rating")) {
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

        // 验证token有效性
        if (!jwtUtil.validateToken(token)) {
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json");
            
            if (jwtUtil.isTokenExpired(token)) {
                BaseResult result = BaseResult.error(401, "Token已过期");
                response.getWriter().write(JSON.toJSONString(result));
            } else {
                BaseResult result = BaseResult.error(401, "Token无效");
                response.getWriter().write(JSON.toJSONString(result));
            }
            return false;
        }

        // Token验证通过，将用户ID放入request中供后续使用
        Integer userId = jwtUtil.getUserIdFromToken(token);
        request.setAttribute("userId", userId);

        return true;
    }
}