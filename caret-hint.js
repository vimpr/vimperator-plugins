/* NEW BSD LICENSE {{{
Copyright (c) 2009-2010, anekos.
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
  <name>Caret Hint</name>
  <description>Move caret position by hint</description>
  <description lang="ja">Hint を使ってキャレット位置を移動</description>
  <version>1.3.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/caret-hint.js</updateURL>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    Move caret position by hint.
    == Global Variables ==
      let g:caret_hint_key = 'c':
        Hint mode key.
        Move caret position to the head of selected element.
      let g:caret_hint_tail_key = 'C':
        Hint mode key.
        Move caret position to the tail of selected element.
      let g:caret_hint_select_key = '' (default: disabled):
        Hint mode key.
        Move caret position to the head of selected element, and select.
      let g:caret_hint_select_tail_key = 'S':
        Hint mode key.
        Move caret position to the tail of selected element, and select.
      let g:caret_hint_swap_key = 's':
        The key mapping for Visual-mode.
        Swap caret position head to tail.
      If apply empty string ('') to these variables, these mapping or mode are not enabled.
    == Global Variables 2 ==
      let g:caret_hint_xpath = '//*':
        The XPath for hint-mode selection.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    Hint を使ってキャレット位置を移動
    == Global Variables 1 ==
      let g:caret_hint_key = 'c':
        Hint モードのキー
        選択した要素の先頭にキャレットを移動する
      let g:caret_hint_tail_key = 'C':
        Hint モードのキー
        選択した要素の後尾にキャレットを移動する
      let g:caret_hint_select_key = '' (デフォルト: 無効):
        Hint モードのキー
        選択した要素の先頭にキャレットを移動し、要素を選択する
      let g:caret_hint_select_tail_key = 'S':
        Hint モードのキー
        選択した要素の後尾にキャレットを移動し、要素を選択する
      let g:caret_hint_swap_key = 's':
        VISUAL モード用のキーマッピング
        キャレットの位置を交換する(先頭 <=> 後尾)
      これらの値に空文字列を与えれば、マッピングやモードは有効にされません。
    == Global Variables 2 ==
      let g:caret_hint_xpath = '//*':
        ヒント対象要素を選択するための XPath
  ]]></detail>
</VimperatorPlugin>;
// }}}

/*       _\|/_
         (o o)
 +----oOO-{_}-OOo------------+
 |TODO count@action の使い道 |
 |     要素 A-B 間を選択     |
 +---------------------------*/


(function () {

  // XXX 空白も有効
  let headMode = gval('caret_hint_key', 'c');
  let tailMode = gval('caret_hint_tail_key', 'C');
  let selectHeadMode = gval('caret_hint_select_key', '');
  let selectTailMode = gval('caret_hint_select_tail_key', 'S');
  let swapKey = gval('caret_hint_swap_key', 's');
  let extendLeader = gval('extend_leader', 'c');
  let hintXPath = liberator.globalVariables.caret_hint_xpath || '//*';

  let extendMode = false;

  [headMode, tailMode, selectHeadMode, selectTailMode].forEach(
    function(mode) {
      let map = extendLeader + ';' + mode;
      if (!mode)
        return;
      mappings.remove(modes.NORMAL, map); // for debug
      mappings.remove(modes.VISUAL, map); // for debug
      mappings.addUserMap(
        [modes.NORMAL, modes.VISUAL],
        [map],
        'desc',
        function () {
          extendMode = true;
          hints.show(mode);
        },
        {
        }
      );
    }
  );

  [
    [[true,  false], headMode],
    [[false, false], tailMode],
    [[true,  true ], selectHeadMode],
    [[false, true ], selectTailMode],
  ].forEach(function ([[h, s], m, d]) {
    if (!m)
      return;
    hints.addMode(
      m,
      'Move caret position to ' + (h ? 'head' : 'tail') + (s ? ' and Select' : ''),
      function (elem, loc, count) {
        moveCaret(elem, h, s);
        extendMode = false;
      },
      function () hintXPath
    );
  });

  if (swapKey) {
    mappings.addUserMap(
      [modes.VISUAL],
      [swapKey],
      'Swap caret position head to tail',
      swapCaret,
      {}
    );
  }


  function gval (name, def) {
    let v = liberator.globalVariables[name];
    return (v === undefined) ? def : v;
  }

  function swapCaret () {
    let win = new XPCNativeWrapper(window.content.window);
    let s = win.getSelection();

    if (s.rangeCount <= 0)
      return false;

    // 位置交換時に元の情報が失われるので保存しておく
    let [a, f] = [[s.anchorNode, s.anchorOffset], [s.focusNode, s.focusOffset]];
    s.collapse.apply(s, f);
    s.extend.apply(s, a);
  }

  function moveCaret (elem, head, select) {
    let doc = elem.ownerDocument;
    let win = new XPCNativeWrapper(window.content.window);
    let sel =  win.getSelection();
    let r = doc.createRange();

    sel.removeAllRanges();
    r.selectNodeContents(elem);

    if (select) {
      mappings.getDefault(modes.NORMAL, 'i').action();
      mappings.getDefault(modes.CARET, 'v').action();
    } else {
      if (head) {
        r.setEnd(r.startContainer, r.startOffset);
      } else {
        r.setStart(r.endContainer, r.endOffset);
      }
      mappings.getDefault(modes.NORMAL, 'i').action();
    }

    if (extendMode) {
      let a = sel.getRangeAt(0);
      if (r.compareBoundaryPoints(Range.END_TO_START, a) < 0) {
        r.setEnd(a.endContainer, a.endOffset);
      } else {
        r.setStart(a.startContainer, a.startOffset);
      }
    }

    sel.addRange(r);

    if (select && head)
      swapCaret();

  }
})();

// vim:sw=2 ts=2 et si fdm=marker:
