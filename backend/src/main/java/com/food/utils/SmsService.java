package com.food.utils;

import com.aliyuncs.DefaultAcsClient;
import com.aliyuncs.IAcsClient;
import com.aliyuncs.dysmsapi.model.v20170525.SendSmsRequest;
import com.aliyuncs.dysmsapi.model.v20170525.SendSmsResponse;
import com.aliyuncs.exceptions.ClientException;
import com.aliyuncs.profile.DefaultProfile;
import com.aliyuncs.profile.IClientProfile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 阿里云短信服务工具类
 */
@Component
public class SmsService {

    @Value("${aliyun.sms.access-key-id}")
    private String accessKeyId;

    @Value("${aliyun.sms.access-key-secret}")
    private String accessKeySecret;

    @Value("${aliyun.sms.sign-name}")
    private String signName;

    @Value("${aliyun.sms.template-code}")
    private String templateCode;

    @Value("${aliyun.sms.region-id}")
    private String regionId;

    private IAcsClient acsClient;

    /**
     * 初始化阿里云短信客户端
     */
    private void initClient() {
        if (acsClient == null) {
            IClientProfile profile = DefaultProfile.getProfile(regionId, accessKeyId, accessKeySecret);
            acsClient = new DefaultAcsClient(profile);
        }
    }

    /**
     * 是否处于开发模式：AK/SK 未配置（保持占位符）时，不调用阿里云，
     * 验证码直接打印到控制台供本地预览使用
     */
    private boolean isDevMode() {
        return accessKeyId == null || accessKeyId.isEmpty()
                || "your_access_key_id".equals(accessKeyId)
                || accessKeySecret == null || accessKeySecret.isEmpty()
                || "your_access_key_secret".equals(accessKeySecret);
    }

    /**
     * 发送短信验证码
     * @param phoneNumber 手机号
     * @param verifyCode 验证码
     * @return 发送是否成功
     */
    public boolean sendVerifyCode(String phoneNumber, String verifyCode) {
        // 开发模式：未配置阿里云短信时模拟发送成功，验证码打印到控制台
        if (isDevMode()) {
            System.out.println("==================================================");
            System.out.println("【开发模式】短信未配置，模拟发送验证码");
            System.out.println("【开发模式】手机号: " + phoneNumber + "  验证码: " + verifyCode);
            System.out.println("==================================================");
            return true;
        }

        try {
            initClient();

            SendSmsRequest request = new SendSmsRequest();
            request.setPhoneNumbers(phoneNumber);
            request.setSignName(signName);
            request.setTemplateCode(templateCode);
            
            // 设置模板参数（验证码和有效期）
            request.setTemplateParam("{\"code\":\"" + verifyCode + "\",\"minutes\":\"5\"}");

            SendSmsResponse response = acsClient.getAcsResponse(request);
            
            // 检查发送结果
            if (response.getCode() != null && response.getCode().equals("OK")) {
                // 不打印验证码明文，避免日志泄露
                System.out.println("短信发送成功，手机号：" + phoneNumber.substring(0, 3) + "****" + phoneNumber.substring(7));
                return true;
            } else {
                System.err.println("短信发送失败，手机号：" + phoneNumber + "，错误码：" + response.getCode());
                return false;
            }
        } catch (ClientException e) {
            System.err.println("短信发送异常：" + e.getMessage());
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            System.err.println("系统异常：" + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 批量发送短信
     * @param phoneNumbers 手机号列表
     * @param templateParam 模板参数
     * @return 发送是否成功
     */
    public boolean sendBatchSms(String[] phoneNumbers, String templateParam) {
        try {
            initClient();

            SendSmsRequest request = new SendSmsRequest();
            // 将手机号数组转换为逗号分隔的字符串
            request.setPhoneNumbers(String.join(",", phoneNumbers));
            request.setSignName(signName);
            request.setTemplateCode(templateCode);
            request.setTemplateParam(templateParam);

            SendSmsResponse response = acsClient.getAcsResponse(request);
            
            return response.getCode() != null && response.getCode().equals("OK");
        } catch (Exception e) {
            System.err.println("批量短信发送异常：" + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}