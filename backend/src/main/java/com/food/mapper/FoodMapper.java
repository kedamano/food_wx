package com.food.mapper;

import com.food.entity.Food;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface FoodMapper {

    int insert(Food food);

    int update(Food food);

    Food selectById(Integer foodId);

    List<Food> selectAll();

    List<Food> selectByCategoryId(Integer categoryId);

    List<Food> selectByStoreId(Integer storeId);

    List<Food> searchByName(@Param("name") String name);

    List<Food> selectByRating(@Param("minRating") Double minRating);

    int updateSales(@Param("foodId") Integer foodId, @Param("sales") Integer sales);

    int deleteById(Integer foodId);

}