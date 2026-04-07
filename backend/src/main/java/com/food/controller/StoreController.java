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
                enrichedStores.add(enrichStoreData(store));
            }
            return BaseResult.success(enrichedStores);
        }
        return result;
    }

    /**
     * 创建并返回一个包含商店信息的Map对象
     *
     * @param id 商店ID
     * @param name 商店名称
     * @param price 价格等级
     * @param rating 评分
     * @param icon 图标URL
     * @param distance 距离信息
     * @param deliveryTime 配送时间
     * @return 包含所有商店信息的Map对象，键包括：
     *         - id: 商店ID
     *         - name: 商店名称
     *         - price: 价格等级
     *         - rating: 评分
     *         - icon: 图标URL
     *         - distance: 距离信息
     *         - deliveryTime: 配送时间
     */
    /**
     * 从数据库实体创建并返回一个包含商店信息的Map对象
     *
     * @param store 商店实体
     * @return 包含所有商店信息的Map对象，键包括：
     *         - id: 商店ID
     *         - name: 商店名称
     *         - price: 价格等级
     *         - rating: 评分
     *         - icon: 图标
     *         - distance: 距离信息
     *         - deliveryTime: 配送时间
     */
    private Map<String, Object> enrichStoreData(Store store) {
        Map<String, Object> storeMap = new HashMap<>();
        storeMap.put("id", store.getStoreId());
        storeMap.put("name", store.getName());
        storeMap.put("price", store.getPriceLevel());
        storeMap.put("rating", store.getRating());
        storeMap.put("icon", getStoreIcon(store.getStoreId()));
        storeMap.put("distance", calculateDistance(store.getLat(), store.getLng()));
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
     * 计算距离（简化版本）
     */
    private String calculateDistance(Double lat, Double lng) {
        // 实际项目中应该根据经纬度计算真实距离
        // 这里返回模拟距离
        if (lat == null || lng == null) {
            return "1.0km";
        }
        return String.format("%.1fkm", Math.random() * 3 + 0.5);
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