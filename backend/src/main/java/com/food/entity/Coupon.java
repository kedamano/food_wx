package com.food.entity;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Coupon implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer couponId;
    private String couponName;
    private BigDecimal discountAmount;
    private BigDecimal minAmount;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
