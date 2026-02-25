/**
 * 评分接口：与后端 POST /api/v1/rating 对应，body: { dishId, score, userId? }
 */
import request from './request';

export function submitRating(dishId, score, userId) {
  return request.post('/rating', { dishId, score, userId });
}
