package com.ouceat.backend.controller;

import com.ouceat.backend.entity.Dish;
import com.ouceat.backend.service.rankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/test")
public class rankController {

    @Autowired
    private rankService rankService;

    @GetMapping("/red")
    public List<Dish> getRedRank(@RequestParam(defaultValue = "10") int limit) {
        return rankService.getRedRank(limit);
    }

    @GetMapping("/black")
    public List<Dish> getBlackRank(@RequestParam(defaultValue = "10") int limit) {
        return rankService.getBlackRank(limit);
    }
}