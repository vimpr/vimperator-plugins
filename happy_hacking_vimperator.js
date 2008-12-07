// ==VimperatorPlugin==
// @name           Happy Hacking Vimperator
// @description    for True Vimperatorer!!
// @description-ja for True Vimperatorer!!
// @license        Creative Commons Attribution-Share Alike 3.0 Unported
// @version        1.0
// @author         anekos (anekos@snca.net)
// @minVersion     2.0pre
// @maxVersion     2.0pre
// @requirements   Steel Heart
// ==/VimperatorPlugin==
//
// Usage:
//    DON NOT THINK. FEEL!
//
// Links:
//    Unbroken keyboard:
//        http://www.pfu.fujitsu.com/hhkeyboard/
//
// License:
//    http://creativecommons.org/licenses/by-sa/3.0/

(function () {
  return;

  let enabled = s2b(liberator.globalVariables.happy_hacking_vimperator_enable, true);
  let ignore = false;

  function s2b (s, d) (!/^(\d+|false)$/i.test(s)|parseInt(s)|!!d*2)&1<<!s;

  function around (obj, name, func) {
    let next = obj[name];
    obj[name] = function ()
      let (self = this, args = arguments)
        func.call(self,
                  function () next.apply(self, args),
                  args);
  };

  function kill (msg) {
    return function (event) {
      if (ignore || !enabled)
        return;
      event.preventDefault();
      event.stopPropagation();
      if (msg)
        liberator.echoerr('Kill the mouse!')
    }
  }

  around(buffer, 'followLink', function (next) {
    ignore = true;
    try {
      next();
    } finally {
      ignore = false;
    }
  });

  window.addEventListener('keypress', function  (event) {
    let elem = window.document.commandDispatcher.focusedElement;
    if (events.toString(event) == '<Return>' && elem && elem.form) {
      ignore = true;
      setTimeout(function () ignore = false, 200);
    }
  }, true);

  [
    ['mousemove', 'DOMMouseScroll'],
    ['mousedown', 'mouseup', 'dblclick', 'click']
  ].forEach(
    function (names, msg)
      names.forEach(function (name) window.addEventListener(name, kill(msg), true))
  );


})();

// vim:sw=2 ts=2 et si fdm=marker:
