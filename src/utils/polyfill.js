if (!Object.assign) {
  Object.assign = function (target) {
    for (var i = 1; i < arguments.length; i++) {
      let source = arguments[i]
      for (let key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
    return target
  }
}
