package com.food.entity;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class Banner implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer id;
    private String title;
    private String subtitle;
    private String imageUrl;
    private String background;
    private String linkType;
    private String linkValue;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
