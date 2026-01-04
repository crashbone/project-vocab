import { createRouter, createWebHistory } from 'vue-router'

// Define your routes
const routes = [
  {
    path: '/',
    name: 'loading',
    component: () => import('@/Pages/PageLoading/PageLoading.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/Pages/PageLanding/PageLanding.vue'),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/Pages/PageDashboard/PageDashboard.vue'),
  },
  {
    path: '/page/:pageId?',
    name: 'page',
    component: () => import('@/Pages/PageWords/PageWords.vue'),
    props: true,
  },
  {
    path: '/add_page',
    name: 'add_page',
    component: () => import('@/Pages/PageAddPage/PageAddPage.vue'),
    props: true,
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
