// ==VimperatorPlugin==
// @name           every.js
// @description    to run a specified command every time at specified interval.
// @description-ja 指定のコマンドを指定の間隔で実行する。
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.1
// @author         anekos (anekos@snca.net)
// ==/VimperatorPlugin==
//
// Usage:
//    :[INTERVAL]every <COMMAND>
//      run <COMMAND> every time at [INTERVAL] sec.
//
//    :[INTERVAL]delay <COMMAND>
//      run <COMMAND> after [INTERVAL] sec.
//
//    :every! <PROCESS-ID>
//      kill specified process.
//
//    The default value of [INTERVAL] is 1 sec.
//    While Vimperator's focus is at command-line,
//    these commands does not run.
//
// Usage-ja:
//    :[INTERVAL]every <COMMAND>
//      [INTERVAL] 間隔で <COMMAND> を走らせる。
//
//    :[INTERVAL]delay <COMMAND>
//      [INTERVAL] 秒後に <COMMAND> を走らせる。
//
//    :every! <PROCESS-ID>
//      指定のプロセスを殺す。
//
//    [INTERVAL] のデフォルトは 1秒。
//    コマンドラインにいるときには、実行されないようになっている。
//
// Links:
//    http://d.hatena.ne.jp/nokturnalmortum/20081102#1225552718


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
    function (arg, bang, count) {
      let cmd = arg.string;
      let f = function () {
        if (liberator.mode == liberator.modules.modes.COMMAND_LINE) {
          setTimeout(f, 500);
        } else {
          liberator.execute(cmd);
        }
      };
      setTimeout(f, msec(count));
    },
    {
      count: true,
      argCount: '+',
      completer: function (context) liberator.modules.completion.ex(context)
    }
  );

})();
