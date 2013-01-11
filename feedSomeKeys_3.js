/* NEW BSD LICENSE {{{
Copyright (c) 2010-2011, anekos.
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

// INFO {{{
let INFO =
xml`<plugin name="feedSomeKeys" version="1.9.3"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/feedSomeKeys_3.js"
          summary="Feed some defined key events into the Web content"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <p>
      Feed key events directly into web contents.
    </p>
    <item>
      <tags>:fmap</tags>
      <spec>:fmap <oa>-e<oa>vents</oa>=<a>eventnamelist</a></oa> <oa>-x<oa>path</oa>=<a>xpath</a></oa> <oa>-f<oa>rame</oa>=<a>framenumber</a></oa> <oa>-urls=<a>urlpattern</a></oa> <oa>-modes=<a>modes</a></oa> <a>lhs</a> <a>rhs</a></spec>
      <description>
        <p>
          Define one mapping.
        </p>
        <p>
          If <a>-urls=<a>urlpattern</a></a> is given,
          the mappings becomes effective mappings only on the page specifed by <a>urlpattern</a>.
        </p>
      </description>
    </item>
    <item>
      <tags>:fmaps</tags>
      <spec>:fmaps <oa>-e<oa>vents</oa>=<a>eventnamelist</a></oa> <oa>-x<oa>path</oa>=<a>xpath</a></oa> <oa>-f<oa>rame</oa>=<a>framenumber</a></oa> <oa>-urls=<a>urlpattern</a></oa> <oa>-p<oa>prefix</oa>=<a>prefix</a></oa> <oa>-modes=<a>modes</a></oa> <a>mappingpair</a> ....</spec>
      <description>
        <p>
          Two or more mappings are defined at once.
          <a>mappingpair</a> is a pair of key names separated by ",".
          <p>e.g. "&lt;Leader>&lt;S-j>,j"</p>
        </p>
        <p>
          If <a>-urls=<a>urlpattern</a></a> is given,
          the mappings becomes effective mappings only on the page specifed by <a>urlpattern</a>.
        </p>
      </description>
    </item>
    <item>
      <tags>:fmapc</tags>
      <spec>:fmapc<oa>!</oa> <oa>-modes=<a>modes</a></oa> <oa>urlpattern</oa></spec>
      <description>
        <p>
          Remove the mappings matched with <oa>urlpattern</oa>.
          If "!" is given, remove all mappings.
        </p>
      </description>
    </item>
    <item>
      <tags>:funmap</tags>
      <spec>:funmap <oa>-urls=<a>urlpattern</a></oa> <oa>-modes=<a>modes</a></oa> <a>lhs</a></spec>
      <description>
        <p>
          Remove the mappings.
        </p>
        <p>
          If you wish to remove url-local mappings, give <a>-urls=<a>urlpattern</a></a>.
        </p>
      </description>
    </item>
    <h3 tag="fmap-url-pattern">urlpattern</h3>
    <p>
      The value of <a>urlpattern</a> should be regular expression.
    </p>
    <h3 tag="fmap-xpath">xpath</h3>
    <p>
      The XPath for a target element.
    </p>
    <h3 tag="fmap-frame-number">framenumber</h3>
    <p>
      The number of a target frame.
      Refer the completion for this number.
    </p>
    <h3 tag="fmap-event-name-list">eventnamelist</h3>
    <p>
      <a>eventnamelist</a> is the list constructed with the below values.
    </p>
    <ul>
      <li>keypress</li>
      <li>keydown</li>
      <li>keyup</li>
      <li>vkeypress</li>
      <li>vkeydown</li>
      <li>vkeyup</li>
    </ul>
    <p>"v..." values use virtual key code.</p>
    <p>The event is generated in the order of writing of each key.</p>
    <p>The default value of this option is "keypress".</p>
    <h3 tag="fmap-modes">modes</h3>
    <p>
      List of mapping modes. (Default is NORMAL mode)
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
  </plugin>
  <plugin name="feedSomeKeys" version="1.9.3"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/feedSomeKeys_3.js"
          summary="Web コンテンツに直接キーイベントを送ります。"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <p>
      Web コンテンツに直接キーイベントを送ります。
    </p>
    <item>
      <tags>:fmap</tags>
      <spec>:fmap <oa>-e<oa>vents</oa>=<a>eventnamelist</a></oa> <oa>-x<oa>path</oa>=<a>xpath</a></oa> <oa>-f<oa>rame</oa>=<a>framenumber</a></oa> <oa>-urls=<a>urlpattern</a></oa> <oa>-modes=<a>modes</a></oa> <a>lhs</a> <a>rhs</a></spec>
      <description>
        <p>
          マッピングを一つ定義します。
        </p>
        <p>
          <a>-urls=<a>urlpattern</a></a> が与えられたとき、
          そのマッピングは <a>urlpattern</a> で指定されたページのみで有効になります。
        </p>
      </description>
    </item>
    <item>
      <tags>:fmaps</tags>
      <spec>:fmaps <oa>-e<oa>vents</oa>=<a>eventnamelist</a></oa> <oa>-x<oa>path</oa>=<a>xpath</a></oa> <oa>-f<oa>rame</oa>=<a>framenumber</a></oa> <oa>-urls=<a>urlpattern</a></oa> <oa>-p<oa>prefix</oa>=<a>prefix</a></oa> <oa>-modes=<a>modes</a></oa> <a>mappingpair</a> ....</spec>
      <description>
        <p>
          一度に複数のマッピングを定義できます。
          <a>mappingpair</a> は、"," で区切られたキー名の組です。
          <p>例: "&lt;Leader>&lt;S-j>,j"</p>
        </p>
        <p>
          <a>-urls=<a>urlpattern</a></a> が与えられたとき、
          そのマッピングは <a>urlpattern</a> で指定されたページのみで有効になります。
        </p>
      </description>
    </item>
    <item>
      <tags>:fmapc</tags>
      <spec>:fmapc<oa>!</oa> <oa>-modes=<a>modes</a></oa> <oa>urlpattern</oa></spec>
      <description>
        <p>
          <oa>urlpattern</oa> のマッピングを削除します。
           "!" が与えられたときは、全てのマッピングが削除されます。
        </p>
      </description>
    </item>
    <item>
      <tags>:funmap</tags>
      <spec>:funmap <oa>-urls=<a>urlpattern</a></oa> <oa>-modes=<a>modes</a></oa> <a>lhs</a></spec>
      <description>
        <p>
          マッピングを削除します。
        </p>
        <p>
          <a>urlpattern</a> 付きのマッピングを削除するときは、<oa>-urls</oa> を指定する必要があります。
        </p>
      </description>
    </item>
    <h3 tag="fmap-url-pattern">urlpattern</h3>
    <p>
      <a>urlpattern</a> の値は正規表現でなければいけません。
    </p>
    <h3 tag="fmap-event-name-list">eventnamelist</h3>
    <p>
      <a>eventnamelist</a> は以下の値から構成されたリストです。
    </p>
    <ul>
      <li>keypress</li>
      <li>keydown</li>
      <li>keyup</li>
      <li>vkeypress</li>
      <li>vkeydown</li>
      <li>vkeyup</li>
    </ul>
    <p>"v..." のものは、仮想キーコードでイベントを発行します。</p>
    <p>キー毎に、書かれた順にイベントが発行されます。</p>
    <p>このオプションのデフォルト値は "keypress" です。</p>
    <h3 tag="fmap-xpath">xpath</h3>
    <p>
      キーイベントを送るべき要素を指定するための XPath。
    </p>
    <h3 tag="fmap-frame-number">framenumber</h3>
    <p>
      キーイベントを送るべきフレームの番号。
      番号は、補完を参考にしてください。
    </p>
    <h3 tag="fmap-modes">modes</h3>
    <p>
      マップするモードのリスト (デフォルトは、NORMALモード)
    </p>
    <h3 tag="fmaps-examples">.vimperatorrc 用の fmaps サンプル</h3>
    <p>コマンドラインで直接に入力するときは、":lazy" を除いてください。</p>
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
</plugin>`;

// }}}

(function () {

  const EVENTS = 'keypress keydown keyup'.split(/\s+/);
  const EVENTS_WITH_V = EVENTS.concat(['v' + n for each (n in EVENTS)]);
  const IGNORE_URLS = /<ALL>/;

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

  const State = {
    feeding: false
  };

  function id (v)
    v;

  function or (list, func)
    (list.length && let ([head,] = list) (func(head) || or(list.slice(1), func)));

  function getFrames () {
    function bodyCheck (content)
      (content.document && content.document.body && content.document.body.localName.toLowerCase() === 'body');

    function get (content)
      (bodyCheck(content) && result.push(content), Array.slice(content.frames).forEach(get));

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
    function finalize (){
      modes.passAllKeys = _passAllKeys;
      State.feeding = false;
    }

    State.feeding = true;

    let _passAllKeys = modes.passAllKeys;

    try {
      modes.passAllKeys = true;
      modes.passNextKey = false;

      for (let [, keyEvent] in Iterator(events.fromString(keys))) {
        eventNames.forEach(function (eventName) {
          let ke = util.cloneObject(keyEvent);
          let [, vkey, name] = eventName.match(/^(v)?(.+)$/);
          if (vkey)
            virtualize(ke);
          let event = createEvent(name, ke);
          target.dispatchEvent(event);
        });
      }
    } catch (e) {
      finalize();
      throw e;
    }

    finalize();
  }

  function makeTryValidator (func)
    function (value) {
      try {
        liberator.log(value);
        func(value);
        return true;
      } catch (e) {}
      return false;
    };

  let regexpValidator = makeTryValidator(RegExp);

  let xpathValidator =
    makeTryValidator(function (expr) document.evaluate(expr, document, null, null, null))

  function fromModeString (s){
    for (let [, {name, mask, char}] in Iterator(modes._modeMap))
      if (s === name || s === char)
        return mask;
  }

  function fromModeStrings (ss, def) {
    if (def && (!ss || ss.length < 1))
      return [modes.NORMAL];
    return ss.map(fromModeString).filter(function (it) (typeof it === 'number'));
  }

  function modeStringsValidator (ss)
    (!ss || (fromModeStrings(ss).length === ss.length));

  function makeListValidator (list)
    function (values)
      (values && !values.some(function (value) !list.some(function (event) event === value)));

  function findMappings ({all, filter, urls, ignoreUrls, not, result, modes: targetModes}) {
    function match (map) {
      let r = (
        map.feedSomeKeys &&
        (all ||
         (!filter || filter === map.names[0]) &&
         (ignoreUrls || urls === IGNORE_URLS || mappings._matchingUrlsTest(map, urls)))
      );
      if (result && r) {
        if (typeof result.matched === 'number')
          result.matched++;
        else
          result.matched = 1;
      }
      return !!r ^ !!not;
    }

    if (filter)
      filter = mappings._expandLeader(filter);
    if (urls)
      urls = RegExp(urls);

    // FIXME 同じオブジェクトがダブって返るかも(あるいはそれで良い？)
    let result = [];
    for (let [, m] in Iterator(targetModes || [modes.NORMAL]))
      result = result.concat(mappings._user[m].filter(match));

    return result;
  }

  function unmap (condition) {
    condition = Object.create(condition);
    let ms = condition.modes || [modes.NORMAL];
    condition.not = true;
    condition.modes = undefined;
    for (let [, m] in Iterator(ms)) {
      condition.modes = [m];
      mappings._user[m] = findMappings(condition);
    }
  }

  function list (condition) {
    let maps = findMappings(condition);
    let template = modules.template;
    let length = 0;
    let list =
      xml`<table>
        ${
          template.map(maps, function (map){
            ++length;
            return template.map(map.names, function (name)
            xml`<tr>
              <td style="font-weight: bold">${name}</td>
              <td style="font-weight: bold">${map.feedSomeKeys.rhs}</td>
              <td>${map.matchingUrls ? map.matchingUrls : '[Global]'}</td>
            </tr>`)
          })
        }
      </table>`;

    if (length == 0) {
      liberator.echomsg("No mapping found");
      return;
    }
    commandline.echo(list, commandline.HL_NORMAL, commandline.FORCE_MULTILINE);
  }

  function fmapCompleter (context, args) {
    context.title = ['name', 'rhs & url'];
    context.completions = [
      [
        xml`<span style="font-weight: bold">${map.names[0]}</span>,
        <span>
          <span style="font-weight: bold">${map.feedSomeKeys.rhs}</span>
          <span>${
            args['-ignoreurls']
              ? xml`<span> for </span><span>${map.matchingUrls ? map.matchingUrls : 'Global'}</span>`
              : ''
          }</span>
        </span>`
      ]
      for each (map in findMappings({urls: args['-urls'], ignoreUrls: args['-ignoreurls']}))
    ];
  }

  function urlCompleter ({currentURL}) {
    return function (context, args) {
      let maps = findMappings({all: true});
      let uniq = {};
      let result = [
        (uniq[map.matchingUrls] = 1, [map.matchingUrls.source, map.names])
        for each (map in maps)
        if (map.matchingUrls && !uniq[map.matchingUrls])
      ];
      if (currentURL) {
        result.unshift(['^' + util.escapeRegex(buffer.URL), 'Current URL']);
        if (content.document.domain)
          result.unshift([util.escapeRegex(content.document.domain), 'Current domain']);
      }
      return result;
    };
  }

  function frameCompleter (context, args) {
    return [
      [i, frame.document.location]
      for each ([i, frame] in Iterator(getFrames()))
    ];
  }

  const ModeStringsCompleter = [
    [name, disp + ' mode' + (char ? ' (alias: ' + char + ')' : '')]
    for ([n, {name, char, disp, extended}] in Iterator(modes._modeMap))
    if (!extended && /^\D+$/.test(n))
  ];


  'fmap fmaps'.split(/\s+/).forEach(function (cmd) {
    let multi = cmd === 'fmaps';

    function action (multi) {
      return function (args) {
        let prefix = args['-prefix'] || '';
        let ms = fromModeStrings(args['-modes'], true);

        function add ([lhs, rhs]) {
          if (!lhs)
            return;

          rhs = rhs || lhs;
          mappings.addUserMap(
            ms,
            [prefix + lhs],
            args['description'] || 'by feedSomeKeys_3.js',
            function () {
              function body (win)
                (win.document.body || win.document);

              let win = document.commandDispatcher.focusedWindow;
              let frames = getFrames();

              let elem = liberator.focus || body(win);

              if (typeof args['-frame'] !== 'undefined') {
                frames = [frames[args['-frame']]];
                elem = body(frames[0]);
              }

              if (args['-xpath']) {
                elem = or(frames, function (f) fromXPath(f.document, args['-xpath'])) || elem;
              }

              if (args['-selector']) {
                elem = or(frames, function (f) f.document.querySelector(args['-selector'])) || elem;
              }

              feed(rhs, args['-events'] || ['keypress'], elem);
            },
            {
              matchingUrls: args['-urls'],
              feedSomeKeys: {
                rhs: rhs,
              }
            },
            true
          );
        }

        if (multi) {
          let sep = let (s = args['-separator'] || ',') function (v) v.split(s);
          args.literalArg.split(/\s+/).map(String.trim).map(sep).forEach(add);
        } else {
          let [, lhs, rhs] = args.literalArg.match(/^(\S+)\s+(.*)$/) || args.literalArg;
          if (!rhs) {
            list({
              filter: prefix + args.literalArg.trim(),
              urls: args['-urls'],
              ignoreUrls: !args['-urls'],
              modes: ms
            });
          } else {
            add([lhs, rhs]);
          }
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
          [['-modes', '-m'], commands.OPTION_LIST, modeStringsValidator, ModeStringsCompleter],
          [['-urls', '-u'], commands.OPTION_STRING, regexpValidator, urlCompleter({currentURL: true})],
          [['-desc', '-description', '-d'], commands.OPTION_STRING],
          [['-frame', '-f'], commands.OPTION_INT, null, frameCompleter],
          [['-xpath', '-x'], commands.OPTION_STRING, xpathValidator],
          [['-selector', '-s'], commands.OPTION_STRING],
          [['-prefix', '-p'], commands.OPTION_STRING],
          [
            ['-events', '-e'],
            commands.OPTION_LIST,
            makeListValidator(EVENTS_WITH_V),
            EVENTS_WITH_V.map(function (v) [v, v])
          ]
        ].concat(
          multi ? [[['-separator', '-s'], commands.OPTION_STRING]]
                : []
        ),
        completer: multi ? null : fmapCompleter
      },
      true
    );
  });

  commands.addUserCommand(
    ['fmapc'],
    'Clear fmappings',
    function (args) {
      let ms = fromModeStrings(args['-modes'], true);
      if (args.bang) {
        unmap({ignoreUrls: true, modes: ms});
        liberator.log('All fmappings were removed.');
      } else {
        let result = {};
        unmap({urls: args.literalArg, result: result, modes: ms});
        liberator.echo(result.matched ? 'Some fmappings were removed.' : 'Not found specifed fmappings.');
      }
    },
    {
      literal: 0,
      bang: true,
      completer: function (context) {
        context.title = ['URL Pattern'];
        context.completions = urlCompleter({})(context);
      },
      options: [
        [['-modes', '-m'], commands.OPTION_LIST],
      ]
    },
    true
  );

  commands.addUserCommand(
    ['funmap'],
    'Remove fmappings',
    function (args) {
      let urls = args['-urls'];
      let name = args.literalArg;
      if (!name)
        return liberator.echoerr('E471: Argument required');

      let result = {};
      unmap({
        filter: name,
        urls: urls,
        ignoreUrls: args['-ignoreurls'],
        result: result,
        modes: fromModeStrings(args['-modes'], true)
      });
      liberator.echo(result.matched ? 'Some fmappings were removed.' : 'Not found specifed fmappings.');
    },
    {
      literal: 0,
      options: [
        [['-modes', '-m'], commands.OPTION_LIST],
        [['-urls', '-u'], commands.OPTION_STRING, regexpValidator, urlCompleter({})],
        [['-ignoreurls', '-iu'], commands.OPTION_NOARG]
      ],
      completer: fmapCompleter
    },
    true
  );

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
    'State VKeys feed getFrames fromXPath virtualize unmap findMappings list'.split(/\s+/).reduce(
      function (result, name)
        (result[name] = eval(name), result),
      {}
    );

})();

// vim:sw=2 ts=2 et si fdm=marker:
