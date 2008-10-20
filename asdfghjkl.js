// ==VimperatorPlugin==
// @name           asdfghjkl;
// @description    Inputting numbers by asdfghjkl; keys in hint mode.
// @description-ja Hintモードで、asdfghjkl;キーを使って数字入力をする。
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// @author         anekos (anekos@snca.net)
// ==/VimperatorPlugin==
//
// Usage:
//  In hint-mode, When press <Space>, enter into asdfghjkl; mode.
//  (If you want to leave this mode, re-press <Space>)
//
// Usage-ja:
//  ヒントモードで、<Space> を押すと asdfghjkl; モード(?)に入ります。
//  出たい場合は、もう一度押します。
//
// Links:
//  http://d.hatena.ne.jp/nokturnalmortum/20081021#1224543467
//  

{
  let asdfghjkl_default = eval(liberator.globalVariables.asdfghjkl_default || "false");
  let active = false;

  let original = {
    show: hints.show,
    onEvent: hints.onEvent,
  };

  hints.show = function () {
    active = asdfghjkl_default;
    return original.show.apply(this, arguments);
  };

  hints.onEvent = function (event) {
    let key = events.toString(event);
    if (key == "<Space>") {
      active = !active;
      return;
    }
    if (active && key.length == 1) {
      let n = ";asdfghjkl".indexOf(key);
      if (n >= 0) {
        events.feedkeys(n.toString(), true);
        return;
      }
    }
    return original.onEvent.call(this, event);
  };

}
