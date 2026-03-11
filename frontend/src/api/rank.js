/**
 * 榜单接口：与后端 GET /api/getRank 对应
 */
import request from './request';

export function getRanking(params = {}) {
  return request.get('/getRank', { params });
}
