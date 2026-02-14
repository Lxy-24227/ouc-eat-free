
import axios from 'axios';

// 创建菜品的接口函数
export const createDish = (data) => {
  // 注意：这里的 URL 需要根据你队友后端定义的路由来修改
  return axios.post('/api/dishes', data);
};