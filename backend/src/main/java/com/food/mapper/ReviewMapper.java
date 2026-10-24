package com.food.mapper;

import com.food.entity.Review;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface ReviewMapper {

    int insert(Review review);

    int update(Review review);

    Review selectById(Integer reviewId);

    List<Review> selectByFoodId(Integer foodId);

    List<Review> selectByUserId(Integer userId);

    List<Review> selectByOrderId(Integer orderId);

    List<Review> selectByRating(@Param("minRating") Integer minRating);

    int deleteById(Integer reviewId);

    @Select("SELECT COUNT(*) FROM reviews WHERE user_id = #{userId} AND DATE(create_time) = CURDATE()")
    int countTodayByUser(@Param("userId") Integer userId);
}
