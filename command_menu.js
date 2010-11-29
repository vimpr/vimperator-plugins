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
  <name>Command Menu</name>
  <description>Execute main-menu and tool-bar by ex-command.</description>
  <description lang="ja">メインメニューとツールバーをコマンドで実行できる</description>
  <version>1.5.2</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/command_menu.js</updateURL>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <detail><![CDATA[
    == Usage ==
      >||
        :menu tools-addons
        :toolbar back
      ||<
    == Requires ==
      XUL/Migemo addon
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Usage ==
      >||
        :menu ツール-アドオン
        :toolbar 戻る
      ||<
      のようにメニュー/ツールバーの"-"区切りのパスを渡すことで、メニュー/ツールバーをクリックします。
      Migemo必須。
    == Requires ==
      XUL/Migemo アドオン
  ]]></detail>
</VimperatorPlugin>;
// }}}

// TODO ==
// ・一度開かないと生成されないようなメニュー(ラベル)に対処できる魔法があったらいいな！
// 　(ScrapBook / ブックマークメニュー)
// ・コンテクストメニューがうまくいかない。

(function () {

  const migemo = Components
                  .classes['@piro.sakura.ne.jp/xmigemo/factory;1']
                  .getService(Components.interfaces.pIXMigemoFactory)
                  .getService("ja");

  function equal (x) function (y) x == y;

  function cloneArray (src) src.map(function (id) id);

  function matchPath (elem, path, getName) {
    var i = 0;
    for (let l = path.length; i < l; i++) {
      if (!path[i](getName(elem)))
        break;
    }
    if (i) {
      let res = [];
      for (let j = i, l = path.length; j < l; j++)
        res.push(path[j]);
      return res;
    }
  }

  function getElementsByPath (elem, path, getName, isTarget, isEnabled) {
    try {
      function get (point, elem, path) {
        var m = path[0](getName(elem, true));

        if (isTarget(elem)) {
          if (!isEnabled(elem))
            return [];
          if (m) {
            if (path.length == 1)
              return [[point + m, elem]];
            (path = cloneArray(path)).shift();
          } else {
            return [];
          }
        }

        //elem.containerOpen = true;
        var res, cs = elem.childNodes, result = [];
        if (cs && cs.length) {
          for (let i = 0, l = cs.length; i < l; i++) {
            if (res = get(m + point, cs[i], path))
              res.map(function (it) it && result.push(it));
          }
        }
        //elem.containerOpen = false;

        return result;
      }

      return get(0, elem, path).sort().map(function (it) it[1]);
    } catch (e) { liberator.log(e); }
  }

  function getPathMatchers (args)
    args.split('-').map(function (it)
      function (l)
        !l                                                        ? 0 :
        l == it                                                   ? 1 :
        l.toLowerCase().indexOf(it.toLowerCase()) >= 0            ? 2 :
        new RegExp(migemo.getRegExp(it.replace(/^\s+|\s+$/, '')),
                   'i').test(l)                                   ? 3 :
                                                                    0);

  function getPathString (elem, isRoot, getName, isTarget) {
    var res = [];
    while (!isRoot(elem)) {
      isTarget(elem) && res.unshift(getName(elem));
      elem = elem.parentNode;
    }
    return res.join('-');

  }



  /*********************************************************************************
   * メインメニュー
   *********************************************************************************/

  const mainMenubar = document.getElementById('main-menubar');
  const toolbox = document.getElementById('navigator-toolbox');
  const contextmenu = document.getElementById('contentAreaContextMenu');

  function fixName (name)
    name ? name.replace(/^\s+|\s+$/, '').replace(/[-\s]+/g, '_') : '';

  function getElementName (elem, multi)
    multi ? [elem.label, elem.tooltipText].map(function (it) fixName(it) || '')
                                          .join('-')
          : fixName(elem.label || elem.tooltipText || '');

  function isNotHidden (elem)
    !elem.hidden ? true : false;

  function isClickable (elem)
    /^(?:menu(?:item)?|toolbarbutton)$/.test(elem.nodeName.toLowerCase());

  function addCommand (cmds, name, root, action) {
    function _find (args, single) {
      var result = getElementsByPath(root,
                                     getPathMatchers(args),
                                     getElementName,
                                     isClickable,
                                     isNotHidden);
      return single ? result[0] : result;
    }

    if (!action) {
      action = function (elem) {
        if (!elem.click)
          return;
        elem.click();
        return true;
      };
    }

    commands.addUserCommand(
      cmds,
      name,
      function (arg) {
        var res = _find(arg.string.replace(/-\s*$/,''), true);
        if (!(res && action(res)))
          liberator.echoerr('menu not found');
      },
      {
        completer: function (context, arg) {
          const gps = function (it) getPathString(it, equal(root), getElementName, isClickable);
          const fp = function (it) [gps(it), it.tooltipText || ''];
          return [0, _find(context.filter).map(fp)];
        }
      },
      true
    );
  }

  addCommand(['me[nu]'], 'Command MainMenu', mainMenubar);
  addCommand(['toolbar', 'tb'], 'Command Toolbar', toolbox);
  addCommand(['conme', 'contextmenu'],
             'Context Menu',
             contextmenu,
             function (elem) {
               //contextmenu.openPopup(null, null, 0, 0, true);
               //contextmenu.hidePopup();
               elem.click();
               //elem.doCommand();
               return true;
             }
  );

})();
