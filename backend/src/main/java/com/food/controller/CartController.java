package com.food.controller;

import com.food.dto.BaseResult;
import com.food.entity.Cart;
import com.food.service.CartService;
import com.food.utils.JwtUtil;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/cart")
@Api(tags = "购物车管理接口")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private JwtUtil jwtUtil;

    private Integer getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && !token.isEmpty()) {
            return jwtUtil.getUserIdFromToken(token);
        }
        return null;
    }

    @PostMapping
    @ApiOperation(value = "添加到购物车", notes = "添加商品到购物车")
    public BaseResult addToCart(@RequestBody Cart cart, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        cart.setUserId(userId);
        return cartService.addToCart(cart);
    }

    @PutMapping("/{cartId}")
    @ApiOperation(value = "更新购物车项", notes = "更新购物车中商品的数量")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "cartId", value = "购物车项ID", required = true, paramType = "path"),
            @ApiImplicitParam(name = "quantity", value = "新数量", required = true, paramType = "body")
    })
    public BaseResult updateCartItem(@PathVariable Integer cartId, @RequestBody QuantityRequest quantityRequest, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证购物车项属于该用户
        Cart cart = cartService.getCartByUserId(userId).getData() != null ?
                ((List<Cart>) cartService.getCartByUserId(userId).getData()).stream()
                        .filter(c -> c.getCartId().equals(cartId))
                        .findFirst()
                        .orElse(null) : null;

        if (cart == null) {
            return BaseResult.error(403, "无权操作该购物车项");
        }

        return cartService.updateCartItem(cartId, quantityRequest.getQuantity());
    }

    @DeleteMapping("/{cartId}")
    @ApiOperation(value = "从购物车移除", notes = "从购物车中移除指定商品")
    public BaseResult removeFromCart(@PathVariable Integer cartId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }

        // 验证购物车项属于该用户
        Cart cart = cartService.getCartByUserId(userId).getData() != null ?
                ((List<Cart>) cartService.getCartByUserId(userId).getData()).stream()
                        .filter(c -> c.getCartId().equals(cartId))
                        .findFirst()
                        .orElse(null) : null;

        if (cart == null) {
            return BaseResult.error(403, "无权操作该购物车项");
        }

        return cartService.removeFromCart(cartId);
    }

    @DeleteMapping("/user/{userId}/food/{foodId}")
    @ApiOperation(value = "从购物车移除商品", notes = "根据用户ID和商品ID从购物车移除")
    public BaseResult removeCartItemByUserAndFood(@PathVariable Integer userId, @PathVariable Integer foodId, HttpServletRequest request) {
        Integer currentUserId = getUserIdFromRequest(request);
        if (currentUserId == null) {
            return BaseResult.error(401, "未登录");
        }

        if (!currentUserId.equals(userId)) {
            return BaseResult.error(403, "无权操作该用户的购物车");
        }

        return cartService.removeCartItemByUserAndFood(userId, foodId);
    }

    @GetMapping("/user/{userId}")
    @ApiOperation(value = "获取购物车", notes = "获取指定用户的购物车列表")
    public BaseResult getCartByUserId(@PathVariable Integer userId, HttpServletRequest request) {
        Integer currentUserId = getUserIdFromRequest(request);
        if (currentUserId == null) {
            return BaseResult.error(401, "未登录");
        }

        if (!currentUserId.equals(userId)) {
            return BaseResult.error(403, "无权查看该用户的购物车");
        }

        return cartService.getCartByUserId(userId);
    }

    @DeleteMapping("/user/{userId}/clear")
    @ApiOperation(value = "清空购物车", notes = "清空指定用户的购物车")
    public BaseResult clearCart(@PathVariable Integer userId, HttpServletRequest request) {
        Integer currentUserId = getUserIdFromRequest(request);
        if (currentUserId == null) {
            return BaseResult.error(401, "未登录");
        }

        if (!currentUserId.equals(userId)) {
            return BaseResult.error(403, "无权操作该用户的购物车");
        }

        return cartService.clearCart(userId);
    }

    @GetMapping("/user/{userId}/total")
    @ApiOperation(value = "获取购物车总价", notes = "获取购物车商品总价和数量统计")
    public BaseResult getCartTotal(@PathVariable Integer userId, HttpServletRequest request) {
        Integer currentUserId = getUserIdFromRequest(request);
        if (currentUserId == null) {
            return BaseResult.error(401, "未登录");
        }

        if (!currentUserId.equals(userId)) {
            return BaseResult.error(403, "无权查看该用户的购物车");
        }

        return cartService.getCartTotal(userId);
    }

    @PostMapping("/user/{userId}/merge")
    @ApiOperation(value = "合并购物车", notes = "合并多个购物车项")
    public BaseResult mergeCart(@PathVariable Integer userId, @RequestBody List<Cart> cartItems, HttpServletRequest request) {
        Integer currentUserId = getUserIdFromRequest(request);
        if (currentUserId == null) {
            return BaseResult.error(401, "未登录");
        }

        if (!currentUserId.equals(userId)) {
            return BaseResult.error(403, "无权操作该用户的购物车");
        }

        return cartService.mergeCart(cartItems, userId);
    }

    // 内部类用于数量更新请求
    private static class QuantityRequest {
        private Integer quantity;

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}