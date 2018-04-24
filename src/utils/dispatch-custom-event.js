export default function dispatchCustomEvent (el, type, status, options) {
  const { canBubble, cancelable, detail, originalEvent, target } = options || {}
  const event = document.createEvent('CustomEvent')
  event.initCustomEvent(
    type,
    canBubble === undefined ? false : canBubble,
    cancelable === undefined ? true : cancelable,
    detail
  )
  event.gestureStatus = status
  if (target) event.originalTarget = target
  if (originalEvent) event.originalEvent = originalEvent
  if (el.dispatchEvent(event) === false && originalEvent) {
    originalEvent.preventDefault()
    originalEvent.stopPropagation()
  }
}
