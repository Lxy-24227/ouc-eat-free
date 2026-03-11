import request from './request';

export function registerUser(data) {
  return request.post('/register', data);
}

export function loginUser(data) {
  return request.post('/login', data);
}
