package com.food.controller;

import com.food.annotation.RequireRole;
import com.food.dto.BaseResult;
import com.food.entity.User;
import com.food.service.OrderService;
import com.food.service.UserService;
import com.food.utils.JwtUtil;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.Map;

/**
 * 骑手端接口：接单派送、实时位置上报、确认送达。
 * 使用者角色：RIDER（骑手）/ MERCHANT / ADMIN，通过 users.role 手工授权。
 */
@RestController
@RequestMapping("/rider")
@Api(tags = "骑手端接口")
public class RiderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    private Integer getCurrentUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token != null && !token.isEmpty()) {
            return jwtUtil.getUserIdFromToken(token);
        }
        return null;
    }

    @GetMapping("/orders/pending")
    @RequireRole({"RIDER", "MERCHANT", "ADMIN"})
    @ApiOperation(value = "待配送订单池", notes = "获取所有制作中（待派送）的订单")
    public BaseResult pendingOrders(HttpServletRequest request) {
        return orderService.getOrdersByStatus("制作中");
    }

    @PostMapping("/orders/{orderId}/dispatch")
    @RequireRole({"RIDER", "MERCHANT", "ADMIN"})
    @ApiOperation(value = "接单/派单", notes = "骑手接单（或商家指派），订单进入配送中；riderName/riderPhone 不传时取骑手账号信息")
    public BaseResult dispatch(@PathVariable Integer orderId,
                               @RequestBody(required = false) Map<String, String> body,
                               HttpServletRequest request) {
        Integer riderId = getCurrentUserId(request);
        if (riderId == null) {
            return BaseResult.error(401, "未登录");
        }

        String riderName = body != null ? body.get("riderName") : null;
        String riderPhone = body != null ? body.get("riderPhone") : null;
        if (riderName == null || riderName.isEmpty() || riderPhone == null || riderPhone.isEmpty()) {
            User rider = userService.getUserById(riderId);
            if (rider != null) {
                if (riderName == null || riderName.isEmpty()) {
                    riderName = rider.getUsername();
                }
                if (riderPhone == null || riderPhone.isEmpty()) {
                    riderPhone = rider.getPhone();
                }
            }
        }

        return orderService.dispatchOrder(orderId, riderId, riderName, riderPhone);
    }

    @PutMapping("/orders/{orderId}/location")
    @RequireRole({"RIDER", "MERCHANT", "ADMIN"})
    @ApiOperation(value = "上报实时位置", notes = "骑手上报当前经纬度，仅限本单骑手")
    public BaseResult reportLocation(@PathVariable Integer orderId,
                                     @RequestBody Map<String, Object> body,
                                     HttpServletRequest request) {
        Integer riderId = getCurrentUserId(request);
        if (riderId == null) {
            return BaseResult.error(401, "未登录");
        }

        Object lngObj = body.get("longitude");
        Object latObj = body.get("latitude");
        if (lngObj == null || latObj == null) {
            return BaseResult.error(400, "缺少经纬度参数");
        }
        try {
            BigDecimal longitude = new BigDecimal(String.valueOf(lngObj));
            BigDecimal latitude = new BigDecimal(String.valueOf(latObj));
            return orderService.updateRiderLocation(orderId, riderId, longitude, latitude);
        } catch (NumberFormatException e) {
            return BaseResult.error(400, "经纬度格式不正确");
        }
    }

    @PutMapping("/orders/{orderId}/deliver")
    @RequireRole({"RIDER", "MERCHANT", "ADMIN"})
    @ApiOperation(value = "确认送达", notes = "骑手确认送达，订单置为已完成；仅限本单骑手")
    public BaseResult deliver(@PathVariable Integer orderId, HttpServletRequest request) {
        Integer riderId = getCurrentUserId(request);
        if (riderId == null) {
            return BaseResult.error(401, "未登录");
        }
        return orderService.deliverOrder(orderId, riderId);
    }
}
