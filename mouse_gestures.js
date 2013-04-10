var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>Mouse Gestures</name>
  <name lang='ja'>マウスジェスチャー</name>
  <description>mouse gestures</description>
  <description lang='ja'>マウスジェスチャー</description>
  <version>0.10.1</version>
  <author>pekepeke</author>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/mouse_gestures.js</updateURL>
  <detail lang='ja'><![CDATA[
  == .vimperatorrc example ==
  >||
  js <<EOM
  liberator.globalVariables.mousegesture_showmsg = true;  // default is true
  liberator.globalVariables.mousegesture_rocker = true;  // default is false
  liberator.globalVariables.mousegesture_wheel = true;  // default is false
  liberator.globalVariables.mousegesture_list = [
    //['UDLR', 'Description', '#id or function or :vimp command or vimp_key', noremap flag]
    ['L'  , 'Back', '#Browser:Back'],
    ['R'  , 'Forward', '#Browser:Forward'],
    ['RLR', 'Close Tab Or Window', '#cmd_close'],
    ['LD' , 'Stop Loading Page', '#Browser:Stop'],
    ['LR' , 'Undo Close Tab', '#History:UndoCloseTab'],
    ['UL' , 'Select Previous Tab', 'gT', true],
    ['UR' , 'Select Next Tab', 'gt', true],
    ['LU' , 'Scroll To Top', function() goDoCommand('cmd_scrollTop')],
    ['LD' , 'Scroll To Bottom', function() goDoCommand('cmd_scrollBottom')],
    ['UDR', 'Add Bookmark', ':dialog addbookmark'],
    ['L>R', 'Forward', '#Browser:Forward'],
    ['L<R', 'Back', '#Browser:Back'],
    ['W-' , 'Select Previous Tab', function() gBrowser.tabContainer.advanceSelectedTab(-1, true) ],
    ['W+' , 'Select Next Tab', function() gBrowser.tabContainer.advanceSelectedTab(+1, true) ],
  ];
  EOM
  ||<
  == liberator.globalVariables ==
  - mousegesture_showmsg
    ジェスチャー情報を表示するかどうか(デフォルト=true:表示する)
  - mousegesture_rocker
    ロッカージェスチャを有効にするかどうか(デフォルト=false:無効)
  - mousegesture_wheel
    ホイールジェスチャを有効にするかどうか(デフォルト=false:無効)
  - mousegesture_list
    ジェスチャー設定。2次元配列で指定してください。
    [ <UDLR>, <Description>, <Command>, <noremap flag> ]
    - UDLR
      ジェスチャーを指定します。
      UDLRの文字列を指定してください。
      それぞれ、マウスジェスチャーの↑、↓、←, →に対応しています。
      一応、ロッカージェスチャー・ホイールジェスチャー等にも暫定で対応しています(別途、オプションを有効にする必要がある)。
      ロッカージェスチャはL>R(左→右クリック), L<R(右→左クリック)で指定可能。
      ホイールジェスチャは W-(↓回転), W+(上回転)で指定可能
    - Description
      コマンドの説明文。
    - Command
      ジェスチャーが実施された際に実行するコマンドを指定します。
      以下の3通りの指定が可能です。
        - '#id'
          document.getElementById(id).doCommand() を実行します。
        - function() { ... }
          記述された関数を実行します。
        - ':[command]'
          Vimperatorのユーザコマンド [command]を実行します。
        - '[key]'
          キーを送ります。
    - noremap flag
      キーを送る、かつ、そのキーコードを noremap で処理を行いたい場合、true を指定してください。
  ]]></detail>
</VimperatorPlugin>`;

liberator.plugins.MouseGestures = (function() {

  const Ci = Components.interfaces;
  var global = liberator.globalVariables;

  if (typeof global.mousegesture_list == 'undefined') return;
  if (liberator.plugins.MouseGestures) liberator.plugins.MouseGestures.registerEvents('remove');

  var Class = function() function() {this.initialize.apply(this, arguments);};
  var MouseGestures = new Class();

  var doCommandByID = function(id) {
    if (document.getElementById(id))
      document.getElementById(id).doCommand();
  };

  MouseGestures.prototype = {
    initialize: function() {
      this.parseSetting();

      var self = this;
      this.registerEvents('add');
      window.addEventListener('unload', function() { self.registerEvents('remove'); }, false);
    },
    parseSetting: function() {
      var gestures = {};
      var self = this;
      this._showstatus = global.mousegesture_showmsg || true;

      this._enableRocker = global.mousegesture_rocker || false;
      this._enableWheel = global.mousegesture_wheel || false;
      if (this._enableRocker) this.captureEvents.push('draggesture');
      if (this._enableWheel) this.captureEvents.push('DOMMouseScroll');
      global.mousegesture_list.forEach(function( [gesture, desc, action, noremap] ) {
        action = action || desc;
        noremap = noremap || false;
        if (typeof action == 'string') {
          let str = action;
          if (str.charAt(0) == ':') action = function() liberator.execute(str.substr(1));
          else if (str.charAt(0) == '#') action = function() doCommandByID(str.substr(1));
          else action = function() modules.events.feedkeys(str, noremap);
        }
        gestures[gesture] = [desc, action];
      });
      this.GESTURES = gestures;
    },
    captureEvents : ['mousedown', 'mousemove', 'mouseup', 'contextmenu'],
    registerEvents: function(action) {
      var self = this;
      this.captureEvents.forEach(
        function(type) { getBrowser().mPanelContainer[action + 'EventListener'](type, self, type == 'contextmenu' || type == 'draggesture');
      });
    },
    set status(msg) {
      if (this._showstatus) commandline.echo(msg, null, commandline.FORCE_SINGLELINE);
    },
    handleEvent: function(event) {
      switch(event.type) {
      case 'mousedown':
        if (event.button == 2) {
          this._isMouseDownR = true;
          this._suppressContext = false;
          this.startGesture(event);
          if (this._enableRocker && this._isMouseDownL) {
            this._isMouseDownR = false;
            this._suppressContext = true;
            this._gesture = 'L>R';
            this.stopGesture(event);
          }
        } else if (this._enableRocker && event.button == 0) {
          this._isMouseDownL = true;
          if (this._isMouseDownR) {
            this._isMouseDownL = false;
            this._suppressContext = true;
            this._gesture = 'L<R';
            this.stopGesture(event);
          }
        }
        break;
      case 'mousemove':
        if (this._isMouseDownR) this.progressGesture(event);
        break;
      case 'mouseup':
        if (this._isMouseDownR && event.button == 2) {
          this._isMouseDownR = false;
          this._suppressContext = !!this._gesture;
          if (this._enableWheel && this._gesture && this._gesture.charAt(0) == 'W') this._gesture = '';
          this.stopGesture(event);
          if (this._shouldFireContext) {      // for Linux & Mac
            this._shouldFireContext = false;
            let mEvent = event.originalTarget.ownerDocument.createEvent('MouseEvents');
            mEvent.initMouseEvent('contextmenu', true, true, aEvent.originalTarget.defaultView, 0, event.screenX, event.screenY, event.clientX, event.clientY, false, false, false, false, 2, null);
            event.originalTarget.dispatchEvent(mEvent);
          }
        } else if (this._isMouseDownL && event.button == 0) this._isMouseDownL = false;
        break;
      case 'contextmenu':
        if (this._suppressContext || this._isMouseDownR) {
          this._suppressContext = false;
          this._shouldFireContext = this._isMouseDownR;
          event.preventDefault();
          event.stopPropagation();
        }
        break;
      case 'DOMMouseScroll':
        if (this._enableWheel && this._isMouseDownR) {
          event.preventDefault();
          event.stopPropagation();
          this._suppressContext = true;
          this._gesture = 'W' + (event.detail > 0 ? '+' : '-');
          this.stopGesture( event, false );
        }
        break;
      case 'draggesture':
        this._isMouseDownL = false;
        break;
      }
    },
    startGesture: function(event) {
      this._gesture = '';
      this._x = event.screenX;
      this._y = event.screenY;
      this._origDoc = event.originalTarget.ownerDocument;
      this._links = [];
    },
    progressGesture: function(event) {
      if (!this._origDoc) return;
      for (let node = event.originalTarget; node; node = node.parentNode) {
        if (node instanceof Ci.nsIDOMHTMLAnchorElement) {
          if (this._links.indexOf(node.href) == -1) this._links.push(node.href);
          break;
        }
      }
      this.timerGesture();
      var x = event.screenX, y = event.screenY;
      var distX = Math.abs(x-this._x), distY = Math.abs(y-this._y);
      var threshold = 15/ (gBrowser.selectedBrowser.markupDocumentViewer.fullZoom || 1.0);
      if (distX < threshold && distY < threshold) return;
      var dir = distX > distY ? (x<this._x ? 'L' : 'R') : (y<this._y ? 'U': 'D');
      if (dir != this._gesture.slice(-1)) {
        this._gesture += dir;
        this.status = 'Gesture: ' + this._gesture + (this.GESTURES[this._gesture] ? ' (' + this.GESTURES[this._gesture][0] + ')' : '');
      }
      this._x = x; this._y = y;
    },
    timerGesture: function(isClear) {
      if (this._timer)  clearTimeout(this._timer);
        this._timer = setTimeout( !isClear ? function(self) self.stopGesture({}, true) : function(self) self._timer = self.status = '', 1500, this);
    },
    stopGesture: function(event, cancel) {
      if (this._gesture) {
        try {
          if (cancel) throw 'Gesture Canceled';

          let cmd = this.GESTURES[this._gesture] || null;
/*
          if ( !cmd && this.GESTURES['*'] ) {
            for (let key in this.GESTURES['*']) {
              if (this.GESTURES['*'][key].test(this._gesture)) {
                cmd = this.GESTURES[key];
                break;
              }
            }
          }
*/
          if (!cmd) throw 'Unknown Gesture: ' + this._gesture;

          cmd[1].call(this);
          this.status = 'Gesture: ' + cmd[0];
        } catch (exp) {
          this.status = exp;
        }
        this.timerGesture(true);
      }
      this._origDoc = this._links = null;
    }
  };
  return new MouseGestures();
})();
