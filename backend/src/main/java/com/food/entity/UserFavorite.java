package com.food.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户收藏商家实体
 */
@Data
@TableName("user_favorites")
public class UserFavorite {

    @TableId(type = IdType.AUTO)
    private Integer id;

    /** 用户ID */
    private Integer userId;

    /** 商家ID */
    private Integer storeId;

    /** 收藏时间 */
    private LocalDateTime createTime;
}
