/**
 * 
 */
const dishService = require('../services/dishService');

exports.getRandomDish = async (req, res) => {
    try {
        const { restaurantId, floor, minScore } = req.query;
        const dishes = await dishService.findByConditions(restaurantId, floor, minScore);
        if (dishes.length === 0) {
            return res.status(404).json({ code: 404, message: '没有符合条件的菜品' });
        }
        const selected = dishService.selectWeightedRandom(dishes);
        res.json({ code: 200, message: 'success', data: selected });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
};

exports.getRanking = async (req, res) => {
    try {
        const { type = 'red', restaurantId, floor, startDate, endDate, page = 1, pageSize = 10 } = req.query;
        const result = await dishService.getRanking(type, restaurantId, floor, startDate, endDate, parseInt(page), parseInt(pageSize));
        res.json({ code: 200, message: 'success', data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
};

// 最小改动：仅修复创建菜品接口缺失导致前端 404
exports.createDish = async (req, res) => {
    try {
        const { name, canteen, price, floor } = req.body || {};
        if (!name || !canteen || price == null || Number(price) <= 0) {
            return res.status(400).json({ code: 400, message: '参数错误：name/canteen/price 必填且 price > 0' });
        }

        const saved = await dishService.createDish({ name, canteen, price, floor });
        res.json({ code: 200, message: '菜品创建成功', data: saved });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: '创建失败：' + error.message });
    }
};