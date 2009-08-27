/* {{{
Copyright (c) 2008, anekos.
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
  <name>every.js</name>
  <description>to run a specified command every time at specified interval.</description>
  <description lang="ja">指定のコマンドを指定の間隔で実行する。</description>
  <version>1.1.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/every.js</updateURL>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <detail><![CDATA[
    == Usage ==
      :[INTERVAL]every <COMMAND>:
        run <COMMAND> every time at [INTERVAL] sec.

      :[INTERVAL]delay <COMMAND>:
        run <COMMAND> after [INTERVAL] sec.

      :every! <PROCESS-ID>:
        kill specified process.

      The default value of [INTERVAL] is 1 sec.
      While Vimperator's focus is at command-line,
      these commands does not run.

    == Links ==
      http://d.hatena.ne.jp/nokturnalmortum/20081102#1225552718
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Usage ==
      :[INTERVAL]every <COMMAND>:
        [INTERVAL] 間隔で <COMMAND> を走らせる。

      :[INTERVAL]delay <COMMAND>:
        [INTERVAL] 秒後に <COMMAND> を走らせる。

      :every! <PROCESS-ID>:
        指定のプロセスを殺す。

      [INTERVAL] のデフォルトは 1秒。
      コマンドラインにいるときには、実行されないようになっている。

    == Links ==
      http://d.hatena.ne.jp/nokturnalmortum/20081102#1225552718
  ]]></detail>
</VimperatorPlugin>;
// }}}


(function () {

  let every = liberator.plugins.every;
  if (every) {
    kill('*');
  } else {
    liberator.plugins.every = every = {ps: []};
  }

  function run (command, interval) {
    let fun = function () {
      if (liberator.mode != liberator.modules.modes.COMMAND_LINE)
        liberator.execute(command);
    };
    every.ps.push({
      handle: setInterval(fun, interval),
      command: command
    });
  }

  function kill (index) {
    if (index == '*') {
      every.ps.forEach(function (process) clearInterval(process.handle));
      liberator.echo(every.ps.length + ' processes were killed!');
      every.ps = [];
    } else {
      let process = every.ps[index];
      if (process) {
        clearInterval(process.handle);
        every.ps.splice(index, index);
        liberator.echo('process "' + process.command + '" was killed!');
      } else {
        liberator.echoerr('unknown process');
      }
    }
  }

  function msec (count) {
    return (count > 0) ? count * 1000 : 1000;
  }

  liberator.modules.commands.addUserCommand(
    ['every', 'ev'],
    'every',
    function (args) {
      if (args.bang) {
        kill(args[0]);
      } else {
        run(args.string, msec(args.count));
      }
    },
    {
      count: true,
      bang: true,
      argCount: '+',
      completer: function (context, args) {
        if (args.bang) {
          context.title = ['PID', 'every process'];
          context.completions = [['*', 'kill em all']].concat(every.ps.map(function (p, i) ([i.toString(), p.command])));
        } else {
          liberator.modules.completion.ex(context);
        }
      }
    },
    true
  );


  liberator.modules.commands.addUserCommand(
    ['delay'],
    'delay',
    function (arg) {
      let cmd = arg.string;
      let f = function () {
        if (liberator.mode == liberator.modules.modes.COMMAND_LINE) {
          setTimeout(f, 500);
        } else {
          liberator.execute(cmd);
        }
      };
      setTimeout(f, msec(arg.count));
    },
    {
      count: true,
      argCount: '+',
      completer: function (context) liberator.modules.completion.ex(context)
    }
  );

})();
