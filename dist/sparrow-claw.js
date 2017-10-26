(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.SparrowClaw = factory());
}(this, (function () { 'use strict';

var recognizer = {
  recognize: function recognize(state, event, option) {
    if (Math.abs(state.totalX) > option.distance || Math.abs(state.totalY) > option.distance) {
      return false;
    }
    if (state.stage === 'end' && (option.timespan === 0 || state.totalTime < option.timespan)) {
      this.emit('tap', 'tap', event);
    }
  },

  defaultOption: {
    timespan: 0,
    distance: 10
  }
};

var recognizer$1 = {
  recognize: function recognize(state, event, option) {
    if (Math.abs(state.totalX) > option.distance || Math.abs(state.totalY) > option.distance) {
      return false;
    }
    if ((option.timer || state.stage === 'end') && state.totalTime >= option.timespan) {
      this.emit('press', 'press', event, true);
      this.end();
    }
  },

  defaultOption: {
    timespan: 500,
    distance: 10,
    timer: 500
  }
};

var GESTURE_DIRECTION = {
  ALL: 'all',
  HORIZONTAL: 'x',
  VERTICAL: 'y'
};

var recognizer$2 = {
  recognize: function recognize(state, event, option, panType) {
    if (!this.gestures[panType || 'pan']) {
      if (state.stage === 'end' || state.touches.length > 1 || state.first.touches.length > 1) return false;
      var xUp = Math.abs(state.totalX) > option.distance;
      var yUp = Math.abs(state.totalY) > option.distance;
      var dir = option.direction;
      var result = void 0;
      if (dir === GESTURE_DIRECTION.HORIZONTAL && yUp || dir === GESTURE_DIRECTION.VERTICAL && xUp) {
        result = false;
      } else if (dir !== GESTURE_DIRECTION.HORIZONTAL && yUp || dir !== GESTURE_DIRECTION.VERTICAL && xUp) {
        result = true;
        this.emit('pan', 'panstart', event);
      }
      return result;
    } else if (state.stage === 'end') {
      this.emit('pan', 'panend', event);
    } else {
      this.emit('pan', 'panmove', event);
    }
  },

  defaultOption: {
    direction: GESTURE_DIRECTION.ALL,
    distance: 10
  }
};

var xRecognizer = {
  recognize: function recognize(state, event, option) {
    return recognizer$2.recognize.call(this, state, event, option, 'panX');
  },

  defaultOption: {
    direction: GESTURE_DIRECTION.HORIZONTAL,
    distance: 10
  }
};

var yRecognizer = {
  recognize: function recognize(state, event, option) {
    return recognizer$2.recognize.call(this, state, event, option, 'panY');
  },

  defaultOption: {
    direction: GESTURE_DIRECTION.VERTICAL,
    distance: 10
  }
};

var recognizer$3 = {
  recognize: function recognize(state, event, option) {
    var len = state.touches.length;
    if (!this.gestures.pinch) {
      if (state.stage === 'end' || state.touches.length !== 2) return false;
      var xUp = void 0;
      var yUp = void 0;
      for (var i = 0; i < len; i++) {
        var touch = state.touches[i];
        xUp = Math.abs(touch.totalX) > option.distance;
        yUp = Math.abs(touch.totalY) > option.distance;
        if (xUp || yUp) break;
      }
      if (xUp || yUp) {
        if (len === 2) {
          this.emit('pinch', 'pinchstart', event);
          return true;
        } else {
          return false;
        }
      }
    } else if (state.stage === 'end') {
      this.emit('pinch', 'pinchend', event);
    } else {
      if (len > 1) {
        var t0 = state.touches[0];
        var t1 = state.touches[1];
        var x = t0.x - t1.x;
        var y = t0.y - t1.y;
        var distance = Math.sqrt(x * x + y * y);
        if (!state.pinchInitDistance) {
          state.pinchInitDistance = distance;
          state.pinchRatio = 1;
        } else {
          state.pinchRatio = distance / state.pinchInitDistance;
        }
      }
      this.emit('pinch', 'pinchmove', event);
    }
  },

  defaultOption: {
    distance: 10
  }
};

var recognizers = {
  tap: recognizer,
  press: recognizer$1,
  pan: recognizer$2,
  panX: xRecognizer,
  panY: yRecognizer,
  pinch: recognizer$3
};

var isArray = Array.isArray || function (v) {
  return {}.toString.call(v) === '[object Array]';
};

var isFunction = Array.isArray || function (v) {
  return {}.toString.call(v) === '[object Function]';
};

function mergeOption(option, defaultOption) {
  option = option || {};
  for (var attr in defaultOption) {
    option[attr] = option[attr] || defaultOption[attr];
  }
  return option;
}

function dispatchCustomEvent(el, eventName, canBubble, cancelable, detail, originalEvent) {
  var e = document.createEvent('CustomEvent');
  e.initCustomEvent(eventName, canBubble, cancelable, detail);
  e.originalEvent = originalEvent;
  el.dispatchEvent(e) === false && originalEvent && originalEvent.preventDefault();
}

var activeElement = void 0;

function calculateTouchState(state, event) {
  var first = state.first;
  var last = state.touches ? state : null;
  var timestamp = +new Date();
  var deltaTime = last ? timestamp - last.timestamp : 0;
  var totalTime = first ? timestamp - first.timestamp : 0;
  var current = {
    timestamp: timestamp,
    deltaTime: deltaTime,
    totalTime: totalTime
  };
  var len = event && event.touches && state.stage !== 'end' ? Math.min(event.touches.length, 2) : 0;
  if (len > 0) {
    var sigmaX = 0;
    var sigmaY = 0;
    var touches = [];
    for (var i = 0; i < len; i++) {
      var t = event.touches[i];
      var touch = {
        x: t.pageX,
        y: t.pageY
      };
      sigmaX += t.pageX;
      sigmaY += t.pageY;
      var firstTouch = first ? first.touches[i] : null;
      var lastTouch = last ? last.touches[i] : null;
      touch.totalX = firstTouch ? t.pageX - firstTouch.x : 0;
      touch.totalY = firstTouch ? t.pageY - firstTouch.y : 0;
      touch.deltaX = lastTouch ? t.pageX - lastTouch.x : 0;
      touch.deltaY = lastTouch ? t.pageY - lastTouch.y : 0;
      touch.speedX = touch.deltaX / (deltaTime || 1);
      touch.speedY = touch.deltaY / (deltaTime || 1);
      touches.push(touch);
    }
    current.centerX = len === 2 ? sigmaX / 2 : last ? last.centerX : undefined;
    current.centerY = len === 2 ? sigmaY / 2 : last ? last.centerY : undefined;
    current.touches = touches;
    for (var prop in touches[0]) {
      current[prop] = touches[0][prop];
    }
  }
  for (var _prop in current) {
    state[_prop] = current[_prop];
  }
  if (!state.first) state.first = current;
}

function Claw(el, options) {
  var _arguments = arguments;

  var handlers = {};
  var gestureOptions = {};
  var timer = void 0;
  var context = {
    el: el,
    emit: function emit(gestureType, eventName, originalEvent, end) {
      var handler = handlers[eventName] || handlers[gestureType] || handlers.default;
      if (handler && handler(el, eventName, this.state, originalEvent) === false) return;
      dispatchCustomEvent(el, eventName, false, true, this.state, originalEvent);
      end && this.end();
    },
    end: function end() {
      if (timer) clearTimeout(timer);
      this.state = null;
    }
  };
  (isArray(options) ? options : [options]).forEach(function (v) {
    if (!v) return;
    var gesture = typeof v === 'string' ? { type: v } : isArray(v) ? { type: v[0], option: v[1] } : v;
    var recognizer = gesture.type ? recognizers[gesture.type] : null;
    recognizer && (gestureOptions[gesture.type] = gesture.option ? mergeOption(gesture.option, recognizer.defaultOption) : recognizer.defaultOption);
  });

  function setTimer(interval) {
    timer = setTimeout(function () {
      processGesture(el, 'hold');
    }, interval);
  }

  function processGesture(el, stage, event) {
    if (timer) clearTimeout(timer);
    if (!context.state || gestureOptions.length < 1) return;
    context.state.stage = stage;
    calculateTouchState(context.state, event);
    if (stage === 'start') return;
    var activeGesture = context.activeGesture;
    var survival = false;
    var interval = void 0;
    if (activeGesture) {
      interval = activeGesture.option.timer;
      survival = !interval && stage === 'hold' ? true : activeGesture.recognize.call(context, context.state, event, activeGesture.option) !== false;
    } else {
      for (var gestureType in gestureOptions) {
        if (context.gestures[gestureType] === false) continue;
        var recognize = recognizers[gestureType].recognize;
        var option = gestureOptions[gestureType];
        var result = !option.timer && stage === 'hold' ? null : recognize.call(context, context.state, event, option);
        if (result === false) {
          context.gestures[gestureType] = false;
        } else {
          if (result === true) {
            context.gestures[gestureType] = true;
            activeElement = el;
            context.activeGesture = {
              recognize: recognize,
              option: option
            };
          }
          option.timer && (!interval || option.timer < interval) && (interval = 100);
          survival = true;
        }
      }
    }
    survival ? stage !== 'end' && interval && setTimer(interval) : context.end();
  }

  el.addEventListener('touchstart', function (event) {
    context.state = { stage: 'start' };
    context.activeGesture = null;
    context.gestures = {};
    processGesture(el, 'start', event);
  });

  el.addEventListener('touchmove', function (event) {
    if (!context.state) return;
    if (activeElement && activeElement !== el) {
      context.end();
      return;
    }
    processGesture(el, 'move', event);
  });

  el.addEventListener('touchend', function (event) {
    if (context.state) {
      processGesture(el, 'end', event);
      activeElement = null;
    }
    context.end();
  });

  this.on = function (eventName, hanlder) {
    if (isFunction(_arguments[0])) {
      handlers.default = _arguments[0];
    } else {
      handlers[eventName] = hanlder;
    }
  };
}

Claw.recognizers = recognizers;

new Claw(document, 'tap').on('tap', function (el, eventName, state, originalEvent) {
  dispatchCustomEvent(originalEvent.target, 'tap', true, true, state, originalEvent);
  return false;
});

return Claw;

})));
