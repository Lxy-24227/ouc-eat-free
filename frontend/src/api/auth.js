import request from './request';

export function register(username, password) {
  return request.post('/register', { username, password });
}

export function login(username, password) {
  return request.post('/login', { username, password });
}
