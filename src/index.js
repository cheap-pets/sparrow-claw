import { isArray, isFunction, isObject, isString } from 'lodash'
import { dispatchCustomEvent, hackAddEventListener, hackRemoveEventListener } from './event'

const EventTypes = [
  'tap',
  'press',
  'panstart',
  'panmove',
  'panend',
  'panx',
  'panxstart',
  'panxmove',
  'panxend',
  'panystart',
  'panymove',
  'panyend',
  'pinchstart',
  'pinchmove',
  'pinchend'
]

function registerListener (el, type, fn) {
  if (EventTypes.indexOf(type) < 0) return
  el.__claw || (el.__claw = { listeners: {} })
  const listeners = el.__claw.listeners
  if (!listeners[type]) listeners[type] = []
  listeners[type].push(fn)
}
function unregisterListener (el, type, fn) {
  if (EventTypes.indexOf(type) < 0 || !el.__claw) return
  const listeners = el.__claw.listeners
  const tl = listeners[type]
  const idx = tl ? tl.indexOf(fn) : -1
  if (idx >= 0) {
    tl.splice(idx, 0)
    if (tl.length < 1) delete listeners[type]
    if (Object.keys(listeners).length < 1) delete el.__claw
  }
}

hackAddEventListener(function (type, fn) {
  registerListener(this, type, fn)
})

hackRemoveEventListener(function (type, fn) {
  unregisterListener(this, type, fn)
})
