package com.food.mapper;

import com.food.entity.Address;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 收货地址Mapper接口
 */
@Mapper
public interface AddressMapper {

    /**
     * 插入地址
     */
    int insert(Address address);

    /**
     * 更新地址
     */
    int update(Address address);

    /**
     * 根据ID查询地址
     */
    Address selectById(Integer addressId);

    /**
     * 根据用户ID查询地址列表
     */
    List<Address> selectByUserId(Integer userId);

    /**
     * 查询用户的默认地址
     */
    Address selectDefaultByUserId(Integer userId);

    /**
     * 删除地址（逻辑删除）
     */
    int deleteById(Integer addressId);

    /**
     * 将用户的所有地址设为非默认
     */
    int clearDefaultByUserId(Integer userId);

    /**
     * 设置默认地址
     */
    int setDefault(@Param("addressId") Integer addressId, @Param("userId") Integer userId);

    /**
     * 统计用户的地址数量
     */
    int countByUserId(Integer userId);
}
