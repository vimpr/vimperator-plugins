//
// auto_word_select_mode.js
//
// LICENSE: {{{
//
//     This software distributable under the terms of an MIT-style license.
//
//     Copyright (c) 2009 snaka<snaka.gml@gmail.com>
//
//     Permission is hereby granted, free of charge, to any person obtaining a copy
//     of this software and associated documentation files (the "Software"), to deal
//     in the Software without restriction, including without limitation the rights
//     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//     copies of the Software, and to permit persons to whom the Software is
//     furnished to do so, subject to the following conditions:
//
//     The above copyright notice and this permission notice shall be included in
//     all copies or substantial portions of the Software.
//
//     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//     THE SOFTWARE.
//
//     OSI page : http://opensource.org/licenses/mit-license.php
//     Japanese : http://sourceforge.jp/projects/opensource/wiki/licenses%2FMIT_license
//
// }}}

// PLUGIN INFO: {{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>{NAME}</name>
  <description>Add auto word select mode.</description>
  <description lang="ja">単語を自動選択するモードを追加します</description>
  <minVersion>2.0</minVersion>
  <maxVersion>2.2pre</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/auto_word_select_mode.js</updateURL>
  <author mail="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
  <license>MIT style license</license>
  <version>1.2.3</version>
  <detail><![CDATA[
    == Subject ==
    Add auto word select mode.
    Mode name is "AUTO_WORD_SELECT".
    Press 'I' key to entering to AUTO_WORD_SELECT mode.
    If you want exit mode, press 'I' key again.
    This mode alway selects current word.

    == Global variables ==
    g:auto_word_select_key:
      The key that entering to AUTO_WORD_SELECT mode.
      Default is 'I'.

    == About define keymap with AUTO_WORD_SELECT mode ==
    The example of defining the key-map for the AUTO_WORD_SELECT mode
    is shown as follows.

    The following definitions are examples of assign behavior that
    displays the translation result of the word selecting it by 'alc'
    service by using multi_requester.js for 's' key.

    >||
    liberator.registerObserver("enter", function() {
      mappings.addUserMap(
        [modes.AUTO_WORD_SELECT],
        ["s"],
        "Translate selected word by multi_requester.js.",
        function() {
          // FIXME:
          // A present mode is preserved in the stack beforehand by the push() method
          // because it doesn't return to AUTO_WORD_SELECT mode before that when
          // returning from the OUTPUT_MULTILINE mode.
          modes.push(modes.AUTO_WORD_SELECT, null, true);

          var selText = content.getSelection().toString();
          var pattern = /[a-zA-Z]+/;
          selText = pattern.test(selText) ? pattern.exec(selText) : selText;
          events.feedkeys(":mr alc " + selText + "<CR>", true, true);
        }
      );
    });
    ||<

  ]]></detail>
  <detail lang="ja"><![CDATA[
    == 概要 ==
    単語を自動選択するモード(AUTO_WORD_SELECT)を追加します。
    'I'キーを押すことによって、AUTO_WORD_SELECTモードに移行します。
    このモードを抜けるには、再度'I'キーを押します。
    このモードでは常に単語が選択されている状態になり、キャレットの
    移動の単位も単語毎の移動になります。
    コンテンツ内の単語を頻繁に選択＆検索する場合などに便利です。

    == グローバル変数 ==
    g:auto_word_select_key:
      AUTO_WORD_SELECTモードに移行するためのキーです。
      デフォルトは'I'です。

    == AUTO_WORD_SELECTモード用のマップの定義について ==
    このモード用のマップの定義例として、multi_requester.jsを使用して
    web上の辞書サービスを使用して検索結果を表示するためのマップを
    定義する例を示します。

    >||
    liberator.registerObserver("enter", function() {
      mappings.addUserMap(
        [modes.AUTO_WORD_SELECT],
        ["s"],
        "Translate selected word by multi_requester.js.",
        function() {
          // FIXME:
          // A present mode is preserved in the stack beforehand by the push() method
          // because it doesn't return to AUTO_WORD_SELECT mode before that when
          // returning from the OUTPUT_MULTILINE mode.
          modes.push(modes.AUTO_WORD_SELECT, null, true);

          var selText = content.getSelection().toString();
          var pattern = /[a-zA-Z]+/;
          selText = pattern.test(selText) ? pattern.exec(selText) : selText;
          events.feedkeys(":mr alc " + selText + "<CR>", true, true);
        }
      );
    });
    ||<

    上記の例ではAUTO_WORD_SELECTモードにおいて、単語を選択した後、's'キーを
    押すと'alc'で登録されているサービスに対して検索を依頼し、その結果を
    画面下部のバッファに表示します。

    modes.push()は、OUTPUT_MULTILINEモードから抜けたときに、AUTO_WORD_SELECT
    モードに復帰させるために行っています。

    追加されたモードに対するマッピングはプラグインを読み込んだ後に行う必要
    があるので、registerObserver()で"enter"のタイミングでaddUserMap()している。

    multi_requester.jsの使い方については、ソースのコメントや以下の
    サイトなどを参照してください。
    - http://vimperator.kurinton.net/plugins/multi_requester.html
    - http://d.zeromemory.info/2008/11/20/vimperator-multi_requester.html

  ]]></detail>
</VimperatorPlugin>`;
// }}}

(function(){

const NEW_MODE = "AUTO_WORD_SELECT";
const KEY = liberator.globalVariables.auto_word_select_key || 'I';

if (!modes.AUTO_WORD_SELECT)
  modes.addMode(NEW_MODE, false, function() NEW_MODE);

// MAPPINGS {{{
mappings.addUserMap(
  [modes.NORMAL, modes.CARET, modes.VISUAL],
  [KEY],
  "Change to AUTO_WORD_SELECT mode.",
  function() {
    modes.push(modes.AUTO_WORD_SELECT);

    if (content.getSelection().rangeCount == 0) {
      let firstNode = content.document.body.firstChild;
      let range = content.document.createRange();
      range.setStart(firstNode, 0);
      range.setEnd(firstNode, 0);
      content.getSelection().addRange(range);
    }
  }
);

mappings.addUserMap(
  [modes.AUTO_WORD_SELECT],
  [KEY, "<Esc>"],
  "Exit AUTO_WORD_SELECT mode.",
  function() {
    modes.pop();
  }
);

mappings.add(
  [modes.AUTO_WORD_SELECT],
  [":"],
  "Change command line mode.",
  function() {
    // FIXME:
    // A present mode is preserved in the stack beforehand by the push() method
    // because it doesn't return to AUTO_WORD_SELECT mode before that when
    // exit from the COMMAND_LINE mode.
    modes.push(modes.AUTO_WORD_SELECT, null, true);
    mappings.get(modes.NORMAL, ":").action();
  }
);

mappings.add(
  [modes.AUTO_WORD_SELECT],
  ["v"],
  "Change visual mode.",
  function() {
    // FIXME:
    // cannot return to modes.AUTO_WORD_SELECT when <Esc><Esc>
    mappings.get(modes.NORMAL, "i").action();
    mappings.get(modes.CARET, "v").action();
  }
);

mappings.add(
  [modes.AUTO_WORD_SELECT],
  ["l"],
  "Move to right word and select.",
  function() {
    controller().wordMove(true, false);
    if (selectable()) selectWord();
  }
);

mappings.add(
  [modes.AUTO_WORD_SELECT],
  ["L"],
  "Extend to right word.",
  function() {
    var before = currentRange();
    content.getSelection().collapseToEnd();
    controller().wordMove(true, true);
    currentRange().setStart(before.startContainer, before.startOffset);
  }
);

mappings.add(
  [modes.AUTO_WORD_SELECT],
  ["h"],
  "Move to left word and select.",
  function() {
    var before = currentRange();
    content.getSelection().collapseToStart();
    controller().wordMove(false, false);
    if (selectable()) selectWord();

    // FIXME:
    // Because the caret doesn't move in a certain situation,
    // the following ugly codes are added.
    var after = currentRange();
    if (compareRange(before, after)) {
      content.getSelection().collapseToStart();
      controller().wordMove(false, false);
    }
  }
);

mappings.add(
  [modes.AUTO_WORD_SELECT],
  ["H"],
  "Extend to left word.",
  function() {
    var before = currentRange();
    content.getSelection().collapseToStart();
    controller().wordMove(false, true);
    currentRange().setEnd(before.endContainer, before.endOffset);
  }
);

mappings.add(
  [modes.AUTO_WORD_SELECT],
  ["j"],
  "Move to below word and select.",
  function() {
    content.getSelection().collapseToStart();
    controller().lineMove(true, false);
    if (selectable()) selectWord();
  }
);

mappings.add(
  [modes.AUTO_WORD_SELECT],
  ["k"],
  "Move to above word and select.",
  function() {
    var before = currentRange();
    content.getSelection().collapseToStart();
    controller().lineMove(false, false);
    if (selectable()) selectWord();

    // FIXME:
    // Because the caret doesn't move in a certain situation,
    // the following ugly codes are added.
    var after = currentRange();
    if (compareRange(before, after)) {
      content.getSelection().collapseToStart();
      controller().lineMove(false, false);
    }
  }
);

// inherites key mappings from CARET mode
[
  // keys                     hasCount  caretModeMethod  caretModeArg
  [["b", "B", "<C-Left>"],       true,  "wordMove",       false],
  [["w", "W", "e", "<C-Right>"], true,  "wordMove",       true ],
  [["<C-f>", "<PageDown>"],      true,  "pageMove",       true ],
  [["<C-b>", "<PageUp>"],        true,  "pageMove",       false],
  [["gg", "<C-Home>"],           false, "completeMove",   false],
  [["G", "<C-End>"],             false, "completeMove",   true ],
  [["0", "^", "<Home>"],         false, "intraLineMove",  false],
  [["$", "<End>"],               false, "intraLineMove",  true ],
].map(function(params) {
  let [keys, hasCount, caretModeMethod, caretModeArg] = params;

  let extraInfo = {};
  if (hasCount) {
    if (Mappings.flags)
      extraInfo.flags = Mappings.flags.COUNT; // for backward compatibility
    else
      extraInfo.count = true;
  }

  mappings.add([modes.AUTO_WORD_SELECT], keys, "",
    function (count) {
      if (typeof count != "number" || count < 1)
        count = 1;

      let controller = buffer.selectionController;
      while (count--)
        controller[caretModeMethod](caretModeArg, false);

      if (selectable()) selectWord();
    },
    extraInfo
  );
});

// }}}
// PRIVATE FUNCTIONS {{{
function selectWord() {
  controller().wordMove(true, false);
  controller().wordMove(false, true);
}

function controller()
  buffer.selectionController;

function compareRange(a, b) {
  return (a.startContainer.isSameNode(b.startContainer) &&
          a.endContainer.isSameNode(b.endNode) &&
          a.startOffset == b.startOffset &&
          a.endOffset   == b.endOffset )
            ? true
            : false;
}

function currentRange()
  content.getSelection().getRangeAt(0);

function selectable() {
  var sel = content.getSelection();
  if (sel.anchorNode.nodeType != 3)
    return false;
  if (sel.anchorOffset == sel.anchorNode.textContent.length)
    return false;

  return true;
}
// }}}

})();

// vim:sw=2 ts=2 et si fdm=marker:
