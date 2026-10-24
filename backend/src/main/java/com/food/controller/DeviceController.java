package com.food.controller;

import com.food.dto.BaseResult;
import com.food.mapper.UserDeviceMapper;
import com.food.utils.JwtUtil;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * 登录设备管理：登录后上报、查看、解绑
 */
@RestController
@RequestMapping("/user/devices")
@Api(tags = "设备管理接口")
public class DeviceController {

    @Autowired
    private UserDeviceMapper userDeviceMapper;

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

    @PostMapping("/report")
    @ApiOperation(value = "上报登录设备", notes = "登录成功后调用，记录本次登录设备")
    public BaseResult report(@RequestBody Map<String, String> body, HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }
        String deviceName = body.getOrDefault("deviceName", "未知设备");
        String deviceModel = body.getOrDefault("deviceModel", "");
        String platform = body.getOrDefault("platform", "mp-weixin");
        userDeviceMapper.insert(userId, deviceName, deviceModel, platform);
        return BaseResult.success("设备已记录");
    }

    @GetMapping
    @ApiOperation(value = "我的设备列表", notes = "按最近登录排序")
    public BaseResult list(HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }
        return BaseResult.success(userDeviceMapper.selectByUser(userId));
    }

    @DeleteMapping("/{deviceId}")
    @ApiOperation(value = "解绑设备", notes = "仅能解绑自己的设备")
    public BaseResult unbind(@PathVariable Integer deviceId, HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }
        int rows = userDeviceMapper.delete(deviceId, userId);
        if (rows > 0) {
            return BaseResult.success("已解绑");
        }
        return BaseResult.error(404, "设备不存在或不属于当前用户");
    }
}
