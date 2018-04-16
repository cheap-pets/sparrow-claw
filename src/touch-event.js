import { dispatchCustomEvent } from './dispatch-custom-event'

// global gesture status && timer
let gs, timer

function setTouchStatus (status, touch) {
  const { identifier, pageX, pageY } = touch
  if (status[identifier]) return
  status[identifier] = {}
}

function setGestureStatus (event) {
  const { $clawed, touches, changedTouches } = event
  if ($clawed) return

  event.$clawed = true
  const timestamp = +new Date()
  gs = gs || { startTime: timestamp }

  const deltaTime = gs.timestamp ? timestamp - gs.timestamp : 0
  const totalTime = gs.initial ? timestamp - gs.initial.timestamp : 0
  const current = {
    timestamp,
    deltaTime,
    totalTime
  }
  for (let i = 0, len = touches.length; i < len; i++) {
    setTouchStatus(current, touches[i])
  }
  for (let i = 0, len = changedTouches.length; i < len; i++) {
    setTouchStatus(current, changedTouches[i])
  }

  if (len > 0) {
    let sumX = 0
    let sumY = 0
    const touches = []
    for (let i = 0; i < len; i++) {
      let t = event.touches[i]
      let touch = {
        x: t.pageX,
        y: t.pageY
      }
      sumX += t.pageX
      sumY += t.pageY
      const firstTouch = first ? first.touches[i] : null
      const lastTouch = last ? last.touches[i] : null
      touch.totalX = firstTouch ? t.pageX - firstTouch.x : 0
      touch.totalY = firstTouch ? t.pageY - firstTouch.y : 0
      touch.deltaX = lastTouch ? t.pageX - lastTouch.x : 0
      touch.deltaY = lastTouch ? t.pageY - lastTouch.y : 0
      touch.speedX = touch.deltaX / (deltaTime || 1)
      touch.speedY = touch.deltaY / (deltaTime || 1)
      touches.push(touch)
    }
    current.centerX = len === 2 ? sumX / 2 : last ? last.centerX : undefined
    current.centerY = len === 2 ? sumY / 2 : last ? last.centerY : undefined
    current.touches = touches

    Object.assign(current, touches[0])
  }
  Object.assign(state, current)
  if (!state.first) state.first = current
}

function initContext (event) {
  const { recognizers } = this
  for (let r in recognizers) {
    
  }
  this.ctx = {}
}

function touchStart (event) {
  if (state !== false) {
    initContext.call(this.__claw)
    setGestureStatus(event)
  }
}

function touchMove (event) {
  setGestureStatus(event)
}

function touchEnd (event) {
  setGestureStatus(event)
  delete this.__claw.ctx
}

document.addEventListener('touchend', () => {
  if (state !== false) state = null
})

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
