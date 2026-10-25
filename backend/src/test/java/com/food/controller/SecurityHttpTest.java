package com.food.controller;

import com.food.utils.JwtUtil;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.util.ReflectionTestUtils;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HTTP 层安全回归（MockMvc）：
 * 越权/未登录/白名单精确匹配等此前只能人工验证的行为，自此有回归网。
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("HTTP 层安全回归")
class SecurityHttpTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JwtUtil jwtUtil;

    private static String user1Token;
    private static String user3Token;

    @BeforeAll
    static void beforeAll(@Autowired JwtUtil jwt) {
        // data-h2.sql 预置 user 1（zhangsan）/ user 3（wangwu）
        user1Token = jwt.generateToken(1);
        user3Token = jwt.generateToken(3);
    }

    @Test
    @DisplayName("无 Token 访问受保护接口 -> 业务码 401")
    void noTokenGets401() throws Exception {
        mvc.perform(get("/order/user/1"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @DisplayName("伪造 Token -> 401")
    void tamperedTokenGets401() throws Exception {
        mvc.perform(get("/order/user/1").header("Authorization", "Bearer fake.token.value"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("用户 A 的 Token 查用户 B 的订单 -> 403")
    void crossUserOrderListDenied() throws Exception {
        mvc.perform(get("/order/user/1").header("Authorization", "Bearer " + user3Token))
                .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    @DisplayName("普通用户访问商家订单 -> 403")
    void merchantOnlyEndpointDeniedForUser() throws Exception {
        mvc.perform(get("/order/store/1").header("Authorization", "Bearer " + user1Token))
                .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    @DisplayName("本人订单列表 -> 200")
    void ownOrderListAllowed() throws Exception {
        mvc.perform(get("/order/user/1").header("Authorization", "Bearer " + user1Token))
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("登录参数校验（@Valid）：空密码 -> 400 且带提示")
    void validationKicksIn() throws Exception {
        mvc.perform(post("/user/login")
                        .contentType("application/json")
                        .content("{\"username\":\"zhangsan\",\"password\":\"\"}"))
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("密码不能为空"));
    }

    @Test
    @DisplayName("公开只读白名单：/food/categories 无 Token 可访问")
    void publicReadWhitelistWorks() throws Exception {
        mvc.perform(get("/food/categories"))
                .andExpect(jsonPath("$.code").value(200));
    }
}
