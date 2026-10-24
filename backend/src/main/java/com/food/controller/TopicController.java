package com.food.controller;

import com.food.dto.BaseResult;
import com.food.mapper.TopicMapper;
import com.food.service.StoreService;
import com.food.service.StoreService;
import com.food.utils.JwtUtil;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 话题：列表、详情（含参与商家）、参与
 */
@RestController
@RequestMapping("/topic")
@Api(tags = "话题接口")
public class TopicController {

    @Autowired
    private TopicMapper topicMapper;

    @Autowired
    private StoreService storeService;

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

    @GetMapping("/list")
    @ApiOperation(value = "话题列表", notes = "按参与人数排序")
    public BaseResult list() {
        return BaseResult.success(topicMapper.selectAll());
    }

    @GetMapping("/{topicId}")
    @ApiOperation(value = "话题详情", notes = "话题信息 + 参与商家列表")
    public BaseResult detail(@PathVariable Integer topicId) {
        Map<String, Object> topic = topicMapper.selectById(topicId);
        if (topic == null) {
            return BaseResult.error(404, "话题不存在");
        }

        List<Map<String, Object>> stores = new ArrayList<>();
        Object storeIds = topic.get("storeIds");
        if (storeIds != null && !String.valueOf(storeIds).isEmpty()) {
            for (String idStr : String.valueOf(storeIds).split(",")) {
                try {
                    BaseResult r = storeService.getStoreById(Integer.parseInt(idStr.trim()));
                    if (r != null && r.getCode() == 200 && r.getData() instanceof com.food.entity.Store) {
                        com.food.entity.Store st = (com.food.entity.Store) r.getData();
                        Map<String, Object> sm = new HashMap<>();
                        sm.put("storeId", st.getStoreId());
                        sm.put("storeName", st.getStoreName());
                        sm.put("logo", st.getLogo());
                        sm.put("rating", st.getRating());
                        sm.put("address", st.getAddress());
                        sm.put("deliveryTime", st.getDeliveryTime());
                        stores.add(sm);
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }
        topic.put("stores", stores);
        return BaseResult.success(topic);
    }

    @PostMapping("/{topicId}/join")
    @ApiOperation(value = "参与话题", notes = "参与人数 +1，需登录")
    public BaseResult join(@PathVariable Integer topicId, HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }
        int rows = topicMapper.increaseParticipant(topicId);
        if (rows > 0) {
            return BaseResult.success("参与成功");
        }
        return BaseResult.error(404, "话题不存在");
    }
}
