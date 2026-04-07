package com.food.entity;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderDetail implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer detailId;
    private Integer orderId;
    private Integer foodId;
    private String foodName;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal totalPrice;
    private LocalDateTime createTime;

}