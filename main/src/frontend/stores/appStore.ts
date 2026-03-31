import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchInitialData, type InitialData } from '@/junk/fetchInitialData'
import { fetchPagesBuildDashboardModel } from '@/wordManagement/wordManagerVue'
import type { DashboardModel } from '@/wordManagement/DashboardModel'

export const useAppStore = defineStore('app', () => {
  const initialData = ref<InitialData | undefined>()
  const dashboardModel = ref<DashboardModel | undefined>()

  async function loadInitialData(): Promise<InitialData> {
    try {
      const data = await fetchInitialData()
      initialData.value = data
      return data
    } catch {
      const fallback: InitialData = { logged_in: false }
      initialData.value = fallback
      return fallback
    }
  }

  async function loadPages(): Promise<DashboardModel> {
    const model = await fetchPagesBuildDashboardModel()
    dashboardModel.value = model
    return model
  }

  return { initialData, dashboardModel, loadInitialData, loadPages }
})
