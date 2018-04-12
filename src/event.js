export function dispatchCustomEvent (el, type, { canBubble, cancelable, detail, originalEvent, prevent, stop }) {
  let event = document.createEvent('CustomEvent')
  event.initCustomEvent(
    type,
    canBubble === undefined ? false : canBubble,
    cancelable === undefined ? true : cancelable,
    detail
  )
  event.originalEvent = originalEvent
  const ret = el.dispatchEvent(event)
  if (originalEvent) {
    if (ret === false || prevent) originalEvent.preventDefault()
    if (ret === false || stop) originalEvent.stopPropagation()
  }
}

export function hackAddEventListener (fn) {
  const prototype = Element.prototype
  const originalFn = prototype.addEventListener
  prototype.addEventListener = function (type, listener, options) {
    if (fn.call(this, type, listener) !== false) {
      originalFn.call(this, type, listener, options)
    }
  }
}

export function hackRemoveEventListener (fn) {
  const prototype = Element.prototype
  const originalFn = prototype.removeEventListener
  prototype.removeEventListener = function (type, listener, options) {
    if (fn.call(this, type, listener) !== false) {
      originalFn.call(this, type, listener, options)
    }
  }
}
