// 核心修改：写死8080，且打印日志确认
const PORT = 8080;
console.log("=== 强制加载配置：端口固定为", PORT, "===");

const path = require('path');
const { existsSync } = require('fs');
const express = require('express');
const cors = require('cors');
// 注释掉 dotenv，彻底避免环境变量干扰
// require('dotenv').config();

const apiRouter = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

// 服务器部署：提供前端静态文件（需先执行 frontend npm run build）
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ code: 500, message: 'Internal Server Error' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;