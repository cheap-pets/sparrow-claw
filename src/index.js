import EventEmitter from 'eventemitter3'
import recognizers from './recognizer/index'
import { isArray, isFunction, isObject, isString } from 'lodash'

function emmitEvent (el, eventName, canBubble, cancelable, detail, originalEvent) {
  let e = document.createEvent('CustomEvent')
  e.initCustomEvent(eventName, canBubble, cancelable, detail)
  e.originalEvent = originalEvent
  el.dispatchEvent(e) === false && originalEvent && originalEvent.preventDefault()
}

let activeElement

function calculateTouchState (state, event) {
  const first = state.first
  const last = state.touches ? state : null
  const timestamp = +new Date()
  const deltaTime = last ? timestamp - last.timestamp : 0
  const totalTime = first ? timestamp - first.timestamp : 0
  const current = {
    timestamp,
    deltaTime,
    totalTime
  }
  const len = event && event.touches && state.stage !== 'end' ? Math.min(event.touches.length, 2) : 0
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
    for (let prop in touches[0]) {
      current[prop] = touches[0][prop]
    }
  }
  for (let prop in current) {
    state[prop] = current[prop]
  }
  if (!state.first) state.first = current
}

class Claw extends EventEmitter {
  constructor (el, options) {
    super()
    
  }
}

function Claw (el, options) {
  const handlers = {}
  const gestureOptions = {}
  let timer
  const context = {
    el,
    emit (gestureType, eventName, originalEvent, end) {
      const handler = handlers[eventName] || handlers[gestureType] || handlers.default
      if (handler && handler(el, eventName, this.state, originalEvent) === false) return
      emmitEvent(el, eventName, false, true, this.state, originalEvent)
      end && this.end()
    },
    end () {
      if (timer) clearTimeout(timer)
      this.state = null
    }
  }
  ;(isArray(options) ? options : [options]).forEach(v => {
    if (!v) return
    const gesture = typeof v === 'string' ? { type: v } : isArray(v) ? { type: v[0], option: v[1] } : v
    const recognizer = gesture.type ? recognizers[gesture.type] : null
    recognizer &&
      (gestureOptions[gesture.type] = gesture.option
        ? Object.assign({}, recognizer.defaultOption, gesture.option)
        : recognizer.defaultOption)
  })

  function setTimer (interval) {
    timer = setTimeout(function () {
      processGesture(el, 'hold')
    }, interval)
  }

  function processGesture (el, stage, event) {
    if (timer) clearTimeout(timer)
    if (!context.state || gestureOptions.length < 1) return
    context.state.stage = stage
    calculateTouchState(context.state, event)
    if (stage === 'start') return
    const activeGesture = context.activeGesture
    let survival = false
    let interval
    if (activeGesture) {
      interval = activeGesture.option.timer
      survival = !interval && stage === 'hold'
        ? true
        : activeGesture.recognize.call(context, context.state, event, activeGesture.option) !== false
    } else {
      for (let gestureType in gestureOptions) {
        if (context.gestures[gestureType] === false) continue
        const recognize = recognizers[gestureType].recognize
        const option = gestureOptions[gestureType]
        const result = !option.timer && stage === 'hold' ? null : recognize.call(context, context.state, event, option)
        if (result === false) {
          context.gestures[gestureType] = false
        } else {
          if (result === true) {
            context.gestures[gestureType] = true
            activeElement = el
            context.activeGesture = {
              recognize,
              option
            }
          }
          option.timer && (!interval || option.timer < interval) && (interval = 100)
          survival = true
        }
      }
    }
    survival ? stage !== 'end' && interval && setTimer(interval) : context.end()
  }

  el.addEventListener('touchstart', event => {
    context.state = { stage: 'start' }
    context.activeGesture = null
    context.gestures = {}
    processGesture(el, 'start', event)
  })

  el.addEventListener('touchmove', event => {
    if (!context.state) return
    if (activeElement && activeElement !== el) {
      context.end()
      return
    }
    processGesture(el, 'move', event)
  })

  el.addEventListener('touchend', event => {
    if (context.state) {
      processGesture(el, 'end', event)
      activeElement = null
    }
    context.end()
  })

  this.on = (eventName, hanlder) => {
    if (isFunction(arguments[0])) {
      handlers.default = arguments[0]
    } else {
      handlers[eventName] = hanlder
    }
  }
}

Claw.recognizers = recognizers

new Claw(document, 'tap').on('tap', (el, eventName, state, originalEvent) => {
  emmitEvent(originalEvent.target, 'tap', true, true, state, originalEvent)
  return false
})

export default Claw
