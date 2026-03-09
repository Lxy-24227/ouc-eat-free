/**
 * API v1 路由：与前端 baseURL /api/v1 对应
 * 注意：/dish/random、/dish/ranking 必须在 /dish/:id 之前，避免被 :id 匹配
 */
const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const ratingController = require('../controllers/ratingController');
const commentController = require('../controllers/commentController');

router.get('/dish/random', dishController.getRandomDish);
router.get('/dish/ranking', dishController.getRanking);
router.post('/rating', ratingController.submitRating);
router.post('/comment', commentController.addComment);
router.get('/dish/:id/comments', commentController.getComments);
router.post('/dish/:id/comments', commentController.addCommentByDishId);

module.exports = router;