package com.food.mapper;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 评价互动：点赞、回复
 */
@Mapper
public interface ReviewInteractionMapper {

    @Select("SELECT id FROM review_likes WHERE review_id = #{reviewId} AND user_id = #{userId}")
    Long selectLike(@Param("reviewId") Integer reviewId, @Param("userId") Integer userId);

    @Insert("INSERT INTO review_likes (review_id, user_id) VALUES (#{reviewId}, #{userId})")
    int insertLike(@Param("reviewId") Integer reviewId, @Param("userId") Integer userId);

    @Delete("DELETE FROM review_likes WHERE review_id = #{reviewId} AND user_id = #{userId}")
    int deleteLike(@Param("reviewId") Integer reviewId, @Param("userId") Integer userId);

    @Select("SELECT COUNT(*) FROM review_likes WHERE review_id = #{reviewId}")
    int countLikes(@Param("reviewId") Integer reviewId);

    /** 批量取点赞数与当前用户是否已赞（前端列表一次性附加） */
    @Select("<script>SELECT review_id AS reviewId, COUNT(*) AS likeCount, " +
            "MAX(CASE WHEN user_id = #{userId} THEN 1 ELSE 0 END) AS likedByMe " +
            "FROM review_likes WHERE review_id IN " +
            "<foreach collection='reviewIds' item='id' open='(' separator=',' close=')'>#{id}</foreach> " +
            "GROUP BY review_id</script>")
    List<Map<String, Object>> selectLikeSummary(@Param("reviewIds") List<Integer> reviewIds,
                                                @Param("userId") Integer userId);

    @Insert("INSERT INTO review_replies (review_id, user_id, content) VALUES (#{reviewId}, #{userId}, #{content})")
    int insertReply(@Param("reviewId") Integer reviewId, @Param("userId") Integer userId,
                    @Param("content") String content);

    @Select("SELECT rr.reply_id AS replyId, rr.review_id AS reviewId, rr.user_id AS userId, " +
            "u.username AS username, u.avatar AS avatar, rr.content, rr.create_time AS createTime " +
            "FROM review_replies rr LEFT JOIN users u ON rr.user_id = u.user_id " +
            "WHERE rr.review_id = #{reviewId} ORDER BY rr.create_time ASC")
    List<Map<String, Object>> selectReplies(@Param("reviewId") Integer reviewId);
}
