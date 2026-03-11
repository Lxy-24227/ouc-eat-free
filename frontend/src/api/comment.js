import request from './request';

export function addComment(dishId, content, score, userId) {
  return request.post('/addComment', { dishId, content, score, userId });
}

export function getComments(dishId, page = 1, pageSize = 10) {
  return request.get(`/dish/${dishId}/comments`, { params: { page, pageSize } });
}
