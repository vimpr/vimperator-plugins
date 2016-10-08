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
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>Session Manager</name>
  <name lang="ja">Session Manager</name>
  <description>for Session Manager Addon</description>
  <version>1.3.4</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/session-manager.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.4</maxVersion>
  <detail><![CDATA[
    sm <sub-command> <session-name>
  ]]></detail>
  <detail lang="ja"><![CDATA[
    sm <sub-command> <session-name>
  ]]></detail>
</VimperatorPlugin>`;
// }}}
// INFO {{{
var INFO = xml`
  <plugin name="session-manager" version="1.3.4"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/session-manager"
          summary="for Session Manager Addon"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3" maxVersion="2.4" />
    <p>for Session Manager Addon.</p>
    <item>
      <tags>:sm</tags>
      <tags>:sessionmanager</tags>
      <spec>:sm <a>sub-command</a> <a>session-name</a></spec>
      <description>
        <p>
          Save or load the session.
        </p>
      </description>
    </item>
  </plugin>
  <plugin name="session-manager" version="1.3.4"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/session-manager"
          summary="for Session Manager Addon"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3" maxVersion="2.4" />
    <p>for Session Manager Addon.</p>
    <item>
      <tags>:sm</tags>
      <tags>:sessionmanager</tags>
      <spec>:sm <a>sub-command</a> <a>session-name</a></spec>
      <description>
        <p>
          セッションを保存したり読み込んだり
        </p>
      </description>
    </item>
  </plugin>
`;
// }}}

// 参考スクリプト:
//  http://d.hatena.ne.jp/mountain_dew/20090819/1250690775

(function () {

  if(!window.gSessionManager)
    return;

  let ignoreAuto = liberator.globalVariables.session_manager_ignore_auto || 0;

  let jsm = {};
  Cu.import("resource://sessionmanager/modules/session_manager.jsm", jsm);
  let gSessionManager = jsm.gSessionManager;

  function alias (obj, from, to)
    (obj[to] = function () obj[from].apply(obj, arguments));

  function fixFile (filename) {
    let dir = io.File(gSessionManager.getSessionDir());
    let file = dir.clone();
    file.append(filename);
    if (!file.exists()) {
      file = dir.clone();
      file.append(filename + '.session');
    }
    return file;
  }

  function fixFilename (filename)
    fixFile(filename).leafName;

  function confirm (prompt, yes, no) {
    let args = arguments;
    commandline.input(
      prompt + ' [yes/no]: ',
      function (a) {
        /^y(es)?$/i(a) ? yes() :
        /^n(o)?$/i(a)  ? (no || function () 0)() :
                         confirm.apply(this, args);
      },
      {}
    );
  }

  function overwriteCheck (name, ok) {
    let file = fixFile(name);
    if (file.exists()) {
      confirm('Overwrite?', ok, function () liberator.echoerr('This process was canceled'));
    } else {
      ok();
    }
  }

  const SubCommands = {
    save: function (name) {
      overwriteCheck(
        name,
        function () {
          gSessionManager.save(window, name, name + '.session');
          liberator.echo('Session saved: '+ name);
        }
      );
    },
    load: function (name) {
      gSessionManager.load(window, fixFilename(name), 'overwrite');
      liberator.echo('Session loaded: '+ name);
    },
    append: function (name) {
      gSessionManager.load(window, fixFilename(name), 'append');
      liberator.echo('Session loaded: '+ name);
    },
    delete: function (name) {
      let file = fixFile(name);
      if (!file.exists())
        return liberator.echoerr('file does not exist: ' + name);
      file.remove(false);
      liberator.echo('Session removed: '+ name);
    },
    pop: function (name) {
      this.load(name);
      this.delete(name);
    }
  };

  alias(SubCommands, 'save', 's');
  alias(SubCommands, 'load', 'l');
  alias(SubCommands, 'delete', 'd');
  alias(SubCommands, 'delete', 'del');
  alias(SubCommands, 'append', 'a');
  alias(SubCommands, 'append', 'add');

  commands.addUserCommand(
    ['sessionmanager', 'sm'],
    'Session manager',
    function(args){
      let sub = args[0], name = args.literalArg;
      SubCommands[sub](name);
    },
    {
      literal: 1,
      options: [
        [['-auto'], commands.OPTION_NOARG],
      ],
      completer: function (context, args) {
        context.title = ['Session name', 'Saved time'];

        if (args.length == 1) {
          context.completions = [
            ['save', 'Save current session'],
            ['load', 'Load saved session (overwrite)'],
            ['delete', 'Remove saved session'],
            ['append', 'Load saved session (append)'],
            ['pop', 'Load and delete settion'],
          ];
          return;
        }

        context.compare = void 0;
        context.completions = [
          [file.leafName.replace(/\.session$/, ''), new Date(file.lastModifiedTime)]
          for ([,file] in Iterator(io.File(gSessionManager.getSessionDir()).readDirectory()))
          if (!ignoreAuto || args['-auto'] || !/^(backup(-\d+)?|autosave)\.session$/.test(file.leafName))
        ].sort(function ([, a], [, b]) (b - a));
      }
    },
    true
  );

})();

