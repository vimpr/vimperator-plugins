/* {{{
Copyright (c) 2008-2010, anekos.
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
  <name>{NAME}</name>
  <description>Write a memo to the specified file.</description>
  <description lang="ja">指定のファイルにメモを書く</description>
  <version>1.1.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/memo.js</updateURL>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.4</maxVersion>
  <detail><![CDATA[
    == Usage ==
      :memo:
        show the memo that was written.
      :memo fooooobar!:
        write "fooooobar!" to the specified memo file.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Usage ==
      :memo
        書かれたメモを表示する
      :memo fooooobar!
        "fooooobar!" と、メモに書く
  ]]></detail>
</VimperatorPlugin>`;
// }}}

// References:
//    http://developer.mozilla.org/index.php?title=Ja/Code_snippets/File_I%2F%2FO

(function () {
  let localfilepath = liberator.globalVariables.memo_filepath || io.expandPath('~/.vimpmemo');
  let charset = 'UTF-8';

  //ネタ的
  let lz = function(s,n)(s+'').replace(new RegExp('^.{0,'+(n-1)+'}$'),function(s)lz('0'+s,n));

  function dateTime () {
    with (new Date())
      return lz(getFullYear(), 4) + '/' +
             lz(getMonth() + 1, 2) + '/' +
             lz(getDate(), 2) + ' ' +
             lz(getHours(), 2) + ':' +
             lz(getMinutes(), 2);
  }

  function filepath () {
    let result = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    result.initWithPath(localfilepath);
    return result;
  }

  function puts (line) {
    line = dateTime() + "\t" + line + "\n";
    let out = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
    let conv = Cc['@mozilla.org/intl/converter-output-stream;1'].
                            createInstance(Ci.nsIConverterOutputStream);
    out.init(filepath(), 0x02 | 0x10 | 0x08, 0664, 0);
    conv.init(out, charset, line.length,
              Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
    conv.writeString(line);
    conv.close();
    out.close();
  }

  function gets () {
    let file = Cc['@mozilla.org/network/file-input-stream;1'].createInstance(Ci.nsIFileInputStream);
    file.init(filepath(), 1, 0, false);
    let conv = Cc['@mozilla.org/intl/converter-input-stream;1'].createInstance(Ci.nsIConverterInputStream);
    conv.init(file, charset, file.available(), conv.DEFAULT_REPLACEMENT_CHARACTER);
    let result = {};
    conv.readString(file.available(), result);
    conv.close();
    file.close();
    return result.value;
  }

  commands.addUserCommand(
    ['memo'],
    'Write memo',
    function (arg) {
      if (arg.bang)
        return util.copyToClipboard(arg.literalArg);

      if (arg.literalArg) {
        puts(arg.literalArg);
      } else {
        let out = xml``;
        gets().split(/\n/).reverse().forEach(function (l) {
          out += xml`<li>${l}</li>`;
        });
        liberator.echo(out);
      }
    },
    {
      bang: true,
      literal: 0,
      completer: function (context, args) {
        if (!args.bang)
          return;

        context.compare = void 0;

        context.createRow = function(item, highlightGroup) {
          let desc = item[1] || this.process[1].call(this, item, item.description);

          if (item.description && item.description.length) {
            return xml`<div highlight=${highlightGroup || "CompItem"} style="white-space: nowrap">
                <li highlight="CompDesc">
                  ${item.description}
                </li>
            </div>`;
          }

          return xml`<div highlight=${highlightGroup || "CompItem"} style="white-space: nowrap">
              <li highlight="CompDesc">${item[0]}&#160;</li>
          </div>`;
        };
        context.filters = [function (item) this.match(item.description)];

        context.completions = gets().split(/\n/).reverse().filter(function (it) {
          return it.length;
        }).map(function (it) {
          return [it.replace(/^[^\t]+\t/, ''), it];
        });
      }
    },
    true
  );

})();
