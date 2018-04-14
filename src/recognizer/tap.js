const recognizer = {
  recognize (state, event, option) {
    if (
      Math.abs(state.totalX) > option.distance ||
      Math.abs(state.totalY) > option.distance ||
      event.touches.length > 1
    ) {
      return false
    }
    if (state.stage === 'end' && (option.timespan === 0 || state.totalTime < option.timespan)) {
      this.emit('tap', 'tap', event)
    }
  },
  options: {
    timespan: 0,
    distance: 10
  }
}

export default recognizer
