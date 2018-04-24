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
  hackAdd(Element.prototype)
  hackAdd(Document.prototype)
}
export function hackRemoveEventListener (fn) {
  hackRemove(Element.prototype)
  hackRemove(Document.prototype)
}
