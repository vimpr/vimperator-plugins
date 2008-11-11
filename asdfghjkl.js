// ==VimperatorPlugin==
// @name           asdfghjkl;
// @description    Inputting numbers by asdfghjkl; keys in hint mode.
// @description-ja Hintモードで、asdfghjkl;キーを使って数字入力をする。
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.3
// @minVersion     2.0pre
// @maxVersion     2.0pre
// @author         anekos (anekos@snca.net)
// ==/VimperatorPlugin==
//
// Usage:
//  In hint-mode, When press <Space>, enter into asdfghjkl; mode.
//  (If you want to leave this mode, re-press <Space>)
//
//  You can change the keybind for enter into asdfghjkl like below:
//    let g:asdfghjkl_mode_change_key = "<C-c>"
//
//  You can also change the keys for inputting numbers like below:
//    let g:asdfghjkl_hintchars = "/zxcvbnm,."
//
//  Note that the numbers 0-9 are corresponding to
//  characters from the left side to the right side of the string.
//
// Usage-ja:
//  ヒントモードで、<Space> を押すと asdfghjkl; モード(?)に入ります。
//  出たい場合は、もう一度押します。
//
//  切り替えキーを変更したい場合は、以下のように設定できます。
//    let g:asdfghjkl_mode_change_key = "<C-c>"
//
//  数字入力のためのキーは、以下のように変更出来ます。
//    let g:asdfghjkl_hintchars = "/zxcvbnm,."
//  それぞれの文字は左側から0-9の数字の入力に対応します。
//
//
// Links:
//  http://d.hatena.ne.jp/nokturnalmortum/20081021#1224543467
//

(function () {
  let asdfghjkl_default = eval(liberator.globalVariables.asdfghjkl_default || 'false');
  let mode_change_key = liberator.globalVariables.asdfghjkl_mode_change_key || '<Space>';
  let useShift = eval(liberator.globalVariables.asdfghjkl_useShift || 'false');
  let asdfghjkl_hintchars = liberator.globalVariables.asdfghjkl_hintchars || ";asdfghjkl";
  let active = false;

  let original = {
    show: hints.show,
    onKeyPress: events.onKeyPress,
  };

  events.onKeyPress = function (event) {
    if (modes.extended & modes.HINTS) {
      let act = active;
      let key = events.toString(event);
      liberator.log(act);
      if (key == mode_change_key) {
        active = !active;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (key.length == 1) {
        if (useShift && event.shiftKey) {
          act = !act;
          key = key.toLowerCase();
        }
        if (act) {
          let n = asdfghjkl_hintchars.indexOf(key);
          if (n >= 0) {
            events.feedkeys(n.toString(), true);
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }
      }
    }
    return original.onKeyPress.call(this, event);
  };

  hints.show = function () {
    active = asdfghjkl_default;
    return original.show.apply(this, arguments);
  };

})();
