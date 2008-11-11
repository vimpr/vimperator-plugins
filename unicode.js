// ==VimperatorPlugin==
// @name           unicode escape
// @description    Copy the escaped-unicode text to the clipboard.
// @description-ja Unicode エスケープされたテキストをクリップボードにコピーする
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// @author         anekos (anekos@snca.net)
// @maxVersion     2.0pre
// @minVersion     2.0pre
// ==/VimperatorPlugin==
//
// Usage:
//    :uc <MULTIBYTE_TEXT>
//    :uc! <ESCAPED_UNICODE_TEXT>
//
// Links:
//

(function () {

  function escape (s)
    s.toSource().replace(/^[^"]+"|"[^"]+$/g,'');

  function unescape (s)
    s.replace(/\\u([a-f\d]{4})/gi,function(_,c)String.fromCharCode(parseInt(c,16)));

  function copyAndEcho (s)
    (liberator.echo(s)+util.copyToClipboard(s));


  commands.addUserCommand(
    ['unicode', 'uc'],
    'unicode (un)escape',
    function (arg, bang)
      copyAndEcho((bang ? unescape : escape)(arg.string)),
    {argCount: '*', bang: true},
    true
  );

})();
