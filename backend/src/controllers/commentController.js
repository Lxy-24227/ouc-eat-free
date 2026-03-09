/**
 * 评论控制器：参数校验（≤20字）、存储、返回
 */
const { body, param, validationResult } = require('express-validator');
const commentService = require('../services/commentService');

/** 评论内容校验：非空、≤20字 */
const commentValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('评论内容不能为空')
    .isLength({ max: 20 }).withMessage('评论需控制在20字以内')
];

/** 菜品ID校验 */
const dishIdParam = param('id').isInt({ min: 1 }).withMessage('无效的菜品ID');

/** 统一校验结果处理 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array()[0]?.msg || '参数错误';
    return res.status(400).json({ code: 400, message: msg });
  }
  next();
}

/** POST /comment：body 含 dishId、content、userId */
exports.addComment = [
  body('dishId').isInt({ min: 1 }).withMessage('dishId 必填且为正整数'),
  ...commentValidation,
  handleValidation,
  async (req, res) => {
    const { dishId, content, userId } = req.body;
    try {
      const saved = await commentService.addComment(dishId, content.trim(), userId);
      res.json({ code: 200, message: '提交成功', data: saved });
    } catch (error) {
      console.error(error);
      res.status(500).json({ code: 500, message: '评论失败：' + error.message });
    }
  }
];

/** POST /dish/:id/comments：REST 风格，body 仅含 content */
exports.addCommentByDishId = [
  dishIdParam,
  ...commentValidation,
  handleValidation,
  async (req, res) => {
    const dishId = parseInt(req.params.id, 10);
    const { content } = req.body;
    const userId = req.body.userId || 'anonymous';
    try {
      const saved = await commentService.addComment(dishId, content.trim(), userId);
      res.json({ code: 200, message: '提交成功', data: saved });
    } catch (error) {
      console.error(error);
      res.status(500).json({ code: 500, message: '评论失败：' + error.message });
    }
  }
];

/** GET /dish/:id/comments：返回 [{ content, createTime, userId }] */
exports.getComments = [
  dishIdParam,
  handleValidation,
  async (req, res) => {
    const dishId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    try {
      const result = await commentService.getCommentsByDish(dishId, page, pageSize);
      const list = result.list.map(item => ({
        content: item.content,
        createTime: item.created_at ? String(item.created_at).slice(0, 19).replace('T', ' ') : (item.createTime || ''),
        userId: item.user_id ?? item.userId
      }));
      res.json({
        code: 200,
        message: 'success',
        data: { list, total: result.total, page: result.page, pageSize: result.pageSize }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ code: 500, message: '查询失败：' + error.message });
    }
  }
];
