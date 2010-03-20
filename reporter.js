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
let PLUGIN_INFO =
<VimperatorPlugin>
  <name>mkvimpref</name>
  <description>Write current preferences to the specified file</description>
  <description lang="ja">現在の preferences を指定のファイルに書き出す。</description>
  <version>1.0.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://coderepos.org/share/export/27234/lang/javascript/vimperator-plugins/trunk/mkvimpref.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    == Commands ==
      - mkvimpref <FILENAME>
        <FILENAME> に現在の preferences を書き出します。
  ]]></detail>
</VimperatorPlugin>;
// }}}

(function () {

  function pad (s, max)
    (s.length < max ? pad(s + ' ', max) : s);

  function defineCommand ({names, desc, action, options}) {
    commands.addUserCommand(
      names,
      desc,
      function (args) {
        let filename = args[0];
        let file = io.File(filename);
        if (file.exists() && !args.bang)
          return liberator.echoerr(filename + ' already exists (add ! to override)');
        return action(file, args);
      },
      {
        argCount: '1',
        bang: true,
        options: options,
        completer: function (context) completion.file(context, true)
      },
      true
    );
  }

  const LIMIT_OPTION = [['-length-limit', '-ll'], commands.OPTION_INT];

  const Writer = {
    colors: function (file) {
      function rmrem (s)
        s.replace(/\s*\/\*.*\*\//g, '');

      let max = 0;
      for (let h in highlight)
        max = Math.max(h.class.length, max);

      for (let h in highlight)
        file.write((h.value ? 'hi ' + pad(h.class, max) + '  ' + rmrem(h.value)
                            : '" hi ' + h.class) + "\n");
    },

    preferences: function (file, {'-length-limit': limit}) {
      function quote(str)
        (typeof str === 'string' ? Commands.quoteArg["'"](str) : str);

      function compareByName ([n1,], [n2,])
        n1.localeCompare(n2);

      let Pref = services.get("pref");

      for each (let name in options.allPrefs().sort(compareByName)) {
        if (!Pref.prefHasUserValue(name))
          continue;
        let value = options.getPref(name);
        if (typeof value === 'string' && limit && v.length > limit)
          continue;
        file.write("set! " + n + "=" +  quote(v) + "\n");
      }
    }
  };

  defineCommand({
    names: ['mkco[lor]'],
    desc: 'Write current highlights to the specified file',
    action: Writer.colors
  });

  defineCommand({
    names: ['mkvimpref'],
    desc: 'Write current preferences to the specified file',
    options: [LIMIT_OPTION],
    action: Writer.preferences
  });

  defineCommand({
    names: ['mkreport'],
    desc: 'Write the report for your question.',
    options: [LIMIT_OPTION],
    action: function (file, args) {
      function writeSection (title, writer) {
        file.write(
          '""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""\n' +
          '" ' + title + '\n\n'
        );
        writer(file, args);
      }

      writeSection('Color Scheme', Writer.colors);
      writeSection(config.hostApplication + ' preferences', Writer.preferences);
    }
  });

})();

// vim:sw=2 ts=2 et si fdm=marker:
