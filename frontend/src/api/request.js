/**
 * 前端请求封装：统一 baseURL，与后端 /api/v1 路由对应
 * 开发环境通过 vite proxy 将 /api 转发到后端，生产需配置同源或 CORS
 */
import axios from 'axios';

const request = axios.create({
  baseURL: '/api/v1',
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
