package com.food.handler;

import com.food.dto.BaseResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理：兜底未捕获异常，统一返回 BaseResult，
 * 避免把内部异常信息（e.getMessage）直接暴露给客户端
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** 业务参数错误 */
    @ExceptionHandler(IllegalArgumentException.class)
    public BaseResult handleIllegalArgument(IllegalArgumentException e) {
        log.warn("参数错误: {}", e.getMessage());
        return BaseResult.error(400, e.getMessage());
    }

    /** 路径/参数类型不匹配（如 /food/undefined）：客户端错误而非服务器故障 */
    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public BaseResult handleTypeMismatch(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException e) {
        log.warn("参数类型错误: {}", e.getMessage());
        return BaseResult.error(400, "参数格式不正确");
    }

    /** 业务规则错误（Service 中主动抛出的 RuntimeException） */
    @ExceptionHandler(RuntimeException.class)
    public BaseResult handleRuntime(RuntimeException e) {
        log.error("运行时异常", e);
        return BaseResult.error(500, "服务器繁忙，请稍后重试");
    }

    /** 兜底 */
    @ExceptionHandler(Exception.class)
    public BaseResult handleException(Exception e) {
        log.error("未处理异常", e);
        return BaseResult.error(500, "服务器繁忙，请稍后重试");
    }
}
