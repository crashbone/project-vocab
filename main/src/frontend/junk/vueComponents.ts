import SvgX from '@/NonPageComponents/SvgX.vue'
import ProfileIcon from "@/NonPageComponents/ProfileIcon/ProfileIcon.vue"
import QuestionNav from "@/NonPageComponents/QuestionNav/QuestionNav.vue"
import BottomBarButton from "@/NonPageComponents/BottomBarButton/BottomBarButton.vue"
import EditableCard from "@/NonPageComponents/EditableCard/EditableCard.vue"
import PageLoading from '@/Pages/PageLoading/PageLoading.vue'
import PageWords from '@/Pages/PageWords/PageWords.vue'
import PageDashboard from '@/Pages/PageDashboard/PageDashboard.vue'
import PagePortfolio from '@/Pages/PagePortfolio/PagePortfolio.vue'
import PageWithWordsTopBar from '@/NonPageComponents/PageWithWordsTopBar/PageWithWordsTopBar.vue'
import LiquidGlass from '@/NonPageComponents/LiquidGlass.vue'
import Sparkles from '@/NonPageComponents/Sparkles.vue'
import ButtonX from '@/NonPageComponents/ButtonX/vue.vue'
import Tooltip from '@/NonPageComponents/Tooltip.vue'
import ContextMenu from '@/NonPageComponents/ContextMenu/ContextMenu.vue'
import ConfirmationPopup from '@/NonPageComponents/ConfirmationPopup/ConfirmationPopup.vue'
import type { App } from 'vue'

export const register = (app: App) => {
  app.component("PageLoading", PageLoading)
  app.component("PageWords", PageWords)
  app.component("PageDashboard", PageDashboard)
  app.component("PageWithWordsTopBar", PageWithWordsTopBar)
  app.component("PagePortfolio", PagePortfolio)
  
  app.component("LiquidGlass", LiquidGlass) 
  app.component("Sparkles", Sparkles)
  app.component("SvgX", SvgX)
  app.component("QuestionNav", QuestionNav)
  app.component("ProfileIcon", ProfileIcon)
  app.component("BottomBarButton", BottomBarButton)
  app.component("EditableCard", EditableCard)
  app.component("ButtonX", ButtonX)
  app.component("Tooltip", Tooltip)
  app.component("ContextMenu", ContextMenu)
  app.component("ConfirmationPopup", ConfirmationPopup)
}