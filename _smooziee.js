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
  <minVersion>2.3pre</minVersion>
  <maxVersion>2.3</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/_smooziee.js</updateURL>
  <author mail="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
  <license>MIT style license</license>
  <version>0.10.1</version>
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

    == API ==
    >||
    smooziee.smoothScrollBy(amount);
    ||<
    Example.
    >||
    :js liberator.plugins.smooziee.smoothScrollBy(600)
    :js liberator.plugins.smooziee.smoothScrollBy(-600)
    ||<

    == ToDo ==

  ]]></detail>

  <detail lang="ja"><![CDATA[
    == 概要 ==
    普段のj,kキーのスクロールをLDRizeライクにスムースにします。

    == グローバル変数 ==
    以下の変数を.vimperatorrcなどで設定することで動作を調整することができます。
    :smooziee_scroll_amount:
      1回にスクロールする幅です（単位：ピクセル）。デフォルトは"400"です。
    :smooziee_interval:
      スクロール時のアニメーションのインターバルです（単位：ミリ秒）。
      "1"以上の値を設定します。デフォルトは"20"です。
    === 設定例 ===
    スクロール量を300pxに、インターバルを10msに設定します。
    >||
    let g:smooziee_scroll_amount="300"
    let g:smooziee_scroll_interval="10"
    ||<

    == API ==
    他のキーにマップする場合やスクリプトから呼び出せるようAPIを用意してます。
    >||
    smooziee.smoothScrollBy(amount);
    ||<
    amountにはスクロール量(ピクセル)を指定してください。正の値で下方向へ負の値で上方向へスクロールします。

    Example.
    >||
    :js liberator.plugins.smooziee.smoothScrollBy(600)
    :js liberator.plugins.smooziee.smoothScrollBy(-600)
    ||<

    == ToDo ==
    - 読み込みの順番によっては他のプラグインと競合する可能性があるのをなんとかしたい。

  ]]></detail>
</VimperatorPlugin>;
// }}}

let self = liberator.plugins.smooziee = (function(){

  // Mappings  {{{
  mappings.addUserMap(
    [modes.NORMAL],
    ["j"],
    "Smooth scroll down",
    function(count){
      self.smoothScrollBy(getScrollAmount() * (count || 1));
    },
    {
      count: true
    }
  );
  mappings.addUserMap(
    [modes.NORMAL],
    ["k"],
    "Smooth scroll up",
    function(count){
      self.smoothScrollBy(getScrollAmount() * -(count || 1));
    },
    {
      count: true
    }
  );
  // }}}
  // PUBLIC {{{
  var PUBLICS = {
    smoothScrollBy: function(moment) {
      win = Buffer.findScrollableWindow();
      interval = window.eval(liberator.globalVariables.smooziee_scroll_interval) || 20;
      destY = win.scrollY + moment;
      clearTimeout(next);
      smoothScroll(moment);
    }
  }

  // }}}
  // PRIVATE {{{
  var next;
  var destY;
  var win;
  var interval;

  function getScrollAmount() window.eval(liberator.globalVariables.smooziee_scroll_amount) || 400;

  function smoothScroll(moment) {
    if (moment > 0)
      moment = Math.floor(moment / 2);
    else
      moment = Math.ceil(moment / 2);

    win.scrollBy(0, moment);

    if (Math.abs(moment) < 1) {
      setTimeout(makeScrollTo(win.scrollX, destY), interval);
      destY = null;
      return;
    }
    next = setTimeout(function() smoothScroll(moment), interval);
  }

  function makeScrollTo(x, y) function() win.scrollTo(x, y);
  // }}}
  return PUBLICS;
})();
// vim: sw=2 ts=2 et si fdm=marker:
