//
// prevent_focus_ietab.js
//
// LICENSE: {{{
// Copyright (c) 2009 snaka<snaka.gml@gmail.com>
//
// Distributable under the terms of an new BSD style license.
// }}}
//
// PLUGIN INFO: {{{
var PLUGIN_INFO =
<VimperatorPlugin>
  <name>prevent_focus_ietab</name>
  <description>This plugin prevents focusing IETab automaticaly.</description>
  <description lang="ja">IETabに勝手にフォーカスを奪われてそうさ不能になるのを防ぐ</description>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/prevent_focus_ietab.js</updateURL>
  <author mail="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
  <license>MIT style license</license>
  <version>1.0.1</version>
  <detail><![CDATA[
    == Subject ==
    This plugin prevents IEtab get focusing with mannerless.
    == Usage ==
    Place this file to vimp's plugin directory. That's all.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == 概要 ==
    IETabにフォーカスを勝手に奪われて操作不能になるのを防ぐ。
    == 使い方 ==
    vimpのpluginディレクトリにこのファイルを格納してください。それだけです。
  ]]></detail>
</VimperatorPlugin>;
// }}}

(function() {
  if (!gIeTab || !gIeTab.onTabSelected)
    return;

  liberator.log("replace IeTab.onTabSelected() function");
  var func = gIeTab.onTabSelected.toSource();
  var newFunc = func.replace(/window\.setTimeout\(gIeTab\.focusIeTab, 0\);/, '');
  gIeTab.removeEventListener("appcontent", "select", gIeTab.onTabSelected);
  gIeTab.addEventListener("appcontent", "select", new Function(newFunc));
})();

// vim:sw=2 ts=2 et si fdm=marker:
