import request from './request';

export function createDish(data) {
  return request.post('/createDish', data);
}

export function getDishDetail(id) {
  return request.get(`/dish/${id}`);
}

export function updateDish(id, data) {
  return request.put(`/dish/${id}`, data);
}