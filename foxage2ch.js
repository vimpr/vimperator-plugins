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
  <name>FoxAge2ch</name>
  <description>for FoxAge2ch</description>
  <version>1.1.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/foxage2ch.js</updateURL>
  <minVersion>2.4</minVersion>
  <maxVersion>2.4</maxVersion>
  <detail><![CDATA[
    for FoxAge2ch
  ]]></detail>
  <detail lang="ja"><![CDATA[
    for FoxAge2ch
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="FoxAge2ch" version="1.1.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/foxage2ch.js"
          summary="for FoxAge2ch addon"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.4"/>
    <p></p>
    <item>
      <tags>:foxageopen</tags>
      <spec>:foxageo<oa>pen</oa> <a>thread</a></spec>
      <description>
        <p>
          Open the selected <a>thread</a>
        </p>
      </description>
    </item>
  </plugin>
  <plugin name="FoxAge2ch" version="1.1.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/foxage2ch.js"
          summary="FoxAge2ch アドオン用"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.4"/>
    <p></p>
    <item>
      <tags>:foxageopen</tags>
      <spec>:foxageo<oa>pen</oa> <a>thread</a></spec>
      <description>
        <p>
          選択された <a>thread</a> を開く
        </p>
        <dl>
          <dt>☀</dt><dd>新着アリ(?)</dd>
          <dt>☁</dt><dd>生存中</dd>
          <dt>☂</dt><dd>死亡</dd>
        </dl>
      </description>
    </item>
  </plugin>
</>;
// }}}


(function () {

  Components.utils.import("resource://foxage2ch/utils.jsm");

  let svc = FoxAge2chUtils.service;

  const Status = {
    live: 0,
    new: 2,
    dead: 4
  };
  for (let [k, v] in Iterator(Status))
    Status[v] = k;

  const StatusIcon = {
    0: '\u2601', // 曇
    2: '\u2600', // 晴
    4: '\u2602', // 雨
  }

  function selType1 (board)
    (board.type === 1);

  const FA = {
    get threads ()
      util.Array.flatten([svc.getChildItems(board.id, {})
        for ([, board] in Iterator(svc.getChildItems("root", {})))
        if (selType1(board))
      ]),
    getThreadById: function (threadId) {
      for ([, thread] in Iterator(FA.threads)) {
        if (thread.id === threadId)
          return thread;
      }
      return;
    },
    titleToId: function (title) {
      for ([, thread] in Iterator(FA.threads)) {
        if (thread.title === title)
          return thread;
      }
      return;
    },
    findThread: function (threadId) {
      if (!threadId) {
        let thread = FA.titleToId(buffer.title);
        if (!thread)
          return;
        threadId = thread.id;
      }
      window.openDialog(
        'chrome://foxage2ch/content/findThread.xul',
        'FoxAge2ch:FindThread',
        'chrome,centerscreen,modal,all',
        threadId
      );
    }
  }
  __context__.utils = FA;

  function threadCompleter (context, args) {
    context.compare = void 0;
    for (let [v, k] in Iterator(Status)) {
      if (typeof v === 'string' && ('-' + v in args))
        args['-status'] = v;
    }
    context.filters = [CompletionContext.Filter.textDescription]
    context.completions = [
      [
        thread.id,
        let (icon = StatusIcon[thread.status])
        (icon ? icon + ' ' : '') + (idx + 1) + ': ' + thread.title
      ]
      for ([idx, thread] in Iterator(FA.threads))
      if (!('-status' in args) || (thread.status === Status[args['-status']]))
    ];
  }

  let threadCommandOptions =
    [
      [
        ['-status', '-s'],
        commands.OPTION_STRING,
        null,
        [[v, StatusIcon[k]] for ([v, k] in Iterator(Status)) if (typeof v === 'string')]
      ]
    ].concat([
      [['-' + k, '-' + k.slice(0, 1)], commands.OPTION_NOARG]
      for ([v, k] in Iterator(Status))
      if (typeof v === 'number')
    ]);

  SubCommands = Commands();
  [true, false].forEach(function (tab) {
    SubCommands.addUserCommand(
      (tab ? ['t[open]', 'tabo[pen]'] : ['o[pen]']),
      'Openthe borard from FoxAge2ch' + (tab ? ' in new tab' : 'in current tab'),
      function (args) {
        let thread = FA.getThreadById(args.literalArg.trim());
        if (thread)
          FoxAge2chUtils.service.openItem(thread, !tab ^ !args.bang, false);
      },
      {
        literal: 0,
        options: threadCommandOptions,
        completer: threadCompleter,
      }
    );
  });

  SubCommands.addUserCommand(
    ['openu[pdates]', 'ou[pdates]'],
    'Open updated threads',
    function () {
      svc.openUpdates("root")
    },
    {
    },
    true
  );

  SubCommands.addUserCommand(
    ['c[heckupdates]'],
    'Check updated threads',
    function () {
      svc.checkUpdates("root")
    },
    {
    },
    true
  );

  SubCommands.addUserCommand(
    ['a[ddthread]'],
    'Add a threadii',
    function (args) {
      let url = FoxAge2chUtils.unwrapURL(args.literalArg || buffer.URL);
      let addedItem = svc.addFavorite(url);
      if (addedItem)
        liberator.echo('Added: ' + url);
    },
    {
      literal: 0,
      completer: function (context, args) {
        context.completions = [
          [FoxAge2chUtils.unwrapURL(buffer.URL), 'Current Buffer']
        ];
      }
    },
    true
  );

  let mainCommand =
    commands.addUserCommand(
      'foxage',
      'Control FoxAge2ch',
      function (args) {
        let ([count, name, bang, args] = SubCommands.parseCommand(args.string)) {
          let cmd = SubCommands.getUserCommand(name);
          liberator.assert(cmd, 'Unknown sub command: ' + name);
          cmd.execute(args, bang, count);
        }
      },
      {
        bang: true,
        literal: 1,
        completer: function (context, args) {
          let [_, name, _, _] = SubCommands.parseCommand(args.string);
          let cmd = SubCommands.getUserCommand(name);

          if (args.length === 2 && cmd) {
            mainCommand.options = cmd.options;
            context.offet = args.string.indexOf(name);
            cmd.completer(context, args);
          } else {
            mainCommand.options = [];
            context.completions = [
              [cmd.names.filter(function (it) it.length > 1)[0], cmd.description]
              for (cmd in Iterator(SubCommands))
            ]
          }
        }
      },
      true
    );

})();

// vim:sw=2 ts=2 et si fdm=marker:
