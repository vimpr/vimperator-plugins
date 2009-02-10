//
// _smooziee.js
// 
// LICENSE: {{{
//   Copyright (c) 2009 snaka<snaka.gml@gmail.com>
// 
//     distributable under the terms of an MIT-style license.
//     http://www.opensource.jp/licenses/mit-license.html
// }}}
//
// PLUGIN INFO: {{{
var PLUGIN_INFO =
<VimperatorPlugin>
<name>smooziee</name>
<description>At j,k key scrolling to be smooth.</description>
<description lang="ja">j,kキーでのスクロールをスムースに</description>
<minVersion>2.0</minVersion>
<maxVersion>2.0pre</maxVersion>
<updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/_smooziee.js</updateURL>
<author mail="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
<license>MIT style license</license>
<version>0.9</version>
<detail><![CDATA[
== Subject ==
j,k key scrolling to be smoothly.

== Global variables ==
You can configure following variable as you like.
:smooziee_scroll_amount: Scrolling amount. Default value is 400px.
:smooziee_interval: Scrolling interval. Default value is 20ms. 

== ToDo ==

]]></detail>

<detail lang="ja"><![CDATA[
== 概要 ==
普段のj,kキーのスクロールをLDRizeライクにスムースにします。

== グローバル変数 ==
以下の変数を.vimperatorrcなどで設定することで動作を調整することができます。
:smooziee_scroll_amount:1回にスクロールする幅です。デフォルトは400pxです。
:smooziee_interval:スクロールのインターバル（単位：ミリ秒）デフォルトは30msです。

== ToDo ==
- 読み込みの順番によっては他のプラグインと競合する可能性があるのをなんとかしたい。

]]></detail>
</VimperatorPlugin>;
// }}}

(function(){
  // configurations
  var scrollAmount  = window.eval(liberator.globalVariables.smooziee_scroll_amount || 400);
  var interval      = window.eval(liberator.globalVariables.smooziee_interval || 20);

  // 
  // Private
  //
  var next = null;
  var destY = null;
  var win = function() window.content.window.wrappedJSObject;

  // direction : positive (down) / negative (up)
  function smoothScroll(amount, direction) {
    var moment = Math.floor(amount / 2);
    win().scrollBy(0, moment * direction);

    if (moment < 1) {
      setTimeout(makeScrollTo(0, destY), interval);
      destY = null;
      return;
    }
    next = setTimeout(function() smoothScroll(moment, direction), interval);
  }

  function resetDestination() {
    clearTimeout(next);
  }

  function makeScrollTo(x, y) {
    return function() {
      win().scrollTo(x, y);
    };
  }

  //
  // Mappings 
  //
  mappings.addUserMap(
    [modes.NORMAL], 
    ["j"], 
    "Smooth scroll down", 
    function(){ 
      destY = win().scrollY + scrollAmount;
      resetDestination();
      smoothScroll(scrollAmount,  1);
    }
  ); 

  mappings.addUserMap(
    [modes.NORMAL], 
    ["k"], 
    "Smooth scroll up", 
    function(){ 
      destY = win().scrollY - scrollAmount;
      resetDestination();
      smoothScroll(scrollAmount, -1);
    }
  ); 
})();
// vim: sw=2 ts=2 et si fdm=marker:
