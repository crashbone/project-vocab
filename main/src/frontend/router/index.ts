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
  },
  {
    path: '/portfolio',
    name: 'portfolio',
    component: () => import('@/Pages/PagePortfolio/PagePortfolio.vue'),
    meta: { title: 'Okan | Frontend Developer' }
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.title && typeof to.meta.title === 'string') {
    document.title = to.meta.title
  };
  next();
});

export default router
