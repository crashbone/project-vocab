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
    const e = opts.event
    if (e.type === 'contextmenu' && e instanceof MouseEvent) {
        // Sag tik: menu imlecin oldugu noktada acilir; ekranin alt yarisindaysa imlecin ustunde
        contextMenuState.triggerRect = new DOMRect(e.clientX, e.clientY, 0, 0)
        contextMenuState.placement = opts.placement ?? (e.clientY > window.innerHeight / 2 ? 'top' : 'bottom')
    } else {
        contextMenuState.triggerRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        contextMenuState.placement = opts.placement ?? 'top'
    }
    contextMenuState.items = opts.items
    contextMenuState.align = opts.align ?? 'center'
    contextMenuState.offset = opts.offset ?? 8
    contextMenuState.visible = true
}

export function closeContextMenu() {
    contextMenuState.visible = false
    contextMenuState.items = []
    contextMenuState.triggerRect = null
}
