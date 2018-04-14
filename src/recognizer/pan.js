import { GESTURE_DIRECTION } from '../constant'

const recognizer = {
  recognize (state, event, option, panType) {
    if (!this.gestures[panType || 'pan']) {
      if (state.stage === 'end' || state.touches.length > 1 || state.first.touches.length > 1) return false
      const xUp = Math.abs(state.totalX) > option.distance
      const yUp = Math.abs(state.totalY) > option.distance
      const dir = option.direction
      let result
      if ((dir === GESTURE_DIRECTION.HORIZONTAL && yUp) || (dir === GESTURE_DIRECTION.VERTICAL && xUp)) {
        result = false
      } else if ((dir !== GESTURE_DIRECTION.HORIZONTAL && yUp) || (dir !== GESTURE_DIRECTION.VERTICAL && xUp)) {
        result = true
        this.emit('pan', 'panstart', event)
      }
      return result
    } else if (state.stage === 'end') {
      this.emit('pan', 'panend', event)
    } else {
      this.emit('pan', 'panmove', event)
    }
  },
  options: {
    direction: GESTURE_DIRECTION.ALL,
    distance: 10
  }
}

const xRecognizer = {
  recognize (state, event, option) {
    return recognizer.recognize.call(this, state, event, option, 'panX')
  },
  options: {
    direction: GESTURE_DIRECTION.HORIZONTAL,
    distance: 10
  }
}

const yRecognizer = {
  recognize (state, event, option) {
    return recognizer.recognize.call(this, state, event, option, 'panY')
  },
  options: {
    direction: GESTURE_DIRECTION.VERTICAL,
    distance: 10
  }
}

export { recognizer as pan, xRecognizer as panX, yRecognizer as panY }
