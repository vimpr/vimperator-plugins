// ==VimperatorPlugin==
// @name           echopy
// @description    echo and copy
// @description-ja echo and copy
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// @author         anekos (anekos@snca.net)
// @maxVersion     2.0pre
// @minVersion     2.0pre
// ==/VimperatorPlugin==
//
// Usage:
//    :echo <EXPRESSION>
//      echo with copy (to clipboard).
//
// Usage-ja:
//    :echo <EXPRESSION>
//      echo すると同時にクリップボードにコピー
//
// Links:
//    http://d.hatena.ne.jp/nokturnalmortum/20081111#1226414487

(function () {

  function neko (obj, useColor) {
    switch (typeof obj) {
      case 'object':
        return liberator.modules.util.objectToString(obj, useColor);
      case 'function':
        return liberator.modules.util.escapeHTML(obj.toString());
      case 'number':
      case 'boolean':
        return '' + obj;
      case 'undefined':
        return 'undefined';
    }
    return obj;
  }

  let echo = commands.get('echo');
  let original_action = echo.action;

  echo.action = function (arg, bang) {
    if (bang) {
      try {
        if (arg.string == '')
          return;
        let obj = liberator.eval(arg.string);
        liberator.echo(neko(obj, true));
        liberator.modules.util.copyToClipboard(neko(obj, false));
      } catch (e) {
        liberator.echoerr(e);
      }
    } else {
      original_action.apply(this, arguments);
    }
  };
  echo.bang = true;


})();
