import axios from 'axios';

const request = axios.create({
  // 最小改动：统一走 /api，兼容后端新增的 /api/createDish、/api/addComment、/api/getRank
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
