/**
 * 
 */
const ratingService = require('../services/ratingService');

exports.submitRating = async (req, res) => {
    const { dishId, score, userId } = req.body;
    if (!dishId || !score || score < 1 || score > 5) {
        return res.status(400).json({ code: 400, message: '参数错误：dishId和score(1-5)为必填' });
    }
    try {
        const result = await ratingService.submitRating(dishId, score, userId);
        res.json({ code: 200, message: '评分成功', data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: '评分失败：' + error.message });
    }
};