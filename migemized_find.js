/* NEW BSD LICENSE {{{
Copyright (c) 2008-2011, anekos.
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
<>
  <plugin name="MigemizedFind" version="2.11.3"
          href="http://vimpr.github.com/"
          summary="Search and Highlight with Migemo."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
  </plugin>
  <plugin name="MigemizedFind" version="2.11.3"
          href="http://vimpr.github.com/"
          summary="Migemo で検索 &amp; ハイライト"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p>
      このプラグインは _libly.js が必要です。
    </p>
    <item>
      <tags>migemized_find_search_word_spec</tags>
      <description><p>First letter of search word:
        <dl>
          <dt>/</dt><dd>Regexp search</dd>
          <dt>?</dt><dd>Migemo search</dd>
          <dt>otherwise</dt><dd>Migemo search</dd>
          </dl>
      </p></description>
    </item>
    <item>
      <tags>:migelight</tags>
      <tags>:ml</tags>
      <spec>:migelight <oa>-color=<a>color</a></oa> <a>word</a></spec>
      <spec>:ml <oa>-color=<a>color</a></oa> <a>word</a></spec>
      <description><p>
        <a>word</a> をハイライトする。
      </p></description>
    </item>
    <item>
      <tags>:removemigelight</tags>
      <tags>:rml</tags>
      <spec>:removemigelight <a>color1</a> <oa>color2</oa> <oa>color3</oa> ...</spec>
      <spec>:rml <a>color1</a> <oa>color2</oa> <oa>color3</oa> ...</spec>
      <description><p>
        <a>color</a> のハイライトを削除する。
        <a>color</a> に "all" を指定すると全て削除される。
      </p></description>
    </item>
    <item>
      <tags>g:migemized_find_language</tags>
      <spec>let g:migemized_find_language = <a>lang</a></spec>
      <description><p>
        検索対象言語の設定
      </p></description>
    </item>
    <item>
      <tags>g:migemized_find_history_limit</tags>
      <spec>let g:migemized_history_limit = <a>number</a></spec>
      <description><p>
        検索履歴の保存される最大数 (デフォルト: 100)
      </p></description>
    </item>
  </plugin>
</>;
// }}}

(function () {

  let XMigemoCore = Components.classes['@piro.sakura.ne.jp/xmigemo/factory;1']
                     .getService(Components.interfaces.pIXMigemoFactory)
                     .getService(liberator.globalVariables.migemized_find_language || 'ja');

  let colors = {
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    ghostwhite: '#f8f8ff',
    aliceblue: '#f0f8ff',
    lavendar: '#e6e6fa',
    azure: '#f0ffff',
    lightcyan: '#e0ffff',
    mintcream: '#f5fffa',
    honeydew: '#f0fff0',
    ivory: '#fffff0',
    beige: '#f5f5dc',
    lightyellow: '#ffffe0',
    lightgoldenrodyellow: '#fafad2',
    lemonchiffon: '#fffacd',
    floralwhite: '#fffaf0',
    oldlace: '#fdf5e6',
    cornsilk: '#fff8dc',
    papayawhite: '#ffefd5',
    blanchedalmond: '#ffebcd',
    bisque: '#ffe4c4',
    snow: '#fffafa',
    linen: '#faf0e6',
    antiquewhite: '#faebd7',
    seashell: '#fff5ee',
    lavenderblush: '#fff0f5',
    mistyrose: '#ffe4e1',
    gainsboro: '#dcdcdc',
    lightgray: '#d3d3d3',
    lightsteelblue: '#b0c4de',
    lightblue: '#add8e6',
    lightskyblue: '#87cefa',
    powderblue: '#b0e0e6',
    paleturquoise: '#afeeee',
    skyblue: '#87ceeb',
    mediumaquamarine: '#66cdaa',
    aquamarine: '#7fffd4',
    palegreen: '#98fb98',
    lightgreen: '#90ee90',
    khaki: '#f0e68c',
    palegoldenrod: '#eee8aa',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    peachpuff: '#ffdab9',
    wheat: '#f5deb3',
    pink: '#ffc0cb',
    lightpink: '#ffb6c1',
    thistle: '#d8bfd8',
    plum: '#dda0dd',
    silver: '#c0c0c0',
    darkgray: '#a9a9a9',
    lightslategray: '#778899',
    slategray: '#708090',
    slateblue: '#6a5acd',
    steelblue: '#4682b4',
    mediumslateblue: '#7b68ee',
    royalblue: '#4169e1',
    blue: '#0000ff',
    dodgerblue: '#1e90ff',
    cornflowerblue: '#6495ed',
    deepskyblue: '#00bfff',
    cyan: '#00ffff',
    aqua: '#00ffff',
    turquoise: '#40e0d0',
    mediumturquoise: '#48d1cc',
    darkturquoise: '#00ced1',
    lightseagreen: '#20b2aa',
    mediumspringgreen: '#00fa9a',
    springgreen: '#00ff7f',
    lime: '#00ff00',
    limegreen: '#32cd32',
    yellowgreen: '#9acd32',
    lawngreen: '#7cfc00',
    chartreuse: '#7fff00',
    greenyellow: '#adff2f',
    yellow: '#ffff00',
    gold: '#ffd700',
    orange: '#ffa500',
    darkorange: '#ff8c00',
    goldenrod: '#daa520',
    burlywood: '#deb887',
    tan: '#d2b48c',
    sandybrown: '#f4a460',
    darksalmon: '#e9967a',
    lightcoral: '#f08080',
    salmon: '#fa8072',
    lightsalmon: '#ffa07a',
    coral: '#ff7f50',
    tomato: '#ff6347',
    orangered: '#ff4500',
    red: '#ff0000',
    deeppink: '#ff1493',
    hotpink: '#ff69b4',
    palevioletred: '#db7093',
    violet: '#ee82ee',
    orchid: '#da70d6',
    magenta: '#ff00ff',
    fuchsia: '#ff00ff',
    mediumorchid: '#ba55d3',
    darkorchid: '#9932cc',
    darkviolet: '#9400d3',
    blueviolet: '#8a2be2',
    mediumpurple: '#9370db1',
    gray: '#808080',
    mediumblue: '#0000cd',
    darkcyan: '#008b8b',
    cadetblue: '#5f9ea0',
    darkseagreen: '#8fbc8f',
    mediumseagreen: '#3cb371',
    teal: '#008080',
    forestgreen: '#228b22',
    seagreen: '#2e8b57',
    darkkhaki: '#bdb76b',
    peru: '#cd853f',
    crimsin: '#dc143c',
    indianred: '#cd5c5c',
    rosybrown: '#bc8f8f',
    mediumvioletred: '#c71585',
    dimgray: '#696969',
    black: '#000000',
    midnightblue: '#191970',
    darkslateblue: '#483d8b',
    darkblue: '#00008b',
    navy: '#000080',
    darkslategray: '#2f4f4f',
    green: '#008000',
    darkgreen: '#006400',
    darkolivegreen: '#556b2f',
    olivedrab: '#6b8e23',
    olive: '#808000',
    darkgoldenrod: '#b8860b',
    chocolate: '#d2691e',
    sienna: '#a0522d',
    saddlebrown: '#8b4513',
    firebrick: '#b22222',
    brown: '#a52a2a',
    maroon: '#800000',
    darkred: '#8b0000',
    darkmagenta: '#8b008b',
    purple: '#800080',
    indigo: '#4b0082',
  };

  let colorsCompltions = [
    [name, <span style={'color: ' + name}>{'\u25a0 ' + value}</span>]
    for each ([name, value] in Iterator(colors))
  ];

  let store = storage.newMap(__context__.NAME, {store: true});

  function s2b (s, d) (!/^(\d+|false)$/i.test(s)|parseInt(s)|!!d*2)&1<<!s;

  function getPosition (elem) {
    if (!elem)
      return {x: 0, y: 0};
    let parent = getPosition(elem.offsetParent);
    return { x: (elem.offsetLeft || 0) + parent.x,
             y: (elem.offsetTop  || 0) + parent.y  }
  }

  function slashArray (ary, center) {
    let head = [], tail = [];
    let current = head;
    for (let i = 0; i < ary.length; i++) {
      let it = ary[i];
      if (it == center)
        current = tail;
      else
        current.push(it);
    }
    return [head, tail];
  }

  let MF = {
    // 定数
    MODE_NORMAL: 0,
    MODE_REGEXP: 1,
    MODE_MIGEMO: 2,

    // 検索履歴
    history: store.get('history', []),

    // 全体で共有する変数
    lastSearchText: null,
    lastSearchExpr: null,
    lastDirection: null,
    lastColor: null,
    currentSearchText: null,
    currentSearchExpr: null,
    currentColor: null,

    // submit の為に使う
    firstResult: null,

    // --color-- の部分は置換される。
    style: 'background-color: --color--; color: black; border: dotted 3px blue;',
    findColor: 'lightblue',
    highlightColor: 'orange',

    // 手抜き用プロパティ
    get document () content.document,

    // タブ毎に状態を保存するために、変数を用意
    // 初回アクセス時に初期化を行う
    get storage () (
      gBrowser.mCurrentTab.__migemized_find_storage ||
      (gBrowser.mCurrentTab.__migemized_find_storage = {
        highlightRemovers: {},
      })
    ),

    // 現在のタブのフレームリスト
    get currentFrames () {
      let result = [];
      (function (frame) {
        // ボディがない物は検索対象外なので外す
        let body = frame.document.querySelector('body');
        if (body && body.localName.toLowerCase() == 'body')
          result.push(frame);
        for (let i = 0; i < frame.frames.length; i++)
          arguments.callee(frame.frames[i]);
      })(content);
      return result;
    },

    // 履歴にアイテム追加
    pushHistory: function (s) {
      let exists = false, newHistory = [];
      newHistory.push(s);
      for (let [i, h] in Iterator(this.history)) {
        if (h === s) {
          exists = true;
        } else {
          newHistory.push(h);
        }
      }
      this.history = newHistory;
    },

    // ボディを範囲とした Range を作る
    makeBodyRange: function (frame) {
      let range = frame.document.createRange();
      range.selectNodeContents(frame.document.querySelector('body'));
      return range;
    },

    // this.style に色を適用した物を返す
    coloredStyle: function (color) {
      return this.style.replace(/--color--/, color);
    },

    // 検索文字列から検索モードと検索文字列を得る。
    searchTextToRegExpString: function (str) {
      let [head, tail] = [str[0], str.slice(1)];
      switch (head) {
        case '/':
          return tail;
        case '?':
          return XMigemoCore.getRegExp(tail);
      }
      return XMigemoCore.getRegExp(str);
    },

    // 指定色のハイライト削除
    removeHighlight: function (color) {
      (this.storage.highlightRemovers[color] || function () void(0))();
      delete this.storage.highlightRemovers[color];
    },

    focusLink: function (range) {
      let node = range.commonAncestorContainer;
      while (node && node.parentNode) {
        if (node.localName.toString().toLowerCase() == 'a')
          return void(Components.lookupMethod(node, 'focus').call(node));
        node = node.parentNode;
      }
    },

    highlight: function (target, color, doScroll, setRemover) {
      let span = this.document.createElement('span');

      span.setAttribute('style', this.coloredStyle(color));
      target.range.surroundContents(span);

      if (doScroll) {
        let scroll = function () {
          let pos = getPosition(span);
          target.frame.scroll(pos.x - (target.frame.innerWidth / 2),
                              pos.y - (target.frame.innerHeight / 2));
          let sel = target.frame.getSelection();
          let r = target.range.cloneRange();
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
        };
        setTimeout(scroll, 0);
      }

      let remover = function () {
        let range = this.document.createRange();
        range.selectNodeContents(span);
        let content = range.extractContents();
        range.setStartBefore(span);
        range.insertNode(content);
        range.selectNode(span);
        range.deleteContents();
      };

      if (setRemover)
        this.storage.highlightRemovers[color] = remover;

      return remover;
    },

    find: function (str, backwards, range, start, end) {
      if (!range)
        range = this.makeBodyRange(this.currentFrames[0]);

      if (!start) {
        start = range.startContainer.ownerDocument.createRange();
        start.setStartBefore(range.startContainer);
      }
      if (!end) {
        end = range.endContainer.ownerDocument.createRange();
        end.setEndAfter(range.endContainer);
      }

      // 検索方向に合わせて、開始終了位置を交換
      if (backwards)
        [start, end] = [end, start];

      try {
        return XMigemoCore.regExpFind(str, 'i', range, start, end, backwards);
      } catch (e) {
        return false;
      }
    },

    findFirst: function (str, backwards, color) {
      if (!color)
        color = this.findColor;

      this.lastDirection = backwards;
      let expr = this.searchTextToRegExpString(str);
      this.currentSearchText = str;
      this.currentSearchExpr = expr;
      this.currentColor = color;

      let result, frames = this.currentFrames;
      if (backwards)
        frames = frames.reverse();

      frames.some(function (frame)
        let (ret = this.find(expr, backwards, this.makeBodyRange(frame)))
          (ret && (result = this.storage.lastResult = { frame: frame, range: ret}))
      , this);

      this.removeHighlight(color);

      if (result)
        this.highlight(result, color, true, true);

      this.firstResult = result;

      return result;
    },

    findSubmit: function (str, backwards, color) {
      this.findFirst(str, backwards, color);
      return this.submit();
    },

    findAgain: function (reverse) {
      let backwards = !!(!this.lastDirection ^ !reverse);
      let last = this.storage.lastResult;

      let frames = this.currentFrames;

      // 前回の結果がない場合、(初め|最後)のフレームを対象にする
      // findFirst と"似た"挙動になる
      if (last) {
        if (backwards) {
          end = last.range.cloneRange();
          end.setEnd(last.range.startContainer, last.range.startOffset);
        } else {
          start = last.range.cloneRange();
          start.setStart(last.range.endContainer, last.range.endOffset);
        }
      } else {
        let idx = backwards ? frames.length - 1
                            : 0;
        last = {frame: frames[0], range: this.makeBodyRange(frames[0])};
      }

      this.removeHighlight(this.lastColor);

      let str = this.lastSearchExpr;
      let start, end;

      let result;
      let ret = this.find(str, backwards, this.makeBodyRange(last.frame), start, end);

      if (ret) {
        result = {frame: last.frame, range: ret};
      } else {
        // 見つからなかったので、ほかのフレームから検索
        let [head, tail] = slashArray(frames, last.frame);
        let next = backwards ? head.reverse().concat(tail.reverse())
                             : tail.concat(head);
        next.some(function (frame)
          let (ret = this.find(str, backwards, this.makeBodyRange(frame)))
            (ret && (result = {frame: frame, range: ret}))
        , this);
      }

      this.storage.lastResult = result;

      if (result) {
        this.highlight(result, this.lastColor, true, true);
        this.focusLink(result);
      }

      return result;
    },

    submit: function () {
      this.pushHistory(this.currentSearchText);

      this.lastSearchText = this.currentSearchText;
      this.lastSearchExpr = this.currentSearchExpr;
      this.lastColor = this.currentColor;
      if (this.firstResult)
        this.focusLink(this.firstResult.range);
      return this.firstResult;
    },

    cancel: function () {
    },

    highlightAll: function (str, color) {
      let expr = this.searchTextToRegExpString(str);
      this.lastSearchText = str;
      this.lastSearchExpr = expr;

      if (!color)
        color = this.highlightColor;

      this.removeHighlight(color);

      let frames = this.currentFrames;
      let removers = [];

      frames.forEach(function (frame) {
        let frameRange = this.makeBodyRange(frame);
        let ret, start = frameRange;
        while (ret = this.find(expr, false, frameRange, start)) {
          removers.push(this.highlight({frame: frame, range: ret}, color, false, false));
          start = ret.cloneRange();
          start.setStart(ret.endContainer, ret.endOffset);
        }
      }, this);

      this.storage.highlightRemovers[color] = function () { removers.forEach(function (it) it.call()); };

      return removers;
    },
  };


  // 前のタイマーを削除するために保存しておく
  let delayCallTimer = null;
  let delayedFunc = null;

  // Vimp の仕様変更に対応
  let _backwards;
  let _findFirst = function (str, backwards) {
      // 短時間に何回も検索をしないように遅延させる
      delayedFunc = function () MF.findFirst(str, backwards);
      if (delayCallTimer) {
        delayCallTimer = null;
        clearTimeout(delayCallTimer);
      }
      delayCallTimer = setTimeout(function () delayedFunc(), 500);
  };

  // ミゲモ化セット
  let migemized = {
    find: function find (str, backwards) {
      _backwards = backwards;
      if (str)
        _findFirst(str, backwards);
    },

    findAgain: function findAgain (reverse) {
      if (!MF.findAgain(reverse))
        liberator.echoerr('not found: ' + MF.lastSearchText);
    },

    onSubmit: function searchSubmitted (command, forcedBackward) {
      if (delayCallTimer) {
        delayCallTimer = null;
        clearTimeout(delayCallTimer);
        delayedFunc();
      }
      if (MF.currentSearchText !== command)
        MF.findFirst(command, forcedBackward);
      if (!MF.submit())
        liberator.echoerr('not found: ' + MF.currentSearchText);
    },

    onCancel: function searchCanceled () {
      MF.cancel();
    },

    onChange: function (str) {
      if (typeof str == 'string') {
        _findFirst(str, _backwards);
      } else if (str === false)
        MF.findAgain();
    },

    completer: function (context, args) {
      context.compare = CompletionContext.Sort.unsorted;
      context.completions = [
        [v, v]
        for ([, v] in Iterator(MF.history))
      ];
    }
  };

  finder.findAgain = migemized.findAgain;

  plugins.libly.$U.around(
    finder,
    'openPrompt',
    function (next, [mode]) {
      let res = next();
      plugins.libly.$U.around(commandline._input, 'change', function (next, [str]) migemized.onChange(str));
      plugins.libly.$U.around(commandline._input, 'submit', function (next, [str]) migemized.onSubmit(str));
      plugins.libly.$U.around(commandline._input, 'cancel', function (next, [str]) migemized.onCancel());
      commandline._input.complete = migemized.completer;
      return res;
    },
    true
  );

  // highlight コマンド
  commands.addUserCommand(
    ['ml', 'migelight'],
    'Migelight matched words',
    function (args) {
      let w = args.literalArg;
      MF.pushHistory(w);
      let r = MF.highlightAll(w, args['-color']);
      liberator.echo(r ? r.length + ' words migelighted.'
                       : 'word not found.');
    },
    {
      literal: 0,
      options: [
        [['-color', '-c'], commands.OPTION_STRING, null, colorsCompltions],
      ],
      completer: function (context, args) {
        context.compare = void 0;
        context.completions = [
          [v, 'History']
          for ([, v] in Iterator(MF.history))
        ];
      }
    },
    true
  );

  // remove highlight コマンド
  commands.addUserCommand(
    ['rml', 'removemigelight'],
    'Remove migelight',
    function (args) {
      if (!args.string)
        return MF.removeHighlight(MF.highlightColor);
      if (args.string == 'all')
        return [f() for each (f in MF.storage.highlightRemovers)];
      args.string.split(/\s+/).forEach(MF.removeHighlight, MF);
    },
    {
      completer: function (context, args) {
        context.title = ['Color', 'Sample'];
        context.completions = colorsCompltions;
      }
    },
    true
  );

  // find コマンド
  commands.addUserCommand(
    ['mf[ind]'],
    'Migemized find',
    function (args) {
      if (!MF.findSubmit(args.join(' '), args['-backward'], args['-color']))
        liberator.echoerr('not found: ' + MF.currentSearchText);
    },
    {
      options: [
        [['-backward', '-b'], commands.OPTION_NOARG],
        [['-color', '-c'], commands.OPTION_STRING, null, colorsCompltions],
      ]
    },
    true
  );

  // 外から使えるように
  liberator.plugins.migemizedFind = MF;

  // 履歴の保存
  __context__.onUnload = function () {
    let limit = parseInt(liberator.globalVariables.migemized_find_history_limit || 100, 10);
    store.set('history', MF.history.slice(0, limit));
  };

})();
