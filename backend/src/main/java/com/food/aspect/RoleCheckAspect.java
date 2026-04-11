package com.food.aspect;

import com.food.annotation.RequireRole;
import com.food.dto.BaseResult;
import com.food.entity.User;
import com.food.service.UserService;
import com.food.utils.JwtUtil;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;

/**
 * 角色权限验证AOP切面
 * 拦截带有@RequireRole注解的方法，验证用户角色权限
 */
@Aspect
@Component
public class RoleCheckAspect {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    /**
     * 拦截带有@RequireRole注解的方法
     */
    @Around("@annotation(requireRole)")
    public Object checkRole(ProceedingJoinPoint joinPoint, RequireRole requireRole) throws Throwable {
        // 获取当前请求
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return BaseResult.error(401, "无法获取请求信息");
        }

        HttpServletRequest request = attributes.getRequest();

        // 从请求头获取Token
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (token == null || token.isEmpty()) {
            return BaseResult.error(401, "未登录");
        }

        // 从Token获取用户ID
        Integer userId = jwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            return BaseResult.error(401, "Token无效");
        }

        // 获取用户信息
        User user = userService.getUserById(userId);
        if (user == null) {
            return BaseResult.error(401, "用户不存在");
        }

        // 获取用户角色
        String userRole = user.getRole();
        if (userRole == null || userRole.isEmpty()) {
            userRole = "USER"; // 默认角色
        }

        // 创建final变量供lambda使用
        final String finalUserRole = userRole;

        // 验证用户角色是否在允许的角色列表中
        String[] requiredRoles = requireRole.value();
        boolean hasPermission = Arrays.stream(requiredRoles)
                .anyMatch(role -> role.equals(finalUserRole));

        if (!hasPermission) {
            return BaseResult.error(403, "无权访问：需要 " + Arrays.toString(requiredRoles) + " 角色");
        }

        // 将用户信息存入request属性，方便后续使用
        request.setAttribute("currentUser", user);
        request.setAttribute("currentUserId", userId);

        // 继续执行原方法
        return joinPoint.proceed();
    }
}
