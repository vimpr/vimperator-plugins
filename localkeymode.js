var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>localkeymode</name>
  <description>assign temporary keymap</description>
  <description lang="ja">一時的なキーマップの割り当て</description>
  <version>0.2.2</version>
  <author homepage="http://d.hatena.ne.jp/pekepekesamurai/">pekepeke</author>
  <minVersion>2.2pre</minVersion>
  <maxVersion>2.2pre</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/localkeymode.js</updateURL>
  <detail><![CDATA[
    == Usage ==
      :togglelocalkeymode:
        有効/無効のトグルです。(ステータスバーのアイコンクリックでも切り替え可能)
      :loadkeymaps:
        任意のキーマップの読み込みを行う
      :clearkeymaps:
        loadkeymaps の読み込みを無効にする

    == .vimperatorrc ==
      g:localkeymode_enable:
        [true=有効/false=無効(デフォルト)]

    == .vimperatorrrc 設定例 ==
      >||
      let g:localkeymode_enable = "true"
      javascript <<EOM
      //[ [url regexp, [ [removekeys], [key, command/function, {noremap:true, count: true, ...}], ... ]], ... ]
      liberator.globalVariables.localKeyMappings=
      [
        [ Url_RegExp,
          [ key, command/function, {extra} ],
          [...]
        ],
        [/www\.hoge\.com/, [
          ['h l'],                  // 一時的に削除するキーマップ(スペース区切で指定)
          [['1','0'], ':open http://www.google.com'],
          ['e', '<C-v>?', {noremap:true}],
          ['q', 'd', {noremap:true}],
        ],
      ];
      EOM
      ||<

      Url_RegExp:
        設定を有効にしたいURL(正規表現での指定)
      key:
        割り当てたいキー名(Arrayで複数指定可能)
      command/function:
        キーに割り当てたいコマンド/メソッド。
       コマンドは ':hoge' のように先頭に':'を付加してください。
      extra:
      noremap, count 等の指定。addUserMap にて使用されます。
  ]]></detail>
</VimperatorPlugin>`;

liberator.plugins.LocalKeyMode = (function() {

  // アイコン定義
  const DISABLE_ICON = 'data:image/png;base64,'
    +'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAZ0lEQVR4nGNcvXo1AymAiSTV'
    +'WDSEhISEhITg0cDy+PFjTFGsgmQ6ieXz58+YolgFybXh06dPmKJYBcm1gY+PD1MUqyC5NvDy'
    +'8mKKYhWEasAqWlhYiCbS398PYTDOmTOHJCdRnPgIAgBfBxpKyax43AAAAABJRU5ErkJg'
    +'gg==';
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
  function cloneMap(org, key) {
    return new Map(
      org.modes, key || org.names, org.description, org.action,
      cloneExtraInfo(org)
    );
  }

  function cloneExtraInfo(org) {
    let result = {};
    for (let name in org)
      if (/^(rhs|noremap|count|motion|arg|silent|route)$/.test(name))
        result[name] = org[name];
    return result;
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
      var panel = document.getElementById('localkeymode-status');
      if (panel) {
        let parent = panel.parentNode;
        parent.removeChild(panel);
      }
      panel = document.createElement('statusbarpanel');
      panel.setAttribute('id', 'localkeymode-status');
      panel.setAttribute('class', 'statusbarpanel-iconic');
      panel.setAttribute('src', self.isEnable ? ENABLE_ICON : DISABLE_ICON);
      panel.addEventListener('click', function(e) { self.isEnable = !self.isEnable; }, false);
      document.getElementById('status-bar').insertBefore(
        panel, document.getElementById('security-button').nextSibling);
      return panel;
    },
    get isEnable() _isEnable,
    set isEnable(value) {
      this.panel.setAttribute('src', value ? ENABLE_ICON : DISABLE_ICON);
      _isEnable = value;
      this.loadKeyMap();
    },
    get isBinding() _isBindLocalKey,
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
      // キーマップの生成
      list.forEach( function( items ) {
        if ( !(items instanceof Array) || items.length < 2 || !(items[1] instanceof Array) ) return;
        self.addLocalKeyMap( items[0], items[1] );
      } );
      // 補完用アイテムの抽出
      this.completeNames = this.keymapnames.map( function(m) {
        m = (m+'').replace(/[\/\\]+/g, '');
        return [m+'', 'maps for [' + m + ']'];
      } );
      autocommands.add('LocationChange', '.*', function () liberator.plugins.LocalKeyMode.loadKeyMap());
    },
    // ローカルキーマップの生成
    addLocalKeyMap: function( uri, items ) {
      if (!uri) return;
      var keymaps = [];
      var delkeys = [];
      if (!(uri instanceof RegExp) ) uri = new RegExp(uri.replace(/(?=[^-0-9A-Za-z_@])/g, '\\'));

      items.forEach( function( [key, command, extra] ) {
        if (!key) return;
        else if (!command) delkeys = delkeys.concat( key.split(' '));
        else {
          key = key instanceof Array ? key : [key];
          extra = extra || new Object();
          if (!extra || !extra.rhs) extra.rhs = (command+'').replace(rhsRegExp, ' ');
          if (typeof command != 'function') {
            let cmdName = command;
            if (command.charAt(0) == ':')
              command = extra.noremap ? function () commandline.open("", cmdName, modes.EX)
                                      : function () liberator.execute(cmdName);
            else
              command = function () feedKeys( command, extra.noremap, true);
          }
          keymaps.push( new Map([modes.NORMAL], key, 'localkeymap', command, extra) );
        }
      });
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
        if (org) self.storekeymaps.push( cloneMap(org, [key]) );
        self.helpstring += key+'    -> [Delete KeyMap]<br/>\n';
        mappings.remove( modes.NORMAL, key);
      } );
      keymaps.keys.forEach( function( m ) {
        m.names.forEach( function( key ) {
          var org = mappings.get(modes.NORMAL, key);
          if (org) self.storekeymaps.push( cloneMap(org, [key]) );
          else self.delkeychars.push( key );
        } );
        mappings.addUserMap([modes.NORMAL], m.names, m.description, m.action,
          cloneExtraInfo(m));
        self.helpstring += m.names+'    -> '+m.rhs+'<br/>\n';
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
      var self = this;
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
        var msg = "";
        for (; 0 < this.storekeymaps.length; ) {
          let m = this.storekeymaps.shift();
          mappings.addUserMap([modes.NORMAL], m.names, m.description, m.action,
            cloneExtraInfo(m));
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
          completer: function(context, arg) {
            let filter = context.filter;
            var names = self.completeNames;
            context.title = ['Name','Description'];
            if (!filter) {
              context.completions = names;
              return;
            }
            filter = filter.toLowerCase();
            context.completions = names.filter( function(el) el[0].toLowerCase().indexOf(filter) == 0);
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
