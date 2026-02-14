package com.ouceat.backend.service;

import com.ouceat.backend.entity.Dish;
import com.ouceat.backend.repository.DishRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class rankService {

    @Autowired
    private DishRepository dishRepository;

    @Cacheable(value = "redRank", key = "#limit")
    public List<Dish> getRedRank(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "avgRating"));
        return dishRepository.findAll(pageable).getContent();
    }

    @Cacheable(value = "blackRank", key = "#limit")
    public List<Dish> getBlackRank(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.ASC, "avgRating"));
        return dishRepository.findAll(pageable).getContent();
    }
}