import { PageModel } from "@/wordManagement/PageModel"
import { fetchPages } from "@/wordManagement/fetchPages"
import { WordManager } from "@/wordManagement/wordManager"
import { DashboardModel } from "@/wordManagement/DashboardModel"

// TODO: DO STH BETTER (pagemodel and wordmodel should not be created and set up like this, this is shit code)
export const fetchPagesBuildDashboardModel = async (): Promise<DashboardModel> => {
  try {
    const pagesJsons = await fetchPages()
    const pageModels: PageModel[] = []

    pagesJsons.forEach(pageJson => {
      const wordManager = WordManager.instance;
      

      const wordsWordManager = wordManager.setupWords(pageJson.words)
      pageModels.push(new PageModel(pageJson, wordsWordManager))
    })

    const dashboardModel = new DashboardModel(pageModels)

    // Return result so caller can await it
    return dashboardModel
  } catch (err) {
    console.error('Failed to fetch and setup pages', err)
    throw err // propagate error to caller
  }
}