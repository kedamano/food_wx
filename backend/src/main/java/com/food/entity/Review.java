package com.food.entity;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Review implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer reviewId;
    private Integer orderId;
    private Integer userId;
    private Integer foodId;
    private Integer rating;
    private String content;
    private List<String> images;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    private String username;
    private String avatar;

}