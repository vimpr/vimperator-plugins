// ==VimperatorPlugin==
// @name           Migemized Find
// @description-ja デフォルトのドキュメント内検索をミゲマイズする。
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        0.3
// ==/VimperatorPlugin==
//
// Usage:
//    検索ワードの一文字目が
//      '/'  => 正規表現検索
//      '?'  => Migemo検索
//      以外 => Migemo検索
//
// Author:
//    anekos
//
// Link:
//    http://d.hatena.ne.jp/nokturnalmortum/20080805#1217941126
//
// TODO:
//  FIND_MODE_NATIVE のときうまく動かない。XUL/Migemoの問題？

(function () {

  // findMode := FIND_MODE_NATIVE | FIND_MODE_MIGEMO | FIND_MODE_REGEXP 

  let lastKeyword = null;
  let original = {};

  // 検索文字列から検索モードと検索文字列を得る。
  function getFindMode (str) {
    let [head, tail] = [str[0], str.slice(1)];
    switch (head) {
      case '/':
        return [tail, XMigemoFind.FIND_MODE_REGEXP];
      case '?':
        return [tail, XMigemoFind.FIND_MODE_MIGEMO];
      //  case '-':
      //    return [tail, XMigemoFind.FIND_MODE_NATIVE];
    }
    return [str, XMigemoFind.FIND_MODE_MIGEMO];
  }

  let migemized = {
    find: function find (str, backwards) {
      let [word, mode] = getFindMode(str);
      if (!word)
        return;
      XMigemoFind.findMode = mode;
      XMigemoFind.find(backwards, lastKeyword = word, true);
    },

    findAgain: function findAgain (reverse) {
      XMigemoFind.find(reverse, lastKeyword, true);
    },

    searchSubmitted: function searchSubmitted (command, forcedBackward) {
      XMigemoFind.clear(false);
      liberator.modes.reset();
    },

    searchCanceled: function searchCanceled () {
      XMigemoFind.clear(false);
    },
  };

  for (let name in migemized)
    original[name] = liberator.search[name];

  function set (funcs) {
    for (let name in funcs)
      liberator.search[name] = funcs[name];
  }

  set(migemized);

  liberator.plugins.migemizedFind = {
    install: function () set(migemized),
    uninstall: function () set(original),
  };

})();
