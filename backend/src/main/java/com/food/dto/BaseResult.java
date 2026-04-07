package com.food.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class BaseResult implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer code;
    private String message;
    private Object data;

    public BaseResult() {
    }

    public BaseResult(Integer code, String message, Object data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static BaseResult success() {
        return new BaseResult(200, "success", null);
    }

    public static BaseResult success(String message) {
        return new BaseResult(200, message, null);
    }

    public static BaseResult success(Object data) {
        return new BaseResult(200, "success", data);
    }

    public static BaseResult success(String message, Object data) {
        return new BaseResult(200, message, data);
    }

    public static BaseResult error(String message) {
        return new BaseResult(500, message, null);
    }

    public static BaseResult error(Integer code, String message) {
        return new BaseResult(code, message, null);
    }

    public static BaseResult error(Integer code, String message, Object data) {
        return new BaseResult(code, message, data);
    }
}