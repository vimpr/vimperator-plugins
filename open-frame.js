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
  <name>openframe-command</name>
  <name lang="ja">openframeコマンド</name>
  <description>Add ":openframe" command.</description>
  <description lang="ja">":openframe" コマンドを追加する</description>
  <version>1.2.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/open-frame.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.4</maxVersion>
  <detail><![CDATA[
    Add "openframe" and "tabopenframe" command.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    コマンド "openframe" と "tabopenframe" を追加します。
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="openframe-command" version="1.2.1"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/open-frame.js"
          summary="Add openframe command."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <item>
      <tags>:openframe</tags>
      <spec>:openf<oa>rame</oa></spec>
      <description><p>Open the selected frame in current tab.</p></description>
    </item>
    <item>
      <tags>:tabopenframe</tags>
      <spec>:t<oa>ab</oa>o<oa>pen</oa>f<oa>rame</oa></spec>
      <description><p>Open the selected frame in new tab.</p></description>
    </item>
  </plugin>
  <plugin name="openframe-command" version="1.2.1"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/open-frame.js"
          summary="Add openframe command."
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <item>
      <tags>:openframe</tags>
      <spec>:openf<oa>rame</oa></spec>
      <description><p>現在のタブに選択したフレームを開く</p></description>
    </item>
    <item>
      <tags>:tabopenframe</tags>
      <spec>:t<oa>ab</oa>o<oa>pen</oa>f<oa>rame</oa></spec>
      <description><p>新しいタブに選択したフレームを開く</p></description>
    </item>
  </plugin>
</>;
// }}}

(function () {

  let gvModeName = {
    current: liberator.globalVariables.open_frame_hint_mode_current,
    tab: liberator.globalVariables.open_frame_hint_mode_tab
  };

  function frames () {
    let result = [];

    (function (win) {
      result = result.concat(Array.map(win.frames, function (win) win));
      Array.forEach(win.frames, arguments.callee);
    })(config.browser.contentWindow);

    return result;
  }

  [true, false].forEach(function (tab) {
    let desc = 'Open frame in ' + (tab ? 'current tab' : 'new tab');
    let modeName = gvModeName[tab ? 'tab' : 'current'] || ((tab ? 'tab-' : '') + 'open-frame');

    let open = function (url) liberator.open(url, tab ? liberator.NEW_TAB : liberator.CURRENT_TAB);

    hints.addMode(
      modeName,
      desc,
      function (elem) {
        open(elem.ownerDocument.location.href);
      },
      function () util.makeXPath(["body"])
    );

    commands.addUserCommand(
      tab ? ['tabopenf[rame]', 'topenf[rame]', 'tof[rame]']
          : ['openf[rame]', 'of[rame]'],
      desc,
      function (args) {
        if (args.literalArg) {
          open(args.literalArg);
        } else {
          hints.show(modeName);
        }
      },
      {
        literal: 0,
        completer: function (context) {
          context.title = ['URL', 'Title'];
          context.completions = [
            [f.location.href, f.document.title || '<No Title>']
            for each (f in frames())
          ];
        }
      },
      true
    );
  });

})();

// vim:sw=2 ts=2 et si fdm=marker:
