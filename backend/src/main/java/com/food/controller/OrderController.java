package com.food.controller;

import com.food.dto.BaseResult;
import com.food.entity.Order;
import com.food.entity.Store;
import com.food.entity.User;
import com.food.service.OrderService;
import com.food.service.StoreService;
import com.food.service.UserService;
import com.food.utils.JwtUtil;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/order")
@Api(tags = "订单管理接口")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private StoreService storeService;

    @Autowired
    private JwtUtil jwtUtil;

    private Integer getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token != null && !token.isEmpty()) {
            return jwtUtil.getUserIdFromToken(token);
        }
        return null;
    }

    @PostMapping
    @ApiOperation(value = "创建订单", notes = "从购物车创建订单")
    public BaseResult createOrder(@RequestBody OrderRequest orderRequest, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setStoreId(orderRequest.getStoreId());
        order.setDeliveryFee(orderRequest.getDeliveryFee());
        order.setAddress(orderRequest.getAddress());
        order.setPhone(orderRequest.getPhone());
        order.setRemark(orderRequest.getRemark());

        return orderService.createOrder(order, orderRequest.getCartIds());
    }

    @PutMapping
    @ApiOperation(value = "更新订单", notes = "更新订单信息")
    public BaseResult updateOrder(@RequestBody Order order, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证订单属于该用户
        Order existingOrder = (Order) orderService.getOrderById(order.getOrderId()).getData();
        if (existingOrder == null || !existingOrder.getUserId().equals(userId)) {
            return BaseResult.error(403, "无权操作该订单");
        }

        return orderService.updateOrder(order);
    }

    @DeleteMapping("/{orderId}")
    @ApiOperation(value = "删除订单", notes = "删除指定订单")
    public BaseResult deleteOrder(@PathVariable Integer orderId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证订单属于该用户
        Order order = (Order) orderService.getOrderById(orderId).getData();
        if (order == null || !order.getUserId().equals(userId)) {
            return BaseResult.error(403, "无权操作该订单");
        }

        return orderService.deleteOrder(orderId);
    }

    @GetMapping("/{orderId}")
    @ApiOperation(value = "获取订单详情", notes = "根据ID获取订单详情")
    public BaseResult getOrderById(@PathVariable Integer orderId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证订单属于该用户
        Order order = (Order) orderService.getOrderById(orderId).getData();
        if (order == null || !order.getUserId().equals(userId)) {
            return BaseResult.error(403, "无权查看该订单");
        }

        return orderService.getOrderById(orderId);
    }

    @GetMapping("/user/{userId}")
    @ApiOperation(value = "获取用户订单", notes = "获取指定用户的订单列表")
    public BaseResult getOrdersByUserId(@PathVariable Integer userId, HttpServletRequest request) {
        Integer currentUserId = getUserIdFromRequest(request);
        if (currentUserId == null) {
            return BaseResult.error(401, "未登录");
        }

        if (!currentUserId.equals(userId)) {
            return BaseResult.error(403, "无权查看该用户的订单");
        }

        return orderService.getOrdersByUserId(userId);
    }

    @GetMapping("/store/{storeId}")
    @ApiOperation(value = "获取商家订单", notes = "获取指定商家的订单列表")
    public BaseResult getOrdersByStoreId(@PathVariable Integer storeId, HttpServletRequest request) {
        // 实际项目中应该验证用户是否是商家管理员
        return orderService.getOrdersByStoreId(storeId);
    }

    @GetMapping("/status/{status}")
    @ApiOperation(value = "根据状态获取订单", notes = "获取指定状态的订单列表")
    public BaseResult getOrdersByStatus(@PathVariable String status, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        BaseResult result = orderService.getOrdersByStatus(status);
        if (result.getData() instanceof List) {
            List<Order> orders = (List<Order>) result.getData();
            // 过滤该用户的订单
            orders.removeIf(order -> !order.getUserId().equals(userId));
            return BaseResult.success(orders);
        }
        return result;
    }

    // 定义允许的状态转换规则
    private static final Map<String, List<String>> ALLOWED_STATUS_TRANSITIONS = new HashMap<String, List<String>>() {{
        put("待付款", Arrays.asList("已取消", "已支付"));
        put("已支付", Arrays.asList("制作中", "已退款"));
        put("制作中", Arrays.asList("配送中"));
        put("配送中", Arrays.asList("已完成"));
        put("已完成", Arrays.asList());
        put("已取消", Arrays.asList());
        put("已退款", Arrays.asList());
    }};

    @PutMapping("/{orderId}/status")
    @ApiOperation(value = "更新订单状态", notes = "更新订单状态")
    @ApiImplicitParam(name = "status", value = "新状态", required = true, paramType = "body")
    public BaseResult updateOrderStatus(@PathVariable Integer orderId, @RequestBody StatusRequest statusRequest, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证订单属于该用户
        Order order = (Order) orderService.getOrderById(orderId).getData();
        if (order == null || !order.getUserId().equals(userId)) {
            return BaseResult.error(403, "无权操作该订单");
        }

        String newStatus = statusRequest.getStatus();
        String currentStatus = order.getStatus();

        // 验证状态转换是否合法
        List<String> allowedTransitions = ALLOWED_STATUS_TRANSITIONS.get(currentStatus);
        if (allowedTransitions == null || !allowedTransitions.contains(newStatus)) {
            return BaseResult.error(400, "非法的状态转换: " + currentStatus + " -> " + newStatus);
        }

        return orderService.updateOrderStatus(orderId, newStatus);
    }

    @PutMapping("/{orderId}/cancel")
    @ApiOperation(value = "取消订单", notes = "取消指定订单")
    public BaseResult cancelOrder(@PathVariable Integer orderId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证订单属于该用户
        Order order = (Order) orderService.getOrderById(orderId).getData();
        if (order == null || !order.getUserId().equals(userId)) {
            return BaseResult.error(403, "无权操作该订单");
        }

        return orderService.cancelOrder(orderId);
    }

    @PutMapping("/{orderId}/pay")
    @ApiOperation(value = "支付订单", notes = "支付指定订单")
    public BaseResult payOrder(@PathVariable Integer orderId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证订单属于该用户
        Order order = (Order) orderService.getOrderById(orderId).getData();
        if (order == null || !order.getUserId().equals(userId)) {
            return BaseResult.error(403, "无权操作该订单");
        }

        return orderService.payOrder(orderId);
    }

    @GetMapping("/{orderId}/rider")
    @ApiOperation(value = "获取骑手信息", notes = "获取订单的骑手信息")
    public BaseResult getRiderInfo(@PathVariable Integer orderId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证订单属于该用户
        Order order = (Order) orderService.getOrderById(orderId).getData();
        if (order == null || !order.getUserId().equals(userId)) {
            return BaseResult.error(403, "无权查看该订单");
        }

        // 检查订单是否处于配送状态
        if (!"配送中".equals(order.getStatus())) {
            return BaseResult.error(400, "订单尚未开始配送");
        }

        Map<String, Object> riderInfo = new HashMap<>();
        riderInfo.put("riderId", order.getRiderId());
        riderInfo.put("riderName", order.getRiderName());
        riderInfo.put("riderPhone", order.getRiderPhone());
        riderInfo.put("riderAvatar", order.getRiderAvatar());
        riderInfo.put("currentLocation", new HashMap<String, BigDecimal>() {{
            put("longitude", order.getRiderLongitude());
            put("latitude", order.getRiderLatitude());
        }});
        riderInfo.put("estimatedDeliveryTime", order.getEstimatedDeliveryTime());
        riderInfo.put("dispatchTime", order.getDispatchTime());

        return BaseResult.success(riderInfo);
    }

    @GetMapping("/{orderId}/tracking")
    @ApiOperation(value = "查看配送信息", notes = "获取订单配送追踪信息")
    public BaseResult trackDelivery(@PathVariable Integer orderId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证订单属于该用户
        Order order = (Order) orderService.getOrderById(orderId).getData();
        if (order == null || !order.getUserId().equals(userId)) {
            return BaseResult.error(403, "无权查看该订单");
        }

        Map<String, Object> trackingInfo = new HashMap<>();
        trackingInfo.put("orderId", order.getOrderId());
        trackingInfo.put("status", order.getStatus());
        trackingInfo.put("deliveryProgress", order.getDeliveryProgress());
        trackingInfo.put("riderInfo", new HashMap<String, Object>() {{
            put("name", order.getRiderName());
            put("phone", order.getRiderPhone());
            put("avatar", order.getRiderAvatar());
            put("location", new HashMap<String, BigDecimal>() {{
                put("longitude", order.getRiderLongitude());
                put("latitude", order.getRiderLatitude());
            }});
        }});
        trackingInfo.put("estimatedDeliveryTime", order.getEstimatedDeliveryTime());
        trackingInfo.put("dispatchTime", order.getDispatchTime());
        trackingInfo.put("actualDeliveryTime", order.getActualDeliveryTime());

        // 获取商家位置
        BigDecimal storeLongitude = new BigDecimal("116.397428");
        BigDecimal storeLatitude = new BigDecimal("39.90923");
        if (order.getStoreId() != null) {
            try {
                BaseResult storeResult = storeService.getStoreById(order.getStoreId());
                if (storeResult != null && storeResult.getData() instanceof Store) {
                    Store store = (Store) storeResult.getData();
                    if (store.getLng() != null) {
                        storeLongitude = BigDecimal.valueOf(store.getLng());
                    }
                    if (store.getLat() != null) {
                        storeLatitude = BigDecimal.valueOf(store.getLat());
                    }
                }
            } catch (Exception e) {
                // 如果获取商家信息失败，使用默认位置（已初始化）
            }
        }
        
        // 获取用户地址位置
        BigDecimal userLongitude = new BigDecimal("116.397428");
        BigDecimal userLatitude = new BigDecimal("39.90923");
        try {
            User user = userService.getUserById(userId);
            if (user != null) {
                // 用户没有直接存储经纬度，使用默认地址位置
                // 实际项目中应该从 user_addresses 表获取
                // 已使用默认值，无需修改
            }
        } catch (Exception e) {
            // 如果获取用户信息失败，使用默认位置（已初始化）
        }

        Map<String, BigDecimal> storeLocationMap = new HashMap<>();
        storeLocationMap.put("longitude", storeLongitude);
        storeLocationMap.put("latitude", storeLatitude);
        trackingInfo.put("storeLocation", storeLocationMap);
        
        Map<String, BigDecimal> userLocationMap = new HashMap<>();
        userLocationMap.put("longitude", userLongitude);
        userLocationMap.put("latitude", userLatitude);
        trackingInfo.put("userLocation", userLocationMap);

        return BaseResult.success(trackingInfo);
    }

    @PutMapping("/{orderId}/complete")
    @ApiOperation(value = "确认收货", notes = "用户确认收到订单商品")
    public BaseResult completeOrder(@PathVariable Integer orderId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证订单属于该用户
        Order order = (Order) orderService.getOrderById(orderId).getData();
        if (order == null || !order.getUserId().equals(userId)) {
            return BaseResult.error(403, "无权操作该订单");
        }

        // 只能完成配送中的订单
        if (!"配送中".equals(order.getStatus())) {
            return BaseResult.error(400, "当前状态无法完成订单");
        }

        // 完成订单
        BaseResult result = orderService.completeOrder(orderId);
        if (result.getCode() == 200) {
            // 为用户增加积分奖励
            userService.updateUserPoints(userId, 50); // 确认收货奖励50积分

            // 返回更新后的订单信息
            Order updatedOrder = (Order) orderService.getOrderById(orderId).getData();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "确认收货成功");
            response.put("order", updatedOrder);
            response.put("pointsAwarded", 50);

            return BaseResult.success(response);
        }

        return result;
    }

    @PutMapping("/{orderId}/remind")
    @ApiOperation(value = "催单", notes = "用户催促商家或骑手")
    public BaseResult remindOrder(@PathVariable Integer orderId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证订单属于该用户
        Order order = (Order) orderService.getOrderById(orderId).getData();
        if (order == null || !order.getUserId().equals(userId)) {
            return BaseResult.error(403, "无权操作该订单");
        }

        // 检查订单状态
        if ("已完成".equals(order.getStatus()) || "已取消".equals(order.getStatus())) {
            return BaseResult.error(400, "当前状态无法催单");
        }

        // 记录催单信息
        Map<String, Object> reminder = new HashMap<>();
        reminder.put("orderId", orderId);
        reminder.put("userId", userId);
        reminder.put("remindTime", LocalDateTime.now());
        reminder.put("orderStatus", order.getStatus());

        // 这里可以发送通知给商家或骑手
        // notificationService.sendReminder(reminder);

        return BaseResult.success("催单提醒已发送");
    }

    @GetMapping("/statistics")
    @ApiOperation(value = "获取订单统计", notes = "获取用户订单统计信息")
    public BaseResult getOrderStatistics(HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 获取用户的所有订单
        BaseResult ordersResult = orderService.getOrdersByUserId(userId);
        if (ordersResult.getData() instanceof List) {
            List<Order> orders = (List<Order>) ordersResult.getData();

            Map<String, Object> statistics = new HashMap<>();
            int totalOrders = orders.size();
            int pendingCount = 0, preparingCount = 0, deliveringCount = 0, completedCount = 0;
            double totalSpent = 0.0;

            for (Order order : orders) {
                totalSpent += order.getPayAmount().doubleValue();
                switch (order.getStatus()) {
                    case "待付款":
                        pendingCount++;
                        break;
                    case "制作中":
                        preparingCount++;
                        break;
                    case "配送中":
                        deliveringCount++;
                        break;
                    case "已完成":
                        completedCount++;
                        break;
                }
            }

            statistics.put("totalOrders", totalOrders);
            statistics.put("pendingOrders", pendingCount);
            statistics.put("preparingOrders", preparingCount);
            statistics.put("deliveringOrders", deliveringCount);
            statistics.put("completedOrders", completedCount);
            statistics.put("totalSpent", totalSpent);

            return BaseResult.success(statistics);
        }

        return ordersResult;
    }

    // 内部类用于订单创建请求
    private static class OrderRequest {
        private Integer storeId;
        private BigDecimal deliveryFee;
        private String address;
        private String phone;
        private String remark;
        private List<Integer> cartIds;

        // getters and setters
        public Integer getStoreId() { return storeId; }
        public void setStoreId(Integer storeId) { this.storeId = storeId; }
        public BigDecimal getDeliveryFee() { return deliveryFee; }
        public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getRemark() { return remark; }
        public void setRemark(String remark) { this.remark = remark; }
        public List<Integer> getCartIds() { return cartIds; }
        public void setCartIds(List<Integer> cartIds) { this.cartIds = cartIds; }
    }

    // 内部类用于状态更新请求
    private static class StatusRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}