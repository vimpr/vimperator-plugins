/* NEW BSD LICENSE {{{
Copyright (c) 2009, anekos.
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
  <description>Move the caret position by hint</description>
  <description lang="ja">Hint を使ってキャレット位置を移動</description>
  <version>1.1.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/caret-hint.js</updateURL>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <detail><![CDATA[
    == Global Variables ==
      let g:caret_hint_key:
        Hint mode key.
        Move the caret position to the selected element.
      let g:caret_hint_select_key:
        Hint mode key.
        Move the caret position to the selected element, and select.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Global Variables ==
      let g:caret_hint_key:
        Hint モードのキー。
        選択した要素の位置にキャレットを移動する。
      let g:caret_hint_select_key:
        Hint モードのキー。
        選択した要素の位置にキャレットを移動し、要素を選択する。
  ]]></detail>
</VimperatorPlugin>;
// }}}

(function () {

  let headMode = liberator.globalVariables.caret_hint_key || 'c';
  let selectMode = liberator.globalVariables.caret_hint_select_key || 'C';

  function moveCaret (elem, type) {
    let doc = elem.ownerDocument;

    let win = new XPCNativeWrapper(window.content.window);
    let sel =  win.getSelection();
    sel.removeAllRanges();

    let r = doc.createRange();
    r.selectNodeContents(elem);

    switch (type) {
      case 'select':
        mappings.getDefault(modes.NORMAL, 'i').action();
        mappings.getDefault(modes.CARET, 'v').action();
        break;
      case 'head':
        r.setEnd(r.startContainer, r.startOffset);
        mappings.getDefault(modes.NORMAL, 'i').action();
        break;
    }

    sel.addRange(r);
  }

  hints.addMode(
    headMode,
    'Move the caret position',
    function (elem, _, count) {
      moveCaret(elem, 'head');
    },
    function () '//*'
  );

  hints.addMode(
    selectMode,
    'Move the caret position and select',
    function (elem, _, count) {
      moveCaret(elem, 'select');
    },
    function () '//*'
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
