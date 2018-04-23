import {
  getClientPosition,
  getTransformY,
  setTransformY,
  setTransitionDuration,
  setTransitionTimingFunction
} from '../utils/styles'

function minY (el) {
  return el.parentNode.clientHeight - el.offsetHeight - el.offsetTop
}

function isOut (el, y) {
  return y > 0 || y < minY(el)
}

export const scroller = {
  attach (el) {
    el.addEventListener('touchstart', function (event) {
      setTransformY(el, getClientPosition(el).top)
      setTransitionDuration(el, 0)
    })
    el.addEventListener('panymove', function (event) {
      let { deltaY } = event.gestureStatus.changedTouches[0]
      const transY = getTransformY(el)
      if (isOut(el, transY + deltaY)) {
        deltaY /= 2
      }
      setTransformY(this, transY + deltaY)
    })
    el.addEventListener('panyend', function (event) {
      let { speedY } = event.gestureStatus.changedTouches[0]
      if (speedY < -3) speedY = -3
      else if (speedY > 3) speedY = 3
      const at = speedY > 0 ? 0.0025 : -0.0025
      let t = Math.abs(speedY / at)
      const s = speedY * t - at * t * t / 2
      const transY = getTransformY(el)
      let newY = transY + s
      let timingFn = 'cubic-bezier(0, 0, 0.25, 1.5)'
      if (isOut(el, transY)) {
        newY = transY > 0 ? 0 : minY(el)
        t = 300
      } else if (isOut(el, newY)) {
        newY = newY > 0 ? 0 : minY(el)
        t = Math.abs(newY - transY) + 200
      } else {
        t = t * 2
        timingFn = 'cubic-bezier(0, 0, 0.25, 1)'
      }
      setTransitionTimingFunction(el, timingFn)
      setTransitionDuration(el, t / 1000)
      setTransformY(this, newY)
    })
  }
}
