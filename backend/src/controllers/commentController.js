/**
 * 
 */
const commentService = require('../services/commentService');

exports.addComment = async (req, res) => {
    const { dishId, content, userId } = req.body;
    if (!dishId || !content) {
        return res.status(400).json({ code: 400, message: 'dishId和content为必填' });
    }
    try {
        const saved = await commentService.addComment(dishId, content, userId);
        res.json({ code: 200, message: '评论成功', data: saved });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: '评论失败：' + error.message });
    }
};

exports.getComments = async (req, res) => {
    const dishId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    try {
        const result = await commentService.getCommentsByDish(dishId, page, pageSize);
        res.json({ code: 200, message: 'success', data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: '查询失败：' + error.message });
    }
};