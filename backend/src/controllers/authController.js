const userService = require('../services/userService');

function getAuthPayload(req) {
  return {
    username: String(req.body?.username || '').trim(),
    password: String(req.body?.password || '').trim()
  };
}

exports.register = async (req, res) => {
  const { username, password } = getAuthPayload(req);

  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
  }

  try {
    // 最小改动：仅补充注册接口，沿用统一响应格式
    const user = await userService.register(username, password);
    res.json({ code: 200, message: '注册成功', data: user });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ code: status, message: error.message || '注册失败' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = getAuthPayload(req);

  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
  }

  try {
    // 最小改动：仅补充登录接口，登录成功直接返回用户名
    const user = await userService.login(username, password);
    res.json({ code: 200, message: '登录成功', data: user });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ code: status, message: error.message || '登录失败' });
  }
};
