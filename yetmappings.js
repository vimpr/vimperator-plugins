// @name           yet mappings
// @description    display the keys that are not mapped yet.
// @description-ja まだマップされていないキーを表示する
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// @author         anekos (anekos@snca.net)
// @maxVersion     1.2
// @minVersion     2.0pre
// ==/VimperatorPlugin==
//
// Usage:
//    :yetmap[pings] [<KEYS>]
//    :ymap [<KEYS>]
//
// Links:
//    http://d.hatena.ne.jp/nokturnalmortum/20081109#1226223461
//

(function () {
  const other = '! @ # $ % ^ & * ( ) _ + | ~ { } : " < > ? - = \\ ` [ ] ; \' , . /'.split(/\s/);
  const special = 'Esc Return Tab Del BS Home Insert End Left Right Up Down PageUp PageDown F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12'.split(/\s/).map(function (it) ("<" + it + ">"));
  const alpha = 'a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(/\s/);
  const keys = alpha.concat(alpha.map(String.toUpperCase)).concat(other).concat(special);

  function exists (modes, key)
    (mappings.getCandidates(modes, key).length || mappings.get(modes, key));

  function getYetMappings (pre) {
    let result = [];
    keys.forEach(function (key) {
      if (!exists([modes.NORMAL], pre + key))
        result.push(key);
    });
    return result;
  }

  commands.addUserCommand(
    ['yetmap[pings]', 'ymap'],
    'display the keys that are not mapped yet.',
    function (arg) {
      liberator.echo(getYetMappings(arg.string || '').join(' '), commandline.FORCE_MULTILINE);
    },
    {
      argCount: '*'
    },
    true
  );

  liberator.plugins.yet_mappgins = {
    get: getYetMappings
  };
})();

