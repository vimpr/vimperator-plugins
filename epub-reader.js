/* NEW BSD LICENSE {{{
Copyright (c) 2010-2011, anekos.
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

// INFO {{{
let INFO =
<>
  <plugin name="ePub Reader" version="1.1.1"
          href="http://vimpr.github.com/"
          summary="for ePub Reader addon"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <item>
      <tags>:epubreader</tags>
      <spec>:epubreader <a>action</a> <oa>number</oa></spec>.
      <description><p>Do <a>action</a>.</p></description>
    </item>
    <p>
      Action list:
      <dl>
        <dt>next</dt><dd>Go next page</dd>
        <dt>prev</dt><dd>Go previous page</dd>
        <dt>nextchapter</dt><dd>Go next chapter</dd>
        <dt>prevchapter</dt><dd>Go previous chapter</dd>
        <dt>bookmark</dt><dd>Bookmark in ePub Reader addon</dd>
        <dt>library</dt><dd>Open ePub Reader library</dd>
        <dt>jump</dt><dd>Jump to the page</dd>
      </dl>
    </p>
    <p>
      Each actions can do mapping.
      e.g.
      <code>
      let g:epub_reader_map_&gt;action&lt; = 'l >';
      </code>
    </p>
  </plugin>
  <plugin name="ePub Reader" version="1.1.1"
          href="http://vimpr.github.com/"
          summary="for ePub Reader addon"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <item>
      <tags>:epubreader</tags>
      <spec>:epubreader <a>action</a> <oa>number</oa></spec>.
      <description><p><a>action</a>を実行する。</p></description>
    </item>
    <p>
      Action のリスト:
      <dl>
        <dt>next</dt><dd>Go next page</dd>
        <dt>prev</dt><dd>Go previous page</dd>
        <dt>nextchapter</dt><dd>Go next chapter</dd>
        <dt>prevchapter</dt><dd>Go previous chapter</dd>
        <dt>bookmark</dt><dd>Bookmark in ePub Reader addon</dd>
        <dt>library</dt><dd>Open ePub Reader library</dd>
        <dt>jump</dt><dd>Jump to the page</dd>
      </dl>
    </p>
    <p>
      各アクションは
      <code>
      let g:epub_reader_map_&gt;action&lt; = 'l >';
      </code>
      のようにしてマッピングできます。
      一つのアクションに複数のマッピングをしたいときは、スペースで区切ります。
    </p>
  </plugin>
</>;
// }}}


(function () {

  const MapKeys = {
    prev: 'goPreviousPage',
    next: 'goNextPage',
    prevchapter: 'goPreviousChapter',
    nextchapter: 'goNextChapter',
    save: 'save',
    bookmark: 'bookmark',
    library: 'openLibrary',
    jump: 'jump'
  };

  const ReaderUrls = /^chrome:\/\/epubreader\/content\/reader.xul/;


  function press (query)
    content.document.querySelector(query).click();

  function pressN (query, n) {
    for (let i = 0; i < (n || 1); i++)
      press(query);
  }

  function makePress (query)
    function ()
      press(query);

  function makePressN (query)
    function (count)
      pressN(query, count);

  function withCompleter (main, completer) {
    main.completer = completer;
    return main;
  }

  function getIndexLinks ()
    let (frame = content.document.querySelector('#nav_frame').contentDocument)
      Array.slice(frame.querySelectorAll('.navPoint .childLevel > a'));

  let api = __context__.API = {
    bookmark:
      makePress('toolbarbutton#save'),
    goPreviousPage:
      makePressN('toolbarbutton#nav_page_backwards_button'),
    goNextPage:
      makePressN('toolbarbutton#nav_page_forwards_button'),
    goPreviousChapter:
      makePressN('toolbarbutton#nav_backwards_button'),
    goNextChapter:
      makePressN('toolbarbutton#nav_forwards_button'),
    openLibrary:
      makePress('toolbarbutton#library'),
    save:
      makePress('toolbarbutton#bookmark'),
    jump:
      withCompleter(
        function (index) {
          buffer.followLink(getIndexLinks()[index], liberator.CURRENT_TAB);
        },
        function (context, args) {
          context.compare = void 0;
          context.completions = [
            [i + ': ' + link.textContent, link.href.replace(/.*\//g, '').replace(/\.[^.]+$/, '')]
            for ([i, link] in Iterator(getIndexLinks()))
          ];
        }
      )
  };

  for (let keyValue in Iterator(MapKeys)) {
    let [key, value] = keyValue;
    let gvname = 'epub_reader_map_' + key;
    let map = liberator.globalVariables[gvname];

    if (!map)
      continue;

    let func = api[value];
    mappings.addUserMap(
      [modes.NORMAL],
      map.split(/\s+/),
      'for ePub Reader',
      function (count) func(count),
      {
        count: !!func.length,
        matchingUrls: ReaderUrls
      }
    );
  }

  commands.addUserCommand(
    ['epubreader'],
    'ePub Reader addon controler',
    function (args) {
      if (!ReaderUrls.test(buffer.URL))
        return liberator.echoerr('Not in ePub Reader');

      let [cmd, num] = args;
      let func = api[MapKeys[cmd]];
      if (!func)
        return liberator.echoerr('Unknown command: ' + cmd);
      func(parseInt(num, 10));
    },
    {
      literal: 1,
      completer: function (context, args) {
        if (args.length > 1) {
          let [cmd] = args;
          let func = api[MapKeys[cmd]];
          if (!func.completer)
            return;
          return func.completer(context, args);
        }

        context.completions = [keyValue for (keyValue in Iterator(MapKeys))];
      }
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
