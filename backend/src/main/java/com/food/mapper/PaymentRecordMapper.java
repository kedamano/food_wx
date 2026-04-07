package com.food.mapper;

import com.food.entity.PaymentRecord;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PaymentRecordMapper {

    int insert(PaymentRecord paymentRecord);

    PaymentRecord selectById(Integer paymentId);

    PaymentRecord selectByPaymentNo(String paymentNo);

    PaymentRecord selectByOrderId(Integer orderId);

}