/**
 * 随机推荐接口：与后端 GET /api/v1/dish/random 对应
 */
import request from './request';

export function getRandomDish(params = {}) {
  return request.get('/dish/random', { params });
}
