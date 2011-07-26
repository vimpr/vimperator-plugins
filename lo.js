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
  <name>Link Opener</name>
  <name lang="ja">Link Opener</name>
  <description>Link Opener</description>
  <description lang="ja">リンクを開く</description>
  <version>2.3.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/lo.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    :help link-opener-plugin
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="link-opener" version="2.3.1"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/lo.js"
          summary="Link Opener"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3" maxVersion="3.0"/>
    <p>
    </p>
    <item>
      <tags>:fo</tags>
      <tags>:fopen</tags>
      <tags>:filteropen</tags>
      <spec>:fo<oa>pen</oa><oa>!</oa> <oa>-w<oa>here</oa>=<a>where</a></oa> <oa>-i<oa>nterval</oa>=<a>interval</a></oa> <oa>-include-current</oa> <a>filter</a></spec>
      <description>
        <p>
          Open the links selected with <a>filter</a>.
          <a>interval</a> is the interval of link opening.
        </p>
        <p>The values of <a>where</a> option</p>
        <dl>
          <dt>f, n, t</dt><dd>Open the link in new tab.</dd>
          <dt>b</dt><dd>Open the link in new background tab.</dd>
          <dt>c</dt><dd>Open the link in current tab.</dd>
          <dt>w</dt><dd>Open the link in window.</dd>
        </dl>
      </description>
    </item>
    <item>
      <tags>:lopen</tags>
      <tags>:lo</tags>
      <tags>:linkopen</tags>
      <spec>:lo<oa>pen</oa><oa>!</oa> <oa>-w<oa>here</oa>=<a>where</a></oa> <oa>-include-current</oa> <a>link</a></spec>
      <description>
        <p>
          Open selected <a>link</a>.
          When used "!", open links in foreground.
        </p>
        <p>The values of <a>where</a> option</p>
        <dl>
          <dt>f, n, t</dt><dd>Open the link in new tab.</dd>
          <dt>b</dt><dd>Open the link in new background tab.</dd>
          <dt>c</dt><dd>Open the link in current tab.</dd>
          <dt>w</dt><dd>Open the link in window.</dd>
        </dl>
      </description>
    </item>
  </plugin>
  <plugin name="link-opener" version="2.3.1"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/lo.js"
          summary="Link Opener"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3" maxVersion="3.0"/>
    <p>
    </p>
    <item>
      <tags>:fo</tags>
      <tags>:fopen</tags>
      <tags>:filteropen</tags>
      <spec>:fo<oa>pen</oa><oa>!</oa> <oa>-w<oa>here</oa>=<a>where</a></oa> <oa>-i<oa>nterval</oa>=<a>interval</a></oa> <oa>-include-current</oa> <a>filter</a></spec>
      <description>
        <p>
          <a>filter</a> で選択されたリンクを開きます。
          <a>interval</a> はリンクを開く間隔です。
          <a>-include-current</a>が指定されると、現在のURLを指すリンクが含まれるようになります。
        </p>
        <p><a>where</a> オプションの値</p>
        <dl>
          <dt>f, n, t</dt><dd>新しいタブに開く</dd>
          <dt>b</dt><dd>バックグラウンドの新しいタブに開く</dd>
          <dt>c</dt><dd>現在のタブに開く</dd>
          <dt>w</dt><dd>新しいウインドウに開く</dd>
        </dl>
      </description>
    </item>
    <item>
      <tags>:lopen</tags>
      <tags>:lo</tags>
      <tags>:linkopen</tags>
      <spec>:lo<oa>pen</oa><oa>!</oa> <oa>-w<oa>here</oa>=<a>where</a></oa> <oa>-include-current</oa> <a>link</a></spec>
      <description>
        <p>
          選択されたリンク(<a>link</a>)を開きます。
          <a>-include-current</a>が指定されると、現在のURLを指すリンクが含まれるようになります。
        </p>
        <p><a>where</a> オプションの値</p>
        <dl>
          <dt>f, n, t</dt><dd>新しいタブに開く</dd>
          <dt>b</dt><dd>バックグラウンドの新しいタブに開く</dd>
          <dt>c</dt><dd>現在のタブに開く</dd>
          <dt>w</dt><dd>新しいウインドウに開く</dd>
        </dl>
      </description>
    </item>
  </plugin>
</>;
// }}}

// Usage:
//    :fo[pen][!] <REGEXP> [-i <INTERVAL_SEC>] [-w <WHERE>]
//      Open filtered links by regexp.
//      When used "!", open links in foreground.
//
//    :lo[pen][!] URI [-w <WHERE>]
//      Open URI
//
// Usage-ja:
//    :fo[pen][!] <ミゲ文字列> [-i <INTERVAL_SEC>] [-w <WHERE>]
//    :fo[pen][!] /<正規表現> [-i <INTERVAL_SEC>] [-w <WHERE>]
//      ミゲ文字列か正規表現でフィルタされたリンクを開く
//
//    :lo[pen][!] URI [-w <WHERE>]
//      URI を開く
//
//    ちなみに Migemo はなくても動きます。
//    無い場合は、 "/" 要らずで正規表現オンリーになります。
//
// Variables:
//    let g:fopen_default_interval="<INTERVAL_SEC>"


(function () {

  const CompItemStyle = "margin-right: 0.5em; max-height: 3em !important; max-width 6em !important;"

  let migemo = window.XMigemoCore;

  function constant (value)
    function () value;

  function isHttpLink (link)
    (link.href && link.href.indexOf('http') == 0);

  function isCurrent (link)
    (link.href === buffer.URL);

  function not (func)
    function () !func.apply(this, arguments);

  function lmatch (re, link)
    ((link.href.match(re) || link.textContent.toString().match(re)));

  function getLinks (includeCurrent) {
    function _get (content)
      Array.prototype.concat.apply(Array.slice(content.document.links), Array.slice(content.frames).map(_get));
    return _get(content).filter(isHttpLink).filter(includeCurrent ? constant(true) : not(isCurrent));
  }

  function makeRegExp (str) {
    return migemo ? (str.indexOf('/') == 0) ? new RegExp(str.slice(1), 'i')
                                            : migemo.getRegExp(str)
                  : new RegExp(str, 'i');
  }

  function filteredLinks (word, includeCurrent) {
    let links = getLinks(includeCurrent);
    if (word.match(/^\s*$/))
      return links;
    let re = makeRegExp(word);
    return [it for each (it in links) if (lmatch(re, it))];
  }

  function charToWhere (str, fail) {
    const table = {
      f: liberator.NEW_TAB,
      t: liberator.NEW_TAB,
      n: liberator.NEW_TAB,
      b: liberator.NEW_BACKGROUND_TAB,
      c: liberator.CURRENT_TAB,
      w: liberator.NEW_WINDOW,
    };
    return (str && table[str.charAt(0).toLowerCase()]) || fail;
  }

  function join (str)
  str.replace(/\n+/g, ' ').replace(/\s+/g, '');

  const WHERE_COMPLETIONS = ['f', 't', 'n', 'b', 'c', 'w'];

  let (foihandle) {

    commands.addUserCommand(
      ['fo[pen]', 'filteropen'],
      'Filtered open',
      function (args) {
        let where = charToWhere(args['-where'], args.bang ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB);
        let [i, links] = [1, filteredLinks(args.join(''), args['-include-current'])];
        if (!links.length)
          return;

        liberator.open(links[0].href, where);

        if (links.length <= 1)
          return;

        let interval = (args['-interval'] || liberator.globalVariables.fopen_default_interval || 1) * 1000;
        foihandle = setInterval(function () {
          try {
            liberator.open(links[i].href, where);
            if ((++i) >= links.length)
              clearInterval(foihandle);
          } catch (e) {
            clearInterval(foihandle);
          }
        }, interval);
      },
      {
        bang: true,
        literal: 0,
        options: [
          [['-interval', '-i'], commands.OPTION_INT],
          [['-where', '-w'], commands.OPTION_STRING, null, WHERE_COMPLETIONS],
          [['-include-current', '-I'], commands.OPTION_NOARG]
        ],
        completer: function (context, arg) {
          context.title = ['URL', 'Text Content'];
          // 本来の補完の絞り込みを抑止
          let filter = context.filter;
          context.filter = "";
          context.completions = filteredLinks(filter, args['-include-current']).map(function (it) ([it.href, join(it.textContent)]));
        },
      },
      true
    );

    commands.addUserCommand(
      ['stopfilteropen', 'stopfo[pen]'],
      'Stop filtered open',
      function () {
        clearInterval(foihandle);
      },
      {},
      true
    );

  }

  let (lolinks = []) {
    commands.addUserCommand(
      ['lo[pen]', 'linkopen'],
      'Filtered open',
      function (args) {
        let arg = args.literalArg;
        let where = charToWhere(args['-where'], args.bang ? liberator.NEW_TAB : liberator.CURRENT_TAB);
        let idx = parseInt(arg, 10);

        if (idx === NaN)
          return liberator.open(arg, where);

        let link = lolinks[idx];
        if (link)
          buffer.followLink(link, where);
        else
          liberator.open(arg, where);
      },
      {
        literal: 0,
        options: [
          [['-where', '-w'], commands.OPTION_STRING, null, WHERE_COMPLETIONS],
          [['-include-current', '-I'], commands.OPTION_NOARG]
        ],
        bang: true,
        completer: function (context, args) {
          lolinks = getLinks(args['-include-current']);
          context.filters = [CompletionContext.Filter.textDescription];
          context.anchored = false;
          context.title = ['URL', 'Text Content'];
          context.keys = {
            text: function ({elem, index}) (index + ': ' + join((elem.textContent || elem.href))),
            description: function ({elem}) (elem.href),
            thumbnail: function ({elem}) let (img = elem.querySelector('img')) (img && img.src)
          };
          context.compare = CompletionContext.Sort.number;
          let process = Array.slice(context.process);
          context.process = [
            process[0],
            function (item, text)
              (item.thumbnail ? <><img src={item.thumbnail} style={CompItemStyle}/>{text}</>
                              : process[1].apply(this, arguments))
          ];
          context.completions = lolinks.map(function (it, i) ({elem: it, index: i}));
        }
      },
      true
    );

  }

})();

// vim:sw=2 ts=2 et si fdm=marker:
