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
// INFO: {{{
var INFO = xml`
<plugin name="smooziee" version="0.10.2"
        href="https://github.com/vimpr/vimperator-plugins/raw/master/_smooziee.js"
        summary="j,kキーでのスクロールをスムースに"
        lang="en_US"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
  <project name="Vimperator" minVersion="3.6"/>
  <license>MIT style license</license>
  <p>j,k key scrolling to be smoothly.</p>
  <h3 tag="smooziee_global_variables">Global vriables</h3>
  <p>You can configure following variable as you like.</p>
  <dl>
    <dt>smooziee_scroll_amount</dt><dd>Scrolling amount(unit:px). Default value is 400px.</dd>
    <dt>smooziee_interval</dt><dd>Scrolling interval(unit:ms). Default value is 20ms.</dd>
  </dl>
  <h3 tag="smooziee_example">Example</h3>
  <p>Set scroll amount is 300px and interval is 10ms.</p>
  <code><ex><![CDATA[
    let g:smooziee_scroll_amount="300"
    let g:smooziee_scroll_interval="10"
  ]]></ex></code>
  <h3 tag="smooziee_API">API</h3>
  <code>smooziee.smoothScrollBy(amount);</code>
  <p>Example</p>
  <code><ex><![CDATA[
    :js liberator.plugins.smooziee.smoothScrollBy(600)
    :js liberator.plugins.smooziee.smoothScrollBy(-600)
  ]]></ex></code>
</plugin>
<plugin name="smooziee" version="0.10.2"
        href="https://github.com/vimpr/vimperator-plugins/raw/master/_smooziee.js"
        summary="j,kキーでのスクロールをスムースに"
        lang="ja"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
  <project name="Vimperator" minVersion="3.6"/>
  <license>MIT style license</license>
  <p>普段のj,kキーのスクロールをLDRizeライクにスムースにします。</p>
  <h3 tag="smooziee_global_variables">グローバル変数</h3>
  <p>以下の変数を.vimperatorrcなどで設定することで動作を調整することができます。</p>
  <dl>
    <dt>smooziee_scroll_amount</dt>
    <dd>1回にスクロールする幅です（単位：ピクセル）。デフォルトは"400"です。</dd>
    <dt>smooziee_interval</dt>
    <dd>スクロール時のアニメーションのインターバルです（単位：ミリ秒）。
      "1"以上の値を設定します。デフォルトは"20"です。</dd>
  </dl>
  <h3 tag="smooziee_example">設定例</h3>
  <p>スクロール量を300pxに、インターバルを10msに設定します。</p>
  <code><ex><![CDATA[
    let g:smooziee_scroll_amount="300"
    let g:smooziee_scroll_interval="10"
  ]]></ex></code>
  <h3 tag="smooziee_API">API</h3>
  <p>他のキーにマップする場合やスクリプトから呼び出せるようAPIを用意してます。</p>
  <code>smooziee.smoothScrollBy(amount);</code>
  <p>Example</p>
  <code><ex><![CDATA[
    :js liberator.plugins.smooziee.smoothScrollBy(600)
    :js liberator.plugins.smooziee.smoothScrollBy(-600)
  ]]></ex></code>
  <h3 tag="soomziee_ToDo">ToDo</h3>
  <ul>
    <li>読み込みの順番によっては他のプラグインと競合する可能性があるのをなんとかしたい。</li>
  </ul>
</plugin>`;
// }}}

let self = liberator.plugins.smooziee = (function(){

  mappings.addUserMap(
    [modes.NORMAL],
    ["j"],
    "Smooth scroll down",
    function(count){
      self.smoothScrollBy(getScrollAmount());
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
      self.smoothScrollBy(getScrollAmount() * -1);
    },
    {
      count: true
    }
    );

  var next;
  var win;
  var interval;

  var PUBLICS = {
    smoothScrollBy: function(moment) {
      win = Buffer.findScrollableWindow();
      interval = window.eval(liberator.globalVariables.smooth_scroll_interval || '30');
      clearTimeout(next);
      smoothScroll(moment);
    }
  }

  function logBase(x, y) {
    // Logarithm of arbitrary base `x`
    return Math.log(y) / Math.log(x);
  }

  function getScrollAmount() {
    // see recognition of Fibonacci Numbers (here approximation is used)
    // http://en.wikipedia.org/wiki/Fibonacci_number#Recognizing_Fibonacci_numbers
    phi = 1.618033;
    sqrt5 = 2.236067;
    fn = liberator.globalVariables.smooth_scroll_amount || '150'
      n = Math.ceil(logBase(phi, (fn * sqrt5 + Math.sqrt(5 * Math.pow(fn, 2) + 4)) / 2))
      return window.eval(n);
  }

  function fib(n){
    // see optimized Binet's formula for Fibonacci sequence
    // http://en.wikipedia.org/wiki/Fibonacci_number#Closed_form_expression
    phi = 1.618033;
    sqrt5 = 2.236067;
    return Math.floor((Math.pow(phi, n) / sqrt5) + 0.5)
  }

  function smoothScroll(moment) {
    if (moment > 0) {
      moment = moment - 1;
      win.scrollBy(0, fib(Math.abs(moment)));
    } else {
      moment = moment + 1;
      win.scrollBy(0, -fib(Math.abs(moment)));
    }

    if (moment == 0)
      return;

    next = setTimeout(function() smoothScroll(moment), interval);
  }

  return PUBLICS;
})();
// vim: sw=2 ts=2 et si fdm=marker:
