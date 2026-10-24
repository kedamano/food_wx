package com.food.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import java.util.Map;

/**
 * 话题
 */
@Mapper
public interface TopicMapper {

    @Select("SELECT topic_id AS topicId, title, description, cover, store_ids AS storeIds, " +
            "participant_count AS participantCount FROM topics ORDER BY participant_count DESC")
    List<Map<String, Object>> selectAll();

    @Select("SELECT topic_id AS topicId, title, description, cover, store_ids AS storeIds, " +
            "participant_count AS participantCount FROM topics WHERE topic_id = #{topicId}")
    Map<String, Object> selectById(@Param("topicId") Integer topicId);

    @Update("UPDATE topics SET participant_count = participant_count + 1 WHERE topic_id = #{topicId}")
    int increaseParticipant(@Param("topicId") Integer topicId);
}
