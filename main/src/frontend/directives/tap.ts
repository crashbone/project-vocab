// tap.ts
/**
 * What does tap directive do:
 * • "@tap" → short press
 *     <div @tap="onTap">Tap me</div>
 * • "@tap.long" → long press
 *     <div @tap.long="onLongTap">Long tap me</div>
 */

const LONG_THRESHOLD_MS = 500
const TAP_THRESHOLD_MS = 250
// If the finger moves this many px it counts as a scroll and the long tap is cancelled
const MOVE_THRESHOLD_PX = 10
// '@tap.long' cannot be written in a Vue template ('.long' is parsed as a modifier); use a dynamic argument:
//   @[LONG_TAP_EVENT]="onLongTap"
export const LONG_TAP_EVENT = 'tap.long'

export default {
  install() {
    let startTime = 0
    let pressedTarget: EventTarget | null = null
    let longTapTimer: number | null = null
    let startX = 0
    let startY = 0

    const cancelPress = () => {
      if (longTapTimer !== null) {
        clearTimeout(longTapTimer)
        longTapTimer = null
      }
      pressedTarget = null
    }

    document.addEventListener('pointerdown', (e: PointerEvent) => {
      startTime = Date.now()
      pressedTarget = e.target
      startX = e.clientX
      startY = e.clientY

      longTapTimer = window.setTimeout(() => {
        if (pressedTarget instanceof HTMLElement) {
          pressedTarget.dispatchEvent(
            new CustomEvent(LONG_TAP_EVENT, { bubbles: true })
          )
        }
        longTapTimer = null
      }, LONG_THRESHOLD_MS)
    })

    document.addEventListener('pointermove', (e: PointerEvent) => {
      if (pressedTarget === null) return
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > MOVE_THRESHOLD_PX) {
        cancelPress()
      }
    })

    // On mobile the browser sends pointercancel instead of pointerup once scrolling starts
    document.addEventListener('pointercancel', cancelPress)

    document.addEventListener('pointerup', (e: PointerEvent) => {
      const duration = Date.now() - startTime

      if (longTapTimer !== null) {
        clearTimeout(longTapTimer)
        longTapTimer = null

        if (duration < TAP_THRESHOLD_MS && pressedTarget instanceof HTMLElement) {
          pressedTarget.dispatchEvent(
            new CustomEvent('tap', { bubbles: true, detail: { originalEvent: e } })
          )
        }
      }

      pressedTarget = null
    })
  }
}
