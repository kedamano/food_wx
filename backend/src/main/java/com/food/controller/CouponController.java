package com.food.controller;

import com.food.dto.BaseResult;
import com.food.entity.Coupon;
import com.food.entity.UserCoupon;
import com.food.mapper.CouponMapper;
import com.food.mapper.UserCouponMapper;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/coupon")
@Api(tags = "优惠券管理接口")
public class CouponController {

    @Autowired
    private CouponMapper couponMapper;

    @Autowired
    private UserCouponMapper userCouponMapper;

    @GetMapping("/all")
    @ApiOperation(value = "获取所有优惠券", notes = "获取系统中所有优惠券")
    public BaseResult getAllCoupons() {
        try {
            List<Coupon> coupons = couponMapper.selectAll();
            return BaseResult.success(coupons);
        } catch (Exception e) {
            return BaseResult.error("获取优惠券失败: " + e.getMessage());
        }
    }

    @GetMapping("/available")
    @ApiOperation(value = "获取可用优惠券", notes = "获取当前可用的优惠券")
    public BaseResult getAvailableCoupons() {
        try {
            List<Coupon> coupons = couponMapper.selectAvailable();
            return BaseResult.success(coupons);
        } catch (Exception e) {
            return BaseResult.error("获取优惠券失败: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    @ApiOperation(value = "获取用户优惠券", notes = "获取指定用户的所有优惠券")
    public BaseResult getUserCoupons(@PathVariable Integer userId) {
        try {
            List<UserCoupon> coupons = userCouponMapper.selectByUserId(userId);
            
            // 格式化数据
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            List<Map<String, Object>> result = coupons.stream().map(coupon -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", coupon.getUserCouponId());
                map.put("couponId", coupon.getCouponId());
                map.put("name", coupon.getCouponName());
                map.put("discount", coupon.getDiscountAmount());
                map.put("condition", "满" + coupon.getMinAmount().intValue() + "可用");
                map.put("expiry", coupon.getEndTime());
                
                // 判断状态
                if (coupon.getIsUsed() != null && coupon.getIsUsed() == 1) {
                    map.put("status", "used");
                    map.put("statusText", "已使用");
                    map.put("statusIcon", "✓");
                } else if (coupon.getEndTime() != null) {
                    try {
                        LocalDateTime endTime = LocalDateTime.parse(coupon.getEndTime() + " 23:59:59", 
                            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        if (endTime.isBefore(LocalDateTime.now())) {
                            map.put("status", "expired");
                            map.put("statusText", "已过期");
                            map.put("statusIcon", "✗");
                        } else {
                            map.put("status", "available");
                            map.put("statusText", "可用");
                            map.put("statusIcon", "🎫");
                        }
                    } catch (Exception e) {
                        map.put("status", "available");
                        map.put("statusText", "可用");
                        map.put("statusIcon", "🎫");
                    }
                } else {
                    map.put("status", "available");
                    map.put("statusText", "可用");
                    map.put("statusIcon", "🎫");
                }
                
                map.put("type", "discount");
                return map;
            }).collect(Collectors.toList());
            
            return BaseResult.success(result);
        } catch (Exception e) {
            return BaseResult.error("获取用户优惠券失败: " + e.getMessage());
        }
    }

    @PostMapping("/exchange")
    @ApiOperation(value = "兑换优惠券", notes = "用户兑换优惠券")
    @ApiImplicitParams({
        @ApiImplicitParam(name = "userId", value = "用户ID", required = true, paramType = "body"),
        @ApiImplicitParam(name = "couponId", value = "优惠券ID", required = true, paramType = "body")
    })
    public BaseResult exchangeCoupon(@RequestBody Map<String, Integer> request) {
        try {
            Integer userId = request.get("userId");
            Integer couponId = request.get("couponId");
            
            if (userId == null || couponId == null) {
                return BaseResult.error("参数不完整");
            }
            
            // 检查优惠券是否存在
            Coupon coupon = couponMapper.selectById(couponId);
            if (coupon == null) {
                return BaseResult.error("优惠券不存在");
            }
            
            // 检查优惠券是否可用
            if (coupon.getStatus() != 1 || coupon.getEndTime().isBefore(LocalDateTime.now())) {
                return BaseResult.error("优惠券已过期或不可用");
            }
            
            // 检查用户是否已经兑换过该优惠券
            List<UserCoupon> existingCoupons = userCouponMapper.selectByUserId(userId);
            boolean alreadyExchanged = existingCoupons.stream()
                .anyMatch(uc -> uc.getCouponId().equals(couponId));
            if (alreadyExchanged) {
                return BaseResult.error("该优惠券已兑换");
            }
            
            // 创建用户优惠券记录
            UserCoupon userCoupon = new UserCoupon();
            userCoupon.setUserId(userId);
            userCoupon.setCouponId(couponId);
            userCoupon.setIsUsed(0);
            
            int result = userCouponMapper.insert(userCoupon);
            if (result > 0) {
                return BaseResult.success("兑换成功");
            } else {
                return BaseResult.error("兑换失败");
            }
        } catch (Exception e) {
            return BaseResult.error("兑换失败: " + e.getMessage());
        }
    }

    @GetMapping("/statistics/{userId}")
    @ApiOperation(value = "获取用户优惠券统计", notes = "获取用户优惠券数量统计")
    public BaseResult getUserCouponStatistics(@PathVariable Integer userId) {
        try {
            List<UserCoupon> allCoupons = userCouponMapper.selectByUserId(userId);
            List<UserCoupon> availableCoupons = userCouponMapper.selectAvailableByUserId(userId);
            List<UserCoupon> usedCoupons = userCouponMapper.selectUsedByUserId(userId);
            List<UserCoupon> expiredCoupons = userCouponMapper.selectExpiredByUserId(userId);
            
            Map<String, Integer> statistics = new HashMap<>();
            statistics.put("available", availableCoupons.size());
            statistics.put("used", usedCoupons.size());
            statistics.put("expired", expiredCoupons.size());
            statistics.put("total", allCoupons.size());
            
            return BaseResult.success(statistics);
        } catch (Exception e) {
            return BaseResult.error("获取统计数据失败: " + e.getMessage());
        }
    }
}
