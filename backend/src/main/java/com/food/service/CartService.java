package com.food.service;

import com.food.dto.BaseResult;
import com.food.entity.Cart;
import com.food.entity.Food;
import com.food.mapper.CartMapper;
import com.food.mapper.FoodMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CartService {

    @Autowired
    private CartMapper cartMapper;

    @Autowired
    private FoodMapper foodMapper;

    /**
     * 根据ID获取购物车项
     * @param cartId 购物车项ID
     * @return 购物车项实体
     */
    public Cart getCartById(Integer cartId) {
        return cartMapper.selectById(cartId);
    }

    public BaseResult addToCart(Cart cart) {
        try {
            // 检查该用户的购物车中是否已有该商品
            Cart existingCart = cartMapper.selectByUserAndFood(cart.getUserId(), cart.getFoodId());
            if (existingCart != null) {
                // 已存在，更新数量
                existingCart.setQuantity(existingCart.getQuantity() + cart.getQuantity());
                existingCart.setUpdateTime(LocalDateTime.now());
                cartMapper.update(existingCart);
                return BaseResult.success("已更新购物车数量", existingCart);
            }

            // 查询菜品信息填充到购物车
            Food food = foodMapper.selectById(cart.getFoodId());
            if (food != null) {
                cart.setFoodName(food.getName());
                cart.setFoodImage(food.getImage());
                cart.setFoodPrice(food.getPrice() != null ? food.getPrice().doubleValue() : 0.0);
                cart.setStoreId(food.getStoreId());
            }

            cart.setCreateTime(LocalDateTime.now());
            cart.setUpdateTime(LocalDateTime.now());
            int result = cartMapper.insert(cart);
            if (result > 0) {
                return BaseResult.success("添加到购物车成功", cart);
            }
            return BaseResult.error("添加到购物车失败");
        } catch (Exception e) {
            return BaseResult.error("添加到购物车失败: " + e.getMessage());
        }
    }

    public BaseResult updateCartItem(Integer cartId, Integer quantity) {
        try {
            Cart cart = cartMapper.selectById(cartId);
            if (cart == null) {
                return BaseResult.error(404, "购物车项不存在");
            }
            cart.setQuantity(quantity);
            cart.setUpdateTime(LocalDateTime.now());
            int result = cartMapper.updateQuantity(cartId, quantity);
            if (result > 0) {
                return BaseResult.success("更新购物车成功", cart);
            }
            return BaseResult.error("更新购物车失败");
        } catch (Exception e) {
            return BaseResult.error("更新购物车失败: " + e.getMessage());
        }
    }

    public BaseResult removeFromCart(Integer cartId) {
        try {
            int result = cartMapper.deleteById(cartId);
            if (result > 0) {
                return BaseResult.success("移除成功");
            }
            return BaseResult.error("移除失败，购物车项不存在");
        } catch (Exception e) {
            return BaseResult.error("移除购物车项失败: " + e.getMessage());
        }
    }

    public BaseResult removeCartItemByUserAndFood(Integer userId, Integer foodId) {
        try {
            int result = cartMapper.deleteByUserAndFood(userId, foodId);
            if (result > 0) {
                return BaseResult.success("移除成功");
            }
            return BaseResult.error("移除失败，购物车项不存在");
        } catch (Exception e) {
            return BaseResult.error("移除购物车项失败: " + e.getMessage());
        }
    }

    public BaseResult getCartByUserId(Integer userId) {
        try {
            List<Cart> cartList = cartMapper.selectByUserId(userId);
            fillFoodInfo(cartList);
            return BaseResult.success(cartList);
        } catch (Exception e) {
            return BaseResult.error("获取购物车失败: " + e.getMessage());
        }
    }

    /**
     * 批量填充菜品信息，避免逐项查询的 N+1 问题
     */
    private void fillFoodInfo(List<Cart> cartList) {
        if (cartList == null || cartList.isEmpty()) {
            return;
        }
        List<Integer> foodIds = new ArrayList<>(cartList.size());
        for (Cart cart : cartList) {
            if (cart.getFoodId() != null) {
                foodIds.add(cart.getFoodId());
            }
        }
        if (foodIds.isEmpty()) {
            return;
        }
        Map<Integer, Food> foodById = new HashMap<>();
        for (Food food : foodMapper.selectByIds(foodIds)) {
            foodById.put(food.getFoodId(), food);
        }
        for (Cart cart : cartList) {
            Food food = foodById.get(cart.getFoodId());
            if (food != null) {
                cart.setFoodName(food.getName());
                cart.setFoodImage(food.getImage());
                cart.setFoodPrice(food.getPrice() != null ? food.getPrice().doubleValue() : 0.0);
            }
        }
    }

    public BaseResult clearCart(Integer userId) {
        try {
            int result = cartMapper.deleteByUserId(userId);
            if (result > 0) {
                return BaseResult.success("购物车已清空");
            }
            return BaseResult.success("购物车已为空");
        } catch (Exception e) {
            return BaseResult.error("清空购物车失败: " + e.getMessage());
        }
    }

    public BaseResult getCartTotal(Integer userId) {
        try {
            List<Cart> cartList = cartMapper.selectByUserId(userId);
            int totalCount = 0;
            double totalPrice = 0.0;
            for (Cart cart : cartList) {
                totalCount += cart.getQuantity();
                if (cart.getFoodPrice() != null) {
                    totalPrice += cart.getFoodPrice() * cart.getQuantity();
                }
            }
            Map<String, Object> data = new HashMap<>();
            data.put("totalCount", totalCount);
            data.put("totalPrice", BigDecimal.valueOf(totalPrice).setScale(2, RoundingMode.HALF_UP));
            data.put("itemCount", cartList.size());
            return BaseResult.success(data);
        } catch (Exception e) {
            return BaseResult.error("获取购物车总价失败: " + e.getMessage());
        }
    }

    public BaseResult mergeCart(List<Cart> cartItems, Integer userId) {
        try {
            for (Cart cart : cartItems) {
                cart.setUserId(userId);
                Cart existingCart = cartMapper.selectByUserAndFood(userId, cart.getFoodId());
                if (existingCart != null) {
                    existingCart.setQuantity(existingCart.getQuantity() + cart.getQuantity());
                    existingCart.setUpdateTime(LocalDateTime.now());
                    cartMapper.update(existingCart);
                } else {
                    // 查询菜品信息
                    Food food = foodMapper.selectById(cart.getFoodId());
                    if (food != null) {
                        cart.setFoodName(food.getName());
                        cart.setFoodImage(food.getImage());
                        cart.setFoodPrice(food.getPrice() != null ? food.getPrice().doubleValue() : 0.0);
                        cart.setStoreId(food.getStoreId());
                    }
                    cart.setCreateTime(LocalDateTime.now());
                    cart.setUpdateTime(LocalDateTime.now());
                    cartMapper.insert(cart);
                }
            }
            return BaseResult.success("购物车合并成功");
        } catch (Exception e) {
            return BaseResult.error("合并购物车失败: " + e.getMessage());
        }
    }
}
