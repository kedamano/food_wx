package com.food.utils;

import com.food.entity.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

/**
 * 微信支付（V2 JSAPI）下单与回调验签。
 * 未配置商户号时支付退回"模拟支付"模式（wx.pay.enabled=false）。
 */
@Service
public class WechatPayService {

    private static final Logger log = LoggerFactory.getLogger(WechatPayService.class);

    private static final String UNIFIED_ORDER_URL = "https://api.mch.weixin.qq.com/pay/unifiedorder";

    @Value("${wx.pay.enabled:false}")
    private boolean enabled;

    /** 默认复用小程序 appid */
    @Value("${wx.pay.appid:${wx.miniapp.appid:}}")
    private String appid;

    @Value("${wx.pay.mch-id:}")
    private String mchId;

    @Value("${wx.pay.mch-key:}")
    private String mchKey;

    @Value("${wx.pay.notify-url:}")
    private String notifyUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isEnabled() {
        return enabled;
    }

    public boolean isConfigured() {
        return appid != null && !appid.isEmpty()
                && mchId != null && !mchId.isEmpty()
                && mchKey != null && !mchKey.isEmpty()
                && notifyUrl != null && !notifyUrl.isEmpty();
    }

    /**
     * 统一下单，返回用于 wx.requestPayment 的 JSAPI 参数
     *
     * @return timeStamp / nonceStr / package / signType / paySign
     */
    public Map<String, String> createJsapiPayParams(Order order, String openid) {
        String prepayId = unifiedOrder(order, openid);
        String packageName = "prepay_id=" + prepayId;

        String timeStamp = String.valueOf(System.currentTimeMillis() / 1000);
        String nonceStr = UUID.randomUUID().toString().replace("-", "");

        Map<String, String> signParams = new TreeMap<>();
        signParams.put("appId", appid);
        signParams.put("timeStamp", timeStamp);
        signParams.put("nonceStr", nonceStr);
        signParams.put("package", packageName);
        String paySign = sign(signParams);

        Map<String, String> params = new HashMap<>();
        params.put("timeStamp", timeStamp);
        params.put("nonceStr", nonceStr);
        params.put("package", packageName);
        params.put("signType", "MD5");
        params.put("paySign", paySign);
        return params;
    }

    /**
     * 调用微信统一下单接口，返回 prepay_id
     */
    private String unifiedOrder(Order order, String openid) {
        if (!isConfigured()) {
            throw new IllegalStateException("微信支付未配置：请设置 WX_PAY_MCH_ID / WX_PAY_MCH_KEY / WX_PAY_NOTIFY_URL");
        }

        String nonceStr = UUID.randomUUID().toString().replace("-", "");
        int totalFee = order.getPayAmount().multiply(new java.math.BigDecimal(100))
                .setScale(0, java.math.BigDecimal.ROUND_UP).intValue();

        Map<String, String> params = new TreeMap<>();
        params.put("appid", appid);
        params.put("mch_id", mchId);
        params.put("nonce_str", nonceStr);
        params.put("body", "美食外卖-订单" + order.getOrderNo());
        params.put("out_trade_no", order.getOrderNo());
        params.put("total_fee", String.valueOf(totalFee));
        params.put("spbill_create_ip", "127.0.0.1");
        params.put("notify_url", notifyUrl);
        params.put("trade_type", "JSAPI");
        params.put("openid", openid);
        String sign = sign(params);
        params.put("sign", sign);

        StringBuilder xml = new StringBuilder("<xml>");
        for (Map.Entry<String, String> entry : params.entrySet()) {
            xml.append('<').append(entry.getKey()).append('>')
                    .append(entry.getValue())
                    .append("</").append(entry.getKey()).append('>');
        }
        xml.append("</xml>");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/xml; charset=UTF-8"));
            ResponseEntity<String> response = restTemplate.postForEntity(
                    UNIFIED_ORDER_URL, new HttpEntity<>(xml.toString(), headers), String.class);

            Map<String, String> result = parseXml(response.getBody());
            if (!"SUCCESS".equals(result.get("return_code")) || !"SUCCESS".equals(result.get("result_code"))) {
                log.warn("微信统一下单失败: {}", response.getBody());
                throw new RuntimeException("微信下单失败：" + result.getOrDefault("err_code_des", result.get("return_msg")));
            }
            return result.get("prepay_id");
        } catch (java.io.IOException e) {
            throw new RuntimeException("微信下单响应解析失败", e);
        }
    }

    /**
     * 微信支付 V2 申请退款（secapi/refund）。
     * 框架已就绪：真实调用需商户证书（mchKey + apiclient_cert.p12）；
     * 未配置证书时抛 IllegalStateException，由调用方降级为模拟退款。
     */
    public boolean refund(String outTradeNo, String outRefundNo,
                          int totalFee, int refundFee) {
        if (!isConfigured()) {
            throw new IllegalStateException("微信退款未配置：需设置 WX_PAY_MCH_ID / WX_PAY_MCH_KEY");
        }
        Map<String, String> params = new TreeMap<>();
        params.put("appid", appid);
        params.put("mch_id", mchId);
        params.put("nonce_str", UUID.randomUUID().toString().replace("-", ""));
        params.put("out_trade_no", outTradeNo);
        params.put("out_refund_no", outRefundNo);
        params.put("total_fee", String.valueOf(totalFee));
        params.put("refund_fee", String.valueOf(refundFee));
        params.put("sign", sign(params));

        StringBuilder xml = new StringBuilder("<xml>");
        for (Map.Entry<String, String> e : params.entrySet()) {
            xml.append('<').append(e.getKey()).append('>')
                    .append(e.getValue())
                    .append("</").append(e.getKey()).append('>');
        }
        xml.append("</xml>");

        try {
            // 生产需携带商户证书调用 https://api.mch.weixin.qq.com/secapi/refund
            // 此处保留调用框架；证书文件路径由环境变量 WX_PAY_CERT_PATH 提供
            log.warn("微信退款调用框架就绪，但未配置商户证书（WX_PAY_CERT_PATH），未发起真实请求");
            return false;
        } catch (Exception e) {
            log.error("微信退款请求失败", e);
            return false;
        }
    }

    /**
     * 校验支付回调签名（返回请求参数中 sign 之外的原始签名做比对）
     */
    public boolean verifyNotifySign(Map<String, String> fields, String sign) {
        Map<String, String> signParams = new TreeMap<>(fields);
        signParams.remove("sign");
        return sign.equals(sign(signParams));
    }

    /**
     * ASCII 升序 k=v 拼接后加 &key=商户密钥，MD5 大写
     */
    private String sign(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String value = entry.getValue();
            if (value == null || value.isEmpty()) {
                continue;
            }
            if (sb.length() > 0) {
                sb.append('&');
            }
            sb.append(entry.getKey()).append('=').append(value);
        }
        sb.append("&key=").append(mchKey);
        return md5Hex(sb.toString()).toUpperCase();
    }

    private String md5Hex(String text) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : digest) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 不可用", e);
        }
    }

    /**
     * 解析微信返回/回调的 XML 为键值对
     */
    public Map<String, String> parseXml(String xml) throws java.io.IOException {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            // 防止 XXE
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setXIncludeAware(false);
            factory.setExpandEntityReferences(false);
            Element root = factory.newDocumentBuilder()
                    .parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)))
                    .getDocumentElement();

            Map<String, String> fields = new HashMap<>();
            org.w3c.dom.NodeList nodes = root.getChildNodes();
            for (int i = 0; i < nodes.getLength(); i++) {
                if (nodes.item(i) instanceof Element) {
                    Element node = (Element) nodes.item(i);
                    fields.put(node.getNodeName(), node.getTextContent());
                }
            }
            return fields;
        } catch (javax.xml.parsers.ParserConfigurationException | org.xml.sax.SAXException e) {
            throw new java.io.IOException("XML 解析失败", e);
        }
    }
}
