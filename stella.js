// ==VimperatorPlugin==
// @name           すてら
// @description-ja ステータスラインに動画の再生時間などを表示する。
// @license        Creative Commons Attribution-Share Alike 3.0 Unported
// @version        0.01
// @author         anekos (anekos@snca.net)
// @minVersion     2.0pre
// @maxVersion     2.0pre
// ==/VimperatorPlugin==
//
// Usage-ja:
//    作成中
//
// TODO
//    user command
//    :fetchvideo
//    Icons
//    Other video hosting websites
//
// Links:
//
// License:
//    http://creativecommons.org/licenses/by-sa/3.0/


(function () {

  /*********************************************************************************
  * Const                                                                        {{{
  *********************************************************************************/

  const ID_PREFIX = 'anekos-stela-';

  // }}}

  /*********************************************************************************
  * Utils                                                                        {{{
  *********************************************************************************/

  function isNum (v)
    (typeof v === 'number' && !isNaN(v));

  function lz (s,n)
    String(Math.pow(10,n ) + s).substring(1);

  function toTimeCode(v)
    (isNum(v) ? (parseInt((v / 60)) + ':' + lz(v % 60, 2))
              : '??:??');

  function bindr (_this, f)
    function () f.apply(_this, arguments);

  function capitalize (s)
    s.replace(/^./, String.toUpperCase);


  // }}}

  /*********************************************************************************
  * Player                                                                       {{{
  *********************************************************************************/

  function Player () {
    this.initialize.apply(this, arguments);
  }

  Player.ST_PLAYING = 'playing';
  Player.ST_PAUSED  = 'paused';
  Player.ST_ENDED   = 'ended';
  Player.ST_OTHER   = 'other';

  // rwxt で機能の有無を表す
  // r = read
  // w = write
  // x = function
  // t = toggle
  Player.prototype = {
    functions: {
      currentTime: '',
      totalTime: '',
      volume: '',
      play: '',
      pause: '',
      muted: '',
      repeating: '',
    },

    icon: null,

    initialize: function () void null,

    get currentTime () undefined,
    set currentTime (value) void value,

    get timeCodes () (toTimeCode(this.currentTime) + '/' + toTimeCode(this.totalTime)),

    get volume () undefined,
    set volume (value) void value,

    get statusText () this.timeCodes,

    is: function (state) (this.state == state),

    has: function (name, ms)
            let (f = this.functions[name])
              (f && !Array.some(ms, function (m) f.indexOf(m) < 0)),

    playOrPause: function () {
      if (this.is(Player.ST_PLAYING)) {
        this.pause();
      } else {
        this.playEx();
      }
    },

    play: function () undefined,

    playEx: function () {
      if (this.is(Player.ST_ENDED))
        this.currentTime = 0;
      this.play();
    },

    pause: function () undefined,

    get repeating () undefined,
    set repeating (value) undefined,

    get muted () undefined,
    set muted (value) undefined,

    get state () undefined,

    toggle: function (name) {
      if (!this.has(name, 'rw'))
        return;
      let v = this[name];
      this[name] = !v;
      return !v;
    }
  };

  // }}}

  /*********************************************************************************
  * YouTubePlayer                                                                {{{
  *********************************************************************************/

  function YouTubePlayer () {
    Player.apply(this, arguments);
  }

  YouTubePlayer.prototype = {
    __proto__: Player.prototype,

    functions: {
      currentTime: 'rw',
      totalTime: 'r',
      volume: 'rw',
      play: 'x',
      pause: 'x',
      muted: 'rwt',
      repeating: 'rw',
    },

    toggles: ['muted'],

    icon: 'http://www.youtube.com/favicon.ico',

    get player ()
      let (p = content.document.getElementById('movie_player'))
        (p && (p.wrappedJSObject || p)),

    get currentTime () parseInt(this.player.getCurrentTime()),
    set currentTime (value) this.player.seekTo(value),

    get totalTime () parseInt(this.player.getDuration()),

    get volume () parseInt(this.player.getVolume()),
    set volume (value) parseInt(this.player.setVolume(value)),

    play: function () this.player.playVideo(),

    pause: function () this.player.pauseVideo(),

    get muted () this.player.isMuted(),
    set muted (value) (value ? this.player.mute() : this.player.unMute()),

    get state () {
      switch (this.player.getPlayerState()) {
        case 'ended':
          return Player.ST_ENDED;
        case 'playing':
          return Player.ST_PLAYING;
        case 'paused':
          return Player.ST_PAUSED;
        case 'buffering':
        case 'video cued':
        case 'unstarted':
        default:
          return Player.ST_OTHER;
      }
    }
  };

  // }}}

  /*********************************************************************************
  * NicoPlayer                                                                   {{{
  *********************************************************************************/

  function NicoPlayer () {
    Player.apply(this, arguments);
  }

  NicoPlayer.prototype = {
    __proto__: Player.prototype,

    functions: {
      currentTime: 'rw',
      totalTime: 'r',
      volume: 'rw',
      play: 'x',
      pause: 'x',
      muted: 'rwt',
      repeating: 'rwt',
      comment: 'rwt'
    },

    icon: 'http://www.nicovideo.jp/favicon.ico',

    get player ()
      let (p = content.document.getElementById('flvplayer'))
        (p && (p.wrappedJSObject || p)),

    get currentTime () parseInt(this.player.ext_getPlayheadTime()),
    set currentTime (value) this.player.ext_setPlayheadTime(value),

    get totalTime () parseInt(this.player.ext_getTotalTime()),

    get volume () parseInt(this.player.ext_getVolume()),
    set volume (value) parseInt(this.player.ext_setVolume(value)),

    playOrPause: function () {
      if (this.is(Player.ST_PLAYING)) {
        this.pause();
      } else {
        let base = this.currentTime;
        setTimeout(bindr(this, function () (base === this.currentTime ? this.playEx() : this.pause())), 100);
      }
    },

    play: function () this.player.ext_play(true),

    pause: function () this.player.ext_play(false),

    get comment () this.player.ext_isCommentVisible(),
    set comment (value) this.player.ext_setCommentVisible(value),

    get repeating () this.player.ext_isRepeat(),
    set repeating (value) this.player.ext_setRepeat(value),

    get muted () this.player.ext_isMute(),
    set muted (value) this.player.ext_setMute(value),

    get state () {
      switch (this.player.ext_getStatus()) {
        case 'end':
          return Player.ST_ENDED;
        case 'playing':
          return Player.ST_PLAYING;
        case 'paused':
          return Player.ST_PAUSED;
        case 'buffering':
        default:
          return Player.ST_OTHER;
      }
    }
  };

  // }}}

  /*********************************************************************************
  * ContextMenu                                                                  {{{
  *********************************************************************************/

  const ContextMenuVolume = [];
  for (let i = 0; i <= 100; i += 10)
    ContextMenuVolume.push({name: 'setVolume', label:   i + '%', attributes: {volume:   i}})

  const ContextMenuTree = [
    'play',
    'pause',
    'comment',
    'repeat',
    {
      name: 'volume-root',
      label: 'Volume',
      id: ID_PREFIX + 'volume-menupopup',
      sub: ContextMenuVolume
    }
  ];

  function buildContextMenu (setting) {
    function append (parent, menu) {
      if (typeof menu == 'string')
        menu = {name: menu};
      if (menu instanceof Array)
        return menu.forEach(function (it) append(parent, it));
      if (!menu.label)
        menu.label = capitalize(menu.name);
      let (elem) {
        if (menu.sub) {
          let _menu = document.createElement('menu');
          let _menupopup = elem = document.createElement('menupopup');
          _menu.setAttribute('label', menu.label);
          _menu.appendChild(_menupopup);
          parent.appendChild(_menu);
          append(_menupopup, menu.sub);
        } else {
          elem = document.createElement('menuitem');
          elem.setAttribute('label', menu.label);
          parent.appendChild(elem);
        }
        menu.id && elem.setAttribute('id', menu.id);
        for (let [name, value] in Iterator(menu.attributes || {}))
          elem.setAttribute(name, value);
        setting.onAppend.call(setting, elem, menu);
      }
    }

    let root = document.createElement('menupopup');
    root.id = setting.id;

    append(root, setting.tree);

    setting.set.setAttribute('context', root.id);
    setting.parent.appendChild(root);

    return root;
  }

  // }}}

  /*********************************************************************************
  * Stella                                                                       {{{
  *********************************************************************************/

  function Stella () {
    this.initialize.apply(this, arguments);
  }

  Stella.MAIN_PANEL_ID  = ID_PREFIX + 'panel',
  Stella.MAIN_MENU_ID   = ID_PREFIX + 'main-menu',
  Stella.VOLUME_MENU_ID = ID_PREFIX + 'volume-menu',

  Stella.prototype = {
    // new 時に呼ばれる
    initialize: function () {
      this.players = {
        niconico: new NicoPlayer(),
        youtube: new YouTubePlayer()
      };
      this.createStatusPanel();
      this.addAutoCommand();
      this.onLocationChange();
      this.__onResize = window.addEventListener('resize', bindr(this, this.onResize), false);
    },

    // もちろん、勝手に呼ばれたりはしない。
    finalize: function () {
      this.removeStatusPanel();
      this.disable();
      window.removeEventListener('resize', this.__onResize, false);
    },

    get where () (
      (~buffer.URL.indexOf('http://www.nicovideo.jp/watch/') && 'niconico')
      ||
      (buffer.URL.match(/^http:\/\/(?:[^.]+\.)?youtube\.com\/watch/) && 'youtube')
    ),

    get hidden () (this.panel.hidden),
    set hidden (v) (this.panel.hidden = v),

    get valid () (this.where),

    get player () this.players[this.where],

    get statusBar () document.getElementById('status-bar'),

    get statusBarVisible () !this.statusBar.getAttribute('moz-collapsed', false),
    set statusBarVisible (value) this.statusBar.setAttribute('moz-collapsed', !value),

    setLabelText: function (name, text)
      let (label = this.labels[name])
        (label && label.setAttribute('value', text)),

    removeStatusPanel: function () {
      let e = this.panel || document.getElementById(this.panelId);
      if (e && e.parentNode)
        e.parentNode.removeChild(e);
    },

    createStatusPanel: function () {
      let self = this;

      function setClickEvent (name, elem) {
        let onClick = self['on' + capitalize(name) + 'Click'];
        onClick && elem.addEventListener('click', function (event) {
          if (event.button == 0) {
            onClick.apply(self, arguments);
            self.update();
          }
        }, false);
      }

      function createLabel (store, name, l, r) {
          let label = store[name] = document.createElement('label');
          label.setAttribute('value', '-');
          label.style.marginLeft = (l || 0) + 'px';
          label.style.marginRight = (r || 0) + 'px';
          label.__defineGetter__('text', function () this.getAttribute('value'));
          label.__defineSetter__('text', function (v) this.setAttribute('value', v));
          setClickEvent(name, label);
      }

      let panel = this.panel = document.createElement('statusbarpanel');
      panel.setAttribute('id', this.panelId);

      let hbox = document.createElement('hbox');
      hbox.setAttribute('align', 'center');

      let icon = this.icon = document.createElement('image');
      icon.setAttribute('class', 'statusbarpanel-iconic');
      icon.style.marginRight = '4px';
      setClickEvent('icon', icon);

      let labels = this.labels = {};
      let toggles = this.toggles = {};
      createLabel(labels, 'main', 2, 2);
      createLabel(labels, 'volume', 0, 2);
      for each (let player in this.players) {
        for (let func in player.functions) {
          if (player.has(func, 't'))
            (func in labels) || createLabel(toggles, func);
        }
      }

      panel.appendChild(hbox);
      hbox.appendChild(icon);
      [hbox.appendChild(label) for each (label in labels)];
      [hbox.appendChild(toggle) for each (toggle in toggles)];

      let menu = this.mainMenu = buildContextMenu({
        id: Stella.MAIN_MENU_ID,
        parent: panel,
        set: hbox,
        tree: ContextMenuTree,
        onAppend: function (elem, menu) setClickEvent(capitalize(menu.name), elem)
      });

      let stbar = document.getElementById('status-bar');
      stbar.insertBefore(panel, document.getElementById('liberator-statusline').nextSibling);
    },

    // FIXME
    addAutoCommand: function ()
      autocommands.add('LocationChange', /.*/, "js liberator.plugins.nico_statusline.onLocationChange()"),

    update: function () {
      try {
        this.labels.main.text       = this.player.statusText;
        this.labels.volume.text     = this.player.volume;
        this.toggles.comment.text   = this.player.comment ? 'C' : 'c';
        this.toggles.repeating.text = this.player.repeating ? 'R' : 'r';
        this.toggles.muted.text     = this.player.muted ? 'M' : 'm';
      } catch (e) {
        liberator.log(e);
      }
    },

    enable: function () {
      this.hidden = false;
      this.icon.setAttribute('src', this.player.icon);
      for (let name in this.toggles) {
        this.toggles[name].hidden = !this.player.has(name, 't');
      }
      if (!this.timerHandle) {
        this.timerHandle = setInterval(bindr(this, this.update), 500);
      }
    },

    disable: function () {
      this.hidden = true;
      if (this.timerHandle) {
        clearInterval(this.timerHandle);
        this.timerHandle = null;
      }
    },

    onLocationChange: function () {
      if (this.__valid !== this.valid) {
        (this.__valid = this.valid) ? this.enable() : this.disable();
      }
    },

    onPlayClick: function () this.player.play(),

    onPauseClick: function () this.player.pause(),

    onMutedClick: function (event) (this.player.muted = !this.player.muted),

    onSetMutedClick: function (event) (this.player.volume = event.target.getAttribute('volume')),

    onCommentClick: function () (this.player.comment = !this.player.comment),

    onRepeatingClick: function () (this.player.repeating = !this.player.repeating),

    onMainClick: function (event) {
      if (event.button)
        return;
      let rect = event.target.getBoundingClientRect();
      let x = event.screenX;
      let per = (x - rect.left) / (rect.right - rect.left);
      this.player.currentTime = this.player.totalTime * per;
    },

    onIconClick: function () this.player.playOrPause(),

    // フルスクリーン時にステータスバーを隠さないようにする
    onFullScreen: function () {
      if (window.fullScreen) {
        this.__statusBarVisible = this.statusBarVisible;
        this.statusBarVisible = true;
      } else {
        if (this.__statusBarVisible !== undefined)
          this.statusBarVisible = this.__statusBarVisible;
      }
    },

    onResize: function () {
      if (this.__fullScreen !== window.fullScreen) {
        this.__fullScreen = window.fullScreen;
        this.onFullScreen(this.__fullScreen);
      }
    }
  };

  // }}}

  /*********************************************************************************
  * Install                                                                      {{{
  *********************************************************************************/

  let (nsl = liberator.plugins.nico_statusline) {
    if (nsl) {
      nsl.finalize();
      liberator.plugins.nico_statusline = new Stella();
    } else {
      window.addEventListener(
        'DOMContentLoaded',
        function () {
          window.removeEventListener('DOMContentLoaded', arguments.callee, false);
          liberator.plugins.nico_statusline = new Stella();
        },
        false
      );
    }
  }

  // }}}

})();

// vim:sw=2 ts=2 et si fdm=marker:
