import { createRouter, createWebHistory } from 'vue-router'
import CreateDish from '../pages/CreateDish.vue'
import DishRank from '../pages/DishRank.vue' // 确保导入了新写的页面

const routes = [
  {
    path: '/',
    redirect: '/CreateDish' // 默认进创建页
  },
  {
    path: '/CreateDish',
    name: 'CreateDish',
    component: CreateDish
  },
  {
    path: '/DishRank',
    name: 'DishRank',
    component: DishRank
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router