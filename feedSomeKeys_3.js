/* NEW BSD LICENSE {{{
Copyright (c) 2010, anekos.
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

}}} */

// PLUGIN_INFO {{{
let PLUGIN_INFO =
<VimperatorPlugin>
  <name>feedSomeKeys 3</name>
  <name lang="ja">feedSomeKeys 3</name>
  <description>feed some defined key events into the Web content</description>
  <description lang="ja">キーイベントをWebコンテンツ側に送る</description>
  <version>1.1.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/feedSomeKeys_3.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <require type="plugin">_libly.js</require>
  <detail><![CDATA[
    see ":help feedSomeKeys-plugin"
    rc file setting sample:
>||
command! -nargs=+ lazy autocmd VimperatorEnter .* <args>
lazy fmaps -u='mail\.google\.com/mail' c / j k n p o u e x s r a # [ ] ? gi gs gt gd ga gc
lazy fmaps -u='mail\.google\.com/mail/.*/[0-9a-f]+$' c / j,n k,p n,j p,k o u e x s r a # [ ] ? gi gs gt gd ga gc
lazy fmaps -u='www\.google\.co\.jp/reader' -events=vkeypress j k n p m s v A r S N P X O gh ga gs gt gu u / ? J K
lazy fmaps -u='(fastladder|livedoor)\.com/reader' j k s a p o v c i,p <Space> <S-Space> z b < > q w e,g
lazy fmaps -u='https?://www\.rememberthemilk\.com/home/' j k m i c t ? d F,f G,g S,s L,l Y,y H,h M,m <Del> <C-S-Left> <C-S-Right>
lazy fmaps -u='http://code.google.com/p/vimperator-labs/issues/list' o j k
lazy fmaps -u='http://code.google.com/p/vimperator-labs/issues/detail' u
||<
  ]]></detail>
  <detail lang="ja"><![CDATA[
    詳しくはヘルプを見てね。 ":help feedSomeKeys-plugin"
    rc ファイルの設定サンプル:
>||
command! -nargs=+ lazy autocmd VimperatorEnter .* <args>
lazy fmaps -u='mail\.google\.com/mail' c / j k n p o u e x s r a # [ ] ? gi gs gt gd ga gc
lazy fmaps -u='mail\.google\.com/mail/.*/[0-9a-f]+$' c / j,n k,p n,j p,k o u e x s r a # [ ] ? gi gs gt gd ga gc
lazy fmaps -u='www\.google\.co\.jp/reader' -events=vkeypress j k n p m s v A r S N P X O gh ga gs gt gu u / ? J K
lazy fmaps -u='(fastladder|livedoor)\.com/reader' j k s a p o v c i,p <Space> <S-Space> z b < > q w e,g
lazy fmaps -u='https?://www\.rememberthemilk\.com/home/' j k m i c t ? d F,f G,g S,s L,l Y,y H,h M,m <Del> <C-S-Left> <C-S-Right>
lazy fmaps -u='http://code.google.com/p/vimperator-labs/issues/list' o j k
lazy fmaps -u='http://code.google.com/p/vimperator-labs/issues/detail' u
||<
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<plugin name="feedSomeKeys" version="1.1.0"
        href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/feedSomeKeys_3.js"
        summary="Feed some defined key events into the Web content"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="anekos@snca.net">anekos</author>
  <license>New BSD License</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
    Feed key events directly into web contents.
  </p>
  <item>
    <tags>:fmap</tags>
    <spec>:fmap <oa>-e<oa>vents</oa>=<a>event-name-list</a></oa> <a>lhs</a> <a>rhs</a></spec>
    <description>
      <p>
        Define one mapping.
      </p>
    </description>
  </item>
  <item>
    <tags>:fmaps</tags>
    <spec>:fmaps <oa>-e<oa>vents</oa>=<a>event-name-list</a></oa> <a>mapping-pair</a> ....</spec>
    <description>
      <p>
        Two or more mappings are defined at once.
        <a>mapping-pair</a> is a pair of key names separated by ",".
      </p>
      <p>
        e.g. "&lt;Leader>&lt;S-j>,j"
      </p>
    </description>
  </item>
  <h3 tag="fmap-event-names">event-name</h3>
  <p>
    <a>event-name-list</a> option follows a list of below values.
    <ul>
      <li>keypress</li>
      <li>keydown</li>
      <li>keyup</li>
      <li>vkeypress</li>
      <li>vkeydown</li>
      <li>vkeyup</li>
    </ul>
    "v-" values use virtual key code.
  </p>
  <h3 tag="fmaps-examples">fmaps examples for .vimperatorrc</h3>
  <p>If you input directly these commands in vimperator commandline, remove the ":lazy".</p>
  <code><ex>
:command! -nargs=+ lazy autocmd VimperatorEnter .* &lt;args>
:lazy fmaps -u='mail\.google\.com/mail' c / j k n p o u e x s r a # [ ] ? gi gs gt gd ga gc
:lazy fmaps -u='mail\.google\.com/mail/.*/[0-9a-f]+$' c / j,n k,p n,j p,k o u e x s r a # [ ] ? gi gs gt gd ga gc
:lazy fmaps -u='www\.google\.co\.jp/reader' -events=vkeypress j k n p m s v A r S N P X O gh ga gs gt gu u / ? J K
:lazy fmaps -u='(fastladder|livedoor)\.com/reader' j k s a p o v c i,p &lt;Space> &lt;S-Space> z b &lt; > q w e,g
:lazy fmaps -u='https?://www\.rememberthemilk\.com/home/' j k m i c t ? d F,f G,g S,s L,l Y,y H,h M,m &lt;Del> &lt;C-S-Left> &lt;C-S-Right>
:lazy fmaps -u='http://code.google.com/p/vimperator-labs/issues/list' o j k
:lazy fmaps -u='http://code.google.com/p/vimperator-labs/issues/detail' u
  </ex></code>
</plugin>;
// }}}

(function () {

  const EVENTS = 'keypress keydown keyup'.split(/\s+/);
  const EVENTS_WITH_V = EVENTS.concat(['v' + n for each (n in EVENTS)]);

  const VKeys = {
    '0': KeyEvent.DOM_VK_0,
    '1': KeyEvent.DOM_VK_1,
    '2': KeyEvent.DOM_VK_2,
    '3': KeyEvent.DOM_VK_3,
    '4': KeyEvent.DOM_VK_4,
    '5': KeyEvent.DOM_VK_5,
    '6': KeyEvent.DOM_VK_6,
    '7': KeyEvent.DOM_VK_7,
    '8': KeyEvent.DOM_VK_8,
    '9': KeyEvent.DOM_VK_9,
    ';': KeyEvent.DOM_VK_SEMICOLON,
    '=': KeyEvent.DOM_VK_EQUALS,
    'a': KeyEvent.DOM_VK_A,
    'b': KeyEvent.DOM_VK_B,
    'c': KeyEvent.DOM_VK_C,
    'd': KeyEvent.DOM_VK_D,
    'e': KeyEvent.DOM_VK_E,
    'f': KeyEvent.DOM_VK_F,
    'g': KeyEvent.DOM_VK_G,
    'h': KeyEvent.DOM_VK_H,
    'i': KeyEvent.DOM_VK_I,
    'j': KeyEvent.DOM_VK_J,
    'k': KeyEvent.DOM_VK_K,
    'l': KeyEvent.DOM_VK_L,
    'm': KeyEvent.DOM_VK_M,
    'n': KeyEvent.DOM_VK_N,
    'o': KeyEvent.DOM_VK_O,
    'p': KeyEvent.DOM_VK_P,
    'q': KeyEvent.DOM_VK_Q,
    'r': KeyEvent.DOM_VK_R,
    's': KeyEvent.DOM_VK_S,
    't': KeyEvent.DOM_VK_T,
    'u': KeyEvent.DOM_VK_U,
    'v': KeyEvent.DOM_VK_V,
    'w': KeyEvent.DOM_VK_W,
    'x': KeyEvent.DOM_VK_X,
    'y': KeyEvent.DOM_VK_Y,
    'z': KeyEvent.DOM_VK_Z,
    '*': KeyEvent.DOM_VK_MULTIPLY,
    '+': KeyEvent.DOM_VK_ADD,
    '-': KeyEvent.DOM_VK_SUBTRACT,
    ',': KeyEvent.DOM_VK_COMMA,
    '.': KeyEvent.DOM_VK_PERIOD,
    '/': KeyEvent.DOM_VK_SLASH,
    '?': KeyEvent.DOM_VK_SLASH,
    '`': KeyEvent.DOM_VK_BACK_QUOTE,
    '{': KeyEvent.DOM_VK_OPEN_BRACKET,
    '\\': KeyEvent.DOM_VK_BACK_SLASH,
    '}': KeyEvent.DOM_VK_CLOSE_BRACKET,
    '\'': KeyEvent.DOM_VK_QUOTE
  };

  function id (v)
    v;

  function or (list, func)
    let ([head, tail] = list)
      ((func || v)(head) || (tail && or(tail, func)));

  function getFrames () {
    function bodyCheck (content)
      (content.document.body.localName.toLowerCase() === 'body');

    function get (content)
      (bodyCheck(content) && result.push(content), Array.slice(content.frames).forEach(get))

    let result = [];
    get(content);
    return result;
  }

  function fromXPath (doc, xpath) {
    let result = util.evaluateXPath(xpath, doc);
    return result.snapshotLength && result.snapshotItem(0);
  }

  function createEvent (eventName, event) {
    let result = content.document.createEvent('KeyEvents');
    result.initKeyEvent(
      eventName,
      true,
      true,
      content,
      event.ctrlKey,
      event.altKey,
      event.shiftKey,
      event.metaKey,
      event.keyCode,
      event.charCode
    );
    return result;
  }

  function virtualize (event) {
    let cc = event.charCode;
    if (/^[A-Z]$/.test(String.fromCharCode(cc)))
      event.shiftKey = true;
    event.keyCode = VKeys[String.fromCharCode(cc).toLowerCase()];
    event.charCode = 0;
    return event;
  }

  function feed (keys, eventNames, target) {
    let _passAllKeys = modes.passAllKeys;
    modes.passAllKeys = true;
    modes.passNextKey = false;

    for (let [, keyEvent] in Iterator(events.fromString(keys))) {
      eventNames.forEach(function (eventName) {
        let [, vkey, name] = eventName.match(/^(v)?(.+)$/);
        if (vkey)
          virtualize(keyEvent);
        let event = createEvent(name, keyEvent);
        target.dispatchEvent(event);
      });
    }

    modes.passAllKeys = _passAllKeys;
  }

  function regexpValidator (expr) {
    try {
      RegExp(expr);
      return true;
    } catch (e) {}
    return false;
  }

  function makeListValidator (list)
    function (values)
      (values && !values.some(function (value) !list.some(function (event) event === value)));

  'fmap fmaps'.split(/\s+/).forEach(function (cmd) {
    let multi = cmd === 'fmaps';

    function action (multi) {
      return function (args) {
        function add ([lhs, rhs]) {
          rhs = rhs || lhs;
          mappings.addUserMap(
            [modes.NORMAL],
            [lhs],
            args['description'] || 'by feedSomeKeys_3.js',
            function () {
              function body (win)
                (win.document.body || win.document);

              let win = document.commandDispatcher.focusedWindow;
              let frames = getFrames();
              let elem = body(win);

              if (typeof args['-frame'] !== 'undefined') {
                frames = [frames[args['-frame']]];
                elem = body(frames[0]);
              }

              if (args['-xpath'])
                elem = or(frames, function (f) fromXPath(f, args['-xpath'])) || elem;

              feed(rhs, args['-events'] || ['keypress'], elem);
            },
            {
              matchingUrls: args['-urls']
            },
            true
          );
        }

        if (multi) {
          let sep = let (s = args['-separator'] || ',') function (v) v.split(s);
          args.literalArg.split(/\s+/).map(String.trim).map(sep).forEach(add);
        } else {
          let [, lhs, rhs] = args.literalArg.match(/^(\S+)\s+(.*)$/) || args.literalArg;
          add([lhs, rhs]);
        }
      };
    }

    commands.addUserCommand(
      [cmd],
      'Feed map a key sequence',
      action(multi),
      {
        literal: 0,
        options: [
          [['-urls', '-u'], commands.OPTION_STRING, regexpValidator],
          [['-desc', '-description'], commands.OPTION_STRING],
          [['-frame', '-f'], commands.OPTION_INT],
          [
            ['-events', '-e'],
            commands.OPTION_LIST,
            makeListValidator(EVENTS_WITH_V),
            EVENTS_WITH_V.map(function (v) [v, v])
          ]
        ].concat(
          multi ? [[['-separator', '-s'], commands.OPTION_STRING]]
                : []
        )
      },
      true
    );
  });

  plugins.libly.$U.around(
    mappings,
    'getCandidates',
    function (next, [mode, prefix, patternOrUrl]) {
      let map = mappings.get(mode, prefix, patternOrUrl);
      if (map && map.matchingUrls)
        return [];
      return next();
    }
  );

  __context__.API =
    'VKeys feed getFrames fromXPath virtualize'.split(/\s+/).reduce(
      function (result, name)
        (result[name] = eval(name), result),
      {}
    );

})();

// vim:sw=2 ts=2 et si fdm=marker:
