/**
 * JSON 文件存储工具
 * 最小改动：仅替换数据库依赖为本地 JSON 持久化
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data');
const DISHES_FILE = path.join(DATA_DIR, 'dishes.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const DEFAULT_DISHES = [
  {
    id: 101,
    name: '红烧排骨',
    canteen: '一食堂',
    price: 12,
    ratings: [{ username: 'system', score: 5, createTime: '2026-03-01 12:00:00' }],
    comments: [{ id: 1, username: 'system', score: 5, content: '经典下饭，值得一试', createTime: '2026-03-01 12:00:00' }],
    averageScore: 5,
    totalVotes: 1,
    createTime: '2026-03-01 12:00:00'
  },
  {
    id: 102,
    name: '香辣鸡腿饭',
    canteen: '二食堂',
    price: 13,
    ratings: [{ username: 'system', score: 4, createTime: '2026-03-02 12:00:00' }],
    comments: [{ id: 1, username: 'system', score: 4, content: '微辣开胃，分量足', createTime: '2026-03-02 12:00:00' }],
    averageScore: 4,
    totalVotes: 1,
    createTime: '2026-03-02 12:00:00'
  },
  {
    id: 103,
    name: '酸菜鱼',
    canteen: '三食堂',
    price: 16,
    ratings: [{ username: 'system', score: 3, createTime: '2026-03-03 12:00:00' }],
    comments: [{ id: 1, username: 'system', score: 3, content: '口味稳定，中规中矩', createTime: '2026-03-03 12:00:00' }],
    averageScore: 3,
    totalVotes: 1,
    createTime: '2026-03-03 12:00:00'
  }
];

const DEFAULT_USERS = [];

function nowString() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function ensureFile(filePath, defaultValue) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
  }
}

function readJson(filePath, defaultValue) {
  ensureFile(filePath, defaultValue);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw || '[]');
    return Array.isArray(data) ? data : defaultValue;
  } catch (error) {
    console.warn(`读取 ${path.basename(filePath)} 失败，回退默认值：`, error.message);
    return defaultValue;
  }
}

function writeJson(filePath, value) {
  ensureFile(filePath, []);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
}

function readDishes() {
  return readJson(DISHES_FILE, DEFAULT_DISHES);
}

function writeDishes(dishes) {
  writeJson(DISHES_FILE, dishes);
}

function readUsers() {
  return readJson(USERS_FILE, DEFAULT_USERS);
}

function writeUsers(users) {
  writeJson(USERS_FILE, users);
}

module.exports = {
  nowString,
  readDishes,
  writeDishes,
  readUsers,
  writeUsers
};
