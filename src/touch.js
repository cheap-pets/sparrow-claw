import { dispatchCustomEvent } from './dispatch-custom-event'

// global gesture status && timer
const gs = {}
let timer

function calcTouchStatus ({ identifier, pageX, pageY }, isEnd) {
  const status = gs.$touches[identifier] || {}
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
        startX: initial ? x : startX,
        startY: initial ? y : startY,
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
  for (let key in gs.$touches) {
    const touch = gs.$touches[key]
    if (touch.state === 'end') continue
    const { timestamp, startTime } = gs[key]
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
  const { $clawed, touches, changedTouches } = event
  if ($clawed) return

  timer && clearTimeout(timer)
  event.$clawed = true

  gs.touches = []
  gs.changedTouches = []

  const processed = {}
  for (let i = 0, len = touches.length; i < len; i++) {
    const status = calcTouchStatus(touches[i])
    gs.touches.push(status)
    processed[status.identifier] = status
  }
  for (let i = 0, len = changedTouches.length; i < len; i++) {
    const touch = changedTouches[i]
    gs.changedTouches.push(processed[touch.identifier] || calcTouchStatus(status, touch, true))
  }
  if (!touches.length) gs.over = true
  else timer = setTimeout(updateHoldStatus, 100)
}

function recognize (claw) {}

function initClawContext (claw, event) {
  for (let key in claw.recognizers) {
  }
  claw.current = {}
}

function touchStart (event) {
  if (gs.over) {
    delete gs.over
    gs.$touches = {}
  }
  setGestureStatus(event)
  if (!this.$claw.current) initClawContext(this.$claw)
}

function touchMove (event) {
  setGestureStatus(event)
  recognize(this.$claw)
}

function touchEnd (event) {
  setGestureStatus(event)
  recognize(this.$claw)
  if (gs.over) delete this.__claw.ctx
}

export function bindTouchEvents (el) {
  el.addEventListener('touchstart', touchStart)
  el.addEventListener('touchmove', touchMove)
  el.addEventListener('touchend', touchEnd)
}

export function unbindTouchEvents (el) {
  el.removeEventListener('touchstart', touchStart)
  el.removeEventListener('touchmove', touchMove)
  el.removeEventListener('touchend', touchEnd)
}
