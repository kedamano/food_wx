package com.food.mapper;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 菜品收藏
 */
@Mapper
public interface FoodFavoriteMapper {

    @Select("SELECT id FROM food_favorites WHERE user_id = #{userId} AND food_id = #{foodId}")
    Long select(@Param("userId") Integer userId, @Param("foodId") Integer foodId);

    @Insert("INSERT INTO food_favorites (user_id, food_id) VALUES (#{userId}, #{foodId})")
    int insert(@Param("userId") Integer userId, @Param("foodId") Integer foodId);

    @Delete("DELETE FROM food_favorites WHERE user_id = #{userId} AND food_id = #{foodId}")
    int delete(@Param("userId") Integer userId, @Param("foodId") Integer foodId);

    @Select("SELECT COUNT(*) FROM food_favorites WHERE user_id = #{userId} AND food_id = #{foodId}")
    int countByUserAndFood(@Param("userId") Integer userId, @Param("foodId") Integer foodId);

    @Select("SELECT f.food_id AS foodId, f.name, f.price, f.image, f.rating, s.store_name AS storeName " +
            "FROM food_favorites ff JOIN foods f ON ff.food_id = f.food_id " +
            "LEFT JOIN stores s ON f.store_id = s.store_id " +
            "WHERE ff.user_id = #{userId} ORDER BY ff.create_time DESC")
    List<Map<String, Object>> selectByUser(@Param("userId") Integer userId);
}
