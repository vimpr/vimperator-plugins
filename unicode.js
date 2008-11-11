// ==VimperatorPlugin==
// @name           unicode escape
// @description    Copy unicode escaped text to clipboard.
// @description-ja Unicode エスケープされてテキストをクリップボードにコピーする
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// @author         anekos (anekos@snca.net)
// @maxVersion     2.0pre
// @minVersion     2.0pre
// ==/VimperatorPlugin==
//
// Usage:
//    :uc <MULTI_BYTE_TEXT>
//
// Links:
//

(function () {

  function lz (s,n)
    (''+s).replace(new RegExp('^.{0,'+(n-1)+'}$'),function(s)lz('0'+s,n));

  function escape (s)
    Array.slice(s).map(function(c)let(d=c.charCodeAt(0))(d<=127?c:'\\u'+lz(d.toString(16),4))).join('');

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
