import router from "@/router"

export const toDashboard = () => {
  router.push({ name: 'dashboard' })
}

export const toLandingPage = () => {
  router.push({ name: 'login' })
}