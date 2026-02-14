package com.ouceat.backend.service;

import com.ouceat.backend.entity.Dish;
import com.ouceat.backend.entity.Rating;
import com.ouceat.backend.entity.Comment;
import com.ouceat.backend.repository.DishRepository;
import com.ouceat.backend.repository.RatingRepository;
import com.ouceat.backend.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class dishService {

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private CommentRepository commentRepository;

    // ========== 菜品创建 ==========
    @Transactional
    public Dish createDish(String name, String canteen, Integer floor) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("菜名不能为空");
        }
        if (canteen == null || canteen.trim().isEmpty()) {
            throw new IllegalArgumentException("食堂不能为空");
        }
        if (floor == null || floor <= 0) {
            throw new IllegalArgumentException("楼层必须为正整数");
        }

        Dish dish = new Dish();
        dish.setName(name.trim());
        dish.setCanteen(canteen.trim());
        dish.setFloor(floor);
        dish.setAvgRating(0.0);
        dish.setCreatedAt(LocalDateTime.now());
        dish.setUpdatedAt(LocalDateTime.now());

        return dishRepository.save(dish);
    }

    // ========== 评分相关 ==========
    @Transactional
    @CacheEvict(value = {"redRank", "blackRank"}, allEntries = true)
    public Rating rateDish(Long dishId, Integer score, String userId) {
        if (dishId == null) {
            throw new IllegalArgumentException("菜品ID不能为空");
        }
        if (score == null || score < 1 || score > 5) {
            throw new IllegalArgumentException("评分必须是1-5之间的整数");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("用户ID不能为空");
        }

        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new RuntimeException("菜品不存在"));

        Rating rating = new Rating();
        rating.setDish(dish);
        rating.setScore(score);
        rating.setUserId(userId);
        rating.setCreatedAt(LocalDateTime.now());
        ratingRepository.save(rating);

        updateAverageRating(dish);
        return rating;
    }

    private void updateAverageRating(Dish dish) {
        List<Rating> ratings = ratingRepository.findByDishId(dish.getId());
        if (ratings.isEmpty()) {
            dish.setAvgRating(0.0);
        } else {
            double avg = ratings.stream()
                    .mapToInt(Rating::getScore)
                    .average()
                    .orElse(0.0);
            // 保留两位小数
            double roundedAvg = Math.round(avg * 100.0) / 100.0;
            dish.setAvgRating(roundedAvg);
        }
        dish.setUpdatedAt(LocalDateTime.now());
        dishRepository.save(dish);
    }

    // ========== 评论相关 ==========
    @Transactional
    public Comment addComment(Long dishId, String content, String userId) {
        if (dishId == null) {
            throw new IllegalArgumentException("菜品ID不能为空");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("评论内容不能为空");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("用户ID不能为空");
        }

        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new RuntimeException("菜品不存在"));

        Comment comment = new Comment();
        comment.setDish(dish);
        comment.setContent(content.trim());
        comment.setUserId(userId);
        comment.setCreatedAt(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByDishId(Long dishId) {
        return commentRepository.findByDishId(dishId);
    }
}