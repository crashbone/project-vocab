import type { Directive, DirectiveBinding } from 'vue'
import {
  ShowOn,
  setupPopover,
  type PopoverState,
} from '@/junk/popoverUtility'

type Placement = 'top' | 'right' | 'bottom' | 'left'

export interface TooltipAction {
  label: string
  // Short sentence shown above the button.
  hint?: string
  disabled: boolean
  onClick: () => void
}

export interface TooltipOptions {
  title?: string
  body?: string
  // Shown as a monospace block under the body (line breaks kept).
  code?: string
  // Small button at the bottom of the tooltip.
  action?: TooltipAction
  placement?: Placement
  offset?: number
  padding?: number
  container?: string
}

interface TooltipElement extends HTMLElement {
  _tooltipState?: PopoverState
}

function appendPart(parent: HTMLElement, tag: string, className: string, text: string) {
  const el = document.createElement(tag)
  el.className = className
  el.textContent = text
  parent.appendChild(el)
  return el
}

/** (Re)builds the tooltip's inner content from the options. */
function fillTooltipInner(inner: HTMLElement, opts: TooltipOptions) {
  inner.innerHTML = ''
  inner.style.padding = `${opts.padding ?? 8}px`

  if (opts.title) appendPart(inner, 'div', 'v-tooltip__title', opts.title)
  if (opts.body) appendPart(inner, 'div', 'v-tooltip__body', opts.body)
  if (opts.code) appendPart(inner, 'pre', 'v-tooltip__code', opts.code)

  if (opts.action) {
    const action = opts.action
    if (action.hint) appendPart(inner, 'div', 'v-tooltip__hint', action.hint)
    const button = appendPart(inner, 'button', 'small-button v-tooltip__action', action.label) as HTMLButtonElement
    button.type = 'button'
    button.disabled = action.disabled
    button.addEventListener('click', (e) => {
      e.stopPropagation()
      if (!button.disabled) action.onClick()
    })
  }

  const arrow = document.createElement('div')
  arrow.className = 'v-tooltip__arrow'
  inner.appendChild(arrow)
}

function createTooltipElement(opts: TooltipOptions): HTMLElement {
  const div = document.createElement('div')
  div.className = 'v-tooltip'
  const inner = document.createElement('div')
  inner.className = 'v-tooltip__inner'
  fillTooltipInner(inner, opts)
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
    code: binding.value?.code,
    action: binding.value?.action,
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
    fillTooltipInner(inner, opts)

    state.opts.placement = opts.placement
    state.opts.offset = opts.offset
    state.opts.container = opts.container
  }
}

export default tooltip
