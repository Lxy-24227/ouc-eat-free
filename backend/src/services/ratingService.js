/**
 * 评分服务：基于 dishes.json 更新评分
 * 最小改动：仅修复无数据库环境评分不可用
 */
const { nowString } = require('../utils/jsonStore');
const dishService = require('./dishService');

async function submitRating(dishId, score, userId = 'anonymous') {
  const dish = await dishService.findDishById(dishId);
  if (!dish) {
    throw new Error('菜品不存在');
  }

  const next = {
    ...dish,
    ratings: [
      ...(Array.isArray(dish.ratings) ? dish.ratings : []),
      {
        username: userId || 'anonymous',
        score: Number(score),
        createTime: nowString()
      }
    ]
  };

  const saved = await dishService.saveDish(next);
  return {
    dishId: Number(dishId),
    newAvg: saved.averageScore,
    totalVotes: saved.totalVotes
  };
}

module.exports = { submitRating };