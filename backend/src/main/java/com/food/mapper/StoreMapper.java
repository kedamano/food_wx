package com.food.mapper;

import com.food.entity.Store;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface StoreMapper {

    int insert(Store store);

    int update(Store store);

    Store selectById(Integer storeId);

    List<Store> selectAll();

    /** 按经纬度近似距离升序（平面欧氏距离，市区尺度足够）；参数空时按评分降序 */
    List<Store> selectNearby(@Param("lat") Double lat, @Param("lng") Double lng);

    List<Store> searchByName(@Param("storeName") String storeName);

}