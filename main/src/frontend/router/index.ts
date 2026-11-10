import { createRouter, createWebHistory, type Router } from 'vue-router'

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
    path: '/multiple_choice/:pageId',
    name: 'multiple_choice',
    component: () => import('@/Pages/PageMultipleChoice/PageMultipleChoice.vue'),
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
    meta: { title: 'Okan | Software Developer' }
  },
]
// Hot reload bu modulu yeniden calistirirsa ikinci bir router olusuyordu: `import router` kullanan yerler
// (geri tusu -> toDashboard) adresi yeni router'la degistiriyor, ekrani cizen app ise eskisini dinliyordu
// -> adres /dashboard olup sayfa degismiyordu. Sadece dev'de: ayni router ornegi yeniden kullanilir.
const existing = import.meta.hot?.data.router as Router | undefined
const router = existing ?? createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})
if (import.meta.hot) import.meta.hot.data.router = router

if (!existing) router.beforeEach((to, from, next) => {
  if (to.meta.title && typeof to.meta.title === 'string') {
    document.title = to.meta.title
  };
  next();
});

export default router
