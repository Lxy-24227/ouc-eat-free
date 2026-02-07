# API 接口规范文档（适用于：随机菜品匹配 + 菜品黑红榜 + 菜品创建）

## 一、基础约定
- **请求前缀**：`/api/v1`
- **请求方法**：
  - `GET`：查询/获取
  - `POST`：新增/提交
  - `PUT`：更新
  - `DELETE`：删除
- **统一返回格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```
- **状态码说明**：
  - `200`：成功
  - `400`：参数错误
  - `401`：未授权
  - `404`：资源不存在
  - `500`：服务器内部错误

---

## 二、随机菜品匹配接口

### 1. 随机推荐一道菜
- **接口地址**：`GET /api/v1/random/dish`
- **功能**：随机返回一道菜品，支持按食堂筛选
- **查询参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | diningHallId | number | 否 | 食堂ID，不传则全食堂随机 |
- **成功响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 101,
    "name": "红烧肉",
    "price": 12.0,
    "diningHall": "一食堂",
    "location": "崂山校区",
    "rating": 4.5,
    "reviewCount": 120
  }
}
```

---

## 三、菜品管理接口（菜品创建/查询）

### 1. 获取菜品列表（支持筛选）
- **接口地址**：`GET /api/v1/dishes`
- **功能**：查询菜品列表，可按食堂、价格、评分筛选
- **查询参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | diningHallId | number | 否 | 食堂ID |
  | minPrice | number | 否 | 最低价格 |
  | maxPrice | number | 否 | 最高价格 |
  | minRating | number | 否 | 最低评分（0-5） |
  | page | number | 否 | 页码，默认1 |
  | size | number | 否 | 每页条数，默认10 |
- **成功响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "size": 10,
    "list": [
      {
        "id": 101,
        "name": "红烧肉",
        "price": 12.0,
        "diningHall": "一食堂",
        "rating": 4.5,
        "reviewCount": 120
      }
    ]
  }
}
```

### 2. 获取单个菜品详情
- **接口地址**：`GET /api/v1/dishes/{id}`
- **功能**：获取菜品详情及评论列表
- **路径参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | number | 是 | 菜品ID |
- **成功响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 101,
    "name": "红烧肉",
    "price": 12.0,
    "diningHall": "一食堂",
    "location": "崂山校区",
    "description": "肥而不腻，入口即化",
    "rating": 4.5,
    "reviewCount": 120,
    "reviews": [
      {
        "id": 2001,
        "userId": 1001,
        "username": "小明",
        "content": "超好吃，分量足！",
        "rating": 5,
        "createTime": "2025-10-01 12:30:00"
      }
    ]
  }
}
```

### 3. 创建新菜品
- **接口地址**：`POST /api/v1/dishes`
- **功能**：用户创建新菜品，丰富黑红榜
- **请求体**：
```json
{
  "name": "宫保鸡丁",
  "price": 10.0,
  "diningHallId": 1,
  "description": "麻辣鲜香，下饭神器"
}
```
- **成功响应示例**：
```json
{
  "code": 200,
  "message": "菜品创建成功",
  "data": {
    "id": 102,
    "name": "宫保鸡丁",
    "price": 10.0,
    "diningHall": "一食堂",
    "createTime": "2025-10-02 18:20:00"
  }
}
```

---

## 四、菜品黑红榜接口（评分/评论）

### 1. 获取黑红榜
- **接口地址**：`GET /api/v1/rank`
- **功能**：获取菜品黑红榜（高分红榜/低分黑榜）
- **查询参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | type | string | 是 | `hot`（红榜）/ `black`（黑榜） |
  | limit | number | 否 | 返回条数，默认10 |
- **成功响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 101,
      "name": "红烧肉",
      "price": 12.0,
      "diningHall": "一食堂",
      "rating": 4.8,
      "reviewCount": 200
    }
  ]
}
```

### 2. 提交评分与评论
- **接口地址**：`POST /api/v1/reviews`
- **功能**：用户对菜品进行评分和评论
- **请求体**：
```json
{
  "dishId": 101,
  "userId": 1001,
  "content": "味道不错，就是有点咸",
  "rating": 4
}
```
- **成功响应示例**：
```json
{
  "code": 200,
  "message": "评论提交成功",
  "data": {
    "reviewId": 2002,
    "dishId": 101,
    "rating": 4,
    "createTime": "2025-10-03 09:15:00"
  }
}
```

### 3. 获取菜品评论列表
- **接口地址**：`GET /api/v1/dishes/{id}/reviews`
- **功能**：获取某道菜的所有评论
- **路径参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | number | 是 | 菜品ID |
- **查询参数**：
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | page | number | 否 | 页码，默认1 |
  | size | number | 否 | 每页条数，默认10 |
- **成功响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "size": 10,
    "list": [
      {
        "id": 2001,
        "username": "小明",
        "content": "超好吃，分量足！",
        "rating": 5,
        "createTime": "2025-10-01 12:30:00"
      }
    ]
  }
}
```

---

## 五、错误响应示例
```json
{
  "code": 400,
  "message": "参数错误：price 必须大于0",
  "data": null
}
```

```json
{
  "code": 404,
  "message": "菜品不存在",
  "data": null
}
```

---

你可以直接把以上内容全选复制，粘贴到 `docs/API.md` 里，小组前后端开发就可以完全按这个规范独立开发了。
需要我再帮你补一份**前端 Mock 数据示例**，让前端同学在后端接口没写完时也能先跑起来页面吗？
