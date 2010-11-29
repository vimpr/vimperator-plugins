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
  <name>VideoController</name>
  <name lang="ja">VideoController</name>
  <description>Add :videocontrol command for HTML5 video.</description>
  <description lang="ja">HTML5 Video のために :videocontrol コマンドを追加する。</description>
  <version>1.1.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/video-controller.js</updateURL>
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
<>
  <plugin name="VideoController" version="1.0.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/video-controller.js"
          summary="Control HTML5 Videos"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <item>
      <tags>:videocontrol</tags>
      <spec>:videocontrol <a>command</a> <oa>arguments...</oa></spec>
      <description>
        <p>
        </p>
      </description>
    </item>
  </plugin>
  <plugin name="VideoController" version="1.0.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/video-controller.js"
          summary="Control HTML5 Videos"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <item>
      <tags>:videocontrol</tags>
      <spec>:videocontrol <a>command</a> <oa>arguments...</oa></spec>
      <description>
        <p>
        </p>
      </description>
    </item>
  </plugin>
</>;
// }}}


(function () {

  const HintName = 'anekos-video-controller-hint';

  function timeCodeToSec (t) {
    let [a, h, m, s] = (t.match(/(?:(\d+):)?(\d+):(\d+)/) || []).map(function (v) parseInt(v, 10) || 0);
    return a ? (h * 60 * 60 + m * 60 + s) : parseInt(t, 10);
  }

  let lastArgs = null;
  let controlls = {
    __proto__: null,
    play: function (elem) {
      elem.play();
    },
    pause: function (elem) {
      elem.pause();
    },
    volume: function (elem, value) {
      value = parseFloat(value);
      elem.volume = Math.min(value > 1 ? value / 100 : value, 100);
    },
    seek: function (elem, value) {
      elem.currentTime = timeCodeToSec(value);
    }
  };

  hints.addMode(
    HintName,
    'Select video',
    function (elem) {
      controlls[lastArgs[0]].apply(null, [elem].concat(lastArgs.slice(1)));
    },
    function () '//video'
  );

  commands.addUserCommand(
    ['videocontrol'],
    'Control HTML5 Videos',
    function (args) {
      lastArgs = args;
      hints.show(HintName);
    },
    {
      completer: function (context, args) {
        const completions = [[n, n] for (n in controlls)];
        context.title = ['Command', ''];
        context.completions = completions;
      }
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
