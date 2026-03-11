/**
 * 评论内存存储（当 USE_MEMORY_STORE=1 或数据库不可用时使用）
 * 结构：{ [dishId]: [{ id, userId, content, createTime }] }
 */
const store = new Map();

let idCounter = 1;

function addComment(dishId, content, userId = 'anonymous') {
  const id = idCounter++;
  const createTime = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' });
  const item = { id, dishId, userId, content, createTime };
  if (!store.has(String(dishId))) {
    store.set(String(dishId), []);
  }
  store.get(String(dishId)).unshift(item);
  return item;
}

function getCommentsByDish(dishId, page = 1, pageSize = 10) {
  const list = store.get(String(dishId)) || [];
  const offset = (page - 1) * pageSize;
  const pageList = list.slice(offset, offset + pageSize);
  return {
    list: pageList,
    total: list.length,
    page,
    pageSize
  };
}

module.exports = { addComment, getCommentsByDish };
