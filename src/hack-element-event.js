const prototype = Element.prototype

export function hackAddEventListener (fn) {
  const originalFn = prototype.addEventListener
  prototype.addEventListener = function (type, listener, options) {
    fn.call(this, type, listener)
    originalFn.call(this, type, listener, options)
  }
}
export function hackRemoveEventListener (fn) {
  const originalFn = prototype.removeEventListener
  prototype.removeEventListener = function (type, listener, options) {
    fn.call(this, type, listener)
    originalFn.call(this, type, listener, options)
  }
}
