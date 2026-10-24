package com.food.service;

import com.food.dto.BaseResult;
import com.food.entity.Food;
import com.food.entity.Order;
import com.food.entity.OrderDetail;
import com.food.mapper.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

/**
 * OrderService 单元测试 (Mockito 隔离测试)
 *
 * 验证订单创建、支付、取消等核心业务逻辑
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService 订单服务测试")
class OrderServiceTest {

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private OrderDetailMapper orderDetailMapper;

    @Mock
    private CartMapper cartMapper;

    @Mock
    private FoodMapper foodMapper;

    @Mock
    private PaymentRecordMapper paymentRecordMapper;

    @InjectMocks
    private OrderService orderService;

    private Order createTestOrder(Integer orderId, Integer userId, String status) {
        Order order = new Order();
        order.setOrderId(orderId);
        order.setOrderNo("ORD-TEST-" + orderId);
        order.setUserId(userId);
        order.setStoreId(1);
        order.setTotalAmount(new BigDecimal("50.00"));
        order.setPayAmount(new BigDecimal("50.00"));
        order.setStatus(status);
        return order;
    }

    @Nested
    @DisplayName("取消订单测试")
    class CancelOrderTests {

        @Test
        @DisplayName("待付款订单可以取消")
        void shouldCancelPendingPaymentOrder() {
            Order order = createTestOrder(1, 1, "待付款");

            when(orderMapper.selectById(1)).thenReturn(order);
            when(orderMapper.updateStatus(eq(1), eq("已取消"))).thenReturn(1);

            BaseResult result = orderService.cancelOrder(1);

            assertEquals(200, result.getCode());
            assertTrue(result.getMessage().contains("已取消"));
        }

        @Test
        @DisplayName("非待付款订单不能取消")
        void shouldRejectCancelOfNonPendingOrder() {
            Order order = createTestOrder(2, 1, "制作中");

            when(orderMapper.selectById(2)).thenReturn(order);

            BaseResult result = orderService.cancelOrder(2);

            assertEquals(400, result.getCode());
            verify(orderMapper, never()).updateStatus(anyInt(), anyString());
        }

        @Test
        @DisplayName("取消不存在的订单应返回 404")
        void shouldReturn404ForCancelNonexistentOrder() {
            when(orderMapper.selectById(999)).thenReturn(null);

            BaseResult result = orderService.cancelOrder(999);

            assertEquals(404, result.getCode());
        }
    }

    @Nested
    @DisplayName("支付订单测试")
    class PayOrderTests {

        @Test
        @DisplayName("待付款订单支付应成功并创建支付记录")
        void shouldPayPendingOrder() {
            Order order = createTestOrder(1, 1, "待付款");

            when(orderMapper.selectById(1)).thenReturn(order);
            when(orderMapper.updateStatus(eq(1), eq("制作中"))).thenReturn(1);
            when(paymentRecordMapper.insert(any())).thenReturn(1);

            BaseResult result = orderService.payOrder(1);

            assertEquals(200, result.getCode());
            verify(paymentRecordMapper, times(1)).insert(any());
        }

        @Test
        @DisplayName("非待付款订单不能支付")
        void shouldRejectPayOfNonPendingOrder() {
            Order order = createTestOrder(2, 1, "已完成");

            when(orderMapper.selectById(2)).thenReturn(order);

            BaseResult result = orderService.payOrder(2);

            assertEquals(400, result.getCode());
            verify(orderMapper, never()).updateStatus(anyInt(), anyString());
            verify(paymentRecordMapper, never()).insert(any());
        }

        @Test
        @DisplayName("支付不存在的订单应返回 404")
        void shouldReturn404ForPayNonexistentOrder() {
            when(orderMapper.selectById(999)).thenReturn(null);

            BaseResult result = orderService.payOrder(999);

            assertEquals(404, result.getCode());
        }
    }

    @Nested
    @DisplayName("获取订单测试")
    class GetOrderTests {

        @Test
        @DisplayName("获取存在的订单应返回订单及详情")
        void shouldReturnOrderWithDetails() {
            Order order = createTestOrder(1, 1, "待付款");
            List<OrderDetail> details = Collections.emptyList();

            when(orderMapper.selectById(1)).thenReturn(order);
            when(orderDetailMapper.selectByOrderId(1)).thenReturn(details);

            BaseResult result = orderService.getOrderById(1);

            assertEquals(200, result.getCode());
            Order returnedOrder = (Order) result.getData();
            assertEquals(1, returnedOrder.getOrderId());
        }

        @Test
        @DisplayName("获取不存在的订单应返回 404")
        void shouldReturn404ForNonexistentOrder() {
            when(orderMapper.selectById(999)).thenReturn(null);

            BaseResult result = orderService.getOrderById(999);

            assertEquals(404, result.getCode());
        }
    }

    @Nested
    @DisplayName("确认收货测试")
    class CompleteOrderTests {

        @Test
        @DisplayName("完成订单状态更新应成功")
        void shouldCompleteOrder() {
            when(orderMapper.updateStatus(eq(1), eq("已完成"))).thenReturn(1);

            BaseResult result = orderService.completeOrder(1);

            assertEquals(200, result.getCode());
            verify(orderMapper).updateStatus(1, "已完成");
        }
    }

    @Nested
    @DisplayName("删除订单测试")
    class DeleteOrderTests {

        @Test
        @DisplayName("删除订单应先删详情再删订单")
        void shouldDeleteDetailsBeforeOrder() {
            when(orderDetailMapper.deleteByOrderId(1)).thenReturn(1);
            when(orderMapper.deleteById(1)).thenReturn(1);

            BaseResult result = orderService.deleteOrder(1);

            assertEquals(200, result.getCode());

            // 验证删除顺序
            org.mockito.InOrder deletionOrder = inOrder(orderDetailMapper, orderMapper);
            deletionOrder.verify(orderDetailMapper).deleteByOrderId(1);
            deletionOrder.verify(orderMapper).deleteById(1);
        }
    }
}
