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
  <version>1.0.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/feedSomeKeys_3.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    ----
  ]]></detail>
  <detail lang="ja"><![CDATA[
    ----
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<plugin name="feedSomeKeys" version="1.0.0"
        href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/feedSomeKeys_3.js"
        summary="Feed some defined key events into the Web content"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="anekos@snca.net">anekos</author>
  <license>New BSD License</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
  </p>
  <item>
    <tags>:fmap</tags>
    <spec>:fmap <oa>-e<oa>vents</oa>=<a>event-name-list</a></oa> <a>lhs</a> <a>rhs</a></spec>
    <description>
      <p></p>
    </description>
  </item>
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

  function virtualize (event) {
    event.keyCode = VKeys[String.fromCharCode(event.charCode).toLowerCase()];
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
        let event = events.create(doc, name, keyEvent);
        if (vkey)
          virtualize(event);
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

    commands.addUserCommand(
      [cmd],
      'Feed map a key sequence',
      function (args) {
        function add ([lhs, rhs]) {
          rhs = rhs || lhs;
          mappings.addUserMap(
            [modes.NORMAL],
            [lhs],
            args['description'] || 'by feedSomeKeys_3.js',
            function () {
              let win = document.commandDispatcher.focusedWindow;
              let frames = getFrames();
              let elem = win;

              if (typeof args['-frame'] !== 'undefined') {
                frames = [frames[args['-frame']]];
                elem = frames[0];
              }

              if (args['-xpath'])
                elem = or(frames, function (f) fromXPath(args['-xpath']));

              if (!elem) {
                liberator.log('feedSomeKeys_3: Not found target element');
                elem = win;
              }

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
          let [, lhs, rhs] = args.literalArg.match(/^(\S+)\s+(.*)$/);
          add([lhs, rhs]);
        }
      },
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

})();

// vim:sw=2 ts=2 et si fdm=marker:
