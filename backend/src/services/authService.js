/**
 * 用户认证服务：users.json 持久化
 * 最小改动：仅新增注册/登录能力，不引入数据库
 */
const { readUsers, writeUsers } = require('../utils/jsonStore');

function sanitizeUser(user) {
  return { username: user.username };
}

async function register(username, password) {
  const users = readUsers();
  const exists = users.some((user) => user.username === username);
  if (exists) return null;

  const nextUsers = [...users, { username, password }];
  writeUsers(nextUsers);
  return sanitizeUser({ username, password });
}

async function login(username, password) {
  const users = readUsers();
  const matched = users.find((user) => user.username === username && user.password === password);
  if (!matched) return null;
  return sanitizeUser(matched);
}

module.exports = {
  register,
  login
};
