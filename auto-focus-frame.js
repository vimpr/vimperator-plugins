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
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>Auto focus frame</name>
  <description>Automatically focus to largest frame.</description>
  <description lang="ja">最も大きなフレームに自動的にフォーカスする。</description>
  <version>1.0.10</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/auto-focus-frame.js</updateURL>
  <minVersion>2.3pre</minVersion>
  <maxVersion>2.3pre</maxVersion>
  <detail><![CDATA[
    == Usage ==
      Only install.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Usage ==
      インストールするだけ
      一番面積の大きいフレームをフォーカスします
  ]]></detail>
</VimperatorPlugin>`;
// }}}

(function () {

  function onLoad () {
    if (!(window.content.document instanceof HTMLDocument) || (content.frames.length <= 1))
      return;

    let targetFrames = content.frames
        .filter(frame => frame.frameElement instanceof HTMLFrameElement);

    let [maxSize, maxFrame] = [-1, null];
    targetFrames.forEach(function(frame) {
      if (frame.scrollMaxX <= 0 && frame.scrollMaxY <= 0)
        return;
      let size = frame.innerWidth * frame.innerHeight;
      if (maxSize < size)
        [maxSize, maxFrame] = [size, frame];
    });
    if (maxFrame)
      maxFrame.focus();
  }

  getBrowser().addEventListener("DOMContentLoaded", onLoad, true);


})();

// vim:sw=2 ts=2 et si fdm=marker:
