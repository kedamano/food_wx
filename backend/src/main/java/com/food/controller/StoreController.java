package com.food.controller;

import com.food.dto.BaseResult;
import com.food.entity.Store;
import com.food.service.StoreService;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/store")
@Api(tags = "商家管理接口")
public class StoreController {

    @Autowired
    private StoreService storeService;

    @GetMapping("/all")
    @ApiOperation(value = "获取所有商家", notes = "获取所有商家列表")
    public BaseResult getAllStores() {
        return storeService.getAllStores();
    }

    @GetMapping("/{storeId}")
    @ApiOperation(value = "获取商家详情", notes = "根据ID获取商家详情")
    public BaseResult getStoreById(@PathVariable Integer storeId) {
        return storeService.getStoreById(storeId);
    }

    @GetMapping("/search")
    @ApiOperation(value = "搜索商家", notes = "根据名称搜索商家")
    @ApiImplicitParam(name = "storeName", value = "商家名称", required = true, paramType = "query")
    public BaseResult searchStores(@RequestParam String storeName) {
        return storeService.searchStores(storeName);
    }

    @GetMapping("/nearby")
    @ApiOperation(value = "获取附近商家", notes = "获取附近的商家列表")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "lat", value = "纬度", paramType = "query"),
            @ApiImplicitParam(name = "lng", value = "经度", paramType = "query")
    })
    public BaseResult getNearbyStores(@RequestParam(required = false) Double lat, @RequestParam(required = false) Double lng) {
        // 调用服务层获取真实的商家数据
        BaseResult result = storeService.getNearbyStores(lat, lng);
        if (result.getCode() == 200) {
            // 获取到的商家数据，添加额外的显示字段
            List<Store> stores = (List<Store>) result.getData();
            List<Map<String, Object>> enrichedStores = new ArrayList<>();
            for (Store store : stores) {
                enrichedStores.add(enrichStoreData(store, lat, lng));
            }
            return BaseResult.success(enrichedStores);
        }
        return result;
    }

    private Map<String, Object> enrichStoreData(Store store) {
        return enrichStoreData(store, null, null);
    }

    private Map<String, Object> enrichStoreData(Store store, Double userLat, Double userLng) {
        Map<String, Object> storeMap = new HashMap<>();
        storeMap.put("id", store.getStoreId());
        storeMap.put("storeId", store.getStoreId());
        storeMap.put("name", store.getName());
        storeMap.put("storeName", store.getName());
        storeMap.put("price", store.getPriceLevel());
        storeMap.put("rating", store.getRating());
        storeMap.put("icon", getStoreIcon(store.getStoreId()));
        storeMap.put("logo", store.getLogo() != null ? store.getLogo() : "");
        storeMap.put("banner", store.getLogo() != null ? store.getLogo() : "");
        // 使用 Haversine 计算真实距离
        if (userLat != null && userLng != null) {
            storeMap.put("distance", calculateDistanceFromUser(userLat, userLng, store.getLat(), store.getLng()));
        } else {
            storeMap.put("distance", calculateDistance(store.getLat(), store.getLng()));
        }
        storeMap.put("deliveryTime", estimateDeliveryTime(store.getStoreId()));
        return storeMap;
    }

    /**
     * 获取商家图标
     */
    private String getStoreIcon(Integer storeId) {
        // 可以根据商家ID返回不同的图标
        String[] icons = {"fa-fire", "fa-utensils", "fa-hamburger", "fa-ice-cream", "fa-wine-bottle", "fa-leaf"};
        if (storeId != null && storeId <= icons.length) {
            return icons[storeId - 1];
        }
        return "fa-store";
    }

    /**
     * 计算距离 - 使用 Haversine 公式
     * @param storeLat 商家纬度
     * @param storeLng 商家经度
     * @return 距离字符串
     */
    private String calculateDistance(Double storeLat, Double storeLng) {
        if (storeLat == null || storeLng == null) {
            return "距离未知";
        }
        // 使用默认用户位置（北京天安门）作为fallback，实际应由前端传入
        double userLat = 39.90923;
        double userLng = 116.397428;
        double distKm = haversineDistance(userLat, userLng, storeLat, storeLng);
        if (distKm < 1.0) {
            return String.format("%.0fm", distKm * 1000);
        }
        return String.format("%.1fkm", distKm);
    }

    /**
     * 根据用户传入坐标计算距离
     */
    private String calculateDistanceFromUser(Double userLat, Double userLng, Double storeLat, Double storeLng) {
        if (storeLat == null || storeLng == null || userLat == null || userLng == null) {
            return "距离未知";
        }
        double distKm = haversineDistance(userLat, userLng, storeLat, storeLng);
        if (distKm < 1.0) {
            return String.format("%.0fm", distKm * 1000);
        }
        return String.format("%.1fkm", distKm);
    }

    /**
     * Haversine 公式计算两点间距离（km）
     */
    private double haversineDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /**
     * 估算配送时间
     */
    private String estimateDeliveryTime(Integer storeId) {
        // 实际项目中应该根据商家位置和配送距离计算
        // 这里返回模拟时间
        String[] times = {"20分钟", "25分钟", "30分钟", "35分钟", "40分钟"};
        if (storeId != null && storeId <= times.length) {
            return times[storeId - 1];
        }
        return "30分钟";
    }
}