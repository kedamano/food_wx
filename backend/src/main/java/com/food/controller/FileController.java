package com.food.controller;

import com.food.dto.BaseResult;
import com.food.utils.JwtUtil;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * 文件上传：头像、评价图片等。
 * 仅接受图片类型，UUID 重命名防止路径覆盖，需登录后调用。
 */
@RestController
@RequestMapping("/file")
@Api(tags = "文件上传接口")
public class FileController {

    /** 允许的图片扩展名 */
    private static final Set<String> ALLOWED_EXT =
            new HashSet<>(Arrays.asList("jpg", "jpeg", "png", "gif", "webp"));

    private static final long MAX_SIZE = 10 * 1024 * 1024; // 与 spring.servlet.multipart.max-file-size 一致

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private Integer getCurrentUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token != null && !token.isEmpty()) {
            return jwtUtil.getUserIdFromToken(token);
        }
        return null;
    }

    @PostMapping("/upload")
    @ApiOperation(value = "上传图片", notes = "multipart 字段名 file，返回可直接访问的 url（如 /upload/xxx.png）")
    public BaseResult upload(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        if (userId == null) {
            return BaseResult.error(401, "未登录");
        }
        if (file == null || file.isEmpty()) {
            return BaseResult.error(400, "请选择要上传的文件");
        }
        if (file.getSize() > MAX_SIZE) {
            return BaseResult.error(400, "文件不能超过10MB");
        }

        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String ext = original.contains(".")
                ? original.substring(original.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT) : "";
        if (!ALLOWED_EXT.contains(ext)) {
            return BaseResult.error(400, "仅支持图片格式：jpg/jpeg/png/gif/webp");
        }

        // UUID 重命名：避免覆盖与路径注入
        String savedName = UUID.randomUUID().toString().replace("-", "") + "." + ext;
        try {
            File dir = new File(uploadDir);
            if (!dir.exists() && !dir.mkdirs()) {
                return BaseResult.error(500, "创建上传目录失败");
            }
            file.transferTo(new File(dir, savedName));
        } catch (IOException e) {
            return BaseResult.error(500, "文件保存失败: " + e.getMessage());
        }

        // 前端通过 resolveImageUrl 拼接为完整地址
        return BaseResult.success("上传成功", "/upload/" + savedName);
    }
}
