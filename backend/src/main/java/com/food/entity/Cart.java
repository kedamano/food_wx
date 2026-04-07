package com.food.entity;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class Cart implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer cartId;
    private Integer userId;
    private Integer foodId;
    private Integer quantity;
    private Integer storeId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    private String foodName;
    private String foodImage;
    private Double foodPrice;

}