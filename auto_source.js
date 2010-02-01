/* NEW BSD LICENSE {{{
Copyright (c) 2009-2010, anekos.
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
  <name>Auto Source</name>
  <description>Sourcing automatically when the specified file is modified.</description>
  <description lang="ja">指定のファイルが変更されたら自動で :so する。</description>
  <version>1.5.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/auto_source.js</updateURL>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <detail><![CDATA[
    == Commands ==
    Start watching:
      - :aso taro.js
      - :autoso[urce] taro.js
    Stop watching:
      - :aso! taro.js
      - :autoso[urce]! taro.js
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Commands ==
    監視を開始:
      - :aso taro.js
      - :autoso[urce] taro.js
      - :autoso[urce] -c[ommand] 'colorscheme mycolors' taro.js
      - :autoso[urce] -c[ommand] -force 'js alert("reload!")' taro.js
    監視を中止:
      - :aso! taro.js
      - :autoso[urce]! taro.js
  ]]></detail>
</VimperatorPlugin>;
let INFO =
<plugin name="Auto Source" version="1.0.0"
        href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/auto_source.js"
        summary="Sourcing automatically when the specified file is modified."
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="anekos@snca.net">anekos</author>
  <license>New BSD License</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
    Sourcing automatically when the specified file is modified.
  </p>
  <item>
    <tags>:aso</tags>
    <spec>:aso <oa>-f<oa>orce</oa></oa> <oa>-h<oa>elp</oa></oa> <oa>-c<oa>ommad</oa>=<a>command</a></oa> <a>file-path</a></spec>
    <description>
      <p>
        source when the <a>file-path</a> is modified.
      </p>
      <p>The following options are interpreted.</p>
      <dl>
        <dt>-force</dt>
        <dd>override if the file has been registered.</dd>
        <dt>-command=<a>command</a></dt>
        <dd>execute the <a>command</a> after source.</dd>
        <dt>-help</dt>
        <dd>re-initialize help files after source.</dd>
      </dl>
    </description>
  </item>
</plugin>;
// }}}

// Links:
//    http://d.hatena.ne.jp/nokturnalmortum/20081114#1226652163
//    http://p-pit.net/rozen/

(function () {

  let files = [];
  let firstTime = window.eval(liberator.globalVariables.auto_source_first_time || 'false');
  let interval = window.eval(liberator.globalVariables.auto_source_interval || '500');

  function getFileModifiedTime (filepath) {
    let file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
    file.initWithPath(filepath);
    return file.lastModifiedTime;
  }

  function exists (filepath)
    files.some(function (it) (it.path.indexOf(filepath) === 0))

  function remove (filepath, func)
    (files = files.filter(function (it) (!(it.path.indexOf(filepath) === 0 && func(it)+'-'))));

  function expandPath (filepath) {
    filepath = io.expandPath(filepath);
    if (filepath.match(/\/|\w:[\\\/]/))
      return filepath;
    let cur = io.getCurrentDirectory();
    cur.appendRelativePath(filepath);
    return cur.path;
  }

  function startWatching (filepath, command, force, initHelp) {
    if (exists(filepath)) {
      if (force) {
        killWatcher(filepath);
      } else {
        throw 'The file has already been watched: ' + filepath;
      }
    }
    let last = firstTime ? null : getFileModifiedTime(filepath);
    let handle = setInterval(function () {
      let current;
      try {
        current = getFileModifiedTime(filepath);
      } catch (e) {
        liberator.echoerr('Error! ' + filepath);
        killWatcher(filepath);
      }
      if (last != current) {
        liberator.log('sourcing: ' + filepath);
        last = current;
        io.source(filepath);
        if (command) {
            liberator.log('command execute: ' + command);
            liberator.execute(command);
        }
        if (initHelp)
          liberator.initHelp();
      }
    }, interval);
    liberator.log('filepath: ' + filepath + (command ? ('; command: ' + command) : ''));
    files.push({handle: handle, path: filepath});
  }

  function killWatcher (filepath) {
    if (!exists(filepath))
      throw 'The file is not watched: ' + filepath;
    remove(filepath, function (it) clearInterval(it.handle));
    liberator.echo('stopped the watching for the file');
  }

  commands.addUserCommand(
    ['autoso[urce]', 'aso'],
    'Sourcing automatically when the specified file is modified.',
    function (arg) {
      (arg.bang ? killWatcher : startWatching)(
        expandPath(arg[0]), arg['-command'], arg['-force'], arg['-help']
      );
    },
    {
      bang: true,
      argCount: '1',
      options: [
          [['-command', '-c'], commands.OPTION_STRING],
          [['-force', '-f'], commands.OPTION_NOARG],
          [['-help', '-h'], commands.OPTION_NOARG]
      ],
      completer: function (context, args) {
        if (args.bang) {
          context.title = ['Path'];
          context.completions = files.map(function (it) ([it.path, '']));
        } else {
          completion.file(context);
        }
      }
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
