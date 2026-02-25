/**
 * 评论接口：与后端 POST /api/v1/comment、GET /api/v1/dish/:id/comments 对应
 */
import request from './request';

export function addComment(dishId, content, userId) {
  return request.post('/comment', { dishId, content, userId });
}

export function getComments(dishId, page = 1, pageSize = 10) {
  return request.get(`/dish/${dishId}/comments`, { params: { page, pageSize } });
}
