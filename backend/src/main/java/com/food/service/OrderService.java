package com.food.service;

import com.food.dto.BaseResult;
import com.food.entity.Cart;
import com.food.entity.Food;
import com.food.entity.Order;
import com.food.entity.OrderDetail;
import com.food.mapper.*;
import com.food.controller.OrderController.OrderItemRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderDetailMapper orderDetailMapper;

    @Autowired
    private CartMapper cartMapper;

    @Autowired
    private FoodMapper foodMapper;

    @Autowired
    private PaymentRecordMapper paymentRecordMapper;

    @Transactional
    public BaseResult createOrder(Order order, List<Integer> cartIds, List<OrderItemRequest> items) {
        try {
            // 生成订单号
            String orderNo = "ORD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                    + String.format("%04d", (int)(Math.random() * 10000));
            order.setOrderNo(orderNo);
            order.setStatus("待付款");
            order.setCreateTime(LocalDateTime.now());
            order.setUpdateTime(LocalDateTime.now());

            // 计算订单金额
            BigDecimal totalAmount = BigDecimal.ZERO;
            List<OrderDetail> orderDetails = new ArrayList<>();

            if (cartIds != null && !cartIds.isEmpty()) {
                // 从购物车创建订单
                for (Integer cartId : cartIds) {
                    Cart cart = cartMapper.selectById(cartId);
                    if (cart == null) {
                        continue;
                    }

                    // 校验购物车归属，防止越权操作他人购物车
                    if (order.getUserId() == null || !order.getUserId().equals(cart.getUserId())) {
                        return BaseResult.error(403, "购物车项不存在或不属于当前用户");
                    }

                    Food food = foodMapper.selectById(cart.getFoodId());
                    BigDecimal unitPrice = food != null && food.getPrice() != null
                            ? food.getPrice() : BigDecimal.ZERO;

                    BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(cart.getQuantity()));
                    totalAmount = totalAmount.add(itemTotal);

                    OrderDetail detail = new OrderDetail();
                    detail.setFoodId(cart.getFoodId());
                    detail.setFoodName(cart.getFoodName() != null ? cart.getFoodName() :
                            (food != null ? food.getName() : "未知菜品"));
                    detail.setPrice(unitPrice);
                    detail.setQuantity(cart.getQuantity());
                    detail.setTotalPrice(itemTotal);
                    detail.setCreateTime(LocalDateTime.now());
                    orderDetails.add(detail);
                }

                // 清除已下单的购物车项
                for (Integer cartId : cartIds) {
                    cartMapper.deleteById(cartId);
                }
            } else if (items != null && !items.isEmpty()) {
                // 从前端 items 直接创建订单明细（立即购买场景）
                for (OrderItemRequest item : items) {
                    BigDecimal unitPrice = item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO;
                    int quantity = item.getQuantity() != null ? item.getQuantity() : 1;
                    BigDecimal itemTotal = item.getTotalPrice() != null ? item.getTotalPrice() :
                            unitPrice.multiply(BigDecimal.valueOf(quantity));
                    totalAmount = totalAmount.add(itemTotal);

                    OrderDetail detail = new OrderDetail();
                    detail.setFoodId(item.getFoodId());
                    detail.setFoodName(item.getName() != null ? item.getName() : "未知菜品");
                    detail.setPrice(unitPrice);
                    detail.setQuantity(quantity);
                    detail.setTotalPrice(itemTotal);
                    detail.setCreateTime(LocalDateTime.now());
                    orderDetails.add(detail);
                }
            }

            // 设置订单金额
            BigDecimal deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
            order.setTotalAmount(totalAmount.add(deliveryFee));
            order.setDeliveryFee(deliveryFee);
            order.setDiscountAmount(BigDecimal.ZERO);
            order.setPayAmount(order.getTotalAmount());

            // 插入订单
            int result = orderMapper.insert(order);
            if (result <= 0) {
                return BaseResult.error("创建订单失败");
            }

            // 插入订单详情
            for (OrderDetail detail : orderDetails) {
                detail.setOrderId(order.getOrderId());
                orderDetailMapper.insert(detail);
            }

            // 返回订单信息
            order.setOrderDetails(orderDetails);
            return BaseResult.success("订单创建成功", order);
        } catch (Exception e) {
            return BaseResult.error("创建订单失败: " + e.getMessage());
        }
    }

    public BaseResult getOrderById(Integer orderId) {
        try {
            Order order = orderMapper.selectById(orderId);
            if (order == null) {
                return BaseResult.error(404, "订单不存在");
            }
            // 查询订单详情
            List<OrderDetail> details = orderDetailMapper.selectByOrderId(orderId);
            order.setOrderDetails(details);
            return BaseResult.success(order);
        } catch (Exception e) {
            return BaseResult.error("获取订单失败: " + e.getMessage());
        }
    }

    public BaseResult getOrdersByUserId(Integer userId) {
        try {
            List<Order> orders = orderMapper.selectByUserId(userId);
            // 查询每个订单的详情
            for (Order order : orders) {
                List<OrderDetail> details = orderDetailMapper.selectByOrderId(order.getOrderId());
                order.setOrderDetails(details);
            }
            return BaseResult.success(orders);
        } catch (Exception e) {
            return BaseResult.error("获取订单列表失败: " + e.getMessage());
        }
    }

    public BaseResult getOrdersByStoreId(Integer storeId) {
        try {
            List<Order> orders = orderMapper.selectByStoreId(storeId);
            for (Order order : orders) {
                List<OrderDetail> details = orderDetailMapper.selectByOrderId(order.getOrderId());
                order.setOrderDetails(details);
            }
            return BaseResult.success(orders);
        } catch (Exception e) {
            return BaseResult.error("获取商家订单失败: " + e.getMessage());
        }
    }

    public BaseResult getOrdersByStatus(String status) {
        try {
            List<Order> orders = orderMapper.selectByStatus(status);
            return BaseResult.success(orders);
        } catch (Exception e) {
            return BaseResult.error("获取订单列表失败: " + e.getMessage());
        }
    }

    public BaseResult updateOrder(Order order) {
        try {
            order.setUpdateTime(LocalDateTime.now());
            int result = orderMapper.update(order);
            if (result > 0) {
                return BaseResult.success("更新订单成功");
            }
            return BaseResult.error("更新订单失败");
        } catch (Exception e) {
            return BaseResult.error("更新订单失败: " + e.getMessage());
        }
    }

    public BaseResult updateOrderStatus(Integer orderId, String status) {
        try {
            int result = orderMapper.updateStatus(orderId, status);
            if (result > 0) {
                return BaseResult.success("更新订单状态成功");
            }
            return BaseResult.error("更新订单状态失败");
        } catch (Exception e) {
            return BaseResult.error("更新订单状态失败: " + e.getMessage());
        }
    }

    public BaseResult cancelOrder(Integer orderId) {
        try {
            Order order = orderMapper.selectById(orderId);
            if (order == null) {
                return BaseResult.error(404, "订单不存在");
            }
            if (!"待付款".equals(order.getStatus())) {
                return BaseResult.error(400, "只有待付款的订单可以取消");
            }
            int result = orderMapper.updateStatus(orderId, "已取消");
            if (result > 0) {
                return BaseResult.success("订单已取消");
            }
            return BaseResult.error("取消订单失败");
        } catch (Exception e) {
            return BaseResult.error("取消订单失败: " + e.getMessage());
        }
    }

    @Transactional
    public BaseResult payOrder(Integer orderId) {
        try {
            Order order = orderMapper.selectById(orderId);
            if (order == null) {
                return BaseResult.error(404, "订单不存在");
            }
            if (!"待付款".equals(order.getStatus())) {
                return BaseResult.error(400, "订单状态不允许支付");
            }

            // 更新订单状态
            int result = orderMapper.updateStatus(orderId, "制作中");
            if (result <= 0) {
                return BaseResult.error("支付失败");
            }

            // 创建支付记录
            com.food.entity.PaymentRecord paymentRecord = new com.food.entity.PaymentRecord();
            paymentRecord.setOrderId(orderId);
            paymentRecord.setPaymentNo("PAY" + System.currentTimeMillis());
            paymentRecord.setPaymentMethod("微信支付");
            paymentRecord.setAmount(order.getPayAmount());
            paymentRecord.setStatus("已支付");
            paymentRecord.setPayTime(LocalDateTime.now());
            paymentRecord.setCreateTime(LocalDateTime.now());
            paymentRecordMapper.insert(paymentRecord);

            return BaseResult.success("支付成功", order);
        } catch (Exception e) {
            return BaseResult.error("支付失败: " + e.getMessage());
        }
    }

    public BaseResult completeOrder(Integer orderId) {
        try {
            int result = orderMapper.updateStatus(orderId, "已完成");
            if (result > 0) {
                return BaseResult.success("订单已完成");
            }
            return BaseResult.error("完成订单失败");
        } catch (Exception e) {
            return BaseResult.error("完成订单失败: " + e.getMessage());
        }
    }

    public BaseResult deleteOrder(Integer orderId) {
        try {
            // 删除订单详情
            orderDetailMapper.deleteByOrderId(orderId);
            // 删除订单
            int result = orderMapper.deleteById(orderId);
            if (result > 0) {
                return BaseResult.success("删除订单成功");
            }
            return BaseResult.error("删除订单失败");
        } catch (Exception e) {
            return BaseResult.error("删除订单失败: " + e.getMessage());
        }
    }
}
