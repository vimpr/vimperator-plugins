//
//  jsh.js
//
// LICENSE: {{{
//   Copyright (c) 2009 snaka<snaka.gml@gmail.com>
//
//     Distributable under the terms of an MIT-style license.
//     http://www.opensource.jp/licenses/mit-license.html
// }}}
// PLUGIN_INFO {{{
var PLUGIN_INFO = <VimperatorPlugin>
  <name>jsh</name>
  <description>Simple javascript shell</description>
  <description lang="ja">簡易Javascriptシェル</description>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/jsh.js</updateURL>
  <author mail="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
  <license>MIT style license</license>
  <version>0.1</version>
  <detail><![CDATA[
    == Subject ==

    == Commands ==
      To start shell.
      >||
      :jsh
      ||<

    == Global variables ==

    == Options ==

    == ToDo ==

  ]]></detail>
  <detail lang="ja"><![CDATA[
    == 概要 ==

    == コマンド ==
      シェルの開始
      >||
      :jsh
      ||<

    == Global variables ==

    == Options ==

    == ToDo ==

  ]]></detail>
</VimperatorPlugin>;
// }}}

liberator.plugins.jsh = (function() {
  // PUBLIC {{{
  const self = {
    start: function() {
      liberator.echo("*** Javascript SHell - Commands : quit() / cls() ***");
      waitForInput();
    }
  };
  // }}}
  // COMMAND {{{
  commands.addUserCommand(
    ["jsh"],
    "Simple javascript shell",
    function() self.start(),
    null,
    true  // for DEBUG
  );
  // }}}
  // PRIVATE {{{
  let  shellContext = {
      quit : cmdQuit,
      exit : cmdQuit,  // alias as 'quit()'
      cls  : cmdCls,
      echo : liberator.echo,
      $LXs : plugins.libly.$U.getNodesFromXPath,
      $LX  : plugins.libly.$U.getFirstNodeFromXPath
  };

  const STATUS = {
    NORMAL: '__JAVASCRIPT_SHELL_NORMAL__',
    QUIT  : '__JAVASCRIPT_SHELL_QUIT__'
  };

  let lastStatus = STATUS.NORMAL;

  function waitForInput() {
    commandline.open("js:", "", modes.JSH);
  }

  function cmdCls() {
    // TODO Is this correct?
    commandline.close();
    waitForInput();
  }

  function cmdQuit() {
    commandline.close();
    throw STATUS.QUIT;
  }

  // TODO:Should move to _libly.js ?
  function pp(value) {
    let result;

    if (!value)
      return '';

    if (typeof value === 'object') {
      result = util.objectToString(value, true);
    } else if (typeof value === 'function') {
      result = <pre>{value.toString()}</pre>;
    } else if (typeof value === 'string' && /\n/.test(value)) {
      result = <span highlight="CmdOutput">{value}</span>;
    } else {
      result = String(value);
    }

    liberator.echo(result, commandline.FORCE_MULTILINE);
  }

  // }}}
  // MODE {{{
  modules.modes.addMode("JSH", true);
  liberator.registerCallback("cancel", modes.JSH, function(str) {
    liberator.echo("CANCELED.");
  });

  liberator.registerCallback("submit", modes.JSH, function(str) {
    try {
      var result = liberator.eval(str, shellContext);
      pp(result);
    } catch(e) {
      if (e == STATUS.QUIT)
        return;
      liberator.echoerr(e);
    }
    (function waitForOutput() {
      setTimeout( function() modes.main == modes.NORMAL
                    ? waitForInput()
                    : waitForOutput(),
                  500 );
    })();
  });

  liberator.registerCallback("complete", modes.JSH, function(context) {
    context.fork("jsh", 0, liberator.modules.completion, "javascript");
  });
  // }}}
  return self;
})();
// vim: sw=2 ts=2 et si fdm=marker:
