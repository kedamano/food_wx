package com.food.controller;

import com.food.annotation.RequireRole;
import com.food.dto.BaseResult;
import com.food.entity.Banner;
import com.food.entity.Category;
import com.food.entity.Food;
import com.food.mapper.BannerMapper;
import com.food.mapper.CategoryMapper;
import com.food.service.FoodService;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/food")
@Api(tags = "菜品管理接口")
public class FoodController {

    @Autowired
    private FoodService foodService;

    @Autowired
    private BannerMapper bannerMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @PostMapping
    @ApiOperation(value = "添加菜品", notes = "添加新菜品（仅商家/管理员）")
    @RequireRole("MERCHANT")
    public BaseResult addFood(@RequestBody Food food) {
        return foodService.addFood(food);
    }

    @PutMapping
    @ApiOperation(value = "更新菜品", notes = "更新菜品信息（仅商家/管理员）")
    @RequireRole("MERCHANT")
    public BaseResult updateFood(@RequestBody Food food) {
        return foodService.updateFood(food);
    }

    @DeleteMapping("/{foodId}")
    @ApiOperation(value = "删除菜品", notes = "删除指定菜品（仅商家/管理员）")
    @RequireRole("MERCHANT")
    public BaseResult deleteFood(@PathVariable Integer foodId) {
        return foodService.deleteFood(foodId);
    }

    @GetMapping("/{foodId}")
    @ApiOperation(value = "获取菜品详情", notes = "根据ID获取菜品详情")
    public BaseResult getFoodById(@PathVariable Integer foodId) {
        return foodService.getFoodById(foodId);
    }

    @GetMapping("/all")
    @ApiOperation(value = "获取所有菜品", notes = "获取所有菜品列表")
    public BaseResult getAllFoods() {
        return foodService.getAllFoods();
    }

    @GetMapping("/category/{categoryId}")
    @ApiOperation(value = "根据分类获取菜品", notes = "根据分类ID获取菜品列表")
    public BaseResult getFoodsByCategory(@PathVariable Integer categoryId) {
        return foodService.getFoodsByCategory(categoryId);
    }

    @GetMapping("/store/{storeId}")
    @ApiOperation(value = "根据商家获取菜品", notes = "根据商家ID获取菜品列表")
    public BaseResult getFoodsByStore(@PathVariable Integer storeId) {
        return foodService.getFoodsByStore(storeId);
    }

    @GetMapping("/search")
    @ApiOperation(value = "搜索菜品", notes = "根据名称搜索菜品")
    @ApiImplicitParam(name = "name", value = "搜索关键词", required = true, paramType = "query")
    public BaseResult searchFoods(@RequestParam String name) {
        return foodService.searchFoods(name);
    }

    @GetMapping("/rating")
    @ApiOperation(value = "根据评分获取菜品", notes = "获取指定评分以上的菜品")
    @ApiImplicitParam(name = "minRating", value = "最低评分", required = true, paramType = "query")
    public BaseResult getFoodsByRating(@RequestParam Double minRating) {
        return foodService.getFoodsByRating(minRating);
    }

    @GetMapping("/popular")
    @ApiOperation(value = "获取热门菜品", notes = "获取评分4.0以上的热门菜品")
    public BaseResult getPopularFoods() {
        return foodService.getPopularFoods();
    }

    @GetMapping("/recommend")
    @ApiOperation(value = "推荐菜品", notes = "获取推荐菜品列表（按销量和评分排序）")
    public BaseResult getRecommendFoods() {
        BaseResult allFoods = foodService.getAllFoods();
        if (allFoods.getData() instanceof List) {
            List<Food> foods = (List<Food>) allFoods.getData();
            // 按评分和销量排序
            foods.sort((f1, f2) -> {
                int ratingCompare = Double.compare(f2.getRating(), f1.getRating());
                if (ratingCompare != 0) {
                    return ratingCompare;
                }
                return Integer.compare(f2.getSales(), f1.getSales());
            });
            return BaseResult.success(foods);
        }
        return allFoods;
    }

    @GetMapping("/banners")
    @ApiOperation(value = "获取轮播图", notes = "获取首页轮播图数据")
    public BaseResult getBanners() {
        try {
            List<Banner> banners = bannerMapper.selectAll();
            return BaseResult.success(banners);
        } catch (Exception e) {
            // 如果数据库查询失败，返回空列表而不是抛出异常
            return BaseResult.success(new ArrayList<>());
        }
    }

    @GetMapping("/categories")
    @ApiOperation(value = "获取分类", notes = "获取美食分类数据")
    public BaseResult getCategories() {
        try {
            List<Category> categories = categoryMapper.selectAll();
            // 转换为前端需要的格式
            List<Map<String, Object>> categoryList = categories.stream()
                .map(cat -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", cat.getCategoryId());
                    map.put("name", cat.getCategoryName());
                    map.put("icon", cat.getIcon());
                    return map;
                })
                .collect(Collectors.toList());
            return BaseResult.success(categoryList);
        } catch (Exception e) {
            return BaseResult.success(new ArrayList<>());
        }
    }

    @PutMapping("/{foodId}/sales")
    @ApiOperation(value = "更新菜品销量", notes = "更新菜品销量")
    @ApiImplicitParam(name = "sales", value = "销量增量", required = true, paramType = "body")
    public BaseResult updateFoodSales(@PathVariable Integer foodId, @RequestBody SalesUpdateRequest salesRequest) {
        return foodService.updateFoodSales(foodId, salesRequest.getSales());
    }

    @PutMapping("/{foodId}/rating")
    @ApiOperation(value = "更新菜品评分", notes = "更新菜品评分")
    @ApiImplicitParam(name = "rating", value = "新评分", required = true, paramType = "body")
    public BaseResult updateFoodRating(@PathVariable Integer foodId, @RequestBody RatingUpdateRequest ratingRequest) {
        return foodService.updateFoodRating(foodId, ratingRequest.getRating());
    }

    // 内部类用于销量更新请求
    private static class SalesUpdateRequest {
        private Integer sales;

        public Integer getSales() {
            return sales;
        }

        public void setSales(Integer sales) {
            this.sales = sales;
        }
    }

    // 内部类用于评分更新请求
    private static class RatingUpdateRequest {
        private Double rating;

        public Double getRating() {
            return rating;
        }

        public void setRating(Double rating) {
            this.rating = rating;
        }
    }
}