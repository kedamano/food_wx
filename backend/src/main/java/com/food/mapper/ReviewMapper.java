package com.food.mapper;

import com.food.entity.Review;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
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

}