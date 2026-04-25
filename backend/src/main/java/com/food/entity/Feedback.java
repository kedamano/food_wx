package com.food.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户反馈实体
 */
@Data
@TableName("feedback")
public class Feedback {

    @TableId(type = IdType.AUTO)
    private Integer id;

    /** 用户ID */
    private Integer userId;

    /** 反馈类型：1-功能建议 2-Bug反馈 3-体验问题 4-其他 */
    private Integer type;

    /** 反馈内容 */
    private String content;

    /** 联系方式 */
    private String contact;

    /** 处理状态：pending/resolved */
    private String status;

    /** 创建时间 */
    private LocalDateTime createTime;
}
