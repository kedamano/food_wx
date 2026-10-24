package com.food.service;

import com.food.dto.BaseResult;
import com.food.entity.Address;
import com.food.mapper.AddressMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 收货地址Service
 */
@Service
public class AddressService {

    @Autowired
    private AddressMapper addressMapper;

    /**
     * 获取用户的所有地址
     */
    public BaseResult getAddressList(Integer userId) {
        try {
            List<Address> addressList = addressMapper.selectByUserId(userId);
            return BaseResult.success(addressList);
        } catch (Exception e) {
            return BaseResult.error("获取地址列表失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID获取地址
     */
    public BaseResult getAddressById(Integer addressId, Integer userId) {
        try {
            Address address = addressMapper.selectById(addressId);
            if (address == null) {
                return BaseResult.error(404, "地址不存在");
            }
            // 验证地址是否属于当前用户
            if (!address.getUserId().equals(userId)) {
                return BaseResult.error(403, "无权访问该地址");
            }
            return BaseResult.success(address);
        } catch (Exception e) {
            return BaseResult.error("获取地址失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户的默认地址
     */
    public BaseResult getDefaultAddress(Integer userId) {
        try {
            Address address = addressMapper.selectDefaultByUserId(userId);
            if (address == null) {
                return BaseResult.error(404, "暂无默认地址");
            }
            return BaseResult.success(address);
        } catch (Exception e) {
            return BaseResult.error("获取默认地址失败: " + e.getMessage());
        }
    }

    /**
     * 添加地址
     */
    @Transactional
    public BaseResult addAddress(Address address) {
        try {
            // 参数校验
            if (address.getName() == null || address.getName().trim().isEmpty()) {
                return BaseResult.error(400, "收货人姓名不能为空");
            }
            if (address.getPhone() == null || address.getPhone().trim().isEmpty()) {
                return BaseResult.error(400, "手机号不能为空");
            }
            if (address.getDetail() == null || address.getDetail().trim().isEmpty()) {
                return BaseResult.error(400, "详细地址不能为空");
            }

            // 构建完整地址
            String fullAddress = buildFullAddress(address);
            address.setFullAddress(fullAddress);

            // 如果是第一个地址，自动设为默认
            int count = addressMapper.countByUserId(address.getUserId());
            if (count == 0) {
                address.setIsDefault(1);
            } else if (address.getIsDefault() == null) {
                address.setIsDefault(0);
            }

            // 如果设为默认，先将其他地址设为非默认
            if (address.getIsDefault() == 1) {
                addressMapper.clearDefaultByUserId(address.getUserId());
            }

            int result = addressMapper.insert(address);
            if (result > 0) {
                return BaseResult.success("添加成功", address);
            }
            return BaseResult.error("添加失败");
        } catch (Exception e) {
            return BaseResult.error("添加地址失败: " + e.getMessage());
        }
    }

    /**
     * 更新地址
     */
    @Transactional
    public BaseResult updateAddress(Address address) {
        try {
            // 验证地址是否存在且属于当前用户
            Address existingAddress = addressMapper.selectById(address.getAddressId());
            if (existingAddress == null) {
                return BaseResult.error(404, "地址不存在");
            }
            if (!existingAddress.getUserId().equals(address.getUserId())) {
                return BaseResult.error(403, "无权修改该地址");
            }

            // 参数校验
            if (address.getName() == null || address.getName().trim().isEmpty()) {
                return BaseResult.error(400, "收货人姓名不能为空");
            }
            if (address.getPhone() == null || address.getPhone().trim().isEmpty()) {
                return BaseResult.error(400, "手机号不能为空");
            }
            if (address.getDetail() == null || address.getDetail().trim().isEmpty()) {
                return BaseResult.error(400, "详细地址不能为空");
            }

            // 构建完整地址
            String fullAddress = buildFullAddress(address);
            address.setFullAddress(fullAddress);

            // 如果设为默认，先将其他地址设为非默认
            if (address.getIsDefault() != null && address.getIsDefault() == 1) {
                addressMapper.clearDefaultByUserId(address.getUserId());
            }

            int result = addressMapper.update(address);
            if (result > 0) {
                return BaseResult.success("更新成功", address);
            }
            return BaseResult.error("更新失败");
        } catch (Exception e) {
            return BaseResult.error("更新地址失败: " + e.getMessage());
        }
    }

    /**
     * 删除地址
     */
    public BaseResult deleteAddress(Integer addressId, Integer userId) {
        try {
            // 验证地址是否存在且属于当前用户
            Address existingAddress = addressMapper.selectById(addressId);
            if (existingAddress == null) {
                return BaseResult.error(404, "地址不存在");
            }
            if (!existingAddress.getUserId().equals(userId)) {
                return BaseResult.error(403, "无权删除该地址");
            }

            int result = addressMapper.deleteById(addressId);
            if (result > 0) {
                return BaseResult.success("删除成功");
            }
            return BaseResult.error("删除失败");
        } catch (Exception e) {
            return BaseResult.error("删除地址失败: " + e.getMessage());
        }
    }

    /**
     * 设置默认地址
     */
    @Transactional
    public BaseResult setDefaultAddress(Integer addressId, Integer userId) {
        try {
            // 验证地址是否存在且属于当前用户
            Address existingAddress = addressMapper.selectById(addressId);
            if (existingAddress == null) {
                return BaseResult.error(404, "地址不存在");
            }
            if (!existingAddress.getUserId().equals(userId)) {
                return BaseResult.error(403, "无权设置该地址");
            }

            // 先将所有地址设为非默认
            addressMapper.clearDefaultByUserId(userId);

            // 设置指定地址为默认
            int result = addressMapper.setDefault(addressId, userId);
            if (result > 0) {
                return BaseResult.success("设置成功");
            }
            return BaseResult.error("设置失败");
        } catch (Exception e) {
            return BaseResult.error("设置默认地址失败: " + e.getMessage());
        }
    }

    /**
     * 构建完整地址
     */
    private String buildFullAddress(Address address) {
        StringBuilder sb = new StringBuilder();
        if (address.getProvince() != null && !address.getProvince().isEmpty()) {
            sb.append(address.getProvince());
        }
        if (address.getCity() != null && !address.getCity().isEmpty()) {
            sb.append(address.getCity());
        }
        if (address.getDistrict() != null && !address.getDistrict().isEmpty()) {
            sb.append(address.getDistrict());
        }
        if (address.getDetail() != null && !address.getDetail().isEmpty()) {
            sb.append(address.getDetail());
        }
        return sb.toString();
    }
}
