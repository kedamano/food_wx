package com.food.mapper;

import com.food.entity.Cart;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface CartMapper {

    int insert(Cart cart);

    int update(Cart cart);

    Cart selectById(Integer cartId);

    Cart selectByUserAndFood(@Param("userId") Integer userId, @Param("foodId") Integer foodId);

    List<Cart> selectByUserId(Integer userId);

    int updateQuantity(@Param("cartId") Integer cartId, @Param("quantity") Integer quantity);

    int deleteById(Integer cartId);

    int deleteByUserId(Integer userId);

    int deleteByUserAndFood(@Param("userId") Integer userId, @Param("foodId") Integer foodId);

}