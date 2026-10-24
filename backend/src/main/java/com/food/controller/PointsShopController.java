package com.food.controller;

import com.food.dto.BaseResult;
import com.food.entity.UserCoupon;
import com.food.mapper.OrderMapper;
import com.food.mapper.PointsLogMapper;
import com.food.mapper.PointsProductMapper;
import com.food.mapper.ReviewMapper;
import com.food.service.UserService;
import com.food.utils.JwtUtil;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 积分商城：商品兑换、每日任务
 */
@RestController
@RequestMapping("/points-shop")
@Api(tags = "积分商城接口")
public class PointsShopController {

    @Autowired
    private PointsProductMapper pointsProductMapper;

    @Autowired
    private UserService userService;

    @Autowired
    private com.food.mapper.UserCouponMapper userCouponMapper;

    @Autowired
    private PointsLogMapper pointsLogMapper;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private ReviewMapper reviewMapper;

    @Autowired
    private JwtUtil jwtUtil;

    private Integer getCurrentUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token != null && !token.isEmpty()) {
            return jwtUtil.getUserIdFromToken(token);
        }
        return null;
    }

    @GetMapping("/products")
    @ApiOperation(value = "积分商品列表", notes = "可兑换商品与库存")
    public BaseResult products() {
        return BaseResult.success(pointsProductMapper.selectActiveProducts());
    }

    @PostMapping("/exchange")
    @ApiOperation(value = "积分兑换", notes = "校验积分与库存，扣积分、减库存，券类商品自动发放用户优惠券")
    @Transactional
    public BaseResult exchange(@RequestBody Map<String, Integer> body, HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }
        Integer productId = body.get("productId");
        if (productId == null) {
            return BaseResult.error(400, "参数不完整");
        }

        try {
            Map<String, Object> product = pointsProductMapper.selectById(productId);
            if (product == null) {
                return BaseResult.error(404, "商品不存在");
            }
            Integer cost = (Integer) product.get("pointsCost");
            if (product.get("stock") == null || (Integer) product.get("stock") <= 0) {
                return BaseResult.error(400, "商品库存不足");
            }

            // 先扣库存（乐观更新，防止超兑）
            if (pointsProductMapper.decreaseStock(productId) <= 0) {
                return BaseResult.error(400, "商品库存不足");
            }

            // 扣积分（余额不足会由 updateUserPoints 校验并整体回滚）
            BaseResult deduct = userService.updateUserPoints(userId, -cost, "EXCHANGE",
                    "积分兑换：" + product.get("name"));
            if (deduct == null || deduct.getCode() != 200) {
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                return deduct != null ? deduct : BaseResult.error("兑换失败");
            }

            // 券类商品发放用户优惠券
            Integer couponTemplateId = (Integer) product.get("couponTemplateId");
            if (couponTemplateId != null) {
                UserCoupon uc = new UserCoupon();
                uc.setUserId(userId);
                uc.setCouponId(couponTemplateId);
                uc.setIsUsed(0);
                userCouponMapper.insert(uc);
            }

            Map<String, Object> data = new HashMap<>();
            data.put("name", product.get("name"));
            data.put("cost", cost);
            return BaseResult.success("兑换成功", data);
        } catch (Exception e) {
            com.food.utils.TxSupport.rollbackIfActive();
            return BaseResult.error("兑换失败: " + e.getMessage());
        }
    }

    @GetMapping("/tasks")
    @ApiOperation(value = "每日任务", notes = "任务完成状态按当日行为实时计算")
    public BaseResult tasks(HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        List<Map<String, Object>> tasks = new ArrayList<>();
        if (userId != null) {
            Integer signed = pointsLogMapper.countTodayByType(userId, "SIGN_IN");
            Integer ordersToday = orderMapper.countTodayByUser(userId);
            Integer reviewsToday = reviewMapper.countTodayByUser(userId);
            tasks.add(task("每日签到", 20, signed != null && signed > 0));
            tasks.add(task("完成一笔订单", 50, ordersToday != null && ordersToday > 0));
            tasks.add(task("发表一条评价", 30, reviewsToday != null && reviewsToday > 0));
        } else {
            tasks.add(task("每日签到", 20, false));
            tasks.add(task("完成一笔订单", 50, false));
            tasks.add(task("发表一条评价", 30, false));
        }
        return BaseResult.success(tasks);
    }

    private Map<String, Object> task(String name, int points, boolean completed) {
        Map<String, Object> t = new HashMap<>();
        t.put("name", name);
        t.put("points", points);
        t.put("completed", completed);
        return t;
    }
}
