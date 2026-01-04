import { getDateTitle } from "@/junk/util/getDateTitle"
import type { PageModel } from "./PageModel"

// Re-defining the types based on the refactoring request
type PageModelIdsGrouped = {
  frequent: number[], // Array of PageModel IDs
  recent: number[],   // Array of PageModel IDs
}

const AMOUNT_OF_PAGES_GROUPED = 2

export class DashboardModel {
  AMOUNT_OF_PAGES_GROUPED = AMOUNT_OF_PAGES_GROUPED
  
  // Stores the sorted arrays of PageModel IDs
  pageModelIdsGrouped: PageModelIdsGrouped
  
  // Stores the actual PageModel objects, keyed by ID (using the imported PageModel type)
  pageModelMap: Record<number, PageModel>;
  
  restTitle: string

  constructor(pageModels: PageModel[]) { // Uses imported PageModel[]
    this.pageModelMap = pageModels.reduce((map, page) => {
      map[page.id] = page
      return map
    }, {} as Record<number, PageModel>)
    this.pageModelIdsGrouped = this.buildPageModels(pageModels) // This method now populates both properties
    this.restTitle = this.getRestTitle()
  }


  private buildPageModels(pageModels: PageModel[]): PageModelIdsGrouped { // Uses imported PageModel[]
    const allIds = Object.keys(this.pageModelMap).map(Number)
    const frequentIds = [...allIds]
    frequentIds.sort((aId, bId) => 
      this.pageModelMap[bId].timeSpentSeconds - this.pageModelMap[aId].timeSpentSeconds
    )
    const recentIds = [...allIds]
    recentIds.sort((aId, bId) => 
      this.pageModelMap[bId].lastEntryAt - this.pageModelMap[aId].lastEntryAt
    )
    return {
      frequent: frequentIds,
      recent: recentIds
    }
  }


  private getRestTitle(): string {
    if (this.pageModelIdsGrouped.recent.length <= AMOUNT_OF_PAGES_GROUPED) {
      return "";
    }
    
    
    const pageId = this.pageModelIdsGrouped.recent[AMOUNT_OF_PAGES_GROUPED]
    const lastEntryPage = this.pageModelMap[pageId]
    
    if (!lastEntryPage) {
        // This should not happen if buildPageModels worked correctly
        return ""; 
    }

    return getDateTitle(new Date(lastEntryPage.lastEntryAt))
  }


}