/**
 * 菜品相关接口。当前后端暂无创建菜品路由，CreateDish 页使用本地模拟提交；
 * 若后端新增 POST /api/v1/dish 等，可在此扩展并接入。
 */
import request from './request';

export function createDish(data) {
  return request.post('/dish', data);
}