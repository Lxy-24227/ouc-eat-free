/**
 * 
 */
const pool = require('../models/db');
const { weightedRandom } = require('../utils/randomPicker');

// 根据条件查询菜品
async function findByConditions(restaurantId, floor, minScore) {
    let sql = `
        SELECT d.*, r.name as restaurant_name, r.floor 
        FROM dishes d 
        JOIN restaurants r ON d.restaurant_id = r.id 
        WHERE 1=1
    `;
    const params = [];
    if (restaurantId) {
        sql += ' AND d.restaurant_id = ?';
        params.push(restaurantId);
    }
    if (floor) {
        sql += ' AND r.floor = ?';
        params.push(floor);
    }
    if (minScore) {
        sql += ' AND d.avg_score >= ?';
        params.push(minScore);
    }
    const [rows] = await pool.query(sql, params);
    return rows;
}

// 加权随机选菜
function selectWeightedRandom(dishes) {
    return weightedRandom(dishes, dish => (dish.avg_score * 10 + 1));
}

// 获取榜单（分页）
async function getRanking(type, restaurantId, floor, startDate, endDate, page, pageSize) {
    let sql = `
        SELECT d.*, r.name as restaurant_name, r.floor 
        FROM dishes d 
        JOIN restaurants r ON d.restaurant_id = r.id 
        WHERE 1=1
    `;
    const params = [];
    if (restaurantId) {
        sql += ' AND d.restaurant_id = ?';
        params.push(restaurantId);
    }
    if (floor) {
        sql += ' AND r.floor = ?';
        params.push(floor);
    }
    if (startDate) {
        sql += ' AND DATE(d.created_at) >= ?';
        params.push(startDate);
    }
    if (endDate) {
        sql += ' AND DATE(d.created_at) <= ?';
        params.push(endDate);
    }
    
    // 排序
    sql += type === 'red' ? ' ORDER BY d.avg_score DESC' : ' ORDER BY d.avg_score ASC';
    
    // 分页
    const offset = (page - 1) * pageSize;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);
    
    const [rows] = await pool.query(sql, params);
    
    // 查询总数（去掉 LIMIT 条件）
    let countSql = sql.split('ORDER BY')[0].replace(/LIMIT.*/, '');
    countSql = `SELECT COUNT(*) as total FROM (${countSql}) as countTable`;
    const [countResult] = await pool.query(countSql, params.slice(0, -2));
    
    return {
        list: rows,
        total: countResult[0].total,
        page,
        pageSize
    };
}

module.exports = {
    findByConditions,
    selectWeightedRandom,
    getRanking
};