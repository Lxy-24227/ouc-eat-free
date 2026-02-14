/**
 * 
 */
const pool = require('../models/db');

async function submitRating(dishId, score, userId = 'anonymous') {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        // 插入评分
        await connection.query(
            'INSERT INTO ratings (dish_id, user_id, score) VALUES (?, ?, ?)',
            [dishId, userId, score]
        );
        
        // 更新菜品平均分
		const [avgResult] = await connection.query(
		    'SELECT AVG(score) as avgScore FROM ratings WHERE dish_id = ?',
		    [dishId]
		);

		// 确保 avgScore 是数字，如果是 null 或 undefined 则默认为 0
		const avgScore = avgResult[0]?.avgScore;
		const newAvg = avgScore !== null && !isNaN(avgScore) ? Number(avgScore) : 0;

		// 保留两位小数（使用 Math.round 避免 toFixed 的类型问题）
		const roundedAvg = Math.round(newAvg * 100) / 100;

		await connection.query(
		    'UPDATE dishes SET avg_score = ? WHERE id = ?',
		    [roundedAvg, dishId]
		);
        
        await connection.commit();
        return { dishId, newAvg };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { submitRating };