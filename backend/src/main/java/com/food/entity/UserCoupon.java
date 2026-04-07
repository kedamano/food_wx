package com.food.entity;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class UserCoupon implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer userCouponId;
    private Integer userId;
    private Integer couponId;
    private Integer isUsed;
    private LocalDateTime usedTime;
    private Integer orderId;
    private LocalDateTime createTime;
    
    // 关联的优惠券信息（用于展示）
    private String couponName;
    private Double discountAmount;
    private Double minAmount;
    private String endTime;
}
