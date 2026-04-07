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

    int deleteById(Integer orderId);

}