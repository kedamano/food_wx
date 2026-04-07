package com.food.entity;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Order implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer orderId;
    private String orderNo;
    private Integer userId;
    private Integer storeId;
    private BigDecimal totalAmount;
    private BigDecimal deliveryFee;
    private BigDecimal discountAmount;
    private BigDecimal payAmount;
    private String status;
    private String address;
    private String phone;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    // 骑手信息
    private Integer riderId;
    private String riderName;
    private String riderPhone;
    private String riderAvatar;
    private BigDecimal riderLongitude;
    private BigDecimal riderLatitude;

    // 配送信息
    private LocalDateTime dispatchTime;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime actualDeliveryTime;
    private String deliveryProgress;

    private String storeName;
    
    private List<OrderDetail> orderDetails;

}