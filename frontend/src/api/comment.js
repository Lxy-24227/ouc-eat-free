/**
 * 评论接口：与后端 /api/v1 路由对应
 * - POST /comment：body { dishId, content, userId? }
 * - GET /dish/:id/comments：query { page, pageSize }
 */
import request from './request';

export function addComment(dishId, content, userId) {
  return request.post('/comment', { dishId, content, userId });
}

export function getComments(dishId, page = 1, pageSize = 10) {
  return request.get(`/dish/${dishId}/comments`, { params: { page, pageSize } });
}
