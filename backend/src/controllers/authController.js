/**
 * 认证控制器：注册/登录
 * 最小改动：仅补齐前端登录注册真实接口
 */
const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }

    const user = await authService.register(String(username).trim(), String(password));
    if (!user) {
      return res.status(400).json({ code: 400, message: '用户名已存在' });
    }
    res.json({ code: 200, message: '注册成功', data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '注册失败：' + error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }

    const user = await authService.login(String(username).trim(), String(password));
    if (!user) {
      return res.status(400).json({ code: 400, message: '用户名/密码错误' });
    }
    res.json({ code: 200, message: '登录成功', data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '登录失败：' + error.message });
  }
};
