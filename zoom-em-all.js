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
  <name>Zoom Em All</name>
  <name lang="ja">Zoom Em All</name>
  <description>Zoom them all.</description>
  <description lang="ja">ブラウザ全体をズーム</description>
  <version>1.1.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/zoom-em-all.js</updateURL>
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
  <plugin name="ZoomEmAll" version="1.1.0"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/zoom-em-all.js"
          summary="Zoom or pan for whole firefox."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <p>Zoom or pan browser.</p>
    <item>
      <tags>:zoomall</tags>
      <tags>:zooma</tags>
      <spec>:zoomall <oa>percentage</oa></spec>
      <description>
        <p>Zoom to <oa>percentage</oa>.</p>
        <p>If not given the argument, reset zoom.</p>
      </description>
    </item>
  </plugin>
  <plugin name="ZoomEmAll" version="1.1.0"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/zoom-em-all.js"
          summary="ブラウザ全体をズーム"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <p>ブラウザ全体を拡大縮小します。</p>
    <item>
      <tags>:zoomall</tags>
      <tags>:zooma</tags>
      <spec>:zoomall <oa>percentage</oa></spec>
      <description>
        <p><oa>percentage</oa>(%)で拡縮します。</p>
        <p>引数省略時は、100%にリセットします。</p>
      </description>
    </item>
  </plugin>
</>;
// }}}

(function () {

  const docViewer =
    window.QueryInterface(Ci.nsIInterfaceRequestor).
      getInterface(Ci.nsIWebNavigation).
      QueryInterface(Ci.nsIDocShell).
      contentViewer.
      QueryInterface(Ci.nsIMarkupDocumentViewer);

  __context__.__defineGetter__('fullZoom', function () docViewer.fullZoom);
  __context__.__defineSetter__('fullZoom', function (v) docViewer.fullZoom = v);


  commands.addUserCommand(
    ['zooma[ll]', 'zoomemall'],
    'Zoom Em All',
    function (args) {
      let [, s, d] = args.literalArg.trim().match(/^([-+])(\d+)/) || [];
      if (d) {
        docViewer.fullZoom += parseInt(args.literalArg || '100', 10) / 100;
      } else {
        docViewer.fullZoom = parseInt(args.literalArg || '100', 10) / 100;
      }
    },
    {
      literal: 0
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
