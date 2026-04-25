package com.food.controller;

import com.food.dto.BaseResult;
import com.food.entity.Store;
import com.food.entity.UserFavorite;
import com.food.mapper.UserFavoriteMapper;
import com.food.service.StoreService;
import com.food.utils.JwtUtil;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户收藏商家接口
 */
@RestController
@RequestMapping("/favorite")
@Api(tags = "收藏管理接口")
public class FavoriteController {

    @Autowired
    private UserFavoriteMapper userFavoriteMapper;

    @Autowired
    private StoreService storeService;

    @Autowired
    private JwtUtil jwtUtil;

    private Integer getCurrentUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtUtil.getUserIdFromToken(token);
    }

    /**
     * 获取用户收藏列表
     */
    @GetMapping("/user/{userId}")
    @ApiOperation(value = "获取收藏列表")
    public BaseResult getFavorites(@PathVariable Integer userId, HttpServletRequest request) {
        Integer currentUserId = getCurrentUserId(request);
        if (currentUserId == null) {
            return BaseResult.error(401, "未登录");
        }
        if (!currentUserId.equals(userId)) {
            return BaseResult.error(403, "无权查看他人收藏");
        }
        try {
            List<UserFavorite> favorites = userFavoriteMapper.selectByUserId(userId);
            List<Map<String, Object>> result = new ArrayList<>();
            for (UserFavorite fav : favorites) {
                BaseResult storeResult = storeService.getStoreById(fav.getStoreId());
                if (storeResult.getCode() == 200 && storeResult.getData() != null) {
                    Store store = (Store) storeResult.getData();
                    Map<String, Object> item = new HashMap<>();
                    item.put("favoriteId", fav.getId());
                    item.put("storeId", store.getStoreId());
                    item.put("storeName", store.getName());
                    item.put("name", store.getName());
                    item.put("logo", store.getLogo());
                    item.put("rating", store.getRating());
                    item.put("deliveryFee", store.getDeliveryFee());
                    item.put("deliveryTime", store.getDeliveryTime() != null ? store.getDeliveryTime() + "分钟" : "30分钟");
                    item.put("createTime", fav.getCreateTime());
                    result.add(item);
                }
            }
            return BaseResult.success(result);
        } catch (Exception e) {
            return BaseResult.error("获取收藏列表失败: " + e.getMessage());
        }
    }

    /**
     * 收藏商家
     */
    @PostMapping
    @ApiOperation(value = "收藏商家")
    public BaseResult addFavorite(@RequestBody Map<String, Integer> body, HttpServletRequest request) {
        Integer currentUserId = getCurrentUserId(request);
        if (currentUserId == null) {
            return BaseResult.error(401, "未登录");
        }
        Integer storeId = body.get("storeId");
        if (storeId == null) {
            return BaseResult.error(400, "商家ID不能为空");
        }
        try {
            // 检查是否已收藏
            Integer count = userFavoriteMapper.isFavorite(currentUserId, storeId);
            if (count != null && count > 0) {
                return BaseResult.error(400, "已收藏该商家");
            }
            UserFavorite fav = new UserFavorite();
            fav.setUserId(currentUserId);
            fav.setStoreId(storeId);
            fav.setCreateTime(LocalDateTime.now());
            userFavoriteMapper.insert(fav);
            return BaseResult.success("收藏成功");
        } catch (Exception e) {
            return BaseResult.error("收藏失败: " + e.getMessage());
        }
    }

    /**
     * 取消收藏
     */
    @DeleteMapping("/{storeId}")
    @ApiOperation(value = "取消收藏商家")
    public BaseResult removeFavorite(@PathVariable Integer storeId, HttpServletRequest request) {
        Integer currentUserId = getCurrentUserId(request);
        if (currentUserId == null) {
            return BaseResult.error(401, "未登录");
        }
        try {
            int result = userFavoriteMapper.deleteByUserAndStore(currentUserId, storeId);
            if (result > 0) {
                return BaseResult.success("取消收藏成功");
            }
            return BaseResult.error(404, "收藏记录不存在");
        } catch (Exception e) {
            return BaseResult.error("取消收藏失败: " + e.getMessage());
        }
    }

    /**
     * 检查是否收藏
     */
    @GetMapping("/check/{storeId}")
    @ApiOperation(value = "检查是否已收藏")
    public BaseResult checkFavorite(@PathVariable Integer storeId, HttpServletRequest request) {
        Integer currentUserId = getCurrentUserId(request);
        if (currentUserId == null) {
            return BaseResult.error(401, "未登录");
        }
        try {
            Integer count = userFavoriteMapper.isFavorite(currentUserId, storeId);
            Map<String, Object> result = new HashMap<>();
            result.put("isFavorite", count != null && count > 0);
            return BaseResult.success(result);
        } catch (Exception e) {
            return BaseResult.error("查询失败: " + e.getMessage());
        }
    }
}
