package com.food.config;

import com.food.utils.VerifyCodeUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

/**
 * cache.type=redis 时把验证码存储切换为 Redis（多实例共享限频/防重放数据）。
 * key: verify:code:{phone} / verify:sent:{phone}，均带 TTL 自动过期。
 */
@Component
@ConditionalOnProperty(prefix = "cache", name = "type", havingValue = "redis")
public class VerifyCodeRedisBridge {

    private static final Logger log = LoggerFactory.getLogger(VerifyCodeRedisBridge.class);

    private final StringRedisTemplate redis;

    public VerifyCodeRedisBridge(StringRedisTemplate redis) {
        this.redis = redis;
    }

    @PostConstruct
    public void install() {
        VerifyCodeUtil.setStore(new VerifyCodeUtil.CodeStore() {
            @Override
            public void save(String phone, String code, int ttlSeconds) {
                redis.opsForValue().set(codeKey(phone), code, java.time.Duration.ofSeconds(ttlSeconds));
            }

            @Override
            public String get(String phone) {
                return redis.opsForValue().get(codeKey(phone));
            }

            @Override
            public void remove(String phone) {
                redis.delete(codeKey(phone));
                redis.delete(sentKey(phone));
            }

            @Override
            public void saveSentAt(String phone, long epochMilli, int ttlSeconds) {
                redis.opsForValue().set(sentKey(phone), String.valueOf(epochMilli),
                        java.time.Duration.ofSeconds(ttlSeconds));
            }

            @Override
            public Long getSentAt(String phone) {
                String v = redis.opsForValue().get(sentKey(phone));
                return v == null ? null : Long.parseLong(v);
            }

            private String codeKey(String phone) { return "verify:code:" + phone; }
            private String sentKey(String phone) { return "verify:sent:" + phone; }
        });
        log.info("验证码存储已切换为 Redis（多实例部署模式）");
    }
}
