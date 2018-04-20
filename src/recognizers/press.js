import dispatchCustomEvent from '../dispatch-custom-event'

function check (el, status, touch, options) {
  if (status.activeElement) return
  const { distance, timespan } = options
  const { totalX, totalY, startTime, state } = touch
  const totalTime = +new Date() - startTime
  if (
    (state === 'end' && totalTime < timespan) ||
    Math.abs(totalX) > distance ||
    Math.abs(totalY) > distance
  ) {
    return false
  } else if (totalTime >= timespan) {
    dispatchCustomEvent(el, 'press', status)
    return true
  }
}

export const press = {
  recognize (el, status) {
    const touch = status.changedTouches[0]
    const recognized = check(el, status, touch, this.options)
    if (recognized === undefined) {
      setTimeout(() => {
        const recognized = check(el, status, touch, this.options)
        if (recognized) {
          status.activeElement = el
          status.activeGesture = 'press'
        } else if (recognized === false && el.$claw.current) {
          delete el.$claw.current.press
        }
      }, this.options.timer)
    }
    return recognized
  },
  options: {
    timespan: 1000,
    distance: 10,
    timer: 1000
  }
}
