/**
 * 评论接口：与后端 /api 路由对应
 * - POST /addComment：body { dishId, score, content, username }
 * - GET /dish/:id/comments：query { page, pageSize }
 */
import request from './request';

export function addComment(dishId, score, content, username) {
  return request.post('/addComment', { dishId, score, content, username });
}

export function getComments(dishId, page = 1, pageSize = 10) {
  return request.get(`/dish/${dishId}/comments`, { params: { page, pageSize } });
}
