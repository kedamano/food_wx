package com.food.entity;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 收货地址实体类
 */
@Data
public class Address implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 地址ID
     */
    private Integer addressId;

    /**
     * 用户ID
     */
    private Integer userId;

    /**
     * 收货人姓名
     */
    private String name;

    /**
     * 收货人手机号
     */
    private String phone;

    /**
     * 省份
     */
    private String province;

    /**
     * 城市
     */
    private String city;

    /**
     * 区县
     */
    private String district;

    /**
     * 详细地址
     */
    private String detail;

    /**
     * 完整地址（省+市+区+详细地址）
     */
    private String fullAddress;

    /**
     * 地址标签：home-家，work-公司，other-其他
     */
    private String tag;

    /**
     * 是否默认地址：0-否，1-是
     */
    private Integer isDefault;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 是否删除：0-否，1-是
     */
    private Integer isDeleted;
}
