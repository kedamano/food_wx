package com.food.mapper;

import com.food.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface UserMapper {

    int insert(User user);

    int update(User user);

    User selectById(Integer userId);

    User selectByUsername(String username);

    User selectByPhone(String phone);

    User selectByInviteCode(String inviteCode);

    List<User> selectAll();

    int deleteById(Integer userId);

}