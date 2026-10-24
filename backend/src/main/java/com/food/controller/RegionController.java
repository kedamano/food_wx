package com.food.controller;

import com.food.dto.BaseResult;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * 省市区数据（来自 resources/region.json，静态只读，客户端地址编辑器选择用）
 */
@RestController
@RequestMapping("/region")
@Api(tags = "省市区数据接口")
public class RegionController {

    private volatile List<Map<String, Object>> cache;

    @SuppressWarnings("unchecked")
    @GetMapping("/tree")
    @ApiOperation(value = "省市区树", notes = "省 -> 市 -> 区 三级名称树")
    public BaseResult tree() throws IOException {
        if (cache == null) {
            synchronized (this) {
                if (cache == null) {
                    String text = new String(new ClassPathResource("region.json")
                            .getInputStream().readAllBytes(), StandardCharsets.UTF_8);
                    cache = com.alibaba.fastjson.JSON.parseObject(text, List.class);
                }
            }
        }
        return BaseResult.success(cache);
    }
}
