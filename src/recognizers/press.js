import dispatchCustomEvent from '../dispatch-custom-event'

function check (el, status, touch, options) {
  if (status.activeElement) return
  const { distance, timespan } = options
  const { totalX, totalY, totalTime, state } = touch
  let result
  if ((state === 'end' && totalTime < timespan) || Math.abs(totalX) > distance || Math.abs(totalY) > distance) {
    result = false
  } else if (totalTime >= timespan) {
    dispatchCustomEvent(el, 'press', status)
    result = true
  }
  return result
}

const recognizer = {
  recognize (el, status) {
    const touch = status.changedTouches[0]
    const result = check(el, status, touch, this.options)
    if (result === undefined) {
      setTimeout(() => {
        const result = check(el, status, touch, this.options)
        if (result) {
          status.activeElement = el
          status.activeGesture = 'press'
        } else if (result === false && el.$claw.current) {
          delete el.$claw.current.press
        }
      }, this.options.timer)
    }
    return result
  },
  options: {
    timespan: 500,
    distance: 10,
    timer: 600
  }
}

export default recognizer
