import dispatchCustomEvent from '../dispatch-custom-event'
import { GESTURE_DIRECTION } from '../constant'

const pan = {
  recognize (el, status, direction) {
    const eventName = 'pan' + (direction || '')
    const { activeGesture } = status
    const { distance } = this.options
    const { totalX, totalY, state } = status.changedTouches[0]
    const x = Math.abs(totalX)
    const y = Math.abs(totalY)
    if (!activeGesture) {
      if (
        (direction === GESTURE_DIRECTION.HORIZONTAL && y > distance) ||
        (direction === GESTURE_DIRECTION.VERTICAL && x > distance)
      ) {
        return false
      } else if (x > distance || y > distance) {
        dispatchCustomEvent(el, eventName + 'start', status)
        return true
      }
    } else if (state === 'end') {
      dispatchCustomEvent(el, eventName + 'end', status)
      return false
    } else {
      dispatchCustomEvent(el, eventName + 'move', status)
    }
  },
  options: {
    distance: 10
  }
}

const panx = {
  recognize (el, status) {
    return pan.recognize(el, status, GESTURE_DIRECTION.HORIZONTAL)
  }
}

const pany = {
  recognize (el, status) {
    return pan.recognize(el, status, GESTURE_DIRECTION.VERTICAL)
  }
}

export { pan, panx, pany }
