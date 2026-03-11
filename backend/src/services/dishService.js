/**
 * 最小改动：仅修复无数据库场景，改为读取 backend/data/dishes.json。
 */
const { weightedRandom } = require('../utils/randomPicker');
const { readJson, writeJson, getNextId, formatDate } = require('../utils/jsonStore');

const DISHES_FILE = 'dishes.json';

async function loadStoredDishes() {
  const dishes = await readJson(DISHES_FILE, []);
  return Array.isArray(dishes) ? dishes : [];
}

async function saveStoredDishes(dishes) {
  await writeJson(DISHES_FILE, dishes);
}

function normalizeDish(rawDish = {}) {
  const comments = Array.isArray(rawDish.comments) ? rawDish.comments : [];
  const ratings = Array.isArray(rawDish.ratings) ? rawDish.ratings : [];
  const scores = [
    ...ratings.map(item => Number(item.score)).filter(score => score >= 1 && score <= 5),
    ...comments.map(item => Number(item.score)).filter(score => score >= 1 && score <= 5)
  ];
  const averageScore = scores.length
    ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100
    : 0;

  return {
    id: Number(rawDish.id),
    name: rawDish.name || '未命名菜品',
    canteen: rawDish.canteen || '',
    price: rawDish.price === '' || rawDish.price == null ? null : Number(rawDish.price),
    createdAt: rawDish.createdAt || formatDate(),
    comments,
    ratings,
    averageScore,
    avg_score: averageScore,
    totalVotes: scores.length,
    total_votes: scores.length,
    commentCount: comments.length
  };
}

async function findByConditions(restaurantId, floor, minScore) {
  const dishes = (await loadStoredDishes()).map(normalizeDish);
  return dishes.filter(dish => {
    const matchRestaurant = restaurantId ? String(dish.canteen) === String(restaurantId) || String(dish.id) === String(restaurantId) : true;
    const matchFloor = floor ? String(dish.floor || '') === String(floor) : true;
    const matchScore = minScore ? dish.averageScore >= Number(minScore) : true;
    return matchRestaurant && matchFloor && matchScore;
  });
}

function selectWeightedRandom(dishes) {
  return weightedRandom(dishes, dish => (Number(dish.avg_score || dish.averageScore || 0) * 10 + 1));
}

async function getRanking(type = 'red', restaurantId, floor, startDate, endDate, page = 1, pageSize = 10) {
  let dishes = (await loadStoredDishes()).map(normalizeDish);

  dishes = dishes.filter(dish => {
    const matchRestaurant = restaurantId ? String(dish.canteen) === String(restaurantId) || String(dish.id) === String(restaurantId) : true;
    const matchFloor = floor ? String(dish.floor || '') === String(floor) : true;
    const matchStart = startDate ? new Date(dish.createdAt).getTime() >= new Date(startDate).getTime() : true;
    const matchEnd = endDate ? new Date(dish.createdAt).getTime() <= new Date(endDate).getTime() : true;
    return matchRestaurant && matchFloor && matchStart && matchEnd;
  });

  dishes = dishes.filter(dish => {
    if (type === 'black') {
      return dish.totalVotes > 0 && dish.averageScore < 3;
    }
    return dish.totalVotes === 0 || dish.averageScore >= 3;
  });

  dishes.sort((a, b) => {
    if (type === 'black') {
      return a.averageScore - b.averageScore || a.commentCount - b.commentCount;
    }
    return b.averageScore - a.averageScore || b.commentCount - a.commentCount;
  });

  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safePageSize = Number(pageSize) > 0 ? Number(pageSize) : 10;
  const offset = (safePage - 1) * safePageSize;

  return {
    list: dishes.slice(offset, offset + safePageSize),
    total: dishes.length,
    page: safePage,
    pageSize: safePageSize
  };
}

async function getDishById(id) {
  const dishes = await loadStoredDishes();
  const target = dishes.find(item => String(item.id) === String(id));
  return target ? normalizeDish(target) : null;
}

async function createDish(payload) {
  const dishes = await loadStoredDishes();
  const nextDish = {
    id: getNextId(dishes),
    name: String(payload.name || '').trim(),
    canteen: String(payload.canteen || '').trim(),
    price: payload.price === '' || payload.price == null ? null : Number(payload.price),
    createdAt: formatDate(),
    comments: [],
    ratings: []
  };
  dishes.push(nextDish);
  await saveStoredDishes(dishes);
  return normalizeDish(nextDish);
}

module.exports = {
  loadStoredDishes,
  saveStoredDishes,
  normalizeDish,
  findByConditions,
  selectWeightedRandom,
  getRanking,
  getDishById,
  createDish
};
