/**
 * 评论服务：支持 MySQL 与内存存储（USE_MEMORY_STORE=1 时使用内存）
 */
const { filterSensitive } = require('../utils/sensitiveWords');
const memoryStore = require('../stores/commentMemoryStore');

const useMemory = process.env.USE_MEMORY_STORE === '1';

async function addComment(dishId, content, userId = 'anonymous') {
    const filtered = filterSensitive(content);
    if (useMemory) {
        const item = memoryStore.addComment(dishId, filtered, userId);
        return { id: item.id, dishId, userId, content: filtered, createTime: item.createTime };
    }
    try {
        const pool = require('../models/db');
        const [rows] = await pool.query(
            'INSERT INTO comments (dish_id, user_id, content) VALUES (?, ?, ?)',
            [dishId, userId, filtered]
        );
        const id = rows?.insertId ?? null;
        return { id, dishId, userId, content: filtered };
    } catch (err) {
        console.warn('MySQL 不可用，使用内存存储:', err.message);
        const item = memoryStore.addComment(dishId, filtered, userId);
        return { id: item.id, dishId, userId, content: filtered, createTime: item.createTime };
    }
}

async function getCommentsByDish(dishId, page = 1, pageSize = 10) {
    if (useMemory) {
        return memoryStore.getCommentsByDish(dishId, page, pageSize);
    }
    try {
        const pool = require('../models/db');
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
    } catch (err) {
        console.warn('MySQL 不可用，使用内存存储:', err.message);
        return memoryStore.getCommentsByDish(dishId, page, pageSize);
    }
}

module.exports = { addComment, getCommentsByDish };