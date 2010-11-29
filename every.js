/* {{{
Copyright (c) 2008-2009, anekos.
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
  <version>1.3.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/every.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    == Usage ==
      :[INTERVAL]every [-i[nterval]=INTERVAL] [-init=INITIALIZE_COMMAND] [-from=COUNTER_FORM] [-step=COUNTER_STEP]<COMMAND>:
        run <COMMAND> every time at [INTERVAL] sec.

      :[INTERVAL]delay [-i[nterval]=INTERVAL] <COMMAND>:
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
      :[INTERVAL]every [-i[nterval]=INTERVAL] [-init=INITIALIZE_COMMAND] [-from=COUNTER_FROM] [-step=COUNTER_STEP]<COMMAND>:
        [INTERVAL] 間隔で <COMMAND> を走らせる。

      :[INTERVAL]delay [-i[nterval]=INTERVAL] <COMMAND>:
        [INTERVAL] 秒後に <COMMAND> を走らせる。

      :every! <PROCESS-ID>:
        指定のプロセスを殺す。

      INTERVAL:
        INTERVAL のデフォルトは 1秒。
        オプションでの指定時には、"s[ec]", "m[in]", "h[our]" の単位で指定可能。(e.g. "0.5hour")
        コマンドラインにいるときには、実行されないようになっている。
      INITIALIZE_COMMAND:
        指定すると、:every 実行直後にそれが実行されます。
      COUNTER_FROM/COUNTER_STEP:
        何れか一方を指定すると、COMMAND 中の "<counter>" という文字が、カウンター数字に置換されます。
        この数字は、COUNTER_FROM で初期化され、every での実行毎に COUNTER_STEP ずつ増えます。

    == Links ==
      http://d.hatena.ne.jp/nokturnalmortum/20081102#1225552718
  ]]></detail>
</VimperatorPlugin>;
// }}}

ps = [];

(function () {

  let (every = liberator.plugins.every) {
    if (every && every.ps)
      kill('*');
  }

  function defined (value)
    (typeof value !== 'undefined');

  function defaultValue (value, def)
    (defined(value) ? value : def);

  function run (command, interval, opts) {
    let process = {
      handle: null,
      command: command,
      options: opts
    };
    if (opts.init)
      liberator.execute(opts.init);
    let fun = function () {
      if (liberator.mode == liberator.modules.modes.COMMAND_LINE)
        return;
      let cmd = process.command;
      if (defined(opts.from) || defined(opts.step)) {
        if (!defined(process.counter))
          process.counter = defaultValue(opts.from, 1);
        cmd = cmd.replace(/<counter>/i, process.counter);
        process.counter += defaultValue(opts.step, 1);
      }
      liberator.execute(cmd);
    };
    process.handle = setInterval(fun, parseInt(interval, 10));
    ps.push(process);
  }

  function kill (index) {
    if (index == '*') {
      ps.forEach(function (process) clearInterval(process.handle));
      liberator.echo(ps.length + ' processes were killed!');
      ps = [];
    } else {
      let process = ps[index];
      if (process) {
        clearInterval(process.handle);
        ps.splice(index, index);
        liberator.echo('process "' + process.command + '" was killed!');
      } else {
        liberator.echoerr('unknown process');
      }
    }
  }

  function msec (count) {
    return (count > 0) ? count * 1000 : 1000;
  }

  function expandSuffix (s) {
    const tbl = {
      '^s(ec)?$': 1,
      '^m(in)?$': 60,
      '^h(our)?$': 60 * 60
    };
    let [, a, b]  = s.match(/^([\d\.]+)(.*)$/);
    let v = parseFloat(a);
    for (let e in tbl)
      if (b.match(e))
        return v * tbl[e];
    return v;
  }

  liberator.modules.commands.addUserCommand(
    ['every', 'ev'],
    'every',
    function (args) {
      if (args.bang) {
        kill(args.literalArg);
      } else {
        let interval = args['-interval'];
        let opts = {};
        'from step init'.split(' ').forEach(function (v) (opts[v] = args['-' + v]));
        run(args.literalArg, msec(interval ? expandSuffix(interval) : args.count), opts);
      }
    },
    {
      literal: 0,
      count: true,
      bang: true,
      completer: function (context, args) {
        if (args.bang) {
          context.title = ['PID', 'every process'];
          context.completions = [['*', 'kill em all']].concat(ps.map(function (p, i) ([i.toString(), p.command])));
        } else {
          liberator.modules.completion.ex(context);
        }
      },
      options: [
        [['-interval', '-i'], commands.OPTION_ANY],
        [['-from', '-f'], commands.OPTION_FLOAT],
        [['-step', '-s'], commands.OPTION_FLOAT],
        [['-init', '-i'], commands.OPTION_STRING],
      ]
    },
    true
  );


  liberator.modules.commands.addUserCommand(
    ['delay'],
    'delay',
    function (args) {
      let cmd = args.literalArg;
      let f = function () {
        if (liberator.mode == liberator.modules.modes.COMMAND_LINE) {
          setTimeout(f, 500);
        } else {
          liberator.execute(cmd);
        }
      };
      let interval = args['-interval'];
      setTimeout(f, msec(interval ? expandSuffix(interval) : args.count));
    },
    {
      literal: 0,
      count: true,
      completer: function (context) liberator.modules.completion.ex(context),
      options: [
        [['-interval', '-i'], commands.OPTION_ANY]
      ]
    },
    true
  );

})();
