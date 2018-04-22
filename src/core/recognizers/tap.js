import dispatchCustomEvent from '../../utils/dispatch-custom-event'

export const tap = {
  recognize (el, status) {
    const { distance, timespan } = this.options
    const { totalX, totalY, totalTime, state } = status.changedTouches[0]
    if (
      (timespan > 0 && totalTime > timespan) ||
      Math.abs(totalX) > distance ||
      Math.abs(totalY) > distance
    ) {
      return false
    } else if (state === 'end') {
      dispatchCustomEvent(el, 'tap', status)
      return true
    }
  },
  options: {
    timespan: 0,
    distance: 10
  },
  eventTypes: ['tap']
}
