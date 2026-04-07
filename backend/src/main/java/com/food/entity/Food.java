package com.food.entity;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Food implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer foodId;
    private String name;
    private BigDecimal price;
    private String description;
    private String image;
    private Integer categoryId;
    private Integer storeId;
    private Double rating;
    private Integer sales;
    private List<String> tags;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    private String categoryName;
    private String storeName;

}