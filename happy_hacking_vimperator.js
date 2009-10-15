/*
Copyright (c) 2008-2009, anekos.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
    3. The names of the authors may not be used to endorse or promote products
       derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
THE POSSIBILITY OF SUCH DAMAGE.


###################################################################################
# http://sourceforge.jp/projects/opensource/wiki/licenses%2Fnew_BSD_license       #
# に参考になる日本語訳がありますが、有効なのは上記英文となります。                #
###################################################################################

*/

let PLUGIN_INFO =
<VimperatorPlugin>
  <name>Happy Happy Vimperator</name>
  <description>This plugin makes you to True Vimperatorer</description>
  <version>2.3.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.2pre</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/happy_hacking_vimperator.js</updateURL>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <detail><![CDATA[
    == Usage ==
    DO NOT THINK. FEEL!
    == Unbroken keyboard ==
    http://www.pfu.fujitsu.com/hhkeyboard/
    == Requirements ==
    Steel Heart
  ]]></detail>
</VimperatorPlugin>;

(function () {

  let enabled = s2b(liberator.globalVariables.happy_hacking_vimperator_enable, true);
  let ignore = false;
  let mousedownTime = new Date();
  let sound = Cc["@mozilla.org/sound;1"].createInstance(Ci.nsISound);
  sound.init();

  let meows = {
    mickey: [
      // mouse kara
      '\u30DE\u30A6\u30B9\u304B\u3089\u624B\u3092\u96E2\u3059\u307E\u3067\u306F\u30A6\u30B8\u866B\u3060\uFF01 \u5730\u7403\u4E0A\u3067\u6700\u4E0B\u7B49\u306E\u751F\u547D\u4F53\u3060\uFF01',
      // itumade
      '\u3044\u3064\u307E\u3067\u305D\u306E\u7CDE\u3092\u63E1\u308A\u3057\u3081\u3066\u3044\u308B\u3064\u3082\u308A\u3060\uFF01',
      // jobs
      '\u30B8\u30E7\u30D6\u30BA\u306E\u30B1\u30C4\u306B\u30C9\u982D\u7A81\u3063\u8FBC\u3093\u3067\u304A\u3063\u6B7B\u306D\uFF01',
      // kusonezu fuck
      '\u305D\u306E\u7CDE\u30CD\u30BA\u30DF\u3068\u30D5\u30A1\u30C3\u30AF\u3057\u3066\u3084\u304C\u308C!',
      // kusata
      '\u8150\u3063\u305F\u30CD\u30BA\u30DF\u306E\u81ED\u3044\u304C\u3057\u3084\u304C\u308B\uFF01',
      // click&drag
      '\u3058\u3063\u304F\u308A\u53EF\u611B\u304C\u3063\u3066\u3084\u308B\u3002\u30AF\u30EA\u30C3\u30AF\u3057\u305F\u308A\u30C9\u30E9\u30C3\u30B0\u3057\u305F\u308A\u51FA\u6765\u306A\u304F\u3057\u3066\u3084\u308B\uFF01',
      // tataki
      '\u305D\u306E\u30DE\u30A6\u30B9\u3092\u3055\u3063\u3055\u3068\u3076\u3061\u58CA\u305B\uFF01',
      // homep
      '\u4FFA\u304C\u3053\u306E\u4E16\u3067\u305F\u3060\u4E00\u3064\u6211\u6162\u3067\u304D\u3093\u306E\u306F\u3001\u624B\u3092\u30AD\u30FC\u30DC\u30FC\u30C9\u304B\u3089\u96E2\u3059\u3053\u3068\u3060\uFF01',
      // umare
      '\u30DE\u30A6\u30B9\u3092\u624B\u306B\u304F\u3063\u3064\u3051\u3066\u751F\u307E\u308C\u3066\u304D\u305F\u304B\uFF1F\u305D\u308C\u3068\u3082\u52AA\u529B\u3057\u3066\u305D\u3046\u3057\u3066\u3044\u308B\u306E\u304B\uFF1F',
      // aijou
      '\u306A\u305C\u30DE\u30A6\u30B9\u3092\u4F7F\u3046\uFF1F\u30D1\u30D1\u3068\u30DE\u30DE\u306E\u611B\u60C5\u304C\u8DB3\u308A\u306A\u304B\u3063\u305F\u306E\u304B\uFF1F',
      // cursor
      '\u305D\u306E\u80F8\u304F\u305D\u60AA\u3044\u30AB\u30FC\u30BD\u30EB\u3092\u6D88\u305B\uFF01',
      // sabetu
      '\u30DE\u30A6\u30B9\u3001\u30C8\u30E9\u30C3\u30AF\u30DC\u30FC\u30EB\u3001\u30BF\u30D6\u30EC\u30C3\u30C8\u3092\u4FFA\u306F\u898B\u4E0B\u3055\u3093\u3002\u5168\u3066\u5E73\u7B49\u306B\u4FA1\u5024\u304C\u306A\u3044\uFF01',
      // do write
      '\u4F55\u3001\u30DE\u30A6\u30B9\u304C\u306A\u3044\u3068\u64CD\u4F5C\u3067\u304D\u306A\u3044\u3060\u3063\u3066\uFF1F\u9ED9\u3063\u3066\u30D7\u30E9\u30B0\u30A4\u30F3\u66F8\u3051\uFF01'
    ],
    key: [
      // dont touch
      '\u305D\u306E\u6C5A\u3044\u30AD\u30FC\u3067\u4FFA\u306B\u89E6\u308B\u3093\u3058\u3083\u306D\u3047\uFF01',
      // hikkonuke
      '\u4ECA\u3059\u3050\u305D\u306E\u30AD\u30FC\u3092\u5F15\u3063\u3053\u629C\u3051\uFF01'
    ]
};

  let gunsou = 'data:image/gif;base64,'+
        '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'+
        'J04QDASAfeIRAgA7';

  let uncleanKeys = '<Up> <Down> <Left> <Right> <Home> <End> <PageDown> <PageUp>'.split(/ /);
  for (let i = 1, e = 20; i < e; i++)
    uncleanKeys.push('<F' + i + '>');

  function s2b (s, d) (!/^(\d+|false)$/i.test(s)|parseInt(s)|!!d*2)&1<<!s;

  function around (obj, name, func) {
    let next = obj[name];
    obj[name] = function ()
      let (self = this, args = arguments)
        func.call(self,
                  function () next.apply(self, args),
                  args);
  };

  function shit (type)
    meows[type][Math.floor(Math.random() * meows[type].length)];

  function fuck (msg) {
    let sz = innerWidth / msg.length / 1.5;
    liberator.echo(
      <div style="background: white; color: black;">
        <table>
          <tr>
            <td><img src={gunsou}/></td>
            <td style={"font-size: " + sz + "px; white-space: nowrap;"}>{msg}</td>
          </tr>
        </table>
      </div>
    );
  }

  function kill (msg) {
    return function (event) {
      if (ignore || !damn(event))
        return;
      event.preventDefault();
      event.stopPropagation();
      if (msg) {
        fuck(shit(msg));
        sound.play(makeURI('http://www.kurinton.net/~snca/files/meow.wav'));
      }
    }
  }

  function damn (event)
    !/^(script|embed)$/i.test(event.target.tagName);

  let (opt = options.get('go'))
    opt.set(opt.get().replace(/[rlb]+/g, ''));

  around(buffer, 'followLink', function (next) {
    ignore = true;
    try {
      next();
    } finally {
      ignore = false;
    }
  });

  around(events, 'onKeyPress', function (next, [event]) {
    let keyStr = events.toString(event);
    if (!events.feedingKeys && uncleanKeys.some(function(v) v == keyStr)) {
      return kill('key')(event);
    }
    next();
  });

  window.addEventListener('keypress', function (event) {
    let elem = window.document.commandDispatcher.focusedElement;
    let keyStr = events.toString(event);
    if (keyStr == '<Return>' && elem && elem.form) {
      ignore = true;
      setTimeout(function () ignore = false, 200);
    }
  }, true);

  ['mousemove', 'DOMMouseScroll', 'mouseup', 'dblclick'].forEach(
      function (name) window.addEventListener(name, kill(false), true)
  );

  window.addEventListener(
    'mousedown',
    function (event) {
      mousedownTime = new Date().getTime();
      kill(false)(event);
    },
    true
  );

  window.addEventListener(
    'click',
    function (event) {
      if ((new Date().getTime() - mousedownTime) < 500)
        kill('mickey')(event);
    },
    true
  );


})();

// vim:sw=2 ts=2 et si fdm=marker:
