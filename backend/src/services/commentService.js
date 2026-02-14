/**
 * 
 */
const pool = require('../models/db');
const { filterSensitive } = require('../utils/sensitiveWords');

async function addComment(dishId, content, userId = 'anonymous') {
    const filtered = filterSensitive(content);
    const [result] = await pool.query(
        'INSERT INTO comments (dish_id, user_id, content) VALUES (?, ?, ?)',
        [dishId, userId, filtered]
    );
    return { id: result.insertId, dishId, userId, content: filtered };
}

async function getCommentsByDish(dishId, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
        'SELECT id, user_id, content, created_at FROM comments WHERE dish_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [dishId, pageSize, offset]
    );
    const [totalResult] = await pool.query(
        'SELECT COUNT(*) as total FROM comments WHERE dish_id = ?',
        [dishId]
    );
    return {
        list: rows,
        total: totalResult[0].total,
        page,
        pageSize
    };
}

module.exports = { addComment, getCommentsByDish };