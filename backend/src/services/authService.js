/**
 * 用户认证服务：users.json 持久化（备用，当前由 userService 提供）
 */
const { readJson, writeJson } = require('../utils/jsonStore');

const USERS_FILE = 'users.json';

function sanitizeUser(user) {
  return { username: user.username };
}

async function register(username, password) {
  const users = await readJson(USERS_FILE, []);
  const exists = users.some((user) => user.username === username);
  if (exists) return null;

  const nextUsers = [...users, { username, password }];
  await writeJson(USERS_FILE, nextUsers);
  return sanitizeUser({ username, password });
}

async function login(username, password) {
  const users = await readJson(USERS_FILE, []);
  const matched = users.find((user) => user.username === username && user.password === password);
  if (!matched) return null;
  return sanitizeUser(matched);
}

module.exports = {
  register,
  login
};
