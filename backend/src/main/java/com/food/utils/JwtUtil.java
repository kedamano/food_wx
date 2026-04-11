package com.food.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private static final int MIN_SECRET_LENGTH = 32; // 最小密钥长度

    // 调试：打印配置值
    @PostConstruct
    public void init() {
        System.out.println("=== JwtUtil 配置 ===");
        System.out.println("expiration: " + expiration + "ms (" + (expiration / 1000 / 60 / 60 / 24) + "天)");

        // 检查密钥是否从环境变量读取
        String envSecret = System.getenv("JWT_SECRET");
        if (envSecret != null && !envSecret.isEmpty()) {
            System.out.println("JWT密钥来源: 环境变量 JWT_SECRET");
        } else {
            System.out.println("警告: JWT密钥使用默认值，仅适用于开发环境！");
            System.out.println("生产环境请设置环境变量: export JWT_SECRET=your_secret_key_here");
        }

        // 验证密钥强度
        if (secret == null || secret.length() < MIN_SECRET_LENGTH) {
            System.err.println("错误: JWT密钥长度不足 " + MIN_SECRET_LENGTH + " 位，存在安全隐患！");
        } else {
            System.out.println("JWT密钥长度: " + secret.length() + " (符合要求)");
        }

        System.out.println("====================");
    }

    /**
     * 生成Token
     * @param userId 用户ID
     * @return Token字符串
     */
    public String generateToken(Integer userId) {
        Date nowDate = new Date();
        Date expireDate = new Date(nowDate.getTime() + expiration);
        System.out.println("=== JwtUtil 生成Token ===");
        System.out.println("userId: " + userId);
        System.out.println("nowDate: " + nowDate + " (" + nowDate.getTime() + ")");
        System.out.println("expireDate: " + expireDate + " (" + expireDate.getTime() + ")");
        System.out.println("expiration配置: " + expiration + "ms");
        System.out.println("============================");

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
        if (claims == null) {
            System.out.println("=== JwtUtil: Token解析失败 ===");
            return false;
        }
        Date exp = claims.getExpiration();
        Date now = new Date();
        System.out.println("=== JwtUtil validateToken ===");
        System.out.println("exp: " + exp + " (" + exp.getTime() + ")");
        System.out.println("now: " + now + " (" + now.getTime() + ")");
        System.out.println("exp.before(now): " + exp.before(now));
        System.out.println("exp.after(now): " + exp.after(now));
        System.out.println("================================");
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
            System.out.println("=== JwtUtil: Token解析失败(检查过期) ===");
            return true;
        }
        Date exp = claims.getExpiration();
        Date now = new Date();
        boolean expired = exp.before(now);
        System.out.println("=== JwtUtil isTokenExpired ===");
        System.out.println("exp: " + exp + " (" + exp.getTime() + ")");
        System.out.println("now: " + now + " (" + now.getTime() + ")");
        System.out.println("已过期: " + expired);
        System.out.println("================================");
        return expired;
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