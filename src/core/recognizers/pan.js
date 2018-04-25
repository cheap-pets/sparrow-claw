import dispatchCustomEvent from '../../utils/dispatch-custom-event'
import { GESTURE_DIRECTION } from '../constant'

const pan = {
  recognize (el, status, event, direction) {
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
  },
  eventTypes: ['panstart', 'panmove', 'panend']
}

const panx = {
  recognize (el, status, event) {
    return pan.recognize(el, status, event, GESTURE_DIRECTION.HORIZONTAL)
  },
  eventTypes: ['panxstart', 'panxmove', 'panxend']
}

const pany = {
  recognize (el, status, event) {
    return pan.recognize(el, status, event, GESTURE_DIRECTION.VERTICAL)
  },
  eventTypes: ['panystart', 'panymove', 'panyend']
}

export { pan, panx, pany }
