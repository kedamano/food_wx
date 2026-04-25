package com.food.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.food.entity.PointsLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 积分日志 Mapper
 */
@Mapper
public interface PointsLogMapper extends BaseMapper<PointsLog> {

    /**
     * 查询用户积分历史
     */
    @Select("SELECT * FROM points_log WHERE user_id = #{userId} ORDER BY create_time DESC")
    List<PointsLog> selectByUserId(@Param("userId") Integer userId);

    /**
     * 查询用户今日积分
     */
    @Select("SELECT IFNULL(SUM(CASE WHEN `change` > 0 THEN `change` ELSE 0 END), 0) " +
            "FROM points_log WHERE user_id = #{userId} AND DATE(create_time) = CURDATE()")
    Integer getTodayPoints(@Param("userId") Integer userId);

    /**
     * 查询用户本月积分
     */
    @Select("SELECT IFNULL(SUM(CASE WHEN `change` > 0 THEN `change` ELSE 0 END), 0) " +
            "FROM points_log WHERE user_id = #{userId} " +
            "AND YEAR(create_time) = YEAR(NOW()) AND MONTH(create_time) = MONTH(NOW())")
    Integer getMonthlyPoints(@Param("userId") Integer userId);

    /**
     * 查询今日是否有指定类型记录（用于签到防重）
     */
    @Select("SELECT COUNT(*) FROM points_log WHERE user_id = #{userId} AND type = #{type} " +
            "AND DATE(create_time) = CURDATE()")
    Integer countTodayByType(@Param("userId") Integer userId, @Param("type") String type);

    /**
     * 查询指定日期是否有签到记录
     */
    @Select("SELECT COUNT(*) FROM points_log WHERE user_id = #{userId} AND type = 'SIGN_IN' " +
            "AND DATE(create_time) = #{date}")
    Integer countSignInByDate(@Param("userId") Integer userId, @Param("date") String date);
}
