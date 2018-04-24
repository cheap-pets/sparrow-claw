function hackAdd (fn, prototype) {
  const oFn = prototype.addEventListener
  prototype.addEventListener = function (type, listener, options) {
    fn.call(this, type, listener)
    oFn.call(this, type, listener, options)
  }
}

function hackRemove (fn, prototype) {
  const oFn = prototype.removeEventListener
  prototype.removeEventListener = function (type, listener, options) {
    fn.call(this, type, listener)
    oFn.call(this, type, listener, options)
  }
}

export function hackAddEventListener (fn) {
  hackAdd(fn, Element.prototype)
  hackAdd(fn, Document.prototype)
}
export function hackRemoveEventListener (fn) {
  hackRemove(fn, Element.prototype)
  hackRemove(fn, Document.prototype)
}
