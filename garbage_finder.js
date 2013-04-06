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
let PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>Garbage Finder</name>
  <name lang="ja">ゴミ探し</name>
  <description>Find the taints in global(window object)</description>
  <description lang="ja">グローバル(window オブジェクト)の汚染を調べる</description>
  <version>1.0.2</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/garbage_finder.js</updateURL>
  <detail><![CDATA[
    == Commands ==
      :garbages:
        Displays (removed|appended) variables.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    前回(Firefox)起動時の window オブジェクトにおける変数と、現在のそれの差分を取ります。
    インストールした拡張が、グローバルを汚していないか調べるのに便利かもしれません。
    == Commands ==
      :garbages:
        (追加|削除)された変数を表示。
  ]]></detail>
</VimperatorPlugin>`;
// }}}

(function () {

  const STORAGE_NAME = 'plugin-garbage-finder';
  const IGNORES = (let (gv = liberator.globalVariables.garbage_finder_ignore)
                      gv === undefined ? 'DownloadUtils PluralForm' : gv).split(/\s+/);

  function Somali (n)
    let(V,[l,s,j,t]=liberator.eval('[loadPref,savePref,json,Object]',storage.newObject))
      ({load:function(d)let(v=l(n,true,t))(V=v?v.value:d),
        save:function(v)s({store:true,name:n,serial:j.encode({value:v===undefined?V:v})})});

  function vars () {
    let result = [];
    for (let name in window)
      result.push(name);
    return result.sort();
  }

  function has (ary, v)
    ary.some(function (it) v == it);

  function diff (oldList, newList) {
    function sub (n, o)
      n.filter(function (it) !has(o, it));
    return {
      appended: ignore(sub(newList, oldList)),
      removed: ignore(sub(oldList, newList))
    };
  }

  function id (value)
    value;

  function ignore (ary)
    ary.filter(function (it) !has(IGNORES, it));


  let store = new Somali(STORAGE_NAME);
  let prevVars = store.load(vars());

  function save ()
    store.save(vars());

  autocommands.add(
    'VimperatorEnter',
    /.*/,
    function () setTimeout(save, 2000)
  );

  commands.addUserCommand(
    ['garbages'],
    'Display garbages',
    function (args) {
      function makeLI (list) {
        if (list.length) {
          let result = ``;
          list.forEach(function (it) (result += <li>{it}</li>));
          return <ol>{result}</ol>;
        }
        // XXX 駄目くさいけどめんどくさいので…
        return <ol>Nothing</ol>;
      }

      if (args.bang) {
        save();
        liberator.echo('Current variables was saved.');
      } else {
        let gs = diff(prevVars, vars());
        let as = makeLI(gs.appended), rs = makeLI(gs.removed);
        let output = <div><h1>Appended</h1><div>{as}</div><h1>Removed</h1><div>{rs}</div></div>;
        if (args['-clipboard']) {
          let cbOut = '';
          function pushLine (v, i)
            cbOut += '  ' + i + '.' + v + '\n';
          cbOut += 'Appended';
          gs.appended.forEach(pushLine);
          cbOut += 'Removed';
          gs.removed.forEach(pushLine);
          util.copyToClipboard(cbOut);
        }
        liberator.echo(output);
      }
    },
    {
      bang: true,
      options: [ [['-clipboard', '-c'], commands.OPTION_NOARG] ]
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
