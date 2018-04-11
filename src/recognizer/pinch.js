const recognizer = {
  recognize (state, event, option) {
    let len = state.touches.length
    if (!this.gestures.pinch) {
      if (state.stage === 'end' || state.touches.length !== 2) return false
      let xUp
      let yUp
      for (let i = 0; i < len; i++) {
        const touch = state.touches[i]
        xUp = Math.abs(touch.totalX) > option.distance
        yUp = Math.abs(touch.totalY) > option.distance
        if (xUp || yUp) break
      }
      if (xUp || yUp) {
        if (len === 2) {
          this.emit('pinch', 'pinchstart', event)
          return true
        } else {
          return false
        }
      }
    } else if (state.stage === 'end') {
      this.emit('pinch', 'pinchend', event)
    } else {
      if (len > 1) {
        const t0 = state.touches[0]
        const t1 = state.touches[1]
        const x = t0.x - t1.x
        const y = t0.y - t1.y
        let distance = Math.sqrt(x * x + y * y)
        if (!state.pinchInitDistance) {
          state.pinchInitDistance = distance
          state.pinchRatio = 1
        } else {
          state.pinchRatio = distance / state.pinchInitDistance
        }
      }
      this.emit('pinch', 'pinchmove', event)
    }
  },
  defaultOption: {
    distance: 10
  }
}

export default recognizer
