package com.food.service;

import com.food.dto.BaseResult;
import com.food.entity.Food;
import com.food.mapper.FoodMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FoodService {

    @Autowired
    private FoodMapper foodMapper;

    public BaseResult addFood(Food food) {
        try {
            food.setCreateTime(LocalDateTime.now());
            food.setUpdateTime(LocalDateTime.now());
            if (food.getSales() == null) {
                food.setSales(0);
            }
            if (food.getRating() == null) {
                food.setRating(5.0);
            }
            if (food.getStatus() == null) {
                food.setStatus(1);
            }
            int result = foodMapper.insert(food);
            if (result > 0) {
                return BaseResult.success("添加菜品成功", food);
            }
            return BaseResult.error("添加菜品失败");
        } catch (Exception e) {
            return BaseResult.error("添加菜品失败: " + e.getMessage());
        }
    }

    public BaseResult updateFood(Food food) {
        try {
            food.setUpdateTime(LocalDateTime.now());
            int result = foodMapper.update(food);
            if (result > 0) {
                return BaseResult.success("更新菜品成功");
            }
            return BaseResult.error("更新菜品失败");
        } catch (Exception e) {
            return BaseResult.error("更新菜品失败: " + e.getMessage());
        }
    }

    public BaseResult deleteFood(Integer foodId) {
        try {
            int result = foodMapper.deleteById(foodId);
            if (result > 0) {
                return BaseResult.success("删除菜品成功");
            }
            return BaseResult.error("删除菜品失败，菜品不存在");
        } catch (Exception e) {
            return BaseResult.error("删除菜品失败: " + e.getMessage());
        }
    }

    public BaseResult getFoodById(Integer foodId) {
        try {
            Food food = foodMapper.selectById(foodId);
            if (food == null) {
                return BaseResult.error(404, "菜品不存在");
            }
            return BaseResult.success(food);
        } catch (Exception e) {
            return BaseResult.error("获取菜品详情失败: " + e.getMessage());
        }
    }

    public BaseResult getAllFoods() {
        try {
            List<Food> foods = foodMapper.selectAll();
            return BaseResult.success(foods);
        } catch (Exception e) {
            return BaseResult.error("获取菜品列表失败: " + e.getMessage());
        }
    }

    /**
     * 分页获取菜品
     */
    public BaseResult getAllFoods(int page, int size) {
        try {
            long total = foodMapper.countAll();
            int offset = Math.max(0, (page - 1) * size);
            List<Food> foods = foodMapper.selectPage(offset, size);
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("list", foods);
            result.put("total", total);
            result.put("page", page);
            result.put("size", size);
            return BaseResult.success(result);
        } catch (Exception e) {
            return BaseResult.error("获取菜品列表失败: " + e.getMessage());
        }
    }

    public BaseResult getFoodsByCategory(Integer categoryId) {
        try {
            List<Food> foods = foodMapper.selectByCategoryId(categoryId);
            return BaseResult.success(foods);
        } catch (Exception e) {
            return BaseResult.error("获取分类菜品失败: " + e.getMessage());
        }
    }

    public BaseResult getFoodsByStore(Integer storeId) {
        try {
            List<Food> foods = foodMapper.selectByStoreId(storeId);
            return BaseResult.success(foods);
        } catch (Exception e) {
            return BaseResult.error("获取商家菜品失败: " + e.getMessage());
        }
    }

    public BaseResult searchFoods(String name) {
        try {
            List<Food> foods = foodMapper.searchByName(name);
            return BaseResult.success(foods);
        } catch (Exception e) {
            return BaseResult.error("搜索菜品失败: " + e.getMessage());
        }
    }

    public BaseResult getFoodsByRating(Double minRating) {
        try {
            List<Food> foods = foodMapper.selectByRating(minRating);
            return BaseResult.success(foods);
        } catch (Exception e) {
            return BaseResult.error("获取菜品失败: " + e.getMessage());
        }
    }

    public BaseResult getPopularFoods() {
        try {
            List<Food> foods = foodMapper.selectByRating(4.0);
            return BaseResult.success(foods);
        } catch (Exception e) {
            return BaseResult.error("获取热门菜品失败: " + e.getMessage());
        }
    }

    public BaseResult updateFoodSales(Integer foodId, Integer sales) {
        try {
            int result = foodMapper.updateSales(foodId, sales);
            if (result > 0) {
                return BaseResult.success("更新销量成功");
            }
            return BaseResult.error("更新销量失败");
        } catch (Exception e) {
            return BaseResult.error("更新销量失败: " + e.getMessage());
        }
    }

    public BaseResult updateFoodRating(Integer foodId, Double rating) {
        try {
            Food food = foodMapper.selectById(foodId);
            if (food == null) {
                return BaseResult.error(404, "菜品不存在");
            }
            food.setRating(rating);
            food.setUpdateTime(LocalDateTime.now());
            int result = foodMapper.update(food);
            if (result > 0) {
                return BaseResult.success("更新评分成功");
            }
            return BaseResult.error("更新评分失败");
        } catch (Exception e) {
            return BaseResult.error("更新评分失败: " + e.getMessage());
        }
    }
}
