import { createRouter, createWebHistory } from 'vue-router'
// 导入你写的那个页面
import CreateDish from '../pages/CreateDish.vue'

const routes = [
  {
    path: '/',
    redirect: '/CreateDish' // 让默认首页直接跳转到你的创建页面
  },
  {
    path: '/CreateDish',
    name: 'CreateDish',
    component: CreateDish
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router