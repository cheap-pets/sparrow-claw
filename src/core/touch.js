const touchable = !!document.createTouch

// global gesture status && timer
const gs = { $touches: {} }
let timer

function calcTouchStatus ({ identifier, pageX, pageY, target }, isEnd) {
  const status = gs.$touches[identifier] || { identifier }
  let { timestamp, startTime, x, y, startX, startY } = status
  const initial = !timestamp
  const now = +new Date()
  const deltaX = initial ? 0 : pageX - x
  const deltaY = initial ? 0 : pageY - y
  const totalTime = initial ? 0 : now - startTime
  const deltaTime = initial ? 0 : now - timestamp
  timestamp = now
  startTime = initial ? now : startTime
  Object.assign(
    status,
    {
      timestamp,
      deltaTime,
      totalTime,
      target,
      state: isEnd ? 'end' : initial ? 'start' : 'hold'
    },
    isEnd
      ? {}
      : {
        startTime,
        x: pageX,
        y: pageY,
        deltaX,
        deltaY,
        startX: initial ? pageX : startX,
        startY: initial ? pageY : startY,
        totalX: initial ? 0 : pageX - startX,
        totalY: initial ? 0 : pageY - startY,
        speedX: deltaX / (deltaTime || 1),
        speedY: deltaY / (deltaTime || 1)
      }
  )
  if (initial) gs.$touches[identifier] = status
  return status
}

function updateHoldStatus () {
  if (gs.activeElement) return
  for (let key in gs.$touches) {
    const touch = gs.$touches[key]
    const { timestamp, startTime, state } = touch
    if (state === 'end') continue
    const now = +new Date()
    Object.assign(touch, {
      timestamp: now,
      totalTime: now - startTime,
      deltaTime: now - timestamp,
      deltaX: 0,
      deltaY: 0,
      speedX: 0,
      speedY: 0,
      state: 'hold'
    })
  }
  timer = setTimeout(updateHoldStatus, 100)
}

function setGestureStatus (event) {
  const { $clawed, touches, targetTouches, changedTouches, type, pageX, pageY } = event
  if ($clawed) return

  timer && clearTimeout(timer)
  event.$clawed = true

  gs.touches = []
  gs.targetTouches = []
  gs.changedTouches = []

  if (touchable) {
    const processed = {}
    for (let i = 0, len = touches.length; i < len; i++) {
      const status = calcTouchStatus(touches[i])
      gs.touches.push(status)
      processed[status.identifier] = status
    }
    for (let i = 0, len = changedTouches.length; i < len; i++) {
      const touch = changedTouches[i]
      const status = processed[touch.identifier] || calcTouchStatus(touch, true)
      gs.changedTouches.push(status)
      processed[touch.identifier] = status
    }
    for (let i = 0, len = targetTouches.length; i < len; i++) {
      gs.targetTouches.push(processed[targetTouches[i].identifier])
    }
  } else {
    if (type !== 'mousedown' && !Object.keys(gs.$touches).length) return
    const status = calcTouchStatus({ identifier: 0, pageX, pageY }, type === 'mouseup')
    if (type !== 'mouseup') gs.touches.push(status)
    gs.changedTouches.push(status)
    gs.targetTouches.push(status)
  }
  if ((type === 'mouseup') || (touches && !touches.length)) {
    gs.over = true
  } else {
    timer = setTimeout(updateHoldStatus, 100)
  }
}

function recognize (el, event) {
  const rs = el.$claw.current
  for (let key in rs) {
    if (gs.activeGesture && gs.activeGesture !== key) continue
    const recognized = rs[key].recognize(el, gs, event)
    if (recognized === false) {
      delete rs[key]
    } else if (recognized === true) {
      clearTimeout(timer)
      gs.activeElement = el
      gs.activeGesture = key
      break
    }
  }
  if (gs.activeGesture && el !== document) event.preventDefault()
}

function initClawContext (claw, event) {
  claw.current = {}
  for (let key in claw.recognizers) {
    claw.current[key] = claw.recognizers[key]
  }
}

function touchStart (event) {
  if (gs.over) {
    gs.$touches = {}
    delete gs.over
    delete gs.activeElement
    delete gs.activeGesture
  }
  if (gs.activeElement && gs.activeElement !== this) return
  setGestureStatus(event)
  if (!this.$claw.current) initClawContext(this.$claw)
  recognize(this, event)
}

function touchMove (event) {
  if (gs.activeElement && gs.activeElement !== this) return
  setGestureStatus(event)
  recognize(this, event)
}

function touchEnd (event) {
  if (gs.activeElement && gs.activeElement !== this) {
    delete this.$claw.current
    return
  }
  setGestureStatus(event)
  recognize(this, event)
  if (gs.over) delete this.$claw.current
}

const touchstart = touchable ? 'touchstart' : 'mousedown'
const touchmove = touchable ? 'touchmove' : 'mousemove'
const touchend = touchable ? 'touchend' : 'mouseup'

export function bindTouchEvents (el) {
  el.addEventListener(touchstart, touchStart)
  el.addEventListener(touchmove, touchMove)
  el.addEventListener(touchend, touchEnd)
}

export function unbindTouchEvents (el) {
  el.removeEventListener(touchstart, touchStart)
  el.removeEventListener(touchmove, touchMove)
  el.removeEventListener(touchend, touchEnd)
}
