var PLUGIN_INFO =
<VimperatorPlugin>
<name>Happy Happy Vimperator</name>
<description>This plugin makes you to True Vimperatorer</description>
<version>2.0</version>
<author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<detail><![CDATA[
== Usage ==
DO NOT THINK. FEEL!
== Unbroken keyboard ==
http://www.pfu.fujitsu.com/hhkeyboard/
== Requirements ==
Steel Heart
== License ==
Creative Commons Attribution-Share Alike 3.0 Unported
http://creativecommons.org/licenses/by-sa/3.0/
]]></detail>
</VimperatorPlugin>;

(function () {

  let enabled = s2b(liberator.globalVariables.happy_hacking_vimperator_enable, true);
  let ignore = false;
  let mousedownTime = new Date();

  let meows = [
    //mouse kara
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
  ];

  function s2b (s, d) (!/^(\d+|false)$/i.test(s)|parseInt(s)|!!d*2)&1<<!s;

  function around (obj, name, func) {
    let next = obj[name];
    obj[name] = function ()
      let (self = this, args = arguments)
        func.call(self,
                  function () next.apply(self, args),
                  args);
  };

  function shit ()
    meows[Math.round(Math.random() * meows.length + 0.5)];

  function fuck (msg) {
    let sz = innerWidth / msg.length / 1.5;
    liberator.echo(
      <div style="background: white; color: black;">
        <table>
          <tr>
            <td><img src="http://www.kurinton.net/~snca/images/gunsou.gif" /></td>
            <td style={"font-size: " + sz + "px; white-space: wrap;"}>{msg}</td>
          </tr>
        </table>
      </div>
    );
  }

  function kill (msg) {
    return function (event) {
      if (ignore)
        return;
      event.preventDefault();
      event.stopPropagation();
      if (msg)
        fuck(shit());
    }
  }

  around(buffer, 'followLink', function (next) {
    ignore = true;
    try {
      next();
    } finally {
      ignore = false;
    }
  });

  window.addEventListener('keypress', function  (event) {
    let elem = window.document.commandDispatcher.focusedElement;
    if (events.toString(event) == '<Return>' && elem && elem.form) {
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
        kill(true)(event);
    },
    true
  );


})();

// vim:sw=2 ts=2 et si fdm=marker:
