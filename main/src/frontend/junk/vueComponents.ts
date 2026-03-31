import SvgX from '@/NonPageComponents/SvgX.vue'
import PageLoading from '@/Pages/PageLoading/PageLoading.vue'
import PageWords from '@/Pages/PageWords/PageWords.vue'
import PageDashboard from '@/Pages/PageDashboard/PageDashboard.vue'
import PageWithWordsTopBar from '@/NonPageComponents/PageWithWordsTopBar/PageWithWordsTopBar.vue'
import LiquidGlass from '@/NonPageComponents/LiquidGlass.vue'
import Sparkles from '@/NonPageComponents/Sparkles.vue'
import ButtonX from '@/NonPageComponents/ButtonX/vue.vue'
import Tooltip from '@/NonPageComponents/Tooltip.vue'
import type { App } from 'vue'

export const register = (app: App) => {
  app.component("PageLoading", PageLoading)
  app.component("PageWords", PageWords)
  app.component("PageDashboard", PageDashboard)
  app.component("PageWithWordsTopBar", PageWithWordsTopBar)
  app.component("LiquidGlass", LiquidGlass) 
  app.component("Sparkles", Sparkles)
  app.component("SvgX", SvgX)
  app.component("ButtonX", ButtonX)
  app.component("Tooltip", Tooltip)
}