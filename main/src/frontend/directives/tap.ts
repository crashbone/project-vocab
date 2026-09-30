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
// Vue sablonunda '@tap.long' yazilamaz ('.long' modifier sanilir); dinamik arguman ile:
//   @[LONG_TAP_EVENT]="onLongTap"
export const LONG_TAP_EVENT = 'tap.long'

export default {
  install() {
    let startTime = 0
    let pressedTarget: EventTarget | null = null
    let longTapTimer: number | null = null

    document.addEventListener('pointerdown', (e: PointerEvent) => {
      startTime = Date.now()
      pressedTarget = e.target

      longTapTimer = window.setTimeout(() => {
        if (pressedTarget instanceof HTMLElement) {
          pressedTarget.dispatchEvent(
            new CustomEvent(LONG_TAP_EVENT, { bubbles: true })
          )
        }
        longTapTimer = null
      }, LONG_THRESHOLD_MS)
    })

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
