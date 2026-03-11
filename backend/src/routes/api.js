const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const ratingController = require('../controllers/ratingController');
const commentController = require('../controllers/commentController');
const authController = require('../controllers/authController');

// 最小改动：同时兼容原有 REST 风格与前端既有 /api/createDish、/api/addComment、/api/getRank 路径
router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/createDish', dishController.createDish);
router.get('/getRank', dishController.getRanking);
router.post('/addComment', commentController.addComment);

router.get('/dish/random', dishController.getRandomDish);
router.get('/dish/ranking', dishController.getRanking);
router.get('/dish/:id', dishController.getDishById);
router.post('/dish', dishController.createDish);
router.post('/rating', ratingController.submitRating);
router.post('/comment', commentController.addComment);
router.get('/dish/:id/comments', commentController.getComments);
router.post('/dish/:id/comments', commentController.addCommentByDishId);

module.exports = router;