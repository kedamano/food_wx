package com.food.mapper;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import java.util.Map;

/**
 * 积分商城：商品、任务判定所需查询
 */
@Mapper
public interface PointsProductMapper {

    @Select("SELECT product_id AS productId, name, points_cost AS pointsCost, stock, image, " +
            "coupon_template_id AS couponTemplateId, description FROM points_products " +
            "WHERE status = 1 ORDER BY points_cost ASC")
    List<Map<String, Object>> selectActiveProducts();

    @Select("SELECT product_id AS productId, name, points_cost AS pointsCost, stock, image, " +
            "coupon_template_id AS couponTemplateId, description FROM points_products WHERE product_id = #{productId}")
    Map<String, Object> selectById(@Param("productId") Integer productId);

    @Update("UPDATE points_products SET stock = stock - 1 WHERE product_id = #{productId} AND stock > 0")
    int decreaseStock(@Param("productId") Integer productId);
}
