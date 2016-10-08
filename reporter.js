/* {{{
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
  <name>mkreport</name>
  <description>Write current information to the specified file</description>
  <description lang="ja">現在の情報を指定のファイルに書き出す。</description>
  <version>1.1.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/reporter.js</updateURL>
  <minVersion>2.2</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    == Commands ==
      - mkvimpref <FILENAME>
        <FILENAME> に現在の preferences を書き出します。
      - mkcolor <FILENAME>
        <FILENAME> に現在の colorschme を書き出します。
      - mkreport [-include=<SECTIONS>] <FILENAME>
        <FILENAME> に以下の情報を書き出します。
        - Firefox アドオン＆プラグインの一覧
        - Vimperator プラグインの一覧
        - デフォルトから変更されている preference (about:config でみられる設定) のリスト
        - バージョンなどの情報
  ]]></detail>
</VimperatorPlugin>`;
// }}}

(function () {

  const File = io.File || io.getFile;

  function openClipBoardWith (path, overwrite, block) {
    let buffer = '';
    block({
      write: function (s) buffer += s,
      writeln: function (s) this.write(s + '\n')
    });
    util.copyToClipboard(buffer);
  }

  function openFileWith (path, overwrite, block) {
    let localFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    let out = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
    let conv = Cc['@mozilla.org/intl/converter-output-stream;1'].
                            createInstance(Ci.nsIConverterOutputStream);
    let file = File(io.expandPath(path));

    if (file.exists()) {
      if (!overwrite)
        return liberator.echoerr(path + ' already exists (add ! to override)');
      file.remove(false);
    }

    localFile.initWithPath(file.path);
    out.init(localFile, 0x02 | 0x08, 0664, 0);

    let result = block({
      __proto__: file,
      write: function (s) {
        conv.init(out, 'UTF-8', s.length,
                  Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
        return conv.writeString(s)
      },
      writeln: function (s) this.write(s + '\n')
    });

    conv.close();
    out.close();

    return result;
  }

  function pad (s, max)
    (s.length < max ? pad(s + ' ', max) : s);

  function defineCommand ({names, desc, action, options}) {
    commands.addUserCommand(
      names,
      desc,
      function (args) {
        let filename = args[0];
        let clip = args['-clipboard'];
        if (!!clip === !!filename)
          return liberator.echoerr(
            clip ? 'E488: Trailing characters'
                 : 'E471: Argument required');
        return (clip ? openClipBoardWith : openFileWith)(
          filename,
          args.bang,
          function (file) {
            return action(file, args);
          }
        );
      },
      {
        literalArg: 0,
        bang: true,
        options: [[['-clipboard', '-c'], commands.OPTION_NOARG]].concat(options),
        completer: function (context, args) {
          if (!args['-clipboard'])
            completion.file(context, true)
        }
      },
      true
    );
  }

  function Writer (title, action)
    ({title: title, action: action});

  const Writers = {
    basic: Writer(
      'Basic',
      function (file) {
        function puts (name, value)
          file.writeln(pad(name + ': ', 20) + value);
        puts('Name', config.name);
        puts('Host', config.hostApplication);
        puts('Platform', navigator.platform);
        puts('Version', liberator.version);
        puts('UserAgent', navigator.userAgent);
      }
    ),

    colors: Writer(
      'Color Scheme',
        function (file) {
        function rmrem (s)
          s.replace(/\s*\/\*.*\*\//g, '');

        let max = 0;
        for (let h in highlight)
          max = Math.max(h.class.length, max);

        for (let h in highlight)
          file.writeln(h.value ? 'hi ' + pad(h.class, max) + '  ' + rmrem(h.value)
                               : '" hi ' + h.class);
      }
    ),

    preferences: Writer(
      config.hostApplication + ' Preference',
        function (file, {'-length-limit': limit}) {
        // TODO エスケープ処理など怪しいので調べる
        function esc (str)
          (typeof str === 'string' ? str.replace(/\n/g, '\\n') : str);

        function quote (str)
          (typeof str === 'string' ? Commands.quoteArg["'"](str) : str);

        function compareByName ([n1,], [n2,])
          n1.localeCompare(n2);

        let Pref = services.get("pref");

        for each (let name in options.allPrefs().sort(compareByName)) {
          if (!Pref.prefHasUserValue(name))
            continue;
          let value = options.getPref(name);
          if (typeof value === 'string' && limit && value.length > limit)
            continue;
          file.writeln("set! " + name + "=" +  esc(quote(value)));
        }
      }
    ),

    addons: Writer(
      config.hostApplication + ' Addon & Plugin',
      function (file) {
        for each (let ext in liberator.extensions) {
          file.writeln(ext.name);
          file.writeln('  ' + (ext.enabled ? 'enabled' : 'disabled'));
        }
      }
    ),

    plugins: Writer(
      config.hostApplication + ' Addon & Plugin',
      function (file) {
        [File(n).leafName for (n in plugins.contexts)].sort().forEach(function (n) file.writeln(n));
      }
    ),

    numbers: Writer(
      'Numbers',
      function (file) {
        function puts (name, value)
          file.writeln(pad(name + ': ', 20) + value);

        function values (obj)
          [null for (_ in obj)].length;

        let (cnt = [0, 0]) {
          for each (let ext in liberator.extensions)
            cnt[0 + !!ext.enabled]++;
          puts('addons', cnt[0] + cnt[1] + ' (enabled: ' + cnt[1] + ', disabled: ' + cnt[0] + ')');
        }
        puts('plugins', values(plugins.contexts));
        puts('bookmarks', bookmarks.get('').length);
        puts('history', history.get('').length);
        puts('commands', values(commands));
        puts('hint-modes', values(hints._hintModes));
        puts(
          'user-mappings',
          [ms for each (ms in mappings._user)].reduce(function (init ,ms) init + ms.length, 0)
          + ' (n: ' +
          mappings._user[modes.NORMAL].length +
          ', c: ' +
          mappings._user[modes.COMMAND_LINE].length +
          ', i: ' +
          mappings._user[modes.INSERT].length +
          ', v: ' +
          mappings._user[modes.VISUAL].length +
          ')'
        );
      }
    )
  };

  const LIMIT_OPTION = [['-length-limit', '-ll'], commands.OPTION_INT];

  defineCommand({
    names: ['mkco[lor]'],
    desc: 'Write current highlights to the specified file',
    action: Writers.colors.action
  });

  defineCommand({
    names: ['mkvimpref'],
    desc: 'Write current preferences to the specified file',
    options: [LIMIT_OPTION],
    action: Writers.preferences.action
  });

  defineCommand({
    names: ['mkreport'],
    desc: 'Write the report for your question.',
    options: [
      LIMIT_OPTION,
      [['-include', '-i'], commands.OPTION_LIST, null, [[n, n] for (n in Writers)]]
    ],
    action: function (file, args) {
      function writeSection (name) {
        const line = '"======================================================================';
        if (!Writers[name])
          return liberator.echoerr('Unknown section: ' + name);
        file.writeln(line);
        file.writeln('" ' + Writers[name].title);
        file.writeln(line + '\n');
        Writers[name].action(file, args);
        file.writeln('\n');
      }

      (args['-include'] || [n for (n in Writers)]).forEach(writeSection);
    }
  });

})();

// vim:sw=2 ts=2 et si fdm=marker:
