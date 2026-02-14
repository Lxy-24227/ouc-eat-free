/**
 * 
 */
const express = require('express');
const router = express.Router();

const dishController = require('../controllers/dishController');
const ratingController = require('../controllers/ratingController');
const commentController = require('../controllers/commentController');

// 盲盒选菜
router.get('/dish/random', dishController.getRandomDish);
// 榜单
router.get('/dish/ranking', dishController.getRanking);

// 评分
router.post('/rating', ratingController.submitRating);

// 评论
router.post('/comment', commentController.addComment);
router.get('/dish/:id/comments', commentController.getComments);

module.exports = router;