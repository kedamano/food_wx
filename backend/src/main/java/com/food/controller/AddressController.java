package com.food.controller;

import com.food.dto.BaseResult;
import com.food.entity.Address;
import com.food.service.AddressService;
import com.food.utils.JwtUtil;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

/**
 * 收货地址Controller
 */
@RestController
@RequestMapping("/address")
@Api(tags = "收货地址管理接口")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 从请求中获取当前用户ID
     */
    private Integer getCurrentUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtUtil.getUserIdFromToken(token);
    }

    /**
     * 获取用户的所有地址
     */
    @GetMapping("/list")
    @ApiOperation(value = "获取地址列表", notes = "获取当前用户的所有收货地址")
    public BaseResult getAddressList(HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        if (userId == null) {
            return BaseResult.error(401, "请先登录");
        }
        return addressService.getAddressList(userId);
    }

    /**
     * 获取地址详情
     */
    @GetMapping("/{addressId}")
    @ApiOperation(value = "获取地址详情", notes = "根据ID获取地址详情")
    @ApiImplicitParam(name = "addressId", value = "地址ID", required = true, paramType = "path")
    public BaseResult getAddressById(@PathVariable Integer addressId, HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        if (userId == null) {
            return BaseResult.error(401, "请先登录");
        }
        return addressService.getAddressById(addressId, userId);
    }

    /**
     * 获取默认地址
     */
    @GetMapping("/default")
    @ApiOperation(value = "获取默认地址", notes = "获取当前用户的默认收货地址")
    public BaseResult getDefaultAddress(HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        if (userId == null) {
            return BaseResult.error(401, "请先登录");
        }
        return addressService.getDefaultAddress(userId);
    }

    /**
     * 添加地址
     */
    @PostMapping("/add")
    @ApiOperation(value = "添加地址", notes = "添加新的收货地址")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "name", value = "收货人姓名", required = true, paramType = "body"),
            @ApiImplicitParam(name = "phone", value = "收货人手机号", required = true, paramType = "body"),
            @ApiImplicitParam(name = "province", value = "省份", required = false, paramType = "body"),
            @ApiImplicitParam(name = "city", value = "城市", required = false, paramType = "body"),
            @ApiImplicitParam(name = "district", value = "区县", required = false, paramType = "body"),
            @ApiImplicitParam(name = "detail", value = "详细地址", required = true, paramType = "body"),
            @ApiImplicitParam(name = "tag", value = "地址标签：home-家，work-公司，other-其他", required = false, paramType = "body"),
            @ApiImplicitParam(name = "isDefault", value = "是否默认：0-否，1-是", required = false, paramType = "body")
    })
    public BaseResult addAddress(@RequestBody Address address, HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        if (userId == null) {
            return BaseResult.error(401, "请先登录");
        }
        address.setUserId(userId);
        return addressService.addAddress(address);
    }

    /**
     * 更新地址
     */
    @PutMapping("/update")
    @ApiOperation(value = "更新地址", notes = "更新收货地址信息")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "addressId", value = "地址ID", required = true, paramType = "body"),
            @ApiImplicitParam(name = "name", value = "收货人姓名", required = true, paramType = "body"),
            @ApiImplicitParam(name = "phone", value = "收货人手机号", required = true, paramType = "body"),
            @ApiImplicitParam(name = "province", value = "省份", required = false, paramType = "body"),
            @ApiImplicitParam(name = "city", value = "城市", required = false, paramType = "body"),
            @ApiImplicitParam(name = "district", value = "区县", required = false, paramType = "body"),
            @ApiImplicitParam(name = "detail", value = "详细地址", required = true, paramType = "body"),
            @ApiImplicitParam(name = "tag", value = "地址标签：home-家，work-公司，other-其他", required = false, paramType = "body"),
            @ApiImplicitParam(name = "isDefault", value = "是否默认：0-否，1-是", required = false, paramType = "body")
    })
    public BaseResult updateAddress(@RequestBody Address address, HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        if (userId == null) {
            return BaseResult.error(401, "请先登录");
        }
        address.setUserId(userId);
        return addressService.updateAddress(address);
    }

    /**
     * 删除地址
     */
    @DeleteMapping("/delete/{addressId}")
    @ApiOperation(value = "删除地址", notes = "删除指定的收货地址")
    @ApiImplicitParam(name = "addressId", value = "地址ID", required = true, paramType = "path")
    public BaseResult deleteAddress(@PathVariable Integer addressId, HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        if (userId == null) {
            return BaseResult.error(401, "请先登录");
        }
        return addressService.deleteAddress(addressId, userId);
    }

    /**
     * 设置默认地址
     */
    @PutMapping("/set-default/{addressId}")
    @ApiOperation(value = "设置默认地址", notes = "将指定地址设为默认")
    @ApiImplicitParam(name = "addressId", value = "地址ID", required = true, paramType = "path")
    public BaseResult setDefaultAddress(@PathVariable Integer addressId, HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        if (userId == null) {
            return BaseResult.error(401, "请先登录");
        }
        return addressService.setDefaultAddress(addressId, userId);
    }
}
