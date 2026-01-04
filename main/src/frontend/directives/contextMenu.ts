import type { Directive, DirectiveBinding } from 'vue'
import { type PopoverState, setupPopover, ShowOn, type Placement } from '@/junk/popoverUtility'

interface ContextMenuElement extends HTMLElement {
  _contextMenuState?: PopoverState
}

type ContextMenuOptions = {
  items: ContextMenuOption[]
  placement?: Placement
  offset?: number
  container?: string
}

type ContextMenuOption = {
  name: string
  click: () => void
}

function createMenuElement(opts: ContextMenuOptions): HTMLElement {
  const div = document.createElement('div')
  div.className = 'context-menu'

  opts.items.forEach(item => {
    const btn = document.createElement('div')
    btn.classList.add('context-menu-button')
    btn.textContent = item.name
    btn.addEventListener('click', e => {
      e.stopPropagation()
      item.click()
      div.remove()
    })
    div.appendChild(btn)
  })

  return div
}

function setupOptions(
  binding: DirectiveBinding<ContextMenuOptions | ContextMenuOption[]>
): ContextMenuOptions {
  if (Array.isArray(binding.value)) {
    return { items: binding.value, placement: 'bottom', offset: 8, container: 'body' }
  }
  return {
    items: binding.value.items,
    placement: binding.value.placement ?? 'bottom',
    offset: binding.value.offset ?? 8,
    container: binding.value.container ?? 'body'
  }
}

const contextMenu: Directive<ContextMenuElement, ContextMenuOptions | ContextMenuOption[]> = {
  mounted(el, binding) {
    const element = el as ContextMenuElement
    const opts = setupOptions(binding)
    const content = createMenuElement(opts)

    const state: PopoverState = {
      popover: null,
      opts: {
        target: element,
        content,
        placement: opts.placement,
        offset: opts.offset,
        container: opts.container,
        showOn: ShowOn.LongTap
      }
    }

    element._contextMenuState = state
    setupPopover(state)
  },

  updated(el, binding) {
    const element = el as ContextMenuElement
    const state = element._contextMenuState
    if (!state) return

    const opts = setupOptions(binding)
    state.opts.content = createMenuElement(opts)
    state.opts.placement = opts.placement
    state.opts.offset = opts.offset
    state.opts.container = opts.container
    state.opts.showOn = ShowOn.LongTap
    state.opts.hideOnClickOutside = true
  },

  unmounted() {
    // no manual cleanup needed; showPopover handles it internally
  }
}

export default contextMenu
