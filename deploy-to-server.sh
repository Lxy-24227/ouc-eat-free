#!/bin/bash
# 在服务器上同步 ouc-eat-free 项目代码
# 使用方法：ssh root@100.68.159.35 'bash -s' < deploy-to-server.sh
# 或者先 ssh root@100.68.159.35 进入服务器，再执行下方命令

set -e

PROJECT_DIR="${PROJECT_DIR:-/root/ouc-eat-free}"
REPO_URL="https://github.com/Lxy-24227/ouc-eat-free.git"

echo "=== 同步 ouc-eat-free 到服务器 ==="

if [ -d "$PROJECT_DIR/.git" ]; then
  echo "项目已存在，拉取最新代码..."
  cd "$PROJECT_DIR"
  git fetch origin
  git reset --hard origin/main
  git pull origin main
else
  echo "克隆项目..."
  mkdir -p "$(dirname "$PROJECT_DIR")"
  git clone "$REPO_URL" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

echo ""
echo "=== 安装依赖 ==="
cd "$PROJECT_DIR/backend" && npm install
cd "$PROJECT_DIR/frontend" && npm install && npm run build

echo ""
echo "=== 同步完成 ==="
echo "项目路径: $PROJECT_DIR"
echo ""
echo "服务器部署（二选一）："
echo "  方式1 - 仅运行后端（推荐）：后端会自动提供前端静态文件"
echo "    cd $PROJECT_DIR/backend && node src/app.js"
echo "    访问 http://服务器IP:8080"
echo ""
echo "  方式2 - 使用 Nginx：参考 nginx.conf.example 配置"
