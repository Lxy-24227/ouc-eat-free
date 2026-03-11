/**
 * 评论服务：基于 dishes.json 的评论与评分写入
 * 最小改动：仅修复评论数据不持久化/刷新后丢失
 */
const { filterSensitive } = require('../utils/sensitiveWords');
const { nowString } = require('../utils/jsonStore');
const dishService = require('./dishService');

async function addComment(dishId, content, userId = 'anonymous', score = 5) {
  const dish = await dishService.findDishById(dishId);
  if (!dish) {
    throw new Error('菜品不存在');
  }

  const filtered = filterSensitive(content);
  const comments = Array.isArray(dish.comments) ? dish.comments : [];
  const nextCommentId = comments.length > 0 ? Math.max(...comments.map((c) => Number(c.id) || 0)) + 1 : 1;
  const createTime = nowString();

  const comment = {
    id: nextCommentId,
    username: userId || 'anonymous',
    score: Number(score),
    content: filtered,
    createTime
  };

  const nextDish = {
    ...dish,
    comments: [comment, ...comments],
    ratings: [
      ...(Array.isArray(dish.ratings) ? dish.ratings : []),
      { username: userId || 'anonymous', score: Number(score), createTime }
    ]
  };

  await dishService.saveDish(nextDish);
  return { ...comment, dishId: Number(dishId) };
}

async function getCommentsByDish(dishId, page = 1, pageSize = 10) {
  const dish = await dishService.findDishById(dishId);
  if (!dish) {
    return { list: [], total: 0, page, pageSize };
  }

  const comments = Array.isArray(dish.comments) ? dish.comments : [];
  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safePageSize = Number(pageSize) > 0 ? Number(pageSize) : 10;
  const offset = (safePage - 1) * safePageSize;

  return {
    list: comments.slice(offset, offset + safePageSize),
    total: comments.length,
    page: safePage,
    pageSize: safePageSize
  };
}

module.exports = { addComment, getCommentsByDish };