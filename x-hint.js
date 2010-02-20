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
  <name>X-Hint</name>
  <name lang="ja">X-Hint</name>
  <description>Show the hints with given XPath.</description>
  <description lang="ja">指定のXPathでヒントを表示する。</description>
  <version>1.0.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/x-hint.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    :xh[int] <Hint-Mode> <XPath>:
      Show the <Hint-Mode> hints with <XPath>
  ]]></detail>
  <detail lang="ja"><![CDATA[
    :xh[int] <Hint-Mode> <XPath>:
      <XPath> で <Hint-Mode> ヒントを表示
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="X-Hint" version="1.0.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/x-hint.js"
          summary="Show the hints with given XPath."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <p>Show the hints with given XPath.</p>
    <item>
      <tags>:xhint</tags>
      <tags>:xh</tags>
      <spec>:xh<oa>int</oa> <a>HintMode</a> <a>XPath</a></spec>
      <description>
        <p>
          Show the <a>HintMode</a> hints with <a>XPath</a>
        </p>
      </description>
    </item>
  </plugin>
  <plugin name="X-Hint" version="1.0.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/x-hint.js"
          summary="Show the hints with given XPath."
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <p>Show the hints with given XPath.</p>
    <item>
      <tags>:xhint</tags>
      <tags>:xh</tags>
      <spec>:xh<oa>int</oa> <a>HintMode</a> <a>XPath</a></spec>
      <description>
        <p>
          <a>XPath</a> で <a>HintMode</a> ヒントを表示する。
        </p>
      </description>
    </item>
  </plugin>
</>;
// }}}


(function () {

  const description = 'Show the hint with given xpath';

  let last = {};

  function xpath ()
    ((last.args && last.args.literalArg) || '//a')

  plugins.libly.$U.around(
    hints,
    'show',
    function (next, [minor, filter, win]) {
      if (last.args) {
        // save
        last.hintMode = this._hintModes[minor];
        last.hintTags = last.hintMode.tags;
        // override
        last.hintMode.tags = xpath;
      }
      return next();
    },
    true
  );

  plugins.libly.$U.around(
    hints,
    'hide',
    function (next, [minor, filter, win]) {
      if (last.hintMode)
        last.hintMode.tags = last.hintTags;
      last = {};
      return next();
    },
    true
  );

  commands.addUserCommand(
    ['xh[int]'],
    description,
    function (args) {
      last.args = args;
      hints.show(args[0]);
    },
    {
      literal: 1
    },
    true
  );
})();

// vim:sw=2 ts=2 et si fdm=marker:
