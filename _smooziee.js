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
<plugin name="smooziee" version="0.10.3"
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

liberator.plugins.smooziee = (function(){
  // Mappings  {{{
  mappings.addUserMap(
    [modes.NORMAL],
    ["j"],
    "Smooth scroll down",
    function(count){
      liberator.plugins.smooziee.smoothScrollBy(getScrollAmount() * (count || 1));
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
      liberator.plugins.smooziee.smoothScrollBy(getScrollAmount() * -(count || 1));
    },
    {
      count: true
    }
  );
  // }}}
  // PUBLIC {{{
  var PUBLICS = {
    smoothScrollBy: function(moment) {
      win = findScrollableWindow();
      interval = window.eval(liberator.globalVariables.smooziee_scroll_interval || '20');
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

  function getScrollAmount() window.eval(liberator.globalVariables.smooziee_scroll_amount || '400');

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

  function findScrollableWindow() {
    var win = this.focusedWindow;
    if (win && (win.scrollMaxX > 0 || win.scrollMaxY > 0)) return win;

    win = config.browser.contentWindow;
    if (win.scrollMaxX > 0 || win.scrollMaxY > 0) return win;

    for (let frame in util.Array.itervalues(win.frames)) {
      if (frame.scrollMaxX > 0 || frame.scrollMaxY > 0) return frame;
    }
    return win;
  }
  // }}}
  return PUBLICS;
})();
// vim: sw=2 ts=2 et si fdm=marker:
