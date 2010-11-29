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
  <name>Reveal Image</name>
  <description>Reveal IE Ctrl-A images.</description>
  <description lang="ja">IE の Ctrl-A 画像を暴く</description>
  <version>1.0.4</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/reveal-ie-ctrl-a-images.js</updateURL>
  <minVersion>2.3pre</minVersion>
  <maxVersion>2.3pre</maxVersion>
  <detail><![CDATA[
    == Description ==
      Reveal IE Ctrl-A images.
    == Global Variables ==
      g:reveal_ie_image_mode_normal = 'r':
        Hints mode for normal version.
      g:reveal_ie_image_mode_reverse = 'R':
        Hints mode for reverse version.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Description ==
      IE の Ctrl-A 画像を暴く
    == Global Variables ==
      g:reveal_ie_image_mode_normal = 'r':
        通常版のヒントモード
      g:reveal_ie_image_mode_reverse = 'R':
        反対版のヒントモード
  ]]></detail>
</VimperatorPlugin>;
// }}}

(function () {
  let ieimg = 'data:image/gif;base64,'+
              'R0lGODlhAgACAIABAF6BvP///yH+EUNyZWF0ZWQgd2l0aCBHSU1QACH5BAEKAAEALAAAAAACAAIA'+
              'AAIDRAIFADs=';

  let modeN = gv('reveal_ie_image_mode_normal', 'r');
  let modeR = gv('reveal_ie_image_mode_reverse', 'R');

  function gv (name, def)
    let (v = liberator.globalVariables[name])
      (v === undefined ? def : v);

  function getAbsPosition (elem) {
    let rect = elem.getBoundingClientRect();
    return {
      x: Math.max((rect.left + content.scrollX), content.scrollX),
      y: Math.max((rect.top  + content.scrollY), content.scrollY),
    };
  }

  function reveal (elem, sec, zura) {
    if (sec <= 0)
      sec = 5;
    let body = elem.ownerDocument.body;
    let indicator = elem.ownerDocument.createElement('div');
    let pos = getAbsPosition(elem);
    //let rect = elem.getBoundingClientRect();
    indicator.id = 'detect-hidden-indicator';
    let style = 'background-image: url(' + ieimg + ');' +
                //'opacity: 0.8;' + //TODO
                'background-repeat: repeat;' +
                'z-index: 999;' +
                'position: absolute; ' +
                'top: ' + (pos.y + (zura ? 1 : 0)) + 'px;' +
                'height:' + elem.clientHeight + 'px;'+
                'left: ' + pos.x + 'px;' +
                'width: ' + elem.clientWidth + 'px';
    indicator.setAttribute('style', style);
    body.appendChild(indicator);
    setTimeout(function () body.removeChild(indicator), sec * 1000);
  }

  // for debug
  if (0) {
    let xpath = '/html/body/div[2]/div[3]/table/tbody/tr/td[2]/div/table/tbody/tr/td[2]/div/img';
    let node = util.evaluateXPath(xpath).snapshotItem(0);
    reveal(node, 1);
  }

  [
    [modeN, false],
    [modeR, true]
  ].forEach(function ([mode, zura]) {
    if (!mode)
      return;
    hints.addMode(
      mode,
      'Reveal IE Ctrl-A images.' + (zura ? ' (reverse)' : ''),
      function (elem, loc, count) {
        reveal(elem, count, zura);
      },
      function () '//img'
    );
  });

  commands.addUserCommand(
    ['revealimage'],
    'Reveal IE Ctrl-A images.',
    function (args) {
      hints.show(args.bang ? modeR : modeN);
    },
    {
      bang: true
    },
    true
  );


})();

// vim:sw=2 ts=2 et si fdm=marker:

