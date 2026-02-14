package com.ouceat.backend.repository;

import com.ouceat.backend.entity.Dish;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {
    // 根据食堂和楼层查询
    List<Dish> findByCanteenAndFloor(String canteen, Integer floor);

    // 查询所有有评分的菜品，按平均分降序排列（用于红榜）
    @Query("SELECT d FROM Dish d WHERE d.avgRating > 0 ORDER BY d.avgRating DESC")
    List<Dish> findRankedDishes(Pageable pageable);
}