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

    List<Store> searchByName(@Param("storeName") String storeName);

}