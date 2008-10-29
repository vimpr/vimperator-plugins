// ==VimperatorPlugin==
// @name           Command-MainMenu
// @description-ja メインメニューとツールバーをコマンドで実行できる
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.5
// @author         anekos (anekos@snca.net)
// ==/VimperatorPlugin==
//
// Usage:
//    :menu ツール-アドオン
//    :toolbar 戻る
//    のようにメニュー/ツールバーの"-"区切りのパスを渡すことで、メニュー/ツールバーをクリックします。
//    Migemo必須。
//
// TODO:
//    ・一度開かないと生成されないようなメニュー(ラベル)に対処できる魔法があったらいいな！
//    　(ScrapBook / ブックマークメニュー)
//    ・コンテクストメニューがうまくいかない。
//
// License:
//    http://creativecommons.org/licenses/by-sa/2.1/jp/
//    http://creativecommons.org/licenses/by-sa/2.1/jp/deed

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
      function (args, _, num, extra) {
        // for HEAD (2)
        if (args.string != undefined)
          args = args.string;
        var res = _find(args.replace(/-\s*$/,''), true);
        if (!(res && action(res)))
          liberator.echoerr('menu not found');
      },
      {
        completer: function (args) {
          const gps = function (it) getPathString(it, equal(root), getElementName, isClickable);
          const fp = function (it) [gps(it), it.tooltipText || ''];
          return [0, _find(args).map(fp)];
        }
      }
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
