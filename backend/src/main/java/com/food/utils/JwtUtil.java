package com.food.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    /** HS512 要求密钥 >= 512bit（64 字节），短密钥循环填充到该长度 */
    private static final int MIN_KEY_BYTES = 64;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private volatile SecretKey signingKey;

    @PostConstruct
    public void init() {
        buildKeyIfNeeded();
        if (System.getenv("JWT_SECRET") == null || System.getenv("JWT_SECRET").isEmpty()) {
            log.warn("JWT 密钥使用默认值，仅适用于开发环境！生产环境请设置环境变量 JWT_SECRET");
        }
    }

    /** 懒构建签名密钥：兼容 Spring 注入与纯单元测试反射注入两种路径 */
    private SecretKey key() {
        buildKeyIfNeeded();
        return signingKey;
    }

    private synchronized void buildKeyIfNeeded() {
        if (signingKey != null) {
            return;
        }
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < MIN_KEY_BYTES) {
            byte[] padded = new byte[MIN_KEY_BYTES];
            int filled = 0;
            while (filled < MIN_KEY_BYTES) {
                int n = Math.min(bytes.length, MIN_KEY_BYTES - filled);
                System.arraycopy(bytes, 0, padded, filled, n);
                filled += n;
            }
            bytes = padded;
        }
        signingKey = Keys.hmacShaKeyFor(bytes);
    }

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
                .signWith(key(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * 解析Token
     * @param token Token字符串
     * @return Claims对象，解析失败返回 null
     */
    public Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            log.debug("Token 解析失败: {}", e.getClass().getSimpleName());
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
     * 验证Token是否有效（签名合法且未过期）
     * @param token Token字符串
     * @return 是否有效
     */
    public boolean validateToken(String token) {
        Claims claims = parseToken(token);
        return claims != null && !claims.getExpiration().before(new Date());
    }

    /**
     * 检查Token是否已过期
     * @param token Token字符串
     * @return 是否已过期
     */
    public boolean isTokenExpired(String token) {
        Claims claims = parseToken(token);
        if (claims == null) {
            return true;
        }
        return claims.getExpiration().before(new Date());
    }

    /**
     * 宽松解析：签名合法但已过期的 Token 仍返回 Claims（供刷新换发新 Token）
     * @return Claims；签名非法等情形返回 null
     */
    public Claims parseTokenIgnoreExpiry(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            // 仅过期：签名仍合法
            return e.getClaims();
        } catch (Exception e) {
            log.debug("Token 宽松解析失败: {}", e.getClass().getSimpleName());
            return null;
        }
    }

    /**
     * 刷新Token
     * @param token Token字符串
     * @return 新的Token
     */
    public String refreshToken(String token) {
        Claims claims = parseTokenIgnoreExpiry(token);
        if (claims == null) {
            return null;
        }

        return generateToken(Integer.parseInt(claims.getSubject()));
    }
}
