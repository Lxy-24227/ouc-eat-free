/** API v1 路由：与前端 api/request baseURL /api/v1 对应 */
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

module.exports = router;