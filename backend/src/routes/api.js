/**
 * API 路由
 * 最小改动：仅补齐缺失接口并兼容旧路径，修复 404
 * 注意：/dish/random、/dish/ranking 必须在 /dish/:id 之前，避免被 :id 匹配
 */
const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const ratingController = require('../controllers/ratingController');
const commentController = require('../controllers/commentController');
const authController = require('../controllers/authController');

// 认证接口
router.post('/register', authController.register);
router.post('/login', authController.login);

// 与需求对齐的兼容接口（/api/createDish、/api/addComment、/api/getRank）
router.post('/createDish', dishController.createDish);
router.post('/addComment', commentController.addComment);
router.get('/getRank', dishController.getRanking);

router.get('/dish/random', dishController.getRandomDish);
router.get('/dish/ranking', dishController.getRanking);
router.post('/dish', dishController.createDish);
router.post('/rating', ratingController.submitRating);
router.post('/comment', commentController.addComment);
router.get('/dish/:id/comments', commentController.getComments);
router.post('/dish/:id/comments', commentController.addCommentByDishId);

module.exports = router;