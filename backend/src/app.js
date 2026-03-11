/** Express 入口：挂载 /api 与 /api/v1，CORS + JSON 解析 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRouter = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());

// 最小改动：仅修复前后端路径不一致导致的 404，兼容 /api 与 /api/v1
app.use('/api', apiRouter);
app.use('/api/v1', apiRouter);

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ code: 500, message: 'Internal Server Error' });
});

// 最小改动：仅修复本地代理默认 8080 的端口不一致问题
const PORT = process.env.PORT || 8080;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
