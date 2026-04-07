package com.food.mapper;

import com.food.entity.OrderDetail;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface OrderDetailMapper {

    int insert(OrderDetail orderDetail);

    int update(OrderDetail orderDetail);

    OrderDetail selectById(Integer detailId);

    List<OrderDetail> selectByOrderId(Integer orderId);

    int deleteById(Integer detailId);

    int deleteByOrderId(Integer orderId);

}