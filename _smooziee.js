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
:smooziee_scroll_amount: Scrolling amount(unit:px). Default value is 400px. 
:smooziee_interval: Scrolling interval(unit:ms). Default value is 20ms. 

=== Excample === 
Set scroll amount is 300px and interval is 10ms. 
>|| 
let g:smooziee_scroll_amount="300" 
let g:smooziee_scroll_interval="10" 
||< 

== ToDo ==

]]></detail>

<detail lang="ja"><![CDATA[
== 概要 ==
普段のj,kキーのスクロールをLDRizeライクにスムースにします。

== グローバル変数 ==
以下の変数を.vimperatorrcなどで設定することで動作を調整することができます。
以下の変数を.vimperatorrcなどで設定することで動作を調整することができます。 
:smooziee_scroll_amount:1回にスクロールする幅です（単位：ピクセル）。デフォルトは"400"です。 
:smooziee_interval:スクロール時のアニメーションのインターバルです（単位：ミリ秒）。"1"以上の値を設定します。デフォルトは"20"です。 
=== 設定例 === 
スクロール量を300pxに、インターバルを10msに設定します。 
>|| 
let g:smooziee_scroll_amount="300" 
let g:smooziee_scroll_interval="10" 
||< 

== ToDo ==
- 読み込みの順番によっては他のプラグインと競合する可能性があるのをなんとかしたい。

]]></detail>
</VimperatorPlugin>;
// }}}

(function(){
  // configurations
  var scrollAmount  = 400;
  var interval      = 20;

  // 
  // Private
  //
  var next = null;
  var destY = null;
  var win = null;

  function setup() {
    win = window.content.window.wrappedJSObject;
    scrollAmount = window.eval(liberator.globalVariables.smooziee_scroll_amount) || scrollAmount; 
    interval = window.eval(liberator.globalVariables.smooziee_scroll_interval) || interval; 
  }

  // direction : positive (down) / negative (up)
  function smoothScroll(amount, direction) {
    var moment = Math.floor(amount / 2);
    win.scrollBy(0, moment * direction);

    if (moment < 1) {
      setTimeout(makeScrollTo(0, destY), interval);
      destY = null;
      return;
    }
    next = setTimeout(function() smoothScroll(moment, direction), interval);
  }

  function makeScrollTo(x, y) {
    return function() {
      win.scrollTo(x, y);
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
      setup();
      destY = win.scrollY + scrollAmount;
      clearTimeout(next);
      smoothScroll(scrollAmount,  1);
    }
  ); 

  mappings.addUserMap(
    [modes.NORMAL], 
    ["k"], 
    "Smooth scroll up", 
    function(){ 
      setup();
      destY = win.scrollY - scrollAmount;
      clearTimeout(next);
      smoothScroll(scrollAmount, -1);
    }
  ); 
})();
// vim: sw=2 ts=2 et si fdm=marker:
