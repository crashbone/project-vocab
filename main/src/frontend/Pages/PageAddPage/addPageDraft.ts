import type { PageType } from '@/wordManagement/PageType'
import type { ViewMode } from './ViewMode'

// Add page'in localStorage'daki tek draft'i (PAGE_STATE_KEYS.draft).
export type AddPageDraft = {
    title: string
    wordObjects: { w1: string, w2: string }[]
    rawModeString: string
    viewMode: ViewMode
    type: PageType
    scroll: number
}
