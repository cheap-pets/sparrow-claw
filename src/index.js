import EventTypes from './gesture-event-types'
import Recognizers from './recognizers'
import { hackAddEventListener, hackRemoveEventListener } from './hack-element-event'
import { bindTouchEvents, unbindTouchEvents } from './touch'

function register (el) {
  const claw = el.__claw = {
    listeners: {},
    recognizers: {}
  }
  bindTouchEvents(el)
  return claw
}
function unregister (el) {
  unbindTouchEvents(el)
  delete el.__claw
}

hackAddEventListener(function (type, fn) {
  const gesture = EventTypes[type]
  if (!gesture) return
  const { listeners, recognizers } = this.__claw || register(this)
  if (!listeners[type]) {
    listeners[type] = []
    if (!recognizers[gesture]) recognizers[gesture] = Recognizers[gesture]
  }
  listeners[type].push(fn)
})

hackRemoveEventListener(function (type, fn) {
  if (!EventTypes[type] || !this.__claw) return
  const { listeners } = this.__claw
  const tl = listeners[type]
  const idx = tl ? tl.indexOf(fn) : -1
  if (idx >= 0) {
    tl.splice(idx, 0)
    if (tl.length < 1) delete listeners[type]
    if (Object.keys(listeners).length < 1) unregister(this)
  }
})
