/**
 * ==VimperatorPlugin==
 * @name       local key mode
 * @description  assign temporary usermodemap
 * @description-ja 一時的なキーマップの割り当てを行います。
 * @version    0.2.1a
 * ==/VimperatorPlugin==
 *
 * Usage:
 *
 * :togglelocalkeymode    - 有効/無効のトグルです。(ステータスバーのアイコンクリックでも切り替え可能)
 * :loadkeymaps           - 任意のキーマップの読み込みを行う
 * :clearkeymaps          - loadkeymaps の読み込みを無効にする
 *
 * .vimperatorrc
 * g:localkeymode_enable : [true=有効/false=無効(デフォルト)]
 *
 *  .vimperatorrrc 設定例:
 *   let g:localkeymode_enable = "true"
 *   javascript <<EOM
 *   //[ [url regexp, [ [removekeys], [key, command/function, {noremap:true, count: true, ...}], ... ]], ... ]
 *   liberator.globalVariables.localKeyMappings=
 *   [
 *     [/www\.nicovideo\.jp\/watch/, [
 *       ['p', ':nicopause'],
 *       ['m', ':nicomute'],
 *       ['v', ':nicommentvisible'],
 *       ['s', ':nicoseek! +10'],
 *       ['S', ':nicoseek! -10'],
 *       ['z', ':nicosize ', true],
 *       ['c', ':nicomment ', true],
 *       ['C', ':nicommand ', true],
 *       ['t', function() {alert('test');}],
 *     ]],
 *     [/www\.hoge\.com/, [
 *       ['h l'],                  // 一時的に削除するキーマップ(スペース区切)
 *       [['1','0'], ':open http://www.google.com'],
 *       ['e', '<C-v>?', {noremap:true}],
 *       ['q', 'd', {noremap:true}],
 *     ],
 *   ];
 *  EOM
 *
 *  備考:
 *   * 
 */
liberator.plugins.LocalKeyMode = (function() {
  
  // アイコン定義
  const DISABLE_ICON = 'data:image/png;base64,'
    +'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAADAFBMVEUAAAABAQECAgIDAwMEBAQF'
    +'BQUGBgYHBwcICAgJCQkKCgoLCwsMDAwNDQ0ODg4PDw8QEBARERESEhITExMUFBQVFRUWFhYXFxcY'
    +'GBgZGRkaGhobGxscHBwdHR0eHh4fHx8gICAhISEiIiIjIyMkJCQlJSUmJiYnJycoKCgpKSkqKior'
    +'KyssLCwtLS0uLi4vLy8wMDAxMTEyMjIzMzM0NDQ1NTU2NjY3Nzc4ODg5OTk6Ojo7Ozs8PDw9PT0+'
    +'Pj4/Pz9AQEBBQUFCQkJDQ0NERERFRUVGRkZHR0dISEhJSUlKSkpLS0tMTExNTU1OTk5PT09QUFBR'
    +'UVFSUlJTU1NUVFRVVVVWVlZXV1dYWFhZWVlaWlpbW1tcXFxdXV1eXl5fX19gYGBhYWFiYmJjY2Nk'
    +'ZGRlZWVmZmZnZ2doaGhpaWlqampra2tsbGxtbW1ubm5vb29wcHBxcXFycnJzc3N0dHR1dXV2dnZ3'
    +'d3d4eHh5eXl6enp7e3t8fHx9fX1+fn5/f3+AgICBgYGCgoKDg4OEhISFhYWGhoaHh4eIiIiJiYmK'
    +'ioqLi4uMjIyNjY2Ojo6Pj4+QkJCRkZGSkpKTk5OUlJSVlZWWlpaXl5eYmJiZmZmampqbm5ucnJyd'
    +'nZ2enp6fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6eoqKipqamqqqqrq6usrKytra2urq6vr6+w'
    +'sLCxsbGysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/AwMDBwcHCwsLD'
    +'w8PExMTFxcXGxsbHx8fIyMjJycnKysrLy8vMzMzNzc3Ozs7Pz8/Q0NDR0dHS0tLT09PU1NTV1dXW'
    +'1tbX19fY2NjZ2dna2trb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp'
    +'6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8'
    +'/Pz9/f3+/v7////isF19AAAAPElEQVR4nGNYgwYYsAv8/48Q6AeB///7YQBToAkE/v9vggFMgRIQ'
    +'+P+/BAYwBQibgcsdEAASmIsGCAsAAE8ZnUuRMbA8AAAAAElFTkSuQmCC';
  const ENABLE_ICON = 'data:image/png;base64,'
    +'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAa0lEQVR4nGP0+OzAQApgIkk1Fg3b'
    +'efZv59mPRwMjwycU/n/e/wwMDIyfGanmJBaG16gCvAwMDAzogpTZ8AJVQImBgYEBXZAyGySwCWMV'
    +'JNcGUWzCWAWhGrABSPQhA3hUMvo9Js1JFCc+ggAAYtsQ+fmaz5UAAAAASUVORK5CYII=';
  const BINDING_ICON = 'data:image/png;base64,'
    + 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAVElEQVR4nGP8v5eBJMBEmnIs'
    + 'Gpz+Mzj9x6OBheEZNmGsguQ5iYXhHjZhrILk2vAVmzBWQXJt4MYmjFWQXBuUsAljFYRqwApi'
    + 'MCJ7CSOEZqR/4iMEAOh5DfER9lQKAAAAAElFTkSuQmCC';
  const rhsRegExp = /[ \r\n]+/g;
  
  var _isEnable;
  var _isBindLocalKey = false;
  
  var _enableTabs = [];
  var _names;
  
  var feedKeys = liberator.modules ? liberator.modules.events.feedkeys
                                   : liberator.events.feedkeys;
  // utility function
  function cloneMap(org) {
    return new Map(
      org.modes, org.names, org.description, org.action,
      {flags:org.flags, rhs:org.rhs, noremap:org.noremap }
    );
  }
  
  var Class = function() function() {this.initialize.apply(this, arguments);};
  
  var LocalKeyMode = new Class();
  LocalKeyMode.prototype = {
    // 初期化メソッド
    initialize: function() {
      this.storekeymaps = [];   //キー待避用(戻し)
      this.delkeychars = [];    //キー待避用(削除)
      this.keymapnames = [];    // 対応URI保持
      this.localkeymaps = [];   // キーマップ保持用
      this.completeNames;       // 補完用
      this.tabinfo = [];        // タブごとの状態保持用
      this.helpstring = '';
      
      var global = liberator.globalVariables;
      this.panel = this.setupStatusBar();
      this.isEnable = global.localkeymode_enable != undefined ?
        window.eval(global.localkeymode_enable) : false;
      this.setupEnvironment();
      this.initLocalKeyMap();
    },
    // ステータスバーにアイコンを生成
    setupStatusBar: function() {
      var self = this;
      var panel = document.createElement('statusbarpanel');
      panel.setAttribute('id', 'localkeymode-status');
      panel.setAttribute('class', 'statusbarpanel-iconic');
      panel.setAttribute('src', self.isEnable ? ENABLE_ICON : DISABLE_ICON);
      panel.addEventListener('click', function(e) { self.isEnable = !self.isEnable; }, false);
      document.getElementById('status-bar').insertBefore(
        panel, document.getElementById('security-button').nextSibling);
      return panel;
    },
    get isEnable() {
      return _isEnable;
    },
    set isEnable(value) {
      this.panel.setAttribute('src', value ? ENABLE_ICON : DISABLE_ICON);
      _isEnable = value;
      this.loadKeyMap();
    },
    get isBinding() {
      return _isBindLocalKey;
    },
    set isBinding(value) {
      this.panel.setAttribute('src', value ? BINDING_ICON :
        this.isEnable ? ENABLE_ICON : DISABLE_ICON );
      _isBindLocalKey = value;
    },
    // 初期処理
    initLocalKeyMap: function() {
      if (liberator.globalVariables.localKeyMappings == undefined ) return;
      var list = liberator.globalVariables.localKeyMappings;
      if (!list) return;
      var self = this;
      list.forEach( function( items ) {
        if ( !(items instanceof Array) || items.length < 2 || !(items[1] instanceof Array) ) return;
        self.addLocalKeyMap( items[0], items[1] );
      } );
      this.completeNames = this.keymapnames.map( function(m) {
        m = (m+'').replace(/[\/\\]+/g, '');
        return [m+'', 'maps for [' + m + ']'];
      } );
    },
    // ローカルキーマップの生成
    addLocalKeyMap: function( uri, items ) {
      if (!uri) return;
      var keymaps = [];
      var delkeys = [];
      if (!(uri instanceof RegExp) ) uri = new RegExp(uri.replace(/(?=[^-0-9A-Za-z_@])/g, '\\'));
      
      for (let i=0; i<items.length; i++) {
        var item = items[i];
        if (item.length < 1 || !item[0]) continue;
        if (item.length < 2) {
          delkeys = delkeys.concat( item[0].split(' ') );
          continue;
        }
        var key = item[0] instanceof Array ? item[0] : [ item[0] ];
        var command = item[1];
        var extra = item[2] ? item[2]:new Object();
        if (!extra || !extra.rhs) extra.rhs = (item[1]+'').replace(rhsRegExp, ' ');
        
        if (typeof command != 'function') {
          let commandName = command;
          if (command.charAt(0) == ':')
            command = extra.noremap ? function () commandline.open("", commandName, modes.EX)
                                    : function () liberator.execute(commandName);
          else
            command = function () feedKeys(command, extra.noremap, true);
        }
        keymaps.push(new Map([modes.NORMAL], key, 'localkeymap', command, extra) );
      }
      this.keymapnames.push( uri );
      this.localkeymaps.push( { keys:keymaps, removekeys:delkeys } );
    },
    releaseClosedTabCache: function() {
      var tabs = getBrowser().mTabs;
      var tabIds = [];
      var tabinfo = this.tabinfo;
      for (let i=0, l=tabs.length; i<l; i++) {
        tabIds.push( tabs[i].linkedPanel );
      }
      for (let i=0; i<tabinfo.length; i++) {
        let isExist = false;
        for (let j=0, l=tabs.length; j<l; j++) {
          if (tabinfo[i].tabId == tabs[j]) {
            isExist = true;
            break;
          }
        }
        if (!isExist) tabinfo.splice(i, 1);
      }
    },
    setupKeyMaps: function( keymaps ) {
      var self = this;
      keymaps.removekeys.forEach( function( key ) {
        var org = mappings.get( modes.NORMAL, key);
        if (org) self.storekeymaps.push( cloneMap(org) );
        self.helpstring += key+'    -> [Delete KeyMap]\n';
        mappings.remove( modes.NORMAL, key);
      } );
      keymaps.keys.forEach( function( m ) {
        m.names.forEach( function( key ) {
          var org = mappings.get(modes.NORMAL, key);
          if (org) self.storekeymaps.push( cloneMap(org) );
          else self.delkeychars.push( key );
        } );
        mappings.addUserMap([modes.NORMAL], m.names, m.description, m.action,
          {flags:m.flags, rhs:m.rhs, noremap:m.noremap });
        self.helpstring += m.names+'    -> '+m.rhs+'\n';
      } );
      this.isBinding = true;
    },
    deleteCurrentTabCache: function() {
      var tabId = getBrowser().selectedTab.linkedPanel;
      var tabinfo = this.tabinfo;
      for (let i=0; i<tabinfo.length; i++) {
        if (tabinfo[i].tabId == tabId) {
          tabinfo.splice(i, 1);
          break;
        }
      }
    },
    // ローカルキーマップセット処理
    loadKeyMap: function() {
      // 暫定処置
      if (liberator.plugins.feedKey && liberator.plugins.feedKey.origMap.length >0) return;
      this.helpstring = '';
      if (this.isBinding) this.restoreKeyMap();
      if (!this.isEnable) {
        this.clearTabCache();
        return;
      }
      var tabinfo = this.tabinfo;
      var settings = this.localkeymaps;
      var tabId = getBrowser().selectedTab.linkedPanel;
      for (let i=0, l=tabinfo.length; i<l; i++) {
        if (tabId == tabinfo[i].tabId) {
          this.setEnable = true;
          this.setupKeyMaps( settings[ tabinfo[i].keyMapIndex ] );
          return;
        }
      }
      
      for (let i=0, l=settings.length; i<settings.length; i++) {
        if ( this.keymapnames[i].test(content.location.href) ) {
          this.setupKeyMaps( settings[i] );
          break;
        }
      }
    },
    clearTabCache: function() {
      for (;0 < this.tabinfo.length;) {
        this.tabinfo.shift();
      }
    },
    // 割り当てていたローカルキーの削除処理
    restoreKeyMap: function() {
      if (this.isBinding) {
        for (; 0 < this.storekeymaps.length; ) {
          let m = this.storekeymaps.shift();
          mappings.addUserMap([modes.NORMAL], m.names, m.description, m.action,
            {flags:m.flags, rhs:m.rhs, noremap:m.noremap});
        }
        for (; 0 < this.delkeychars.length; ) {
          let keys = this.delkeychars.shift();
          mappings.remove( modes.NORMAL, keys );
        }
        this.isBinding = false;
      }
    },
    // その他処理(ユーザコマンド追加等)
    setupEnvironment: function() {
      var self = this;
      commands.addUserCommand(['togglelocalkeymode'], 'Toggle local/global key mapping',
        function() {
          self.isEnable = !self.isEnable;
        }, {} );
      commands.addUserCommand(['loadkeymaps', 'loadlocalkeymaps'], 'Load local key mapping',
        function(args) {
          if (!self.isEnable) {
            liberator.echoerr('localkeymode is disabled');
            return;
          }
          var arg = (typeof args.string == undefined ? args : args.string);
          if (!arg) {
            liberator.echo(self.helpstring);
            return;
          }
          self.releaseClosedTabCache();
          self.deleteCurrentTabCache();
          var tabId = getBrowser().selectedTab.linkedPanel;
          var names = self.completeNames;
          for (let i=0, l=names.length; i<l; i++) {
            if (names[i][0] == arg) {
              self.tabinfo.push( {tabId: tabId, keyMapIndex: i} );
              self.loadKeyMap();
              return;
            }
          }
        }, {
          completer: function(filter) {
            var names = self.completeNames;
            if (!filter) return [0, names];
            filter = filter.toLowerCase();
            return [0, names.filter( function(el)
              el[0].toLowerCase().indexOf(filter) == 0) ];
          }
        } );
      commands.addUserCommand(['clearkeymaps', 'clearlocalkeymaps'], 'Clear local key mapping',
        function() {
          self.clearTabCache();
          self.loadKeyMap();
        }, {
      });
    },
  };
  
  return new LocalKeyMode();
})();

autocommands.add('LocationChange', '.*', 'js liberator.plugins.LocalKeyMode.loadKeyMap();');
