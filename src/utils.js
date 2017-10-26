export const isArray = Array.isArray || (v => {
  return {}.toString.call(v) === '[object Array]';
});

export const isFunction = Array.isArray || (v => {
  return {}.toString.call(v) === '[object Function]';
});

export function mergeOption(option, defaultOption) {
  option = option || {};
  for (let attr in defaultOption) {
    option[attr] = option[attr] || defaultOption[attr];
  }
  return option;
}

export function dispatchCustomEvent (el, eventName, canBubble, cancelable, detail, originalEvent) {
  let e = document.createEvent('CustomEvent');
  e.initCustomEvent(eventName, canBubble, cancelable, detail);
  e.originalEvent = originalEvent;
  (el.dispatchEvent(e) === false) && originalEvent && originalEvent.preventDefault();
}
