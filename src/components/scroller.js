import dispatchCustomEvent from '../utils/dispatch-custom-event'

import {
  getClientPosition,
  getTransformY,
  setTransformY,
  setTransitionDuration,
  setTransitionTimingFunction
} from '../utils/styles'

function getMinY (el) {
  const y = el.parentNode.clientHeight - el.offsetHeight - el.offsetTop
  return y > 0 ? 0 : y
}

function isOut (y, minY) {
  return y > 0 || y < minY
}

export const scroller = {
  attach (el) {
    el.addEventListener('touchstart', function (event) {
      setTransformY(el, getClientPosition(el).top)
      setTransitionDuration(el, 0)
    })
    el.addEventListener('panymove', function (event) {
      const gs = event.gestureStatus
      let { deltaY } = gs.changedTouches[0]
      const transY = getTransformY(el)
      const minY = getMinY(el)
      if (isOut(transY + deltaY, minY)) {
        deltaY /= 2
      }
      const newY = transY + deltaY
      setTransformY(this, newY)
      gs.scrollMinY = minY
      gs.scrollY = newY
    })
    el.addEventListener('panyend', function (event) {
      const gs = event.gestureStatus
      let { speedY } = gs.changedTouches[0]
      if (speedY < -3) speedY = -3
      else if (speedY > 3) speedY = 3
      const at = speedY > 0 ? 0.0025 : -0.0025
      let t = Math.abs(speedY / at)
      const s = speedY * t - at * t * t / 2
      const transY = getTransformY(el)
      const minY = getMinY(el)
      let newY = transY + s
      let timingFn = 'cubic-bezier(0, 0, 0.25, 1.5)'
      if (isOut(transY, minY)) {
        newY = transY > 0 ? 0 : minY
        t = 300
      } else if (isOut(newY, minY)) {
        newY = newY > 0 ? 0 : minY
        t = Math.abs(newY - transY) + 200
      } else {
        t = t * 2
        timingFn = 'cubic-bezier(0, 0, 0.25, 1)'
      }
      setTransitionTimingFunction(el, timingFn)
      setTransitionDuration(el, t / 1000)
      setTransformY(this, newY)
      gs.scrollMinY = minY
      gs.scrollY = transY
      gs.scrollDirection = speedY > 0 ? 1 : (speedY < 0 ? -1 : 0)
    })
    el.$setScrollTop = function (top) {
      setTransformY(this, top || 0)
    }
  }
}
