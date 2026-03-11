import { createRouter, createWebHistory } from 'vue-router'
import CreateDish from '../pages/CreateDish.vue'
import DishRank from '../pages/DishRank.vue'
import DishDetail from '../pages/DishDetail.vue'
// 👇 新增的三个页面导入
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Profile from '../pages/Profile.vue'

const routes = [
  // 建议将根目录重定向到榜单页，这样用户一进来就能看到菜品
  { path: '/', redirect: '/DishRank' },
  { path: '/CreateDish', name: 'CreateDish', component: CreateDish, meta: { requiresAuth: true } },
  { path: '/DishRank', name: 'DishRank', component: DishRank },
  { path: '/dish/:id', name: 'DishDetail', component: DishDetail },

  // 👇 新增的路由配置
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/profile', name: 'Profile', component: Profile },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 最小改动：仅增加登录态守卫，限制创建菜品入口
router.beforeEach((to) => {
  const user = localStorage.getItem('user_info');
  if (to.meta?.requiresAuth && !user) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  if ((to.path === '/login' || to.path === '/register') && user) {
    return '/DishRank';
  }
  return true;
});

export default router