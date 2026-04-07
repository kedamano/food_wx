package com.food.mapper;

import com.food.entity.UserCoupon;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface UserCouponMapper {

    int insert(UserCoupon userCoupon);

    int update(UserCoupon userCoupon);

    UserCoupon selectById(Integer userCouponId);

    List<UserCoupon> selectByUserId(Integer userId);
    
    List<UserCoupon> selectAvailableByUserId(Integer userId);
    
    List<UserCoupon> selectUsedByUserId(Integer userId);
    
    List<UserCoupon> selectExpiredByUserId(Integer userId);
}
