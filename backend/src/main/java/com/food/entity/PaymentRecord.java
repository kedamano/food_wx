package com.food.entity;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer paymentId;
    private Integer orderId;
    private String paymentNo;
    private String paymentMethod;
    private BigDecimal amount;
    private String status;
    private LocalDateTime payTime;
    private LocalDateTime createTime;

}