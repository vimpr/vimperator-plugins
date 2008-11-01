/**
 * ==VimperatorPlugin==
 * @name       local key mode
 * @description  assign temporary usermodemap
 * @description-ja 一時的なキーマップの割り当てを行います。
 * @version    0.11b
 * ==/VimperatorPlugin==
 *
 * Usage:
 *
 * :togglelocalkeymode
 * 
 * 有効/無効のトグルです。(ステータスバーのアイコンクリックでも切り替え可能)
 * 
 * .vimperatorrc
 * g:localkeymode_enable : [true=有効/false=無効(デフォルト)]
 *
 *  .vimperatorrrc 設定例:
 *   let g:localkeymode_enable = "true"
 *   javascript <<EOM
 *   //[ [url regexp, [ [removekeys], [key, command/function , {noremap:true, count: true, ...}] ,... ]] , ... ]
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
 *       ['t', function(){alert('test');}],
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
liberator.plugins.LocalKeyMode = (function(){
  
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
    
  const rhsRegExp = /[ \r\n]+/g;
  
  var _isEnable;
  var _isBindLocalKey = false;
  var feedkeysfuncName = typeof liberator.modules != 'undefined'? 'liberator.modules.events.feedkeys': 'liberator.events';
  // utility function
  function cloneMap(org){
    return new Map(
      org.modes, org.names, org.description, org.action, 
      {flags:org.flags, rhs: org.rhs, noremap:org.noremap, bang: org.bang, count: org.count }
    );
  }
  
  var Class = function(){ return function(){this.initialize.apply(this, arguments);}; };
  
  var LocalKeyMode = new Class();
  LocalKeyMode.prototype = {
    // 初期化メソッド
    initialize: function() {
      this.storekeymaps = [];
      this.delkeychars = [];
      this.localkeymaps = [];
      
      var global = liberator.globalVariables;
      this.panel = this.setupStatusBar();
      this.isEnable = global.localkeymode_enable != undefined ? window.eval(global.localkeymode_enable) : false;
      this.setupEnvironment();
      this.initLocalKeyMap();
    },
    // ステータスバーにアイコンを生成
    setupStatusBar: function() {
      var self = this;
      var panel = document.createElement('statusbarpanel');
      panel.setAttribute('id','localkeymode-status');
      panel.setAttribute('class','statusbarpanel-iconic');
      panel.setAttribute('src', self.isEnable ? ENABLE_ICON : DISABLE_ICON);
      panel.addEventListener('click', function(e){ self.isEnable = !self.isEnable; },false);
      document.getElementById('status-bar').insertBefore(panel, document.getElementById('security-button').nextSibling);
      return panel;
    },
    get isEnable(){
      return _isEnable;
    },
    set isEnable(value){
      this.panel.setAttribute('src', value ? ENABLE_ICON : DISABLE_ICON);
      _isEnable = value;
      this.loadKeyMap();
    },
    // 初期処理
    initLocalKeyMap: function(){
      if (liberator.globalVariables.localKeyMappings == undefined ) return;
      var list = liberator.globalVariables.localKeyMappings;
      if (!list) return;
      var self = this;
      list.forEach( function( items ){ 
        if ( !(items instanceof Array) || items.length < 2 || !(items[1] instanceof Array) ) return;
        self.addLocalKeyMap( items[0], items[1] ); 
      } );
    },
    // ローカルキーマップの生成
    addLocalKeyMap: function( uri, items ) {
      if (!uri) return;
      var keymaps = [];
      var delkeys = [];
      if (!(uri instanceof RegExp) ) uri = new RegExp(uri.replace(/([^0-9A-Za-z_])/g, '\\$1'));
      
      for ( var i=0; i<items.length ;i++){
        var item = items[i];
        if (item.length < 1 || !item[0]) continue;
        if (item.length < 2) {
          delkeys = delkeys.concat( item[0].split(' ') );
          continue;
        }
        var key = item[0] instanceof Array ? item[0] : [ item[0] ];
        var command = item[1];
        var extend = item[2] ? item[2]:new Object();
        if (!extend || !extend.rhs) extend.rhs = (item[1]+'').replace(rhsRegExp,' ');
        
        if (typeof command != 'function') {
          if (command.charAt(0)==':')
            command = new Function( extend.noremap ? 
              'commandline.open("","'+command+'",modes.EX);'
              : 'liberator.execute("'+command+'");' );
          else 
            command = new Function([ feedkeysfuncName, '("', command, '",', (extend.noremap? true: false) ,', true)'].join('') );
        }
        keymaps.push( {modes:[modes.NORMAL], names: key , description: 'localkeymap', action: command, extend: extend } );
      }
      this.localkeymaps.push( { uri:uri , keys:keymaps, removekeys:delkeys } );
    },
    // ローカルキーマップセット処理
    loadKeyMap: function() {
      if (_isBindLocalKey) this.restoreKeyMap();
      if (!this.isEnable) return;
      var self = this;
      for (var i=0; i<this.localkeymaps.length; i++) {
        var keymap = this.localkeymaps[i];
        if ( keymap.uri.test(content.location.href) ) {
          keymap.removekeys.forEach( function( key ){
            var org = mappings.get( modes.NORMAL, key);
            if (org) self.storekeymaps.push( cloneMap(org) );
            mappings.remove( modes.NORMAL, key);
          } );
          keymap.keys.forEach( function( m ) {
            m.names.forEach( function( key ) {
              var org = mappings.get(modes.NORMAL, key);
              if (org) self.storekeymaps.push( cloneMap(org) );
              else self.delkeychars.push( key );
            } );
            mappings.addUserMap([modes.NORMAL], m.names, m.description, m.action, m.extend );
          } );
          _isBindLocalKey = true;
          break;
        }
      }
    },
    // 割り当てていたローカルキーの削除処理
    restoreKeyMap: function() {
      if (_isBindLocalKey){
        for (; 0 < this.storekeymaps.length; ) {
          var m = this.storekeymaps.shift(); //this.storekeymaps[0];
          mappings.addUserMap([modes.NORMAL], m.names, m.description, m.action, {flags:m.flags, rhs: m.rhs, noremap: m.noremap, bang: m.bang, count: m.count });
        }
        for (; 0 < this.delkeychars.length; ) {
          var keys = this.delkeychars.shift();
          mappings.remove( modes.NORMAL, keys );
        }
        _isBindLocalKey = false;
      }
    },
    // その他処理(ユーザコマンド追加等)
    setupEnvironment: function() {
      var self = this;
      commands.addUserCommand(["togglelocalkeymode"], "Toggle Local/Global Key Mapping", 
        function() { 
          self.isEnable = !self.isEnable;
        }, {} );
    },
  };
  
  return new LocalKeyMode();
})();

autocommands.add('LocationChange', '.*', 'js liberator.plugins.LocalKeyMode.loadKeyMap();');
