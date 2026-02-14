package com.ouceat.backend.controller;

import com.ouceat.backend.entity.Dish;
import com.ouceat.backend.entity.Rating;
import com.ouceat.backend.entity.Comment;
import com.ouceat.backend.service.dishService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/test")
public class dishController {

    @Autowired
    private dishService dishService;

    @GetMapping("/dish")
    public Dish createDish(@RequestParam String name,
                           @RequestParam String canteen,
                           @RequestParam Integer floor) {
        return dishService.createDish(name, canteen, floor);
    }

    @GetMapping("/rate")
    public Rating rateDish(@RequestParam Long dishId,
                           @RequestParam Integer score,
                           @RequestParam String userId) {
        return dishService.rateDish(dishId, score, userId);
    }

    @GetMapping("/comment")
    public Comment addComment(@RequestParam Long dishId,
                              @RequestParam String content,
                              @RequestParam String userId) {
        return dishService.addComment(dishId, content, userId);
    }

    @GetMapping("/comments")
    public List<Comment> getComments(@RequestParam Long dishId) {
        return dishService.getCommentsByDishId(dishId);
    }
}