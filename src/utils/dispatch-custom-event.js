export default function dispatchCustomEvent (el, type, status, options) {
  const { canBubble, cancelable, detail, originalEvent } = options || {}
  const event = document.createEvent('CustomEvent')
  event.initCustomEvent(
    type,
    canBubble === undefined ? false : canBubble,
    cancelable === undefined ? true : cancelable,
    detail
  )
  event.gestureStatus = status
  if (originalEvent) event.originalEvent = originalEvent
  if (el.dispatchEvent(event) === false && originalEvent) {
    originalEvent.preventDefault()
    originalEvent.stopPropagation()
  }
}
