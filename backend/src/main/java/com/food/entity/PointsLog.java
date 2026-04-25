package com.food.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分变动日志实体
 */
@Data
@TableName("points_log")
public class PointsLog {

    @TableId(type = IdType.AUTO)
    private Integer id;

    /** 用户ID */
    private Integer userId;

    /** 积分变化量（正为增加，负为减少） */
    @com.baomidou.mybatisplus.annotation.TableField("`change`")
    private Integer change;

    /** 操作类型：SIGN_IN/ORDER_COMPLETE/ADMIN/EXCHANGE/REVIEW */
    private String type;

    /** 操作原因/描述 */
    private String reason;

    /** 操作后余额 */
    private Integer balance;

    /** 创建时间 */
    private LocalDateTime createTime;
}
