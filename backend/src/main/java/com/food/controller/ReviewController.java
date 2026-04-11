package com.food.controller;

import com.food.dto.BaseResult;
import com.food.entity.Review;
import com.food.entity.Order;
import com.food.service.ReviewService;
import com.food.service.OrderService;
import com.food.service.UserService;
import com.food.utils.JwtUtil;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/review")
@Api(tags = "评价管理接口")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    private Integer getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token != null && !token.isEmpty()) {
            return jwtUtil.getUserIdFromToken(token);
        }
        return null;
    }

    @PostMapping
    @ApiOperation(value = "添加评价", notes = "为订单添加评价")
    public BaseResult addReview(@RequestBody Review review, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        review.setUserId(userId);
        return reviewService.addReview(review);
    }

    @PostMapping("/order/{orderId}")
    @ApiOperation(value = "为订单添加评价", notes = "为特定订单添加评价")
    public BaseResult addReviewForOrder(@PathVariable Integer orderId, @RequestBody Review review, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证订单属于该用户且已完成
        Order order = (Order) orderService.getOrderById(orderId).getData();
        if (order == null || !order.getUserId().equals(userId)) {
            return BaseResult.error(403, "无权评价该订单");
        }

        if (!"已完成".equals(order.getStatus())) {
            return BaseResult.error(400, "只能评价已完成的订单");
        }

        // 检查是否已经评价过
        BaseResult existingReview = reviewService.getReviewsByOrderId(orderId);
        if (existingReview.getData() != null && !((List) existingReview.getData()).isEmpty()) {
            return BaseResult.error(400, "该订单已经评价过了");
        }

        review.setUserId(userId);
        review.setOrderId(orderId);
        BaseResult result = reviewService.addReview(review);

        if (result.getCode() == 200) {
            // 评价成功后增加用户积分
            userService.updateUserPoints(userId, 30); // 评价奖励30积分

            Map<String, Object> response = new HashMap<>();
            response.put("message", "评价成功");
            response.put("review", result.getData());
            response.put("pointsAwarded", 30);

            return BaseResult.success(response);
        }

        return result;
    }

    @PutMapping
    @ApiOperation(value = "更新评价", notes = "更新评价内容")
    public BaseResult updateReview(@RequestBody Review review, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证评价属于该用户
        Review existingReview = (Review) reviewService.getReviewById(review.getReviewId()).getData();
        if (existingReview == null || !existingReview.getUserId().equals(userId)) {
            return BaseResult.error(403, "无权操作该评价");
        }

        review.setUserId(userId);
        return reviewService.updateReview(review);
    }

    @DeleteMapping("/{reviewId}")
    @ApiOperation(value = "删除评价", notes = "删除指定评价")
    public BaseResult deleteReview(@PathVariable Integer reviewId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证评价属于该用户
        Review review = (Review) reviewService.getReviewById(reviewId).getData();
        if (review == null || !review.getUserId().equals(userId)) {
            return BaseResult.error(403, "无权操作该评价");
        }

        return reviewService.deleteReview(reviewId);
    }

    @GetMapping("/{reviewId}")
    @ApiOperation(value = "获取评价详情", notes = "根据ID获取评价详情")
    public BaseResult getReviewById(@PathVariable Integer reviewId) {
        return reviewService.getReviewById(reviewId);
    }

    @GetMapping("/food/{foodId}")
    @ApiOperation(value = "获取菜品评价", notes = "根据菜品ID获取评价列表")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "page", value = "页码", paramType = "query", defaultValue = "1"),
            @ApiImplicitParam(name = "limit", value = "每页数量", paramType = "query", defaultValue = "10")
    })
    public BaseResult getReviewsByFoodId(@PathVariable Integer foodId, @RequestParam(defaultValue = "1") Integer page, @RequestParam(defaultValue = "10") Integer limit) {
        BaseResult result = reviewService.getReviewsByFoodId(foodId);
        if (result.getData() instanceof List) {
            List<Review> reviews = (List<Review>) result.getData();
            // 分页处理
            int total = reviews.size();
            int start = (page - 1) * limit;
            int end = Math.min(start + limit, total);
            if (start > total) {
                return BaseResult.success(new PageResult<>(0, page, limit, new ArrayList<>()));
            }
            List<Review> pageData = reviews.subList(start, end);
            return BaseResult.success(new PageResult<>(total, page, limit, pageData));
        }
        return result;
    }

    @GetMapping("/user/{userId}")
    @ApiOperation(value = "获取用户评价", notes = "根据用户ID获取评价列表")
    public BaseResult getReviewsByUserId(@PathVariable Integer userId, HttpServletRequest request) {
        Integer currentUserId = getUserIdFromRequest(request);
        if (currentUserId == null) {
            return BaseResult.error(401, "未登录");
        }

        if (!currentUserId.equals(userId)) {
            return BaseResult.error(403, "无权查看该用户的评价");
        }

        return reviewService.getReviewsByUserId(userId);
    }

    @GetMapping("/order/{orderId}")
    @ApiOperation(value = "获取订单评价", notes = "根据订单ID获取评价")
    public BaseResult getReviewsByOrderId(@PathVariable Integer orderId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证订单属于该用户
        // 实际项目中应该查询订单表验证
        return reviewService.getReviewsByOrderId(orderId);
    }

    @GetMapping("/rating/{minRating}")
    @ApiOperation(value = "获取高评分评价", notes = "获取指定评分以上的评价")
    public BaseResult getReviewsByRating(@PathVariable Integer minRating) {
        return reviewService.getReviewsByRating(minRating);
    }

    @GetMapping("/food/{foodId}/rating")
    @ApiOperation(value = "获取菜品评分信息", notes = "获取菜品的评分统计信息")
    public BaseResult getFoodRating(@PathVariable Integer foodId) {
        return reviewService.getFoodRating(foodId);
    }

    @GetMapping("/food/{foodId}/statistics")
    @ApiOperation(value = "获取菜品评价统计", notes = "获取菜品的评价统计数据")
    public BaseResult getReviewStatistics(@PathVariable Integer foodId) {
        return reviewService.getReviewStatistics(foodId);
    }

    // 内部类用于分页结果
    private static class PageResult<T> {
        private int total;
        private int page;
        private int limit;
        private List<T> data;

        public PageResult(int total, int page, int limit, List<T> data) {
            this.total = total;
            this.page = page;
            this.limit = limit;
            this.data = data;
        }

        public int getTotal() {
            return total;
        }

        public int getPage() {
            return page;
        }

        public int getLimit() {
            return limit;
        }

        public List<T> getData() {
            return data;
        }
    }
}