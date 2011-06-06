/* NEW BSD LICENSE {{{
Copyright (c) 2009-2011, anekos.
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
  <plugin name="Caret Hint" version="1.4.0"
          href="http://vimpr.github.com/"
          summary="Move caret position by hint"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>g:caret_hint_key</tags>
      <spec>let g:caret_hint_key = <a>key</a></spec>
      <description><p>
        Hint mode key.
        Move caret position to the head of selected element.
        (default: 'c')
      </p></description>
    </item>
    <item>
      <tags>g:caret_hint_tail_key</tags>
      <spec>let g:caret_hint_tail_key = <a>key</a></spec>
      <description><p>
        Hint mode key.
        Move caret position to the tail of selected element.
        (default: 'C')
      </p></description>
    </item>
    <item>
      <tags>g:caret_hint_select_key</tags>
      <spec>let g:caret_hint_select_key = <a>key</a></spec>
      <description><p>
        Hint mode key.
        Move caret position to the head of selected element, and select.
        (default: disabled)
      </p></description>
    </item>
    <item>
      <tags>g:caret_hint_select_tail_key</tags>
      <spec>let g:caret_hint_select_tail_key = <a>key</a></spec>
      <description><p>
        Hint mode key.
        Move caret position to the tail of selected element, and select.
        (default: 'S')
      </p></description>
    </item>
    <item>
      <tags>g:caret_hint_swap_key</tags>
      <spec>let g:caret_hint_swap_key = <a>key</a></spec>
      <description><p>
        The key mapping for Visual-mode.
        Swap caret position head to tail.
        (default: 's')
      </p></description>
    </item>
    <p>If apply empty string ('') to these variables, these mapping or mode are not enabled.</p>
    <item>
      <tags>g:caret_hint_xpath</tags>
      <spec>let g:caret_hint_xpath = <a>XPath</a></spec>
      <description><p>
        The XPath for hint-mode selection.
      </p></description>
    </item>
  </plugin>
  <plugin name="Caret Hint" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="Hint を使ってキャレット位置を移動"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>g:caret_hint_key</tags>
      <spec>let g:caret_hint_key = <a>key</a></spec>
      <description><p>
        Hint モードのキー
        選択した要素の先頭にキャレットを移動する
        (default: 'c')
      </p></description>
    </item>
    <item>
      <tags>g:caret_hint_tail_key</tags>
      <spec>let g:caret_hint_tail_key = <a>key</a></spec>
      <description><p>
        Hint モードのキー
        選択した要素の後尾にキャレットを移動する
        (default: 'C')
      </p></description>
    </item>
    <item>
      <tags>g:caret_hint_select_key</tags>
      <spec>let g:caret_hint_select_key = <a>key</a></spec>
      <description><p>
        Hint モードのキー
        選択した要素の先頭にキャレットを移動し、要素を選択する
        (default: disabled)
      </p></description>
    </item>
    <item>
      <tags>g:caret_hint_select_tail_key</tags>
      <spec>let g:caret_hint_select_tail_key = <a>key</a></spec>
      <description><p>
        Hint モードのキー
        選択した要素の後尾にキャレットを移動し、要素を選択する
        (default: 'S')
      </p></description>
    </item>
    <item>
      <tags>g:caret_hint_swap_key</tags>
      <spec>let g:caret_hint_swap_key = <a>key</a></spec>
      <description><p>
        VISUAL モード用のキーマッピング
        キャレットの位置を交換する(先頭 ⇔ 後尾)
        (default: 's')
      </p></description>
    </item>
    <p>これらの値に空文字列を与えれば、マッピングやモードは有効にされません。</p>
    <item>
      <tags>g:caret_hint_xpath</tags>
      <spec>let g:caret_hint_xpath = <a>XPath</a></spec>
      <description><p>
        ヒント対象要素を選択するための XPath
      </p></description>
    </item>
  </plugin>
</>;
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
  let hintXPath = liberator.globalVariables.caret_hint_xpath || '//*';

  [
    [[true,  false], ['caret-hint-move-head', headMode]],
    [[false, false], ['caret-hint-move-tail', tailMode]],
    [[true,  true ], ['caret-hint-select-head', selectHeadMode]],
    [[false, true ], ['caret-hint-select-tail', selectTailMode]],
  ].forEach(function ([[h, s], ms]) {
    ms.forEach(function (m) {
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

  commands.addUserCommand(
    ['caret'],
    'Caret control with hint',
    function (args) {
    },
    {
      subCommands: [
        new Command(
          ['m[ove]'],
          'Move caret',
          function () {},
          {
            subCommands: [
              new Command(
                ['h[ead]'],
                'Move caret to head of selected element',
                function () hints.show('caret-hint-move-head'),
                {}
              ),
              new Command(
                ['t[ail]'],
                'Move caret to head of selected element',
                function () hints.show('caret-hint-move-tail'),
                {}
              )
            ]
          }
        ),
        new Command(
          ['select'],
          'Select a element',
          function () {},
          {
            subCommands: [
              new Command(
                ['h[ead]'],
                'Select and move caret to head of selected element',
                function () hints.show('caret-hint-select-head'),
                {}
              ),
              new Command(
                ['t[ail]'],
                'Select and move caret to tail of selected element',
                function () hints.show('caret-hint-select-tail'),
                {}
              )
            ]
          }
        )
      ]
    },
    true
  );


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

  // Vimperator 3.0 までと 3.1 以降に両対応
  const [CaretKey, VisualKey] =
    /caret/.exec(mappings.getDefault(modes.NORMAL, 'i').description) ? ['i', 'v'] : ['c', 'v'];

  function moveCaret (elem, head, select) {
    let doc = elem.ownerDocument;
    let win = new XPCNativeWrapper(window.content.window);
    let sel =  win.getSelection();
    let r = doc.createRange();

    sel.removeAllRanges();
    r.selectNodeContents(elem);

    if (select) {
      mappings.getDefault(modes.NORMAL, CaretKey).action();
      mappings.getDefault(modes.CARET, VisualKey).action();
    } else {
      if (head) {
        r.setEnd(r.startContainer, r.startOffset);
      } else {
        r.setStart(r.endContainer, r.endOffset);
      }
      mappings.getDefault(modes.NORMAL, CaretKey).action();
    }

    sel.addRange(r);

    if (select && head)
      swapCaret();

  }
})();

// vim:sw=2 ts=2 et si fdm=marker:
