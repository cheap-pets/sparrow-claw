import {
  getClientRect,
  getTransformY,
  setTransformY,
  setTransitionDuration,
  setTransitionTimingFunction
} from '../utils/styles'

export const scroller = {
  attach (el) {
    setTransitionTimingFunction(el, 'cubic-bezier(0, 0, 0.25, 1)')
    el.addEventListener('touchstart', function (event) {
      console.log(getTransformY(el), getClientRect(el).top)
      setTransformY(el, getClientRect(el).top)
      setTransitionDuration(el, 0)
    })
    el.addEventListener('panymove', function (event) {
      const { deltaY } = event.gestureStatus.changedTouches[0]
      const transY = getTransformY(el)
      setTransformY(this, transY + deltaY)
    })
    el.addEventListener('panyend', function (event) {
      let { speedY } = event.gestureStatus.changedTouches[0]
      if (speedY < -3) speedY = -3
      else if (speedY > 3) speedY = 3
      console.log(speedY)
      const at = speedY > 0 ? 0.0025 : -0.0025
      const t = Math.abs(speedY / at)
      const s = speedY * t - at * t * t / 2
      const transY = getTransformY(el)
      setTransitionDuration(el, t * 2 / 1000)
      setTransformY(this, transY + s)
    })
  }
}
