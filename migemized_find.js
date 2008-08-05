// ==VimperatorPlugin==
// @name           Migemized Find
// @description-ja デフォルトのドキュメント内検索をミゲマイズする。
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        0.1
// ==/VimperatorPlugin==
//
// Author:
//    anekos
//
// Link:
//    http://d.hatena.ne.jp/nokturnalmortum/20080805#1217941126
//
// TODO:
//    先頭の一文字で、正規表現検索などに切り替え可能にする
//    挙動が違うのを治す

(function () {

  // findMode := FIND_MODE_NATIVE | FIND_MODE_MIGEMO | FIND_MODE_REGEXP 

  let lastKeyword = null;

  liberator.search.find = function (str, backwards) {
    XMigemoFind.findMode = XMigemoFind.FIND_MODE_MIGEMO;
    XMigemoFind.find(backwards, lastKeyword = str, false);
  };

  liberator.search.findAgain = function (reverse) {
    XMigemoFind.find(reverse, lastKeyword, false);
  };

  liberator.search.searchSubmitted = function (command, forcedBackward) {
    //どうしよう
  };

  

})();
