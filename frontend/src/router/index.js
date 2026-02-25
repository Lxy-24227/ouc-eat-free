import { createRouter, createWebHistory } from 'vue-router'
import CreateDish from '../pages/CreateDish.vue'
import DishRank from '../pages/DishRank.vue'

const routes = [
  { path: '/', redirect: '/CreateDish' },
  { path: '/CreateDish', name: 'CreateDish', component: CreateDish },
  { path: '/DishRank', name: 'DishRank', component: DishRank },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router