const recognizer = {
  recognize (state, event, option) {
    if (
      Math.abs(state.totalX) > option.distance ||
      Math.abs(state.totalY) > option.distance ||
      event.touches.length > 1
    ) {
      return false
    }
    if ((option.timer || state.stage === 'end') && state.totalTime >= option.timespan) {
      this.emit('press', 'press', event, true)
    }
  },
  options: {
    timespan: 500,
    distance: 10,
    timer: 500
  }
}

export default recognizer
