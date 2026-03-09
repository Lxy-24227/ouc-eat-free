import { createRouter, createWebHistory } from 'vue-router'
import CreateDish from '../pages/CreateDish.vue'
import DishRank from '../pages/DishRank.vue'
import DishDetail from '../pages/DishDetail.vue'

const routes = [
  { path: '/', redirect: '/CreateDish' },
  { path: '/CreateDish', name: 'CreateDish', component: CreateDish },
  { path: '/DishRank', name: 'DishRank', component: DishRank },
  { path: '/dish/:id', name: 'DishDetail', component: DishDetail },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router