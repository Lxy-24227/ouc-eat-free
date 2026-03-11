/**
 * 评分服务：基于 dishes.json 的评分持久化
 */
const { getNextId, formatDate } = require('../utils/jsonStore');
const { loadStoredDishes, saveStoredDishes, normalizeDish } = require('./dishService');

async function submitRating(dishId, score, userId = 'anonymous') {
  const dishes = await loadStoredDishes();
  const target = dishes.find(item => String(item.id) === String(dishId));

  if (!target) {
    const error = new Error('菜品不存在');
    error.status = 404;
    throw error;
  }

  if (!Array.isArray(target.ratings)) {
    target.ratings = [];
  }

  target.ratings.push({
    id: getNextId(target.ratings),
    userId: userId || 'anonymous',
    score: Number(score),
    createTime: formatDate()
  });

  await saveStoredDishes(dishes);
  const normalized = normalizeDish(target);

  return {
    dishId: normalized.id,
    averageScore: normalized.averageScore,
    totalVotes: normalized.totalVotes
  };
}

module.exports = { submitRating };
