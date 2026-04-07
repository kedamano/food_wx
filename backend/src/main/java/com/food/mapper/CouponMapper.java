package com.food.mapper;

import com.food.entity.Coupon;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface CouponMapper {

    Coupon selectById(Integer couponId);

    List<Coupon> selectAll();
    
    List<Coupon> selectAvailable();
}
