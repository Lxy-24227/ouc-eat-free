/**
 * 榜单接口：与后端 GET /api/v1/dish/ranking 对应
 */
import request from './request';

export function getRanking(params = {}) {
  return request.get('/dish/ranking', { params });
}
