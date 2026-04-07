package com.food.entity;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class Category implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer categoryId;
    private String categoryName;
    private String icon;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

}