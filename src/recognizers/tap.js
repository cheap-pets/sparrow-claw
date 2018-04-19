import dispatchCustomEvent from '../dispatch-custom-event'

const recognizer = {
  recognize (el, status) {
    const { distance, timespan } = this.options
    const { totalX, totalY, totalTime, state } = status.changedTouches[0]
    let result
    if ((timespan > 0 && totalTime > timespan) || Math.abs(totalX) > distance || Math.abs(totalY) > distance) {
      result = false
    } else if (state === 'end') {
      dispatchCustomEvent(el, 'tap', status)
      result = true
    }
    return result
  },
  options: {
    timespan: 300,
    distance: 10
  }
}

export default recognizer
