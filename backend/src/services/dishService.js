/**
 * 菜品服务：JSON 文件持久化
 * 最小改动：仅修复无数据库环境下菜品创建/排行榜/评论联动
 */
const { weightedRandom } = require('../utils/randomPicker');
const { nowString, readDishes, writeDishes } = require('../utils/jsonStore');

function normalizeDish(dish) {
  const normalized = {
    id: Number(dish.id),
    name: dish.name || '未命名菜品',
    canteen: dish.canteen || dish.restaurant_name || '',
    floor: dish.floor || '',
    price: dish.price == null ? null : Number(dish.price),
    ratings: Array.isArray(dish.ratings) ? dish.ratings : [],
    comments: Array.isArray(dish.comments) ? dish.comments : [],
    createTime: dish.createTime || dish.created_at || nowString()
  };

  const scoreList = normalized.ratings
    .map((item) => Number(item.score))
    .filter((score) => score >= 1 && score <= 5);
  const fallbackScores = normalized.comments
    .map((item) => Number(item.score))
    .filter((score) => score >= 1 && score <= 5);
  const scores = scoreList.length > 0 ? scoreList : fallbackScores;

  const totalVotes = scores.length;
  const averageScore = totalVotes > 0
    ? Number((scores.reduce((sum, s) => sum + s, 0) / totalVotes).toFixed(2))
    : Number(dish.averageScore || dish.avg_score || 0);

  return {
    ...normalized,
    averageScore,
    totalVotes
  };
}

function listAllDishes() {
  return readDishes().map(normalizeDish);
}

function saveAllDishes(dishes) {
  writeDishes(dishes.map(normalizeDish));
}

async function findByConditions(restaurantId, floor, minScore) {
  const dishes = listAllDishes();
  return dishes.filter((dish) => {
    if (restaurantId && dish.canteen !== restaurantId) return false;
    if (floor && dish.floor !== floor) return false;
    if (minScore && dish.averageScore < Number(minScore)) return false;
    return true;
  });
}

// 加权随机选菜
function selectWeightedRandom(dishes) {
  return weightedRandom(dishes, (dish) => (Number(dish.averageScore || 0) * 10 + 1));
}

async function getRanking(type, restaurantId, floor, startDate, endDate, page = 1, pageSize = 10) {
  let dishes = listAllDishes();

  if (restaurantId) dishes = dishes.filter((d) => d.canteen === restaurantId);
  if (floor) dishes = dishes.filter((d) => d.floor === floor);
  if (startDate) dishes = dishes.filter((d) => String(d.createTime).slice(0, 10) >= startDate);
  if (endDate) dishes = dishes.filter((d) => String(d.createTime).slice(0, 10) <= endDate);

  const sorted = [...dishes].sort((a, b) => {
    return type === 'black'
      ? a.averageScore - b.averageScore
      : b.averageScore - a.averageScore;
  });

  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safePageSize = Number(pageSize) > 0 ? Number(pageSize) : 10;
  const offset = (safePage - 1) * safePageSize;
  const list = sorted.slice(offset, offset + safePageSize);

  return {
    list: list.map((dish) => ({
      ...dish,
      avg_score: dish.averageScore,
      total_votes: dish.totalVotes,
      commentCount: dish.comments.length
    })),
    total: sorted.length,
    page: safePage,
    pageSize: safePageSize
  };
}

async function createDish(payload) {
  const dishes = listAllDishes();
  const nextId = dishes.length > 0 ? Math.max(...dishes.map((d) => Number(d.id) || 0)) + 1 : 1;

  const newDish = normalizeDish({
    id: nextId,
    name: String(payload.name || '').trim(),
    canteen: String(payload.canteen || '').trim(),
    floor: payload.floor ? String(payload.floor).trim() : '',
    price: Number(payload.price),
    ratings: [],
    comments: [],
    createTime: nowString()
  });

  dishes.push(newDish);
  saveAllDishes(dishes);
  return newDish;
}

async function findDishById(dishId) {
  const dishes = listAllDishes();
  return dishes.find((dish) => Number(dish.id) === Number(dishId)) || null;
}

async function saveDish(updatedDish) {
  const dishes = listAllDishes();
  const idx = dishes.findIndex((dish) => Number(dish.id) === Number(updatedDish.id));
  if (idx === -1) return null;
  dishes[idx] = normalizeDish(updatedDish);
  saveAllDishes(dishes);
  return dishes[idx];
}

module.exports = {
  findByConditions,
  selectWeightedRandom,
  getRanking,
  createDish,
  findDishById,
  saveDish,
  normalizeDish
};
