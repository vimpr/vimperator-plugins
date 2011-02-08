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
  <plugin name="FoxAge2ch" version="1.3.1"
          href="https://github.com/vimpr/vimperator-plugins/blob/master/foxage2ch.js"
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
  <plugin name="FoxAge2ch" version="1.3.1"
          href="https://github.com/vimpr/vimperator-plugins/blob/master/foxage2ch.js"
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
    findThread: function (threadId) {
      window.openDialog(
        'chrome://foxage2ch/content/findThread.xul',
        'FoxAge2ch:FindThread',
        'chrome,centerscreen,modal,all',
        threadId
      );
    },
    findThreadByURL: function (url) {
      let [boardId, threadId] = FoxAge2chUtils.parseFromURL(FoxAge2chUtils.unwrapURL(url));
      return FA.findThread(threadId);
    },
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

  SubCommands = [
    new Command(
      ['openu[pdates]', 'ou[pdates]'],
      'Open updated threads',
      function () {
        svc.openUpdates("root")
      },
      {
      },
      true
    ),

    new Command(
      ['c[heckupdates]'],
      'Check updated threads',
      function () {
        svc.checkUpdates("root")
      },
      {
      },
      true
    ),

    new Command(
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
    ),

    new Command(
      ['f[indthread]'],
      'Find thread',
      function (args) {
        let threadId = args.literalArg;
        if (threadId) {
          FA.findThread(threadId);
        } else {
          FA.findThreadByURL(buffer.URL);
        }
      },
      {
        literal: 0,
        completer: threadCompleter
      },
      true
    )
  ];

  [true, false].forEach(function (tab) {
    SubCommands.push(new Command(
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
    ));
  });

  commands.addUserCommand(
    'foxage',
    'Control FoxAge2ch',
    function (args) (0 - 0),
    {
      bang: true,
      literal: 1,
      subCommands: SubCommands,
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
