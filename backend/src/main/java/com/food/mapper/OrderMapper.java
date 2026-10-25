package com.food.mapper;

import com.food.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;
import java.util.Map;

@Mapper
public interface OrderMapper {

    int insert(Order order);

    int update(Order order);

    Order selectById(Integer orderId);

    Order selectByOrderNo(String orderNo);

    List<Order> selectByUserId(Integer userId);

    List<Order> selectByStoreId(Integer storeId);

    List<Order> selectByStatus(@Param("status") String status);

    int updateStatus(@Param("orderId") Integer orderId, @Param("status") String status);

    int updateDispatch(@Param("orderId") Integer orderId,
                       @Param("riderId") Integer riderId,
                       @Param("riderName") String riderName,
                       @Param("riderPhone") String riderPhone);

    int updateRiderLocation(@Param("orderId") Integer orderId,
                            @Param("longitude") java.math.BigDecimal longitude,
                            @Param("latitude") java.math.BigDecimal latitude,
                            @Param("progress") Integer progress);

    int updateDelivered(@Param("orderId") Integer orderId);

    List<Order> selectByUserIdPage(@Param("userId") Integer userId,
                                   @Param("status") String status,
                                   @Param("offset") int offset,
                                   @Param("limit") int limit);

    long countByUserId(@Param("userId") Integer userId,
                       @Param("status") String status);

    int deleteById(Integer orderId);

    /** 今日订单数（每日任务判定用） */
    @Select("SELECT COUNT(*) FROM orders WHERE user_id = #{userId} AND DATE(create_time) = CURDATE()")
    int countTodayByUser(@Param("userId") Integer userId);

    /** 聚合统计（SQL 化，替代全量拉内存计算） */
    @Select("SELECT COUNT(*) AS totalOrders, " +
            "SUM(CASE WHEN status='待付款' THEN 1 ELSE 0 END) AS pendingOrders, " +
            "SUM(CASE WHEN status='制作中' THEN 1 ELSE 0 END) AS preparingOrders, " +
            "SUM(CASE WHEN status='配送中' THEN 1 ELSE 0 END) AS deliveringOrders, " +
            "SUM(CASE WHEN status='已完成' THEN 1 ELSE 0 END) AS completedOrders, " +
            "COALESCE(SUM(CASE WHEN status NOT IN ('已取消','已退款','待付款') THEN pay_amount ELSE 0 END), 0) AS totalSpent " +
            "FROM orders WHERE user_id = #{userId}")
    Map<String, Object> statisticsByUser(@Param("userId") Integer userId);

}