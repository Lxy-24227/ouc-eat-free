import { createRouter, createWebHistory } from 'vue-router'
import CreateDish from '../pages/CreateDish.vue'
import DishRank from '../pages/DishRank.vue'
import DishDetail from '../pages/DishDetail.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Profile from '../pages/Profile.vue'
import { isLoggedIn } from '../utils/auth'

const routes = [
  { path: '/', redirect: '/DishRank' },
  { path: '/CreateDish', name: 'CreateDish', component: CreateDish, meta: { requiresAuth: true } },
  { path: '/DishRank', name: 'DishRank', component: DishRank },
  { path: '/dish/:id', name: 'DishDetail', component: DishDetail },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  // 最小改动：仅拦截创建菜品/个人中心等需要登录的页面
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }

  return true
})

export default router