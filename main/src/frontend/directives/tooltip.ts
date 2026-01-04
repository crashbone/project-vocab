import type { Directive, DirectiveBinding } from 'vue'
import {
  ShowOn,
  setupPopover,
  type PopoverState,
} from '@/junk/popoverUtility'

type Placement = 'top' | 'right' | 'bottom' | 'left'

export interface TooltipOptions {
  title?: string
  body?: string
  placement?: Placement
  offset?: number
  padding?: number
  container?: string
}

interface TooltipElement extends HTMLElement {
  _tooltipState?: PopoverState
}

function createTooltipElement(opts: TooltipOptions): HTMLElement {
  const div = document.createElement('div')
  div.className = 'v-tooltip'

  const inner = document.createElement('div')
  inner.className = 'v-tooltip__inner'
  inner.style.padding = `${opts.padding ?? 8}px`

  if (opts.title) {
    const titleEl = document.createElement('div')
    titleEl.className = 'v-tooltip__title'
    titleEl.textContent = opts.title
    inner.appendChild(titleEl)
  }

  if (opts.body) {
    const bodyEl = document.createElement('div')
    bodyEl.className = 'v-tooltip__body'
    bodyEl.style.whiteSpace = 'pre-wrap'
    bodyEl.textContent = opts.body
    inner.appendChild(bodyEl)
  }

  const arrow = document.createElement('div')
  arrow.className = 'v-tooltip__arrow'
  inner.appendChild(arrow)

  div.appendChild(inner)
  return div
}

function setupOptions(binding: DirectiveBinding<string | TooltipOptions>): TooltipOptions {
  if (typeof binding.value === 'string') {
    return {
      body: binding.value,
      placement: 'bottom',
      offset: 8,
      container: '.app-frame'
    }
  }

  return {
    title: binding.value?.title,
    body: binding.value?.body,
    placement: binding.value?.placement ?? 'bottom',
    offset: binding.value?.offset ?? 8,
    padding: binding.value?.padding,
    container: binding.value?.container ?? '.app-frame'
  }
}

const tooltip: Directive<TooltipElement, string | TooltipOptions> = {
  mounted(el, binding) {
    const element = el as TooltipElement
    const opts = setupOptions(binding)
    const content = createTooltipElement(opts)

    const state: PopoverState = {
      popover: null,
      opts: {
        target: element,
        content,
        placement: opts.placement,
        offset: opts.offset,
        container: opts.container,
        arrow: true,
        showOn: ShowOn.Hover
      }
    }

    element._tooltipState = state

    // Just call showPopover with state
    setupPopover(state)
  },

  updated(el, binding) {
    const element = el as TooltipElement
    element.classList.add('v-tooltip-target')
    const opts = setupOptions(binding)
    const state = element._tooltipState
    if (!state) return

    const inner = state.opts.content.querySelector<HTMLDivElement>('.v-tooltip__inner')!
    inner.innerHTML = ''

    if (opts.title) {
      const titleEl = document.createElement('div')
      titleEl.className = 'v-tooltip__title'
      titleEl.textContent = opts.title
      inner.appendChild(titleEl)
    }

    if (opts.body) {
      const bodyEl = document.createElement('div')
      bodyEl.className = 'v-tooltip__body'
      bodyEl.style.whiteSpace = 'pre-wrap'
      bodyEl.textContent = opts.body
      inner.appendChild(bodyEl)
    }

    inner.style.padding = `${opts.padding ?? 8}px`

    state.opts.placement = opts.placement
    state.opts.offset = opts.offset
    state.opts.container = opts.container
  }
}

export default tooltip
