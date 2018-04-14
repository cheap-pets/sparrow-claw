import EventTypes from './event-types'
import { hackAddEventListener, hackRemoveEventListener } from './hack-element-event'
import { bindTouchEvents, unbindTouchEvents } from './touch-event'

function register (el) {
  const claw = el.__claw = {
    listeners: {}
  }
  bindTouchEvents(el)
  return claw
}
function unregister (el) {
  unbindTouchEvents(el)
  delete el.__claw
}

hackAddEventListener(function (type, fn) {
  if (EventTypes.indexOf(type) < 0) return
  const { listeners } = this.__claw || register(this)
  if (!listeners[type]) listeners[type] = []
  listeners[type].push(fn)
})

hackRemoveEventListener(function (type, fn) {
  if (EventTypes.indexOf(type) < 0 || !this.__claw) return
  const { listeners } = this.__claw
  const tl = listeners[type]
  const idx = tl ? tl.indexOf(fn) : -1
  if (idx >= 0) {
    tl.splice(idx, 0)
    if (tl.length < 1) delete listeners[type]
    if (Object.keys(listeners).length < 1) unregister(this)
  }
})
