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
  <version>1.1.2</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/x-hint.js</updateURL>
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
  <plugin name="X-Hint" version="1.1.3"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/x-hint.js"
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
    <item>
      <tags>:xhintdo</tags>
      <tags>:xhdo</tags>
      <spec>:xhintdo <a>XPath</a> <a>javascript</a></spec>
      <description>
        <p>
          Show the hints with <a>XPath</a>.
          And do <a>javascript</a> code.
          This command gives the variable "elem" to the context of <a>javascript</a>.
        </p>
      </description>
    </item>
  </plugin>
  <plugin name="X-Hint" version="1.1.3"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/x-hint.js"
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
    <item>
      <tags>:xhintdo</tags>
      <tags>:xhdo</tags>
      <spec>:xhintdo <a>XPath</a> <a>javascript</a></spec>
      <description>
        <p>
          <a>XPath</a> でヒントを出し、<a>javascript</a> コードを実行します。
          <a>javascript</a> の context には 変数 "elem" が与えられます。
        </p>
      </description>
    </item>
  </plugin>
</>;
// }}}


(function () {

  const description = 'Show the hint with given xpath.';

  let last = {};

  function xpath ()
    (last.xpath || '//a')

  function restore () {
    if (last.hintMode)
      last.hintMode.tags = last.hintTags;
    last = {};
  }

  plugins.libly.$U.around(
    hints,
    'show',
    function (next, [minor, filter, win]) {
      if (last.xpath) {
        // save
        last.hintMode = this._hintModes[minor];
        last.hintTags = last.hintMode.tags;
        // override
        last.hintMode.tags = xpath;
      }
      try {
        return next();
      } catch (e) {
        restore();
        liberator.log('x-hint: restore tags for error');
        liberator.log(e);
      }
    },
    true
  );

  plugins.libly.$U.around(
    hints,
    'hide',
    function (next, [minor, filter, win]) {
      restore();
      return next();
    },
    true
  );

  function showHintsWith (mode, xpath) {
    last.xpath = xpath;
    hints.show(mode);
  }

  __context__.show = showHintsWith;

  commands.addUserCommand(
    ['xh[int]'],
    description + '(:xhint <mode> <xpath>)',
    function (args) {
      showHintsWith(args[0], args.literalArg);
    },
    {
      literal: 1
    },
    true
  );

  let (hintModeText = 'x-hint-do', js = null) {
    hints.addMode(
      hintModeText,
      'X-Hint DO',
      function (elem) {
        let context = {__proto__: modules.userContext, elem: elem};
        try {
          liberator.eval(js, context);
        } catch (e) {
          liberator.echoerr(e);
        }
      }
    );

    commands.addUserCommand(
      ['xhintdo', 'xhdo'],
      'Run js-code with X-Hint. (:xhdo <xpath> <javascript>)',
      function (args) {
        js  = args.literalArg;
        showHintsWith(hintModeText, args[0]);
      },
      {
        literal: 1,
        completer: function (context, args) {
          if (args.completeArg == 1)
            completion.javascript(context);
        }
      },
      true
    );
  }

})();

// vim:sw=2 ts=2 et si fdm=marker:
