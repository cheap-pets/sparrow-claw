export default function dispatchCustomEvent (el, type, { canBubble, cancelable, detail, originalEvent }) {
  const event = document.createEvent('CustomEvent')
  event.initCustomEvent(
    type,
    canBubble === undefined ? false : canBubble,
    cancelable === undefined ? true : cancelable,
    detail
  )
  event.originalEvent = originalEvent
  if (el.dispatchEvent(event) === false && originalEvent) {
    originalEvent.preventDefault()
    originalEvent.stopPropagation()
  }
}
