package com.food.utils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * 微信小程序服务：code2session 换取 openid
 */
@Service
public class WechatService {

    private static final Logger log = LoggerFactory.getLogger(WechatService.class);

    private static final String JSCODE2SESSION_URL =
            "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code";

    @Value("${wx.miniapp.appid:}")
    private String appid;

    @Value("${wx.miniapp.secret:}")
    private String secret;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 是否已配置微信小程序凭据（未配置时微信登录不可用）
     */
    public boolean isConfigured() {
        return appid != null && !appid.isEmpty() && secret != null && !secret.isEmpty();
    }

    /**
     * 用 wx.login 的 code 换取 openid
     *
     * @param jsCode 前端 wx.login 返回的 code
     * @return openid
     * @throws IllegalStateException 未配置 appid/secret
     * @throws RuntimeException     code 无效或微信接口返回错误
     */
    public String getOpenidByCode(String jsCode) {
        if (!isConfigured()) {
            throw new IllegalStateException("微信登录未配置：请在服务端设置 WX_APPID / WX_SECRET 环境变量");
        }
        if (jsCode == null || jsCode.isEmpty()) {
            throw new IllegalArgumentException("code 不能为空");
        }

        String url = String.format(JSCODE2SESSION_URL, appid, secret, jsCode);
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        JSONObject json = JSON.parseObject(response.getBody());

        Integer errcode = json.getInteger("errcode");
        if (errcode != null && errcode != 0) {
            log.warn("code2session 失败: errcode={}, errmsg={}", errcode, json.getString("errmsg"));
            throw new RuntimeException("微信登录失败：" + json.getString("errmsg"));
        }
        String openid = json.getString("openid");
        if (openid == null || openid.isEmpty()) {
            throw new RuntimeException("微信登录失败：未获取到 openid");
        }
        return openid;
    }
}
