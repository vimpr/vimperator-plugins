// ==VimperatorPlugin==
// @name           Command-MainMenu
// @description-ja メインメニューとツールバーをコマンドで実行できる
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.3
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
//    http://creativecommons.org/licenses/by-sa/2.1/jp/deed.en_CA

(function(){ try{

  const migemo = Components
                  .classes['@piro.sakura.ne.jp/xmigemo/factory;1']
                  .getService(Components.interfaces.pIXMigemoFactory)
                  .getService("ja");

  function id (v) v;

  function equal (x) function (y) x == y;

  function cloneArray (src) src.map(id);

  function matchPath (elem, path, getName) {
    for (var i = 0; i < path.length; i++) {
      if (!path[i](getName(elem)))
        break;
    }
    if (i) {
      var res = [];
      for (var j = i; j < path.length; j++)
        res.push(path[j]);
      return res;
    }
  }

  function getElementsByPath (elem, path, getName, isTarget, isEnabled) {
    try{
      function get (point, elem, path) {
        if (isTarget(elem)) {
          if (!isEnabled(elem))
            return [];
          var m = path[0](getName(elem, true));
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
          for (var i = 0; i < cs.length; i++) {
            if (res = get(m + point, cs[i], path))
              res.map(function(it) it && result.push(it));
          }
        }
        //elem.containerOpen = false;

        return result;
      }

      return get(0, elem, path).sort().map(function (it) it[1]);
    }catch(e){ liberator.log(e); }
  }

  function getPathMatchers (args) {
    return args.split('-').map(function(it){
      let n = it.toLowerCase();
      let s = migemo.getRegExp(it.replace(/^\s+|\s+$/, ''));
      let re = new RegExp(s, 'i');
      return function (l) {
        if (!l)                               return 0;
        if (l == it)                          return 1;
        if (l.toLowerCase().indexOf(n) >= 0)  return 2;
        if (re.test(l))                       return 3;
        return 0; 
      }
    });
  }

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

  function fixName (name) {
    return name ? name.replace(/^\s+|\s+$/, '').replace(/[\-\s]+/g, '_') : '';
  }

  function getElementName (elem, multi) {
    const f = function (it) { return fixName(it) || ''; }
    return multi ? [elem.label, elem.tooltipText].map(f).join('-') 
                 : fixName(elem.label || elem.tooltipText || '') ;
  }

  function isNotHidden (elem) {
    return !elem.hidden;
  }

  function isClickable (elem) {
    const re = /^(menu(item)?|toolbarbutton)$/i;
    return elem.nodeName.match(re);
  }

  function addCommand(cmds, name, root, action) {
    function _find (args, single) {
      var result =  getElementsByPath(root, 
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

    liberator.commands.addUserCommand(
      cmds,
      name,
      function (args, _, num, extra) {
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

}catch(e){ liberator.log(e);}
})();

