/**
 * 菜品相关接口
 * 最小改动：仅对齐后端已补齐的创建接口 /api/createDish
 */
import request from './request';

export function createDish(data) {
  return request.post('/createDish', data);
}