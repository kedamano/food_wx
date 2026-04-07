package com.food.mapper;

import com.food.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface CategoryMapper {

    int insert(Category category);

    int update(Category category);

    Category selectById(Integer categoryId);

    List<Category> selectAll();

}