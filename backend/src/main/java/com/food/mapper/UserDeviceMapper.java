package com.food.mapper;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 登录设备
 */
@Mapper
public interface UserDeviceMapper {

    @Insert("INSERT INTO user_devices (user_id, device_name, device_model, platform) " +
            "VALUES (#{userId}, #{deviceName}, #{deviceModel}, #{platform})")
    int insert(@Param("userId") Integer userId, @Param("deviceName") String deviceName,
               @Param("deviceModel") String deviceModel, @Param("platform") String platform);

    @Select("SELECT device_id AS deviceId, device_name AS deviceName, device_model AS deviceModel, " +
            "platform, login_time AS loginTime FROM user_devices " +
            "WHERE user_id = #{userId} ORDER BY login_time DESC")
    List<Map<String, Object>> selectByUser(@Param("userId") Integer userId);

    @Delete("DELETE FROM user_devices WHERE device_id = #{deviceId} AND user_id = #{userId}")
    int delete(@Param("deviceId") Integer deviceId, @Param("userId") Integer userId);
}
