import request from './request';

export function getRanking(params = {}) {
  return request.get('/getRank', { params });
}
