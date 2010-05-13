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
  <name>Edit Vimperator File</name>
  <description>Open vimperator files with text-editor.</description>
  <description lang="ja">Vimperator 関連のファイルをエディタで開く</description>
  <version>1.0.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/edit-vimperator-files.js</updateURL>
  <minVersion>2.4</minVersion>
  <maxVersion>2.4</maxVersion>
  <detail><![CDATA[
     = commands =
      :edit <file>
  ]]></detail>
  <detail lang="ja"><![CDATA[
     = commands =
      :edit <file>
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="EditVimperatorFile" version="1.0.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/edit-vimperator-files.js"
          summary="Open vimperator files with text-editor."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.4"/>
    <p></p>
    <item>
      <tags>:edit</tags>
      <spec>:edit <a>file</a></spec>
      <description><p></p></description>
    </item>
  </plugin>
  <plugin name="EditVimperatorFile" version="1.0.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/edit-vimperator-files.js"
          summary="Vimperator 関連のファイルをエディタで開く"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.4"/>
    <p></p>
    <item>
      <tags>:edit</tags>
      <tags>:edit</tags>
      <spec>:edit <a>file</a></spec>
    </item>
  </plugin>
</>;
// }}}


(function () {

  function toArray (obj)
    (obj instanceof Array ? obj : obj.toString().split(/[,| \t\r\n]+/));

  let dirs = toArray(liberator.globalVariables.plugin_loader_roots);
  'HOME USERPROFILE HOMEDRIVE'.split(/\s/).forEach(
    function (envName) dirs.push(services.get("environment").get(envName))
  );
  dirs = dirs.concat(io.getRuntimeDirectories("plugin").map(function (file) file.path));
  dirs = util.Array.compact(dirs).map(io.expandPath);

  let getItems =
    let (lastTime, lastItems)
      function () {
        if (lastTime && (new Date() - lastTime < 5 * 1000))
          return lastItems;
        return lastItems = util.Array.flatten([
          [
            [file.path, dir]
            for each ([, file] in io.File(dir).readDirectory(false))
            if (file.isFile() && /^[\._]vimperatorrc|\.(js|vimp|css)$/(file.leafName))
          ]
          for ([, dir] in Iterator(dirs))
        ]);

      };

  completion.vimperatorFiles =
    function (context, args) {
      let items = getItems();
      context.completions = items.map(function ([file, dir]) [file, dir]);
    };

  commands.addUserCommand(
    ['edit'],
    'Open vimperator file',
    function (args) {
      editor.editFileExternally(args.literalArg);
    },
    {
      literal: 0,
      completer: function (context) completion.vimperatorFiles(context)
    },
    true
  );


})();

// vim:sw=2 ts=2 et si fdm=marker:
