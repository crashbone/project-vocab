/* CHATGPT Generated Code */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type Placement = 'top' | 'right' | 'bottom' | 'left'

export enum ShowOn {
  Hover = 'hover',
  LongTap = 'longTap'
}

export interface PopoverOptions {
  target: HTMLElement
  content: HTMLElement
  placement?: Placement
  offset?: number
  container?: string
  arrow?: boolean
  showOn?: ShowOn
}

export interface PopoverState {
  popover: HTMLElement | null
  opts: PopoverOptions
}

/** Positions the arrow element inside the popover */
function positionArrow(
  target: HTMLElement,
  popover: HTMLElement,
  arrow: HTMLElement,
  placement: Placement
) {
  const t = target.getBoundingClientRect()
  const p = popover.getBoundingClientRect()
  const arrowSize = 12
  const arrowOffset = arrowSize / 2

  arrow.style.width = `${arrowSize}px`
  arrow.style.height = `${arrowSize}px`
  arrow.style.position = 'absolute'
  arrow.classList.remove('top', 'bottom', 'left', 'right')
  arrow.classList.add(placement)

  switch (placement) {
    case 'top':
      arrow.style.bottom = `-${arrowOffset}px`
      arrow.style.left = `${t.left + t.width / 2 - p.left - arrowSize / 2}px`
      arrow.style.top = ''
      arrow.style.right = ''
      break
    case 'bottom':
      arrow.style.top = `-${arrowOffset}px`
      arrow.style.left = `${t.left + t.width / 2 - p.left - arrowSize / 2}px`
      arrow.style.bottom = ''
      arrow.style.right = ''
      break
    case 'left':
      arrow.style.right = `-${arrowOffset}px`
      arrow.style.top = `${t.top + t.height / 2 - p.top - arrowSize / 2}px`
      arrow.style.left = ''
      arrow.style.bottom = ''
      break
    case 'right':
      arrow.style.left = `-${arrowOffset}px`
      arrow.style.top = `${t.top + t.height / 2 - p.top - arrowSize / 2}px`
      arrow.style.right = ''
      arrow.style.bottom = ''
      break
  }
}

/** Positions the floating element relative to its target, optionally positioning arrow */
function positionPopover(
  target: HTMLElement,
  popover: HTMLElement,
  placement: Placement = 'bottom',
  offset: number = 8,
  containerSelector?: string,
  arrow = false
) {
  const container = containerSelector
    ? document.querySelector<HTMLElement>(containerSelector)
    : document.body
  if (!container) return

  const t = target.getBoundingClientRect()
  const r = popover.getBoundingClientRect()
  const c = container.getBoundingClientRect()

  let top = 0
  let left = 0

  switch (placement) {
    case 'top':
      top = t.top - r.height - offset
      left = t.left + t.width / 2 - r.width / 2
      break
    case 'bottom':
      top = t.bottom + offset
      left = t.left + t.width / 2 - r.width / 2
      break
    case 'left':
      top = t.top + t.height / 2 - r.height / 2
      left = t.left - r.width - offset
      break
    case 'right':
      top = t.top + t.height / 2 - r.height / 2
      left = t.right + offset
      break
  }

  top = Math.max(c.top, Math.min(top, c.bottom - r.height))
  left = Math.max(c.left, Math.min(left, c.right - r.width))

  popover.style.top = `${top + window.scrollY}px`
  popover.style.left = `${left + window.scrollX}px`

  if (arrow) {
    let arrowEl = popover.querySelector<HTMLElement>('.v-tooltip__arrow')
    if (!arrowEl) {
      arrowEl = document.createElement('div')
      arrowEl.className = 'v-tooltip__arrow'
      arrowEl.style.position = 'absolute'
      popover.appendChild(arrowEl)
    }
    positionArrow(target, popover, arrowEl, placement)
  }
}

function showPopover(state: PopoverState) {
  if (!state.popover) return
  state.popover = state.opts.content
  document.body.appendChild(state.popover)
  positionPopover(
    state.opts.target,
    state.popover,
    state.opts.placement,
    state.opts.offset,
    state.opts.container,
    state.opts.arrow ?? false
  )
  requestAnimationFrame(() => state.popover?.classList.add('visible'))
}

/** Hides a popover (removes from DOM after fade out) */
function hidePopover(state: PopoverState) {
  if (!state.popover) return
  state.popover!.classList.remove('visible')
}

/** Internal: sets up hover or tap triggers and outside click */
function setupTrigger(state: PopoverState) {
  const el = state.opts.target
  if (state.opts.showOn === ShowOn.Hover) {
    const onEnter = () => {
      showPopover(state)
    }
    const onLeave = () => {
      hidePopover(state)
    }
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)

      ; (state as any)._cleanup = () => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
        hidePopover(state)
      }
  } else if (state.opts.showOn === ShowOn.LongTap) {
    const handler = () => {
      showPopover(state)
      const onClickOutside = (e: MouseEvent) => {
        if (!state.popover?.contains(e.target as Node) && e.target !== el) {
          hidePopover(state)
          document.removeEventListener('mousedown', onClickOutside)
        }
      }
      document.addEventListener('mousedown', onClickOutside)
    }

    const preventDefaultEvent = (ev: any) => {
      ev.preventDefault() // Prevent text selection
    }
    el.addEventListener('touchstart', preventDefaultEvent, { passive: false })
    el.addEventListener('touchmove', preventDefaultEvent, { passive: false })
    el.addEventListener('touchend', preventDefaultEvent, { passive: false })
    el.addEventListener('touchcancel', preventDefaultEvent, { passive: false })
    el.addEventListener('tap.long', handler)

      ; (state as any)._cleanup = () => {
        el.removeEventListener('tap.long', handler)
        hidePopover(state)
      }
  }
}

/** Shows a popover and sets up everything internally */
export function setupPopover(state: PopoverState) {
  if (!state.popover) {
    state.popover = state.opts.content
    document.body.appendChild(state.popover)
    positionPopover(
      state.opts.target,
      state.popover,
      state.opts.placement,
      state.opts.offset,
      state.opts.container,
      state.opts.arrow ?? false
    )

    // internally setup triggers and outside click
    setupTrigger(state)
  }
}
