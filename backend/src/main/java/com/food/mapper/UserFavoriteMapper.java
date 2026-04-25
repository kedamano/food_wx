package com.food.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.food.entity.UserFavorite;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 用户收藏 Mapper
 */
@Mapper
public interface UserFavoriteMapper extends BaseMapper<UserFavorite> {

    @Select("SELECT * FROM user_favorites WHERE user_id = #{userId} ORDER BY create_time DESC")
    List<UserFavorite> selectByUserId(@Param("userId") Integer userId);

    @Select("SELECT COUNT(*) FROM user_favorites WHERE user_id = #{userId} AND store_id = #{storeId}")
    Integer isFavorite(@Param("userId") Integer userId, @Param("storeId") Integer storeId);

    @Delete("DELETE FROM user_favorites WHERE user_id = #{userId} AND store_id = #{storeId}")
    int deleteByUserAndStore(@Param("userId") Integer userId, @Param("storeId") Integer storeId);
}
