package com.food.controller;

import com.food.dto.BaseResult;
import com.food.entity.Feedback;
import com.food.mapper.FeedbackMapper;
import com.food.utils.JwtUtil;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 用户反馈接口
 */
@RestController
@RequestMapping("/feedback")
@Api(tags = "用户反馈接口")
public class FeedbackController {

    @Autowired
    private FeedbackMapper feedbackMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    @ApiOperation(value = "提交反馈")
    public BaseResult submitFeedback(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            Integer userId = jwtUtil.getUserIdFromToken(token);

            Feedback feedback = new Feedback();
            feedback.setUserId(userId != null ? userId : 0);
            Object typeObj = body.get("type");
            feedback.setType(typeObj != null ? Integer.valueOf(typeObj.toString()) : 4);
            Object contentObj = body.get("content");
            feedback.setContent(contentObj != null ? contentObj.toString() : "");
            Object contactObj = body.get("contact");
            feedback.setContact(contactObj != null ? contactObj.toString() : "");
            feedback.setStatus("pending");
            feedback.setCreateTime(LocalDateTime.now());

            feedbackMapper.insert(feedback);
            return BaseResult.success("反馈提交成功");
        } catch (Exception e) {
            return BaseResult.error("提交失败: " + e.getMessage());
        }
    }

}
