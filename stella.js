/*
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
# http://sourceforge.jp/projects/opensource/wiki/licenses%2Fnew_BSD_license
# に参考になる日本語訳がありますが、有効なのは上記英文となります。
###################################################################################

*/

var PLUGIN_INFO =
<VimperatorPlugin>
  <name>Stella</name>
  <name lang="ja">すてら</name>
  <description>Show video informations on the status line.</description>
  <description lang="ja">ステータスラインに動画の再生時間などを表示する。</description>
  <version>0.09</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos２</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <detail><![CDATA[
    == Commands ==
      :stpl[ay]:
        play or pause
      :stpa[use]:
        pause
      :stvolume <VOLUME>:
        set to the specified volume.
      :stmu[te]:
        turn on/off mute.
      :stre[peat]:
        turn on/off mute.
      :stco[mment]:
        turn on/off comment visible.
      :stse[ek] <TIMECODE>:
        seek to specified position.
        TIMECODE formats
          - :stseek 1:30 # 1分30秒
          - :stseek 1.5  # 1.5分。90秒
          - :stseek 90   # 90秒
      :stse[ek]! <TIMECODE>:
        seek to the specified position from current position at relatively.
      :stfe[tch]:
        fetch and save the video.
      :stla[rge]:
        enlarge video screen.
      :stfu[llscreen]:
        turn on/off fullscreen.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Commands ==
      :stpl[ay]:
        再生/ポーズの解除を行う。
      :stpa[use]:
        一時停止する。
      :stvolume <VOLUME>:
        指定の音量にする。
        0から100の数字で指定する。
      :stmu[te]:
        ミュートのOn/Offを切り替える。
      :stre[peat]:
        リピートモードのOn/Offを切り替える。
      :stco[mment]:
        コメントのOn/Offを切り替える。
      :stse[ek] <TIMECODE>:
        指定の秒数までシークする。
        TIMECODE は以下の様に指定できる。
          - :stseek 1:30 # 1分30秒
          - :stseek 1.5  # 1.5分。90秒
          - :stseek 90   # 90秒
      :stse[ek]! <TIMECODE>:
        現在の位置から TIMECODE 分移動する。
      :stfe[tch]:
        動画をファイルとして保存する。
      :stla[rge]:
        画面を大きくする/戻す。
      :stfu[llscreen]:
        フルスクリーン表示のOn/Offを切り替える。
    == Link ==
      http://d.hatena.ne.jp/nokturnalmortum/20081213/1229168832
  ]]></detail>
</VimperatorPlugin>;


/*
TODO
   ・Icons
   ・Other video hosting websites
   ・auto fullscreen
   ・動的な command の追加削除 (nice rabbit!)
   ・ツールチップみたいな物で、マウスオー馬したときに動画情報を得られるようにしておく。
   ・外から呼ぶべきでない関数(プライベート)をわかりやすくしたい
   ・argCount の指定が適当なのを修正 (動的な userCommand と平行でうまくできそう？)
   ・実際のプレイヤーが表示されるまで待機できようにしたい(未表示に時にフルスクリーン化すると…)
   ・コメント欄でリンクされている動画も関連動画として扱いたい
      -> "その３=>sm666" みたいなやつ
      -> リンクはともかくタイトルの取得がムツカシー

MEMO
   ・prototype での定義順: 単純な値 initialize finalize (get|set)ter メソッド
   ・関数やプロパティは基本的にアルファベット順にならべる。

Refs:
   http://yuichis.homeip.net/nicodai.user.html
   http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/trunk/nicontroller.js
   http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/trunk/youtubeamp.js

Thanks:
   参考にさせてもらった人々。THANKS!!
     janus_wel 氏
       http://d.hatena.ne.jp/janus_wel/
     ゆういち 氏
       http://yuichis.homeip.net/nicodai.user.html
*/

(function () {

  /*********************************************************************************
  * Const                                                                        {{{
  *********************************************************************************/

  const ID_PREFIX = 'anekos-stela-';
  const InVimperator = !!(liberator && modules && modules.liberator);
  const DOUBLE_CLICK_INTERVAL = 300;

  // }}}

  /*********************************************************************************
  * Utils                                                                        {{{
  *********************************************************************************/

  function bindr (_this, f)
    function () f.apply(_this, arguments);

  function capitalize (s)
    s.replace(/^[a-z]/, String.toUpperCase).replace(/-[a-z]/, function (s) s.slice(1).toUpperCase());

  function currentURL ()
    content.document.location.href;

  function download (url, filepath, ext, title) {
    let dm = Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager);
    let wbp = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
    let file;

    if (filepath) {
      file = io.getFile(io.expandPath(filepath));
    } else {
      file = dm.userDownloadsDirectory;
    }
    if (file.isDirectory() && title)
      file.appendRelativePath(fixFilename(title) + ext);
    if (file.exists())
      return liberator.echoerr('The file already exists! -> ' + file.path);
    file = makeFileURI(file);

    let dl = dm.addDownload(0, makeURL(url, null, null), file, title, null, null, null, null, wbp);
    wbp.progressListener = dl;
    wbp.persistFlags |= wbp.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
    wbp.saveURI(makeURL(url), null, null, null, null, file);

    return true;
  }

  function fixDoubleClick (obj, click, dblClick) {
    let clicked = 0;
    let original = {click: obj[click], dblClick: obj[dblClick]};
    obj[click] = function () {
      let self = this, args = arguments;
      let _clicked = ++clicked;
      setTimeout(function () {
        if (_clicked == clicked--)
          original.click.apply(self, args);
        else
          clicked = 0;
      }, DOUBLE_CLICK_INTERVAL);
    };
    obj[dblClick] = function () {
      clicked = 0;
      original.dblClick.apply(this, arguments);
    };
  }

  function fixFilename (filename) {
    const badChars = /[\\\/:;*?"<>|]/g;
    return filename.replace(badChars, '_');
  }

  // 上手い具合に秒数に直すよ
  function fromTimeCode (code) {
    var m;
    if (m = /^(([-+]?)\d+):(\d+)$/(code))
      return parseInt(m[1], 10) * 60 + (m[2] == '-' ? -1 : 1) * parseInt(m[3], 10);
    if (m = /^([-+]?\d+\.\d+)$/(code))
      return Math.round(parseFloat(m[1], 10) * 60);
    return parseInt(code, 10);
  }

  function getElementByIdEx (id)
    let (p = content.document.getElementById(id))
      (p && (p.wrappedJSObject || p));

  function httpRequest (uri, onComplete) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200)
          onComplete && onComplete(xhr);
        else
          raise(xhr.statusText);
      }
    };
    xhr.open('GET', uri, !!onComplete);
    xhr.send(null);
    return xhr;
  }

  function id (value)
    value;

  function isNum (v)
    (typeof v === 'number' && !isNaN(v));

  function lz (s, n)
    String(Math.pow(10, n) + s).substring(1);

  function makeFile (s) {
    var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    file.initWithPath(s);
    return file;
  }

  function makeURL (s) {
    let url = Cc["@mozilla.org/network/standard-url;1"].createInstance(Ci.nsIURL);
    url.spec = s;
    return url;
  }

  function restoreStyle (target, doDelete) {
    let style = target.style;
    if (!style.__stella_backup)
      return;
    let backup = style.__stella_backup;
    for (let name in Iterator(backup))
      style[name] = backup[name];
    if (doDelete)
      delete style.__stella_backup;
  }

  function storeStyle (target, values, overwrite) {
    let [style, cstyle] = [target.style, content.getComputedStyle(target, '')];
    let backup = {};
    for (let [name, value] in Iterator(values)) {
      backup[name] = cstyle[name];
      style[name] = value;
    }
    if (overwrite || !style.__stella_backup)
      style.__stella_backup = backup;
  }

  function toTimeCode(v)
    (isNum(v) ? (parseInt((v / 60)) + ':' + lz(v % 60, 2))
              : '??:??');

  let raise = InVimperator ? function (error) {throw new Error(error)}
                           : function (error) liberator.echoerr(error);

  // }}}

  /*********************************************************************************
  * Player                                                                       {{{
  *********************************************************************************/

  function Player () {
    let self = this;

    this.initialize.apply(this, arguments);

    function setf (name, value)
      ((self.functions[name] === undefined) && (self.functions[name] = value || ''));

    let (seek = this.has('currentTime', 'rw', 'totalTime', 'r') && 'x') {
      setf('seek', seek);
      setf('seekRelative', seek);
    }
    setf('playOrPause', this.has('play', 'x', 'pause', 'x') && 'x');
    setf('turnUpDownVolume', this.has('volume', 'rw') && 'x');
    setf('maxVolume', this.has('volume', 'rw') && 'r');
    setf('fetch', this.has('fileURL', 'r') && 'x');
    setf('relations', [name for each (name in Player.RELATIONS) if (this.has(name, 'r'))].length && 'r');
    if (!this.functions.large)
      this.functions.large = this.functions.fullscreen;
  }

  Player.ST_ENDED   = 'ended';
  Player.ST_OTHER   = 'other';
  Player.ST_PAUSED  = 'paused';
  Player.ST_PLAYING = 'playing';

  Player.REL_ID     = 'id';
  Player.REL_SEARCH = 'search';
  Player.REL_TAG    = 'tag';
  Player.REL_URL    = 'url';

  Player.RELATIONS = {
    REL_TAG: 'relatedTags',
    REL_ID: 'relatedIDs'
  };

  // rwxt で機能の有無を表す
  // r = read
  // w = write
  // x = function
  // t = toggle
  Player.prototype = {
    functions: {
      currentTime: '',
      fileExtension: 'r',
      fileURL: '',
      fullscreen: '',
      large: '',
      makeURL: '',
      muted: '',
      pause: '',
      play: '',
      playEx: '',
      relatedIDs: '',
      relatedTags: '',
      repeating: '',
      tags: '',
      title: '',
      totalTime: '',
      volume: '',
      // auto setting => fetch maxVolume playOrPause relations seek seekRelative turnUpDownVolume
    },

    icon: null,

    initialize: function () void null,

    finalize: function () {
      // 念のためフルスクリーンは解除しておく
      if (this.has('fullscreen', 'rwt') && this.isValid && this.fullscreen)
        this.fullscreen = false;
    },

    is: function (state) (this.state == state),

    has: function (name, ms)
      (arguments.length < 2)
      ||
      let (f = this.functions[name])
        (f && !Array.some(ms, function (m) f.indexOf(m) < 0))
        &&
        arguments.callee.apply(this, Array.splice(arguments, 2)),

    get currentTime () undefined,
    set currentTime (value) value,

    get fileExtension () '',

    get fullscreen () undefined,
    set fullscreen (value) value,

    get fileURL () undefined,

    get maxVolume () 100,

    get muted () undefined,
    set muted (value) value,

    get relatedIDs () undefined,

    get relations () {
      if (!this.has('relations', 'r'))
        return [];
      let result = [];
      for (let [type, name] in Iterator(Player.RELATIONS)) {
        if (this.has(name, 'r'))
          result = result.concat(this[name]);
      }
      return result;
    },

    get repeating () undefined,
    set repeating (value) value,

    get large () this.fullscreen,
    set large (value) (this.fullscreen = value),

    get state () undefined,

    get statusText () this.timeCodes,

    get storage ()
      (content.document.__stella_storage || (content.document.__stella_storage = {})),

    get timeCodes () (toTimeCode(this.currentTime) + '/' + toTimeCode(this.totalTime)),

    get title () undefined,

    get isValid () /^http:\/\/(tw|es|de|www)\.nicovideo\.jp\/watch\//.test(buffer.URL),

    get volume () undefined,
    set volume (value) value,

    fetch: function (filepath)
      download(this.fileURL, filepath, this.fileExtension, this.title),

    makeURL: function () undefined,

    pause: function () undefined,

    play: function () undefined,

    playEx: function () {
      if (this.is(Player.ST_ENDED))
        this.currentTime = 0;
      this.play();
    },

    playOrPause: function () {
      if (this.is(Player.ST_PLAYING)) {
        this.pause();
      } else {
        this.playEx();
      }
    },

    seek: function (v) {
      v = fromTimeCode(v);
      if (v < 0)
        v = this.totalTime + v;
      return this.currentTime = Math.min(Math.max(v, 0), this.totalTime);
    },

    seekRelative: function (v)
      this.currentTime = Math.min(Math.max(this.currentTime + fromTimeCode(v), 0), this.totalTime),

    toggle: function (name) {
      if (!this.has(name, 'rwt'))
        return;
      let v = this[name];
      this[name] = !v;
      return !v;
    },

    turnUpDownVolume: function (v)
      this.volume = Math.min(Math.max(this.volume + parseInt(v), 0), this.maxVolume)
  };

  // }}}

  /*********************************************************************************
  * Relation                                                                     {{{
  *********************************************************************************/

  function Relation () {
  }

  Relation.prototype = {
    get command () undefined,
    get description () undefined,
    get completionItem () ([this.command, this.description]),
  };


  // }}}

  /*********************************************************************************
  * Relation - Sub                                                               {{{
  *********************************************************************************/

  function RelatedTag (tag) {
    this.tag = tag;
    Relation.apply(this, arguments);
  }

  RelatedTag.prototype = {
    __proto__: Relation.prototype,
    get command () (':' + this.tag),
    get description () (this.tag)
  };



  function RelatedID (id, title) {
    this.id = id;
    this.title = title;
    Relation.apply(this, arguments);
  }

  RelatedID.prototype = {
    __proto__: Relation.prototype,
    get command () ('#' + this.id),
    get description () this.title
  };



  function RelatedURL (url, title) {
    this.url = url;
    this.title = title;
    Relation.apply(this, arguments);
  }

  RelatedURL.prototype = {
    __proto__: Relation.prototype,
    get command () this.url,
    get description () this.title
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
      fileURL: 'r',
      fullscreen: 'rwt',
      muted: 'rwt',
      pause: 'x',
      play: 'x',
      playEx: 'x',
      playOrPause: 'x',
      repeating: 'rw',
      title: 'r',
      totalTime: 'r',
      volume: 'rw'
    },

    icon: 'http://www.youtube.com/favicon.ico',

    get currentTime () parseInt(this.player.getCurrentTime()),
    set currentTime (value) (this.player.seekTo(fromTimeCode(value)), this.currentTime),

    get fileExtension () '.mp4',

    get fileURL ()
      let (as = content.document.defaultView.wrappedJSObject.swfArgs)
        ('http://www.youtube.com/get_video?fmt=22&video_id=' + as.video_id + '&t=' + as.t),

    get fullscreen () this.storage.fullscreen,
    // FIXME - 元に戻らない＆スクロールバーが出たまま
    set fullscreen () {
      this.storage.fullscreen = !this.storage.fullscreen;
      let p = this.player;
      let r = p.getBoundingClientRect();
      if (this.fullscreen) {
        if (this.storage.r === undefined)
          this.storage.r = options['guioptions'].indexOf('r') >= 0;
        storeStyle(p, {
          marginLeft: -r.left + 'px',
          marginTop: -r.top + 'px',
          width: content.innerWidth + 'px',
          height: content.innerHeight + 'px',
        });
        p.setSize(content.innerWidth, content.innerHeight);
      } else {
        p.setSize(640, 385);
        restoreStyle(p);
      }
    },

    get muted () this.player.isMuted(),
    set muted (value) ((value ? this.player.mute() : this.player.unMute()), value),

    get player ()
      let (p = content.document.getElementById('movie_player'))
        (p && (p.wrappedJSObject || p)),

    get state () {
      switch (this.player.getPlayerState()) {
        case 0:
          return Player.ST_ENDED;
        case 1:
          return Player.ST_PLAYING;
        case 2:
          return Player.ST_PAUSED;
        case 3:
          // buffering
        case 5:
          //video cued
        case -1:
          //unstarted
        default:
          return Player.ST_OTHER;
      }
    },

    get title ()
      content.document.title.replace(/^YouTube - /, ''),

    get totalTime () parseInt(this.player.getDuration()),

    get isValid () buffer.URL.match(/^http:\/\/(?:[^.]+\.)?youtube\.com\/watch/),

    get volume () parseInt(this.player.getVolume()),
    set volume (value) (this.player.setVolume(value), this.volume),

    play: function () this.player.playVideo(),

    pause: function () this.player.pauseVideo()
  };

  // }}}

  /*********************************************************************************
  * NicoPlayer                                                                   {{{
  *********************************************************************************/

  function NicoPlayer () {
    Player.apply(this, arguments);
  }

  // name, Normal, Fullscreen
  // 任意の順で設定できるように配列で持つ
  NicoPlayer.Variables = [
    ['videowindow._xscale',                     100,   null],
    ['videowindow._yscale',                     100,   null],
    ['videowindow._x',                            6,      0],
    ['videowindow._y',                           65,      0],
    ['controller._x',                             6,  -1000],
    ['inputArea._x',                              4,  -1000],
    ['controller._visible',                       1,      1],
    ['inputArea._visible',                        1,      1],
    ['waku._visible',                             1,      0],
    ['tabmenu._visible',                          1,      0],
    ['videowindow.video_mc.video.smoothing',   null,      1],
    ['videowindow.video_mc.video.deblocking',  null,      5]
  ];

  NicoPlayer.SIZE_LARGE  = 'fit';
  NicoPlayer.SIZE_NORMAL = 'normal';

  NicoPlayer.prototype = {
    __proto__: Player.prototype,

    functions: {
      comment: 'rwt',
      currentTime: 'rw',
      fetch: 'x',
      fileURL: '',
      fullscreen: 'rwt',
      id: 'r',
      large: 'rwt',
      makeURL: 'x',
      muted: 'rwt',
      pause: 'x',
      play: 'x',
      playEx: 'x',
      playOrPause: 'x',
      relatedIDs: 'r',
      relatedTags: 'r',
      repeating: 'rwt',
      tags: 'r',
      title: 'r',
      totalTime: 'r',
      volume: 'rw'
    },

    icon: 'http://www.nicovideo.jp/favicon.ico',

    get comment () this.player.ext_isCommentVisible(),
    set comment (value) (this.player.ext_setCommentVisible(value), value),

    get playerContainer () getElementByIdEx('flvplayer_container'),

    get currentTime () parseInt(this.player.ext_getPlayheadTime()),
    set currentTime (value) (this.player.ext_setPlayheadTime(fromTimeCode(value)), this.currentTime),

    get fileExtension () '.flv',

    get fullscreen () !!this.storage.fullscreen,
    set fullscreen (value) {
      value = !!value;
      if (this.storage.fullscreen === value)
        return;

      this.storage.fullscreen = value;

      let self = this, player = this.player,
          win = content.wrappedJSObject, doc = content.document.wrappedJSObject;

      if (player.ext_getVideoSize() === 'fit')
        player.ext_setVideoSize('normal');

      win.toggleMaximizePlayer();
      if (value) {
        turnOn();
        win.onresize = fixFullscreen;
      } else {
        turnOff();
        delete win.onresize;
      }
      win.scrollTo(0, 0);

      // 以下関数定義のみ - setVariables turnOn/Off fixFullscreen

      function setVariables (fullscreen) {
        NicoPlayer.Variables.forEach(function ([name, normal, full]) {
          let v = fullscreen ? full : normal;
          if (v !== null)
            self.player.SetVariable(name, v);
        });
      }

      function turnOn () {
        let viewer = {w: 544, h: 384};
        let screen = {
          w: content.innerWidth,
          h: content.innerHeight
        };
        let scale = {
          w: Math.max(1, screen.w / viewer.w),
          h: Math.max(1, screen.h / viewer.h)
        };
        scale.v = Math.min(scale.w, scale.h);
        storeStyle(doc.body, {
          backgroundImage:  'url()',
          backgroundRepeat: '',
          backgroundColor:  'black'
        });
        storeStyle(
          player,
          (scale.w >= scale.h) ? {
            width:      Math.floor(viewer.w * scale.h) + 'px',
            height:     screen.h + 'px',
            marginLeft: ((screen.w - viewer.w * scale.h) / 2) + 'px',
            marginTop:  '0px'
          } : {
            width:      screen.w + 'px',
            height:     Math.floor(viewer.h * scale.w) + 'px',
            marginLeft: '0px',
            marginTop:  ((screen.h - viewer.h * scale.w) / 2) + 'px'
          }
        );
        player.SetVariable('videowindow._xscale', 100 * scale.v);
        player.SetVariable('videowindow._yscale', 100 * scale.v);
        setVariables(true);
      }

      function turnOff () {
        restoreStyle(doc.body, true);
        restoreStyle(player, true);
        player.style.marginLeft = '';
        player.style.marginTop  = '';
        setVariables(false);
      }

      function fixFullscreen ()
        ((InVimperator && liberator.mode === modes.COMMAND_LINE) || setTimeout(turnOn, 500));

    },

    get id ()
      let (m = currentURL().match(/\/watch\/([a-z]{2}\d+)/))
        (m && m[1]),

    get muted () this.player.ext_isMute(),
    set muted (value) (this.player.ext_setMute(value), value),

    get player () getElementByIdEx('flvplayer'),

    get relatedIDs () {
      if (this.__rid_last_url == currentURL())
        return this.__rid_cache || [];
      this.__rid_last_url = currentURL();
      let videos = [];
      let uri = 'http://www.nicovideo.jp/api/getrelation?sort=p&order=d&video=' + this.id;
      let xhr = new XMLHttpRequest();
      xhr.open('GET', uri, false);
      xhr.send(null);
      let xml = xhr.responseXML;
      let v, vs = xml.evaluate('//video', xml, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
      while (v = vs.iterateNext()) {
        let [cs, video] = [v.childNodes, {}];
        for each (let c in cs)
          if (c.nodeName != '#text')
            video[c.nodeName] = c.textContent;
        videos.push(new RelatedID(video.url.replace(/^.+?\/watch\//, ''), video.title));
      }
      return this.__rid_cache = videos;
    },

    get relatedTags() {
      let nodes = content.document.getElementsByClassName('nicopedia');
      return [new RelatedTag(it.textContent) for each (it in nodes) if (it.rel == 'tag')];
    },

    get repeating () this.player.ext_isRepeat(),
    set repeating (value) (this.player.ext_setRepeat(value), value),

    get large () this.player.ext_getVideoSize() === NicoPlayer.SIZE_LARGE,
    set large (value) {
        this.player.ext_setVideoSize(value ? NicoPlayer.SIZE_LARGE : NicoPlayer.SIZE_NORMAL)
        return this.large;
    },

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
    },

    get title () content.document.title.replace(/\s*\u2010\s*\u30CB\u30B3\u30CB\u30B3\u52D5\u753B(.+)$/, ''),

    get totalTime () parseInt(this.player.ext_getTotalTime()),

    get volume () parseInt(this.player.ext_getVolume()),
    set volume (value) (this.player.ext_setVolume(value), this.volume),

    fetch: function (filepath) {
      let onComplete = bindr(this, function (xhr) {
          let res = xhr.responseText;
          let info = {};
          res.split(/&/).forEach(function (it) let ([n, v] = it.split(/=/)) (info[n] = v));
          download(decodeURIComponent(info.url), filepath, this.fileExtension, this.title);
      });
      httpRequest('http://www.nicovideo.jp/api/getflv?v=' + this.id, onComplete);
    },

    makeURL: function (value, type) {
      switch (type) {
        case Player.REL_ID:
          return 'http://www.nicovideo.jp/watch/' + value;
        case Player.REL_TAG:
          return 'http://www.nicovideo.jp/tag/' + encodeURIComponent(value);
        case Player.REL_SEARCH:
          return 'http://www.nicovideo.jp/search/' + encodeURIComponent(value);
      }
      return value;
    },

    pause: function () this.player.ext_play(false),

    play: function () this.player.ext_play(true),

    playOrPause: function () {
      if (this.is(Player.ST_PLAYING)) {
        this.pause();
      } else {
        let base = this.currentTime;
        setTimeout(bindr(this, function () (base === this.currentTime ? this.playEx() : this.pause())), 100);
      }
    },

  };

  // }}}

  /*********************************************************************************
  * ContextMenu                                                                  {{{
  *********************************************************************************/

  const ContextMenuVolume = [];
  for (let i = 0; i <= 100; i += 10)
    ContextMenuVolume.push({name: 'setVolume', label: i + '%', attributes: {volume: i}});

  const ContextMenuTree = [
    'play',
    'pause',
    'comment',
    'repeat',
    'fullscreen',
    'fetch',
    {
      name: 'volume-root',
      label: 'Volume',
      id: ID_PREFIX + 'volume-menupopup',
      sub: ContextMenuVolume
    },
    {
      name: 'relations-root',
      label: 'Relations',
      id: ID_PREFIX + 'relations-menupopup',
      sub: []
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
  * Event                                                                        {{{
  *********************************************************************************/

  function WebProgressListener (listeners) {
    let self = this;
    for (let [name, listener] in Iterator(listeners))
      this[name] = listener;
    getBrowser().addProgressListener(this);
    // これは必要？
    window.addEventListener('unload', bindr(this.uninstall), false);
  }

  WebProgressListener.prototype = {
    onStatusChange: function (webProgress, request, stateFlags, staus) undefined,
    onProgressChange: function (webProgress, request, curSelfProgress,
                                maxSelfProgress, curTotalProgress, maxTotalProgress) undefined,
    onLocationChange: function (webProgress, request, location) undefined,
    onStateChange: function (webProgress, request, status, message) undefined,
    onSecurityChange: function (webProgress, request, state) undefined,
    uninstall: function () {
      getBrowser().removeProgressListener(this);
    },
  };

  // }}}

  /*********************************************************************************
  * Stella                                                                       {{{
  *********************************************************************************/

  function Stella () {
    this.initialize.apply(this, arguments);
  }

  Stella.MAIN_PANEL_ID  = ID_PREFIX + 'main-panel',
  Stella.MAIN_MENU_ID   = ID_PREFIX + 'main-menu',
  Stella.VOLUME_MENU_ID = ID_PREFIX + 'volume-menu',

  Stella.prototype = {
    // new 時に呼ばれる
    initialize: function () {
      let self = this;

      this.players = {
        niconico: new NicoPlayer(),
        youtube: new YouTubePlayer()
      };

      this.createStatusPanel();
      this.onLocationChange();

      this.__onResize = window.addEventListener('resize', bindr(this, this.onResize), false);
      this.progressListener = new WebProgressListener({onLocationChange: bindr(this, this.onLocationChange)});
    },

    // もちろん、勝手に呼ばれたりはしない。
    finalize: function () {
      this.removeStatusPanel();
      this.disable();
      this.progressListener.uninstall();
      for each (let player in this.players)
        player.finalize();
      window.removeEventListener('resize', this.__onResize, false);
    },

    get hidden () (this.panel.hidden),
    set hidden (v) (this.panel.hidden = v),

    get isValid () (this.where),

    get player () this.players[this.where],

    get statusBar () document.getElementById('status-bar'),

    get statusBarVisible () !this.statusBar.getAttribute('moz-collapsed', false),
    set statusBarVisible (value) (this.statusBar.setAttribute('moz-collapsed', !value), value),

    get where () {
      for (let [name, player] in Iterator(this.players))
        if (player.isValid)
          return name;
    },

    addUserCommands: function () {
      let self = this;

      function add (cmdName, funcS, funcB) {
        commands.addUserCommand(
          ['st' + cmdName],
          cmdName.replace(/[\[\]]+/g, '') + ' - Stella',
          (funcS instanceof Function)
            ? funcS
            : function (arg, bang) {
                if (!self.isValid)
                  raise('Stella: Current page is not supported');
                let p = self.player;
                let func = bang ? funcB : funcS;
                if (p.has(func, 'rwt'))
                  p.toggle(func);
                else if (p.has(func, 'rw'))
                  p[func] = arg[0];
                else if (p.has(func, 'x'))
                  p[func].apply(p, arg);
                self.update();
              },
          {argCount: '*', bang: !!funcB},
          true
        );
      }

      add('pl[ay]', 'playOrPause', 'play');
      add('pa[use]', 'pause');
      add('mu[te]', 'muted');
      add('re[peat]', 'repeating');
      add('co[mment]', 'comment');
      add('vo[lume]', 'volume', 'turnUpDownVolume');
      add('se[ek]', 'seek', 'seekRelative');
      add('fe[tch]', 'fetch');
      add('la[rge]', 'large');
      add('fu[llscreen]', 'fullscreen');

      commands.addUserCommand(
        ['strel[ations]'],
        'relations - Stella',
        function (args) {
          let arg = args.string;
          let url = self.player.has('makeURL', 'x') ? makeRelationURL(self.player, arg) : arg;
          liberator.open(url, args.bang ? liberator.NEW_TAB : liberator.CURRENT_TAB);
        },
        {
          argCount: '*',
          bang: true,
          completer: function (context, args) {
            if (!self.isValid)
              raise('Stella: Current page is not supported');
            if (!self.player.has('relations', 'r'))
              return;
            context.title = ['Tag/ID', 'Description'];
            context.completions = self.player.relations.map(function (rel) rel.completionItem);
          },
        },
        true
      );
    },

    createStatusPanel: function () {
      let self = this;

      function setEvents (name, elem) {
        ['click', 'popupshowing'].forEach(function (eventName) {
          let onEvent = self['on' + capitalize(name) + capitalize(eventName)];
          onEvent && elem.addEventListener(eventName, function (event) {
            if (eventName != 'click' || event.button == 0) {
              onEvent.apply(self, arguments);
              self.update();
            }
          }, false);
        });
      }

      function createLabel (store, name, l, r) {
          let label = store[name] = document.createElement('label');
          label.setAttribute('value', '-');
          label.style.marginLeft = (l || 0) + 'px';
          label.style.marginRight = (r || 0) + 'px';
          label.__defineGetter__('text', function () this.getAttribute('value'));
          label.__defineSetter__('text', function (v) this.setAttribute('value', v));
          setEvents(name, label);
      }

      let panel = this.panel = document.createElement('statusbarpanel');
      panel.setAttribute('id', Stella.MAIN_PANEL_ID);

      let hbox = document.createElement('hbox');
      hbox.setAttribute('align', 'center');

      let icon = this.icon = document.createElement('image');
      icon.setAttribute('class', 'statusbarpanel-iconic');
      icon.style.marginRight = '4px';
      setEvents('icon', icon);
      icon.addEventListener('dblclick', bindr(this, this.onIconDblClick), false);

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
        onAppend: function (elem, menu) setEvents(capitalize(menu.name), elem)
      });

      let stbar = document.getElementById('status-bar');
      stbar.insertBefore(panel, document.getElementById('liberator-statusline').nextSibling);

      let relmenu = document.getElementById('anekos-stela-relations-menupopup');
    },

    disable: function () {
      this.hidden = true;
      if (this.timerHandle) {
        clearInterval(this.timerHandle);
        this.timerHandle = null;
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

    removeStatusPanel: function () {
      let e = this.panel || document.getElementById(this.panelId);
      if (e && e.parentNode)
        e.parentNode.removeChild(e);
    },

    update: function () {
      this.labels.main.text = this.player.statusText;
      this.labels.volume.text = this.player.volume;
      for (let name in this.toggles) {
        this.toggles[name].text = (this.player[name] ? String.toUpperCase : id)(name[0]);
      }
    },

    onCommentClick: function () (this.player.toggle('comment')),

    onFetchClick: function () this.player.fetch(),

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

    onFullscreenClick: function () this.player.toggle('fullscreen'),

    onIconClick: function () this.player.playOrPause(),

    onIconDblClick: function () this.player.toggle('fullscreen'),

    onLocationChange: function () {
      if (this.__valid !== this.isValid) {
        (this.__valid = this.isValid) ? this.enable() : this.disable();
      }
    },

    onMainClick: function (event) {
      if (event.button)
        return;
      if (!(this.player && this.player.has('currentTime', 'rw', 'totalTime', 'r')))
        return;

      let rect = event.target.getBoundingClientRect();
      let x = event.screenX;
      let per = (x - rect.left) / (rect.right - rect.left);
      this.player.currentTime = this.player.totalTime * per;
    },

    onMutedClick: function (event) this.player.toggle('muted'),

    onPauseClick: function () this.player.pause(),

    onPlayClick: function () this.player.play(),

    onRepeatClick: function () this.player.toggle('repeating'),

    onRelationsRootPopupshowing: function () {
      /* build */
    },

    onResize: function () {
      if (this.__fullScreen !== window.fullScreen) {
        this.__fullScreen = window.fullScreen;
        this.onFullScreen(this.__fullScreen);
      }
    },

    onSetVolumeClick: function (event) (this.player.volume = event.target.getAttribute('volume'))
  };

  fixDoubleClick(Stella.prototype, 'onIconClick', 'onIconDblClick');

  // }}}

  /*********************************************************************************
  * Functions                                                                    {{{
  *********************************************************************************/

  function makeRelationURL (player, command) {
    if (!player.has('makeURL', 'x'))
      raise('Mysterious Error! makeURL has been not implmented.');
    if (command.match(/^[#\uff03]/))
      return player.makeURL(command.slice(1), Player.REL_ID);
    if (command.match(/^[:\uff1a]/))
      return player.makeURL(command.slice(1), Player.REL_TAG);
    if (command.indexOf('http://') == -1)
      return player.makeURL(encodeURIComponent(command), Player.REL_TAG);
    return command;
  }

  // }}}

  /*********************************************************************************
  * Install                                                                      {{{
  *********************************************************************************/

  if (InVimperator) {
    let estella = liberator.plugins.stella;

    let install = function () {
      let stella = liberator.plugins.stella = new Stella();
      stella.addUserCommands();
      liberator.log('Stella: installed.');
    };

    // すでにインストール済みの場合は、一度ファイナライズする
    // (デバッグ時に前のパネルが残ってしまうため)
    if (estella) {
      estella.finalize();
      install();
    } else {
      window.addEventListener(
        'DOMContentLoaded',
        function () {
          window.removeEventListener('DOMContentLoaded', arguments.callee, false);
          install();
        },
        false
      );
    }
  } else {
    /* do something */
  }

  // }}}

})();

// vim:sw=2 ts=2 et si fdm=marker:
