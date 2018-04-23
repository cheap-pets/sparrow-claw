export function getClientPosition (el) {
  const { top, left } = el.parentNode.getBoundingClientRect()
  const { offsetTop, offsetLeft } = el
  const rect = el.getBoundingClientRect()
  return {
    top: rect.top - top - offsetTop,
    left: rect.left - left - offsetLeft
  }
}

export function getTransformY ({ style }) {
  let s = style.transform || style.webkitTransform || ''
  let t = s.match(/translate3d\(\dpx,([^)]*)/)
  let v = t ? t[1] : 0
  return parseInt(v, 10)
}

export function setTransformY ({ style }, y) {
  style.transform = 'translate3d(0,' + y + 'px,0)'
  style.webkitTransform = 'translate3d(0,' + y + 'px,0)'
}

export function setTransitionDuration ({ style }, s) {
  style.transitionDuration = s + 's'
  style.webkitTransitionDuration = s + 's'
}

export function setTransitionTimingFunction ({ style }, type) {
  style.transitionTimingFunction = type
  style.webkitTransitionTimingFunction = type
}
