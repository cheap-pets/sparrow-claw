(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.SparrowClaw = {})));
}(this, (function (exports) { 'use strict';

if (!Object.assign) {
  Object.assign = function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
}

var EventTypes = {
  'tap': 'tap',
  'press': 'press',
  'panstart': 'pan',
  'panmove': 'pan',
  'panend': 'pan',
  'panxstart': 'panx',
  'panxmove': 'panx',
  'panxend': 'panx',
  'panystart': 'pany',
  'panymove': 'pany',
  'panyend': 'pany',
  'pinchstart': 'pinch',
  'pinchmove': 'pinch',
  'pinchend': 'pinch'
};

function dispatchCustomEvent(el, type, status, options) {
  var _ref = options || {},
      canBubble = _ref.canBubble,
      cancelable = _ref.cancelable,
      detail = _ref.detail,
      originalEvent = _ref.originalEvent,
      originalTarget = _ref.originalTarget;

  var event = document.createEvent('CustomEvent');
  event.initCustomEvent(type, canBubble === undefined ? false : canBubble, cancelable === undefined ? true : cancelable, detail);
  event.gestureStatus = status;
  if (originalTarget) event.originalTarget = originalTarget;
  if (originalEvent) event.originalEvent = originalEvent;
  if (el.dispatchEvent(event) === false && originalEvent) {
    originalEvent.preventDefault();
    originalEvent.stopPropagation();
  }
}

var tap = {
  recognize: function recognize(el, status, event) {
    var _options = this.options,
        distance = _options.distance,
        timespan = _options.timespan;
    var _status$changedTouche = status.changedTouches[0],
        totalX = _status$changedTouche.totalX,
        totalY = _status$changedTouche.totalY,
        totalTime = _status$changedTouche.totalTime,
        state = _status$changedTouche.state,
        target = _status$changedTouche.target;

    if (timespan > 0 && totalTime > timespan || Math.abs(totalX) > distance || Math.abs(totalY) > distance) {
      return false;
    } else if (state === 'end') {
      dispatchCustomEvent(el, 'tap', status, {
        originalEvent: event,
        originalTarget: target,
        canBubble: true
      });
      return true;
    }
  },

  options: {
    timespan: 0,
    distance: 10
  },
  eventTypes: ['tap']
};

function check(el, status, touch, options) {
  if (status.activeElement) return;
  var distance = options.distance,
      timespan = options.timespan;
  var totalX = touch.totalX,
      totalY = touch.totalY,
      startTime = touch.startTime,
      state = touch.state;

  var totalTime = +new Date() - startTime;
  if (state === 'end' && totalTime < timespan || Math.abs(totalX) > distance || Math.abs(totalY) > distance) {
    return false;
  } else if (totalTime >= timespan) {
    dispatchCustomEvent(el, 'press', status);
    return true;
  }
}

var press = {
  recognize: function recognize(el, status) {
    var _this = this;

    var touch = status.changedTouches[0];
    var recognized = check(el, status, touch, this.options);
    if (recognized === undefined) {
      setTimeout(function () {
        var recognized = check(el, status, touch, _this.options);
        if (recognized) {
          status.activeElement = el;
          status.activeGesture = 'press';
        } else if (recognized === false && el.$claw.current) {
          delete el.$claw.current.press;
        }
      }, this.options.timer);
    }
    return recognized;
  },

  options: {
    timespan: 1000,
    distance: 10,
    timer: 1000
  },
  eventTypes: ['press']
};

var GESTURE_DIRECTION = {
  ALL: 'all',
  HORIZONTAL: 'x',
  VERTICAL: 'y'
};

var pan = {
  recognize: function recognize(el, status, event, direction) {
    var eventName = 'pan' + (direction || '');
    var activeGesture = status.activeGesture;
    var distance = this.options.distance;
    var _status$changedTouche = status.changedTouches[0],
        totalX = _status$changedTouche.totalX,
        totalY = _status$changedTouche.totalY,
        state = _status$changedTouche.state;

    var x = Math.abs(totalX);
    var y = Math.abs(totalY);
    if (!activeGesture) {
      if (direction === GESTURE_DIRECTION.HORIZONTAL && y > distance || direction === GESTURE_DIRECTION.VERTICAL && x > distance) {
        return false;
      } else if (x > distance || y > distance) {
        dispatchCustomEvent(el, eventName + 'start', status);
        return true;
      }
    } else if (state === 'end') {
      dispatchCustomEvent(el, eventName + 'end', status);
      return false;
    } else {
      dispatchCustomEvent(el, eventName + 'move', status);
    }
  },

  options: {
    distance: 10
  },
  eventTypes: ['panstart', 'panmove', 'panend']
};

var panx = {
  recognize: function recognize(el, status, event) {
    return pan.recognize(el, status, event, GESTURE_DIRECTION.HORIZONTAL);
  },

  eventTypes: ['panxstart', 'panxmove', 'panxend']
};

var pany = {
  recognize: function recognize(el, status, event) {
    return pan.recognize(el, status, event, GESTURE_DIRECTION.VERTICAL);
  },

  eventTypes: ['panystart', 'panymove', 'panyend']
};



var Recognizers = Object.freeze({
	tap: tap,
	press: press,
	pan: pan,
	panx: panx,
	pany: pany
});

function hackAdd(fn, prototype) {
  var oFn = prototype.addEventListener;
  prototype.addEventListener = function (type, listener, options) {
    fn.call(this, type, listener);
    oFn.call(this, type, listener, options);
  };
}

function hackRemove(fn, prototype) {
  var oFn = prototype.removeEventListener;
  prototype.removeEventListener = function (type, listener, options) {
    fn.call(this, type, listener);
    oFn.call(this, type, listener, options);
  };
}

function hackAddEventListener(fn) {
  hackAdd(fn, Element.prototype);
  hackAdd(fn, Document.prototype);
}
function hackRemoveEventListener(fn) {
  hackRemove(fn, Element.prototype);
  hackRemove(fn, Document.prototype);
}

var touchable = !!document.createTouch;

// global gesture status && timer
var gs = { $touches: {} };
var timer = void 0;

function calcTouchStatus(_ref, isEnd) {
  var identifier = _ref.identifier,
      target = _ref.target,
      pageX = _ref.pageX,
      pageY = _ref.pageY,
      screenX = _ref.screenX,
      screenY = _ref.screenY;

  var status = gs.$touches[identifier] || { identifier: identifier };
  var timestamp = status.timestamp,
      startTime = status.startTime,
      x = status.x,
      y = status.y,
      startX = status.startX,
      startY = status.startY;

  var initial = !timestamp;
  var now = +new Date();
  var deltaX = initial ? 0 : screenX - x;
  var deltaY = initial ? 0 : screenY - y;
  var totalTime = initial ? 0 : now - startTime;
  var deltaTime = initial ? 0 : now - timestamp;
  timestamp = now;
  startTime = initial ? now : startTime;
  Object.assign(status, {
    timestamp: timestamp,
    deltaTime: deltaTime,
    totalTime: totalTime,
    target: target,
    state: isEnd ? 'end' : initial ? 'start' : 'hold'
  }, isEnd ? {} : {
    startTime: startTime,
    x: screenX,
    y: screenY,
    pageX: pageX,
    pageY: pageY,
    deltaX: deltaX,
    deltaY: deltaY,
    startX: initial ? screenX : startX,
    startY: initial ? screenY : startY,
    totalX: initial ? 0 : screenX - startX,
    totalY: initial ? 0 : screenY - startY,
    speedX: deltaX / (deltaTime || 1),
    speedY: deltaY / (deltaTime || 1)
  });
  if (initial) gs.$touches[identifier] = status;
  return status;
}

function updateHoldStatus() {
  if (gs.activeElement) return;
  for (var key in gs.$touches) {
    var touch = gs.$touches[key];
    var timestamp = touch.timestamp,
        startTime = touch.startTime,
        state = touch.state;

    if (state === 'end') continue;
    var now = +new Date();
    Object.assign(touch, {
      timestamp: now,
      totalTime: now - startTime,
      deltaTime: now - timestamp,
      deltaX: 0,
      deltaY: 0,
      speedX: 0,
      speedY: 0,
      state: 'hold'
    });
  }
  timer = setTimeout(updateHoldStatus, 100);
}

function setGestureStatus(event) {
  var $clawed = event.$clawed,
      touches = event.touches,
      targetTouches = event.targetTouches,
      changedTouches = event.changedTouches,
      type = event.type,
      screenX = event.screenX,
      screenY = event.screenY;

  if ($clawed) return;

  timer && clearTimeout(timer);
  event.$clawed = true;

  gs.touches = [];
  gs.targetTouches = [];
  gs.changedTouches = [];

  if (touchable) {
    var processed = {};
    for (var i = 0, len = touches.length; i < len; i++) {
      var status = calcTouchStatus(touches[i]);
      gs.touches.push(status);
      processed[status.identifier] = status;
    }
    for (var _i = 0, _len = changedTouches.length; _i < _len; _i++) {
      var touch = changedTouches[_i];
      var _status = processed[touch.identifier] || calcTouchStatus(touch, true);
      gs.changedTouches.push(_status);
      processed[touch.identifier] = _status;
    }
    for (var _i2 = 0, _len2 = targetTouches.length; _i2 < _len2; _i2++) {
      gs.targetTouches.push(processed[targetTouches[_i2].identifier]);
    }
  } else {
    if (type !== 'mousedown' && !Object.keys(gs.$touches).length) return;
    var _status2 = calcTouchStatus({ identifier: 0, screenX: screenX, screenY: screenY }, type === 'mouseup');
    if (type !== 'mouseup') gs.touches.push(_status2);
    gs.changedTouches.push(_status2);
    gs.targetTouches.push(_status2);
  }
  if (type === 'mouseup' || touches && !touches.length) {
    gs.over = true;
  } else {
    timer = setTimeout(updateHoldStatus, 100);
  }
}

function recognize(el, event) {
  var rs = el.$claw.current;
  for (var key in rs) {
    if (gs.activeGesture && gs.activeGesture !== key) continue;
    var recognized = rs[key].recognize(el, gs, event);
    if (recognized === false) {
      delete rs[key];
    } else if (recognized === true) {
      clearTimeout(timer);
      gs.activeElement = el;
      gs.activeGesture = key;
      break;
    }
  }
  if (gs.activeGesture && el !== document) event.preventDefault();
}

function initClawContext(claw, event) {
  claw.current = {};
  for (var key in claw.recognizers) {
    claw.current[key] = claw.recognizers[key];
  }
}

function touchStart(event) {
  if (gs.over) {
    gs.$touches = {};
    delete gs.over;
    delete gs.activeElement;
    delete gs.activeGesture;
  }
  if (gs.activeElement && gs.activeElement !== this) return;
  setGestureStatus(event);
  if (!this.$claw.current) initClawContext(this.$claw);
  recognize(this, event);
}

function touchMove(event) {
  if (gs.activeElement && gs.activeElement !== this) return;
  setGestureStatus(event);
  recognize(this, event);
}

function touchEnd(event) {
  if (gs.activeElement && gs.activeElement !== this) {
    delete this.$claw.current;
    return;
  }
  setGestureStatus(event);
  recognize(this, event);
  if (gs.over) delete this.$claw.current;
}

var touchstart = touchable ? 'touchstart' : 'mousedown';
var touchmove = touchable ? 'touchmove' : 'mousemove';
var touchend = touchable ? 'touchend' : 'mouseup';

function bindTouchEvents(el) {
  el.addEventListener(touchstart, touchStart);
  el.addEventListener(touchmove, touchMove);
  el.addEventListener(touchend, touchEnd);
}

function unbindTouchEvents(el) {
  el.removeEventListener(touchstart, touchStart);
  el.removeEventListener(touchmove, touchMove);
  el.removeEventListener(touchend, touchEnd);
}

function register(el) {
  var claw = el.$claw = {
    listeners: {},
    recognizers: {}
  };
  bindTouchEvents(el);
  return claw;
}
function unregister(el) {
  unbindTouchEvents(el);
  delete el.$claw;
}

hackAddEventListener(function (type, fn) {
  var gesture = EventTypes[type];
  if (!gesture) return;

  var _ref = this.$claw || register(this),
      listeners = _ref.listeners,
      recognizers = _ref.recognizers;

  if (!listeners[type]) {
    listeners[type] = [];
    if (!recognizers[gesture]) recognizers[gesture] = Recognizers[gesture];
  }
  listeners[type].push(fn);
});

hackRemoveEventListener(function (type, fn) {
  if (!EventTypes[type] || !this.$claw) return;
  var listeners = this.$claw.listeners;

  var tl = listeners[type];
  var idx = tl ? tl.indexOf(fn) : -1;
  if (idx >= 0) {
    tl.splice(idx, 0);
    if (tl.length < 1) delete listeners[type];
    if (Object.keys(listeners).length < 1) unregister(this);
  }
});

function getClientPosition(el) {
  var _el$parentNode$getBou = el.parentNode.getBoundingClientRect(),
      top = _el$parentNode$getBou.top,
      left = _el$parentNode$getBou.left;

  var offsetTop = el.offsetTop,
      offsetLeft = el.offsetLeft;

  var rect = el.getBoundingClientRect();
  return {
    top: rect.top - top - offsetTop,
    left: rect.left - left - offsetLeft
  };
}

function getTransformY(_ref) {
  var style = _ref.style;

  var s = style.transform || style.webkitTransform || '';
  var t = s.match(/translate3d\(\dpx,([^)]*)/);
  var v = t ? t[1] : 0;
  return parseInt(v, 10);
}

function setTransformY(_ref2, y) {
  var style = _ref2.style;

  style.transform = 'translate3d(0,' + y + 'px,0)';
  style.webkitTransform = 'translate3d(0,' + y + 'px,0)';
}

function setTransitionDuration(_ref3, s) {
  var style = _ref3.style;

  style.transitionDuration = s + 's';
  style.webkitTransitionDuration = s + 's';
}

function setTransitionTimingFunction(_ref4, type) {
  var style = _ref4.style;

  style.transitionTimingFunction = type;
  style.webkitTransitionTimingFunction = type;
}

function getMinY(el) {
  var y = el.parentNode.clientHeight - el.offsetHeight - el.offsetTop;
  return y > 0 ? 0 : y;
}

function isOut(y, minY) {
  return y > 0 || y < minY;
}

var scroller = {
  attach: function attach(el) {
    el.addEventListener('touchstart', function (event) {
      setTransformY(el, getClientPosition(el).top);
      setTransitionDuration(el, 0);
    });
    el.addEventListener('panymove', function (event) {
      var gs = event.gestureStatus;
      var deltaY = gs.changedTouches[0].deltaY;

      var transY = getTransformY(el);
      var minY = getMinY(el);
      if (isOut(transY + deltaY, minY)) {
        deltaY /= 2;
      }
      var newY = transY + deltaY;
      setTransformY(this, newY);
      gs.scrollMinY = minY;
      gs.scrollY = newY;
    });
    el.addEventListener('panyend', function (event) {
      var gs = event.gestureStatus;
      var speedY = gs.changedTouches[0].speedY;

      if (speedY < -3) speedY = -3;else if (speedY > 3) speedY = 3;
      var at = speedY > 0 ? 0.0025 : -0.0025;
      var t = Math.abs(speedY / at);
      var s = speedY * t - at * t * t / 2;
      var transY = getTransformY(el);
      var minY = getMinY(el);
      var newY = transY + s;
      var timingFn = 'cubic-bezier(0, 0, 0.25, 1.5)';
      if (isOut(transY, minY)) {
        newY = transY > 0 ? 0 : minY;
        t = 300;
      } else if (isOut(newY, minY)) {
        newY = newY > 0 ? 0 : minY;
        t = Math.abs(newY - transY) + 200;
      } else {
        t = t * 2;
        timingFn = 'cubic-bezier(0, 0, 0.25, 1)';
      }
      setTransitionTimingFunction(el, timingFn);
      setTransitionDuration(el, t / 1000);
      setTransformY(this, newY);
      gs.scrollMinY = minY;
      gs.scrollY = transY;
      gs.scrollDirection = speedY > 0 ? 1 : speedY < 0 ? -1 : 0;
    });
    el.$setScrollTop = function (top) {
      setTransformY(this, top || 0);
    };
  }
};

exports.Recognizers = Recognizers;
exports.scroller = scroller;

Object.defineProperty(exports, '__esModule', { value: true });

})));
