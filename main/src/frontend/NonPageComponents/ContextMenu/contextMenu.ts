import { reactive } from 'vue'

export interface ContextMenuItem {
    name: string
    disabled?: boolean
    click: () => void
}

interface ContextMenuState {
    visible: boolean
    triggerRect: DOMRect | null
    placement: 'top' | 'bottom'
    // 'end': menu tetikleyicinin sag kenarina hizalanir (ekranin sag kenarindaki butonlar icin)
    align: 'center' | 'end'
    offset: number
    items: ContextMenuItem[]
}

export const contextMenuState = reactive<ContextMenuState>({
    visible: false,
    triggerRect: null,
    placement: 'top',
    align: 'center',
    offset: 8,
    items: [],
})

export function showContextMenu(opts: {
    event: Event
    items: ContextMenuItem[]
    placement?: 'top' | 'bottom'
    align?: 'center' | 'end'
    offset?: number
}) {
    const el = opts.event.currentTarget as HTMLElement
    contextMenuState.triggerRect = el.getBoundingClientRect()
    contextMenuState.items = opts.items
    contextMenuState.placement = opts.placement ?? 'top'
    contextMenuState.align = opts.align ?? 'center'
    contextMenuState.offset = opts.offset ?? 8
    contextMenuState.visible = true
}

export function closeContextMenu() {
    contextMenuState.visible = false
    contextMenuState.items = []
    contextMenuState.triggerRect = null
}
