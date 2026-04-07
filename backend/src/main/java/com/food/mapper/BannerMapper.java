package com.food.mapper;

import com.food.entity.Banner;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface BannerMapper {

    int insert(Banner banner);

    int update(Banner banner);

    Banner selectById(Integer id);

    List<Banner> selectAll();
}
