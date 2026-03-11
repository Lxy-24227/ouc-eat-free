/**
 * 最小改动：仅补充注册/登录，基于 users.json 存储用户名和密码。
 */
const { readJson, writeJson } = require('../utils/jsonStore');

const USERS_FILE = 'users.json';

async function register(username, password) {
  const safeUsername = String(username || '').trim();
  const safePassword = String(password || '').trim();
  const users = await readJson(USERS_FILE, []);

  if (users.some(user => user.username === safeUsername)) {
    const error = new Error('用户名已存在');
    error.status = 400;
    throw error;
  }

  const newUser = {
    username: safeUsername,
    password: safePassword
  };

  users.push(newUser);
  await writeJson(USERS_FILE, users);

  return { username: newUser.username };
}

async function login(username, password) {
  const safeUsername = String(username || '').trim();
  const safePassword = String(password || '').trim();
  const users = await readJson(USERS_FILE, []);
  const target = users.find(user => user.username === safeUsername && user.password === safePassword);

  if (!target) {
    const error = new Error('用户名/密码错误');
    error.status = 401;
    throw error;
  }

  return { username: target.username };
}

module.exports = {
  register,
  login
};
