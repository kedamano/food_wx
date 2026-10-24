package com.food.mapper;

import com.food.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

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

}