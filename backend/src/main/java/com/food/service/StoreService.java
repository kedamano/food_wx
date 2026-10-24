package com.food.service;

import com.food.dto.BaseResult;
import com.food.entity.Store;
import com.food.mapper.StoreMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StoreService {

    @Autowired
    private StoreMapper storeMapper;

    public BaseResult getAllStores() {
        try {
            List<Store> stores = storeMapper.selectAll();
            return BaseResult.success(stores);
        } catch (Exception e) {
            return BaseResult.error("获取商家列表失败: " + e.getMessage());
        }
    }

    public BaseResult getStoreById(Integer storeId) {
        try {
            Store store = storeMapper.selectById(storeId);
            if (store == null) {
                return BaseResult.error(404, "商家不存在");
            }
            return BaseResult.success(store);
        } catch (Exception e) {
            return BaseResult.error("获取商家信息失败: " + e.getMessage());
        }
    }

    public BaseResult searchStores(String storeName) {
        try {
            List<Store> stores = storeMapper.searchByName(storeName);
            return BaseResult.success(stores);
        } catch (Exception e) {
            return BaseResult.error("搜索商家失败: " + e.getMessage());
        }
    }

    public BaseResult getNearbyStores(Double lat, Double lng) {
        try {
            List<Store> stores = storeMapper.selectAll();
            // 简单返回所有商家，实际项目中应根据经纬度计算距离排序
            return BaseResult.success(stores);
        } catch (Exception e) {
            return BaseResult.error("获取附近商家失败: " + e.getMessage());
        }
    }
}
