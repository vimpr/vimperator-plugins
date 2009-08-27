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
  <name>tabsort</name>
  <description>Add ":tabsort" command.</description>
  <description lang="ja">tabsort コマンドを追加する</description>
  <version>1.0.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <minVersion>2.2pre</minVersion>
  <maxVersion>2.2pre</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/tabsort.js</updateURL>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <detail><![CDATA[
    == Commands ==
    :tabso[or] [-t[arget]=<TARGET>]
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Commands ==
    :tabso[or] [-t[arget]=<TARGET>]:

    == Misc ==
    URLによるソートばかり使う！という人は
    >||
    command! urlsort tabsort -t=url
    ||<
    なんかを .vimperatorrc に書いておくと良いよ。
  ]]></detail>
</VimperatorPlugin>;
// }}}

(function () {

  function memberCompare (name)
    function (a, b) a[name].toString().localeCompare(b[name].toString());

  function tabSort (cmp) {
    let nbrowsers = getBrowser().browsers.length;
    let ts = [];
    for (let [i,] in tabs.browsers) {
      let b = getBrowser().getBrowserAtIndex(i);
      let c = b.contentDocument;
      ts.push({
        index: i,
        tab: gBrowser.mTabs[i],
        url: c.location.href,
        title: c.title
      });
    }
    ts.sort(cmp).forEach(function (it, i) (i == it.index) || getBrowser().moveTabTo(it.tab, i));
  }

  let targetOptions = [
    ['title', 'Title'],
    ['url', 'URL'],
  ];

  function targetValidater (value)
    targetOptions.some(function ([n,]) n == value);

  commands.addUserCommand(
    ['tabso[rt]'],
    'Sort tabs',
    function (arg) {
      tabSort(memberCompare(arg['-target'] || 'title'));
    },
    {
      argCount: '0',
      options: [
        [['-target', '-t'], commands.OPTION_STRING, targetValidater, targetOptions],
      ],
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
