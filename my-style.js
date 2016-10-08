/* NEW BSD LICENSE {{{
Copyright (c) 2011, anekos.
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
var INFO = xml`
  <plugin name="MyStyle" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="Apply my style sheet to current page."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:mystyle-set</tags>
      <spec>:mys<oa>tyle</oa> set <a>URL</a> <a>CSS</a></spec>
      <description><p>
        Set <a>CSS</a> to <a>URL</a>.
        If <a>CSS</a> has any names of defined style, they are expanded.
      </p></description>
    </item>
    <item>
      <tags>:mystyle-unset</tags>
      <spec>:mys<oa>tyle</oa> unset <a>URL</a></spec>
      <description><p>
        Unset style for <a>URL</a>.
      </p></description>
    </item>
    <item>
      <tags>g:my_style_define</tags>
      <spec>g:my_style_define = <a>STYLES</a></spec>
      <description>
        <p>Define some styles and their names for completion and command.</p>
        <p>
        e.g.
        <code><![CDATA[
:js <<EOM
liberator.globalVariables.my_style_define = {
  blackboard: '* {color: white !important; background-color: #004040 !important }',
  bold: '* { font-weight: bold !important }'
};
EOM
        ]]></code>
        </p>
      </description>
    </item>
  </plugin>
  <plugin name="MyStyle" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="現在のページに自分用のスタイルを適用する"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:mystyle-set</tags>
      <spec>:mys<oa>tyle</oa> set <a>URL</a> <a>CSS</a></spec>
      <description><p>
        <a>URL</a> に <a>CSS</a> を適用します。
        <a>CSS</a> に定義されてスタイルの名前が含まれていると、それらは展開されます。
      </p></description>
    </item>
    <item>
      <tags>:mystyle-set</tags>
      <spec>:mys<oa>tyle</oa> unset <a>URL</a></spec>
      <description><p>
        <a>URL</a> セットされたスタイルを解除します。
      </p></description>
    </item>
    <item>
      <tags>g:my_style_define</tags>
      <spec>g:my_style_define = <a>STYLES</a></spec>
      <description>
        <p>補完とコマンド用にスタイルとその名前を定義します。</p>
        <p>
        e.g.
        <code><![CDATA[
:js <<EOM
liberator.globalVariables.my_style_define = {
  blackboard: '* {color: white !important; background-color: #004040 !important }',
  bold: '* { font-weight: bold !important }'
};
EOM
        ]]></code>
        </p>
      </description>
    </item>
  </plugin>
`;
// }}}

(function () {

  const StyleNamePrefix = 'my-style-';

  const DefaultDefinedStyle = {
    BLACKBOARD: `<![CDATA[
      * {
        color: white !important;
        background-color: #004040 !important;
        background-image: none !important;
      }
    ]]>`,
    NEKOME: `<![CDATA[
      body {
        background-image: url(http://snca.net/images/redeye.jpg) !important;
      }
      * {
        background: transparent !important;
        color: white !important;
      }
    ]]>`,
    VIMPMASK: `<![CDATA[
      body {
        background-image: url(http://snca.net/images/ildjarn.png) !important;
        background-repeat: no-repeat !important;
        background-position: right bottom !important;
        background-attachment: fixed !important;
      }
    ]]>`
  };

  if (!__context__.DefinedStyles) {
    Object.defineProperty(
      __context__,
      'DefinedStyles',
      {
        get: function () (liberator.globalVariables.my_style_define || DefaultDefinedStyle)
      }
    );
  }

  let Currents = {};

  const store = storage.newMap(__context__.NAME, {store: true});

  function expand (css)
    css.replace(/\w+/g, function (n) (DefinedStyles.hasOwnProperty(n) ? DefinedStyles[n] : n));

  function urlCompleter (context) {
    let cs = [];
    let loc = content.location;
    let pathname = loc.pathname;
    let paths = pathname.split('/').slice(1);

    for (let i = 0; i < paths.length; i++) {
      cs.push([
        [loc.protocol + '/',  loc.hostname].concat(paths.slice(0, i)).join('/') + '/*',
        'Current URL'
      ]);
    }

    cs.push([loc.hostname, 'Current HOST'])

    context.compare = null;
    context.completions = cs;

    context.fork(
      'CURRENT',
      0,
      context,
      function (context, args) {
        context.title = ['Style set URL'];
        context.completions = Array.from(Iterator(Currents));
      }
    );
  }

  function styleCompleter (context, args) {
    let style = Currents[args[0]];
    if (style)
      context.completions = [[style, 'CURRENT']];

    context.fork(
      'DEFINED',
      0,
      context,
      function (context) {
        let m = args.literalArg.match(/(\s+)\S*$/);
        if (m)
          context.advance(m.index + m[1].length);

        context.filters = [CompletionContext.Filter.textDescription];
        context.completions = Array.from(Iterator(DefinedStyles));
      }
    );
  }

  function styleNameCompleter (context) {
    context.completions = Array.from(Iterator(Currents));
  }

  function set (url, css) {
    Currents[url] = css;
    styles.addSheet(false, StyleNamePrefix + url, url, expand(css));
  }

  function unset (url, name) {
    if (name)
      url = url.slice(StyleNamePrefix.length);
    delete Currents[url];
    styles.removeSheet(false, StyleNamePrefix + url);
  }

  const SubCommands = [
    new Command(
      ['s[et]'],
      'Set style',
      function (args) {
        set(args[0], args.literalArg);
      },
      {
        literal: 1,
        completer: function (context, args) {
          (args.length > 1 ? styleCompleter : urlCompleter)(context, args);
        }
      }
    ),

    new Command(
      ['u[nset]'],
      'Unset style',
      function (args) {
        let m = args[0];
        if (m) {
          unset(m);
        } else {
          for (let [, style] in Iterator(styles)) {
            if (style.name.indexOf(StyleNamePrefix) === 0)
              unset(style.name, true);
          }
        }
      },
      {
        bang: true,
        literal: 0,
        completer: styleNameCompleter
      }
    ),

    new Command(
      ['p[ermanent]'],
      'Permanent current styles',
      function (args) {
        store.set('permanent', Currents);
        store.save();
        liberator.echo('Permanent current styles');
      },
      {
        argCount: '0',
      }
    )
  ];

  commands.addUserCommand(
    ['mys[tyle]'],
    'Set style for me',
    function (args) {
      /* TODO list */
    },
    {
      subCommands: SubCommands
    },
    true
  );

  Currents = store.get('permanent', {});
  for (let [url, css] in Iterator(Currents)) {
    set(url, css);
  }

})();

// vim:sw=2 ts=2 et si fdm=marker:
