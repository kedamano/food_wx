package com.food.service;

import com.food.dto.BaseResult;
import com.food.entity.Review;
import com.food.mapper.ReviewMapper;
import com.food.mapper.UserMapper;
import com.food.mapper.FoodMapper;
import com.food.entity.User;
import com.food.entity.Food;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    @Autowired
    private ReviewMapper reviewMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private FoodMapper foodMapper;

    public BaseResult addReview(Review review) {
        try {
            review.setCreateTime(LocalDateTime.now());
            review.setUpdateTime(LocalDateTime.now());
            if (review.getStatus() == null) {
                review.setStatus(1);
            }

            // 填充用户信息
            if (review.getUserId() != null) {
                User user = userMapper.selectById(review.getUserId());
                if (user != null) {
                    review.setUsername(user.getUsername());
                    review.setAvatar(user.getAvatar());
                }
            }

            int result = reviewMapper.insert(review);
            if (result > 0) {
                return BaseResult.success("评价成功", review);
            }
            return BaseResult.error("评价失败");
        } catch (Exception e) {
            return BaseResult.error("评价失败: " + e.getMessage());
        }
    }

    public BaseResult updateReview(Review review) {
        try {
            review.setUpdateTime(LocalDateTime.now());
            int result = reviewMapper.update(review);
            if (result > 0) {
                return BaseResult.success("更新评价成功");
            }
            return BaseResult.error("更新评价失败");
        } catch (Exception e) {
            return BaseResult.error("更新评价失败: " + e.getMessage());
        }
    }

    public BaseResult deleteReview(Integer reviewId) {
        try {
            int result = reviewMapper.deleteById(reviewId);
            if (result > 0) {
                return BaseResult.success("删除评价成功");
            }
            return BaseResult.error("删除评价失败，评价不存在");
        } catch (Exception e) {
            return BaseResult.error("删除评价失败: " + e.getMessage());
        }
    }

    public BaseResult getReviewById(Integer reviewId) {
        try {
            Review review = reviewMapper.selectById(reviewId);
            if (review == null) {
                return BaseResult.error(404, "评价不存在");
            }
            return BaseResult.success(review);
        } catch (Exception e) {
            return BaseResult.error("获取评价失败: " + e.getMessage());
        }
    }

    public BaseResult getReviewsByFoodId(Integer foodId) {
        try {
            List<Review> reviews = reviewMapper.selectByFoodId(foodId);
            // 填充用户信息
            for (Review review : reviews) {
                if (review.getUserId() != null && review.getUsername() == null) {
                    User user = userMapper.selectById(review.getUserId());
                    if (user != null) {
                        review.setUsername(user.getUsername());
                        review.setAvatar(user.getAvatar());
                    }
                }
            }
            return BaseResult.success(reviews);
        } catch (Exception e) {
            return BaseResult.error("获取评价列表失败: " + e.getMessage());
        }
    }

    public BaseResult getReviewsByUserId(Integer userId) {
        try {
            List<Review> reviews = reviewMapper.selectByUserId(userId);
            return BaseResult.success(reviews);
        } catch (Exception e) {
            return BaseResult.error("获取评价列表失败: " + e.getMessage());
        }
    }

    public BaseResult getReviewsByOrderId(Integer orderId) {
        try {
            List<Review> reviews = reviewMapper.selectByOrderId(orderId);
            return BaseResult.success(reviews);
        } catch (Exception e) {
            return BaseResult.error("获取评价列表失败: " + e.getMessage());
        }
    }

    public BaseResult getReviewsByRating(Integer minRating) {
        try {
            List<Review> reviews = reviewMapper.selectByRating(minRating);
            return BaseResult.success(reviews);
        } catch (Exception e) {
            return BaseResult.error("获取评价列表失败: " + e.getMessage());
        }
    }

    public BaseResult getFoodRating(Integer foodId) {
        try {
            List<Review> reviews = reviewMapper.selectByFoodId(foodId);
            Map<String, Object> data = new HashMap<>();
            if (reviews.isEmpty()) {
                data.put("averageRating", 0.0);
                data.put("totalReviews", 0);
                return BaseResult.success(data);
            }
            double totalRating = 0;
            for (Review review : reviews) {
                totalRating += review.getRating() != null ? review.getRating() : 0;
            }
            double averageRating = totalRating / reviews.size();
            data.put("averageRating", Math.round(averageRating * 10.0) / 10.0);
            data.put("totalReviews", reviews.size());
            return BaseResult.success(data);
        } catch (Exception e) {
            return BaseResult.error("获取菜品评分失败: " + e.getMessage());
        }
    }

    public BaseResult getReviewStatistics(Integer foodId) {
        try {
            List<Review> reviews = reviewMapper.selectByFoodId(foodId);
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalReviews", reviews.size());

            // 按评分分布统计
            int[] ratingDistribution = new int[6]; // 0-5星
            double totalRating = 0;
            for (Review review : reviews) {
                int rating = review.getRating() != null ? review.getRating() : 0;
                if (rating >= 0 && rating <= 5) {
                    ratingDistribution[rating]++;
                }
                totalRating += rating;
            }
            statistics.put("averageRating", reviews.isEmpty() ? 0 :
                    Math.round(totalRating / reviews.size() * 10.0) / 10.0);
            statistics.put("ratingDistribution", ratingDistribution);

            // 好评率（4-5星）
            int goodReviews = ratingDistribution[4] + ratingDistribution[5];
            double goodRate = reviews.isEmpty() ? 0 :
                    Math.round(goodReviews * 100.0 / reviews.size() * 10.0) / 10.0;
            statistics.put("goodRate", goodRate);

            // 有图评价数
            long withImagesCount = reviews.stream()
                    .filter(r -> r.getImages() != null && !r.getImages().isEmpty())
                    .count();
            statistics.put("withImagesCount", withImagesCount);

            return BaseResult.success(statistics);
        } catch (Exception e) {
            return BaseResult.error("获取评价统计失败: " + e.getMessage());
        }
    }
}
