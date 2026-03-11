/**
 * 前端请求封装：统一 baseURL，与后端 /api 路由对应
 * 最小改动：仅修复路径前缀不一致导致的 404
 */
import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

request.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || '请求失败';
    return Promise.reject(new Error(msg));
  }
);

export default request;
