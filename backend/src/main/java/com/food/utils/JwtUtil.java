package com.food.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    /**
     * 生成Token
     * @param userId 用户ID
     * @return Token字符串
     */
    public String generateToken(Integer userId) {
        Date nowDate = new Date();
        Date expireDate = new Date(nowDate.getTime() + expiration);

        return Jwts.builder()
                .setHeaderParam("typ", "JWT")
                .setSubject(userId.toString())
                .setIssuedAt(nowDate)
                .setExpiration(expireDate)
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    /**
     * 解析Token
     * @param token Token字符串
     * @return Claims对象
     */
    public Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(secret)
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 从Token中获取用户ID
     * @param token Token字符串
     * @return 用户ID
     */
    public Integer getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        if (claims != null) {
            return Integer.parseInt(claims.getSubject());
        }
        return null;
    }

    /**
     * 验证Token是否有效
     * @param token Token字符串
     * @return 是否有效
     */
    public boolean validateToken(String token) {
        Claims claims = parseToken(token);
        return claims != null && !claims.getExpiration().before(new Date());
    }

    /**
     * 检查Token是否需要刷新
     * @param token Token字符串
     * @return 是否需要刷新
     */
    public boolean isTokenExpired(String token) {
        Claims claims = parseToken(token);
        if (claims == null) {
            return true;
        }
        return claims.getExpiration().before(new Date());
    }

    /**
     * 刷新Token
     * @param token Token字符串
     * @return 新的Token
     */
    public String refreshToken(String token) {
        Claims claims = parseToken(token);
        if (claims == null) {
            return null;
        }

        return generateToken(Integer.parseInt(claims.getSubject()));
    }
}