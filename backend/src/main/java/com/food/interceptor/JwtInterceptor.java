package com.food.interceptor;

import com.food.dto.BaseResult;
import com.food.utils.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.alibaba.fastjson.JSON;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(JwtInterceptor.class);

    @Autowired
    private JwtUtil jwtUtil;

    /** 白名单使用 Ant 风格精确匹配，防止 /user/registerXXX 这类前缀伪造绕过 */
    private static final String[] WHITELIST = {
            "/user/register", "/user/login", "/user/wechat-login", "/user/wechat-register",
            "/user/refresh-token", "/user/send-verify-code",
            "/order/pay-notify",
            "/food/all", "/food/popular", "/food/recommend", "/food/banners", "/food/categories",
            "/store/**", "/region/**", "/topic/list", "/file/upload",
            "/images/**", "/test/**"
    };

    private static final org.springframework.util.AntPathMatcher MATCHER = new org.springframework.util.AntPathMatcher();

    boolean isWhitelisted(String uri) {
        for (String pattern : WHITELIST) {
            if (MATCHER.match(pattern, uri)) {
                return true;
            }
        }
        return uri.endsWith(".png") || uri.endsWith(".jpg") || uri.endsWith(".jpeg");
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String token = request.getHeader("Authorization");
        String uri = request.getRequestURI();
        if (isWhitelisted(uri)) {
            return true;
        }

        // 验证token
        if (token == null || token.isEmpty()) {
            response.setStatus(401);
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

        // 验证token有效性（不得打印 token 明文）
        if (jwtUtil.isTokenExpired(token)) {
            response.setStatus(401);
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json");
            BaseResult result = BaseResult.error(401, "Token已过期");
            response.getWriter().write(JSON.toJSONString(result));
            log.debug("Token 已过期: uri={}", uri);
            return false;
        }

        // Token验证通过，将用户ID放入request中供后续使用
        Integer userId = jwtUtil.getUserIdFromToken(token);
        request.setAttribute("userId", userId);

        return true;
    }
}