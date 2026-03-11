/**
 * 评论服务：基于 dishes.json 的评论持久化
 */
const { filterSensitive } = require('../utils/sensitiveWords');
const { getNextId, formatDate } = require('../utils/jsonStore');
const { loadStoredDishes, saveStoredDishes } = require('./dishService');

async function addComment(dishId, content, userId = 'anonymous', score = 5) {
  const dishes = await loadStoredDishes();
  const target = dishes.find(item => String(item.id) === String(dishId));

  if (!target) {
    const error = new Error('菜品不存在');
    error.status = 404;
    throw error;
  }

  if (!Array.isArray(target.comments)) {
    target.comments = [];
  }

  const filtered = filterSensitive(content);
  const saved = {
    id: getNextId(target.comments),
    userId: userId || 'anonymous',
    username: userId || 'anonymous',
    score: Number(score),
    content: filtered,
    createTime: formatDate()
  };

  target.comments.push(saved);
  await saveStoredDishes(dishes);
  return { ...saved, dishId: Number(dishId) };
}

async function getCommentsByDish(dishId, page = 1, pageSize = 10) {
  const dishes = await loadStoredDishes();
  const target = dishes.find(item => String(item.id) === String(dishId));
  const comments = Array.isArray(target?.comments) ? [...target.comments] : [];
  comments.sort((a, b) => String(b.createTime).localeCompare(String(a.createTime)));

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
