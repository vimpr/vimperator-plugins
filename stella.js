/* {{{
Copyright (c) 2008-2011, anekos.
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

}}} */

// PLUGIN_INFO {{{
let PLUGIN_INFO =
<VimperatorPlugin>
  <name>Stella</name>
  <name lang="ja">すてら</name>
  <description>For Niconico/YouTube/Vimeo, Add control commands and information display(on status line).</description>
  <description lang="ja">ニコニコ動画/YouTube/Vimeo 用。操作コマンドと情報表示(ステータスライン上に)追加します。</description>
  <version>0.32.9</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <minVersion>2.0</minVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/stella.js</updateURL>
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
          label.style.marginRight = (r || 0) + 'px';
          - :stseek 90   # 90秒
      :stse[ek]! <TIMECODE>:
        seek to the specified position from current position at relatively.
      :stfe[tch]:
        fetch and save the video.
      :stla[rge]:
        enlarge video screen.
      :stfu[llscreen]:
        turn on/off fullscreen.
      :stqu[ality]:
        Set video quality.

    == Local Mappings Sample ==
    >||
function addLocalMappings(buffer, maps) {
  maps.forEach(
    function (map) {
      let [cmd, action, extra] = map;
      let actionFunc = action;
      extra || (extra = {});

      if (typeof action == "string") {
        if (action.charAt(0) == ':')
          actionFunc = extra.open ? function () commandline.open("", action, modes.EX)
                                  : function () liberator.execute(action);
        else
          actionFunc = function () events.feedkeys(action, extra.noremap, true);
      }
      extra.matchingUrls = buffer;
      mappings.addUserMap(
        [modes.NORMAL],
        [cmd],
        "Local mapping for " + buffer,
        actionFunc,
        extra
      );
    }
  );
}

addLocalMappings(
  /^(http:\/\/(es|www).nicovideo.jp\/(watch|playlist\/mylist)|http:\/\/(jp|www)\.youtube\.com\/watch|http:\/\/(www\.)?vimeo\.com\/(channels\/(hd)?#)?\d+)/,
  [
    ['<C-g>', ':pageinfo S',      ],
    ['p',     ':stplay',          ],
    ['m',     ':stmute',          ],
    ['c',     ':stcomment',       ],
    ['zz',    ':stlarge',         ],
    ['r',     ':strepeat',        ],
    ['+',     ':stvolume! 10',    ],
    ['-',     ':stvolume! -10',   ],
    ['h',     ':stseek! -10',     ],
    ['l',     ':stseek! 10',      ],
    ['k',     ':stvolume! 10',    ],
    ['j',     ':stvolume! -10',   ],
    ['s',     ':stseek ',         {open: true}],
    ['S',     ':stseek! ',        {open: true}],
    ['v',     ':stvolume ',       {open: true}],
    ['V',     ':stvolume! ',      {open: true}],
    ['o',     ':strelations ',    {open: true}],
    ['O',     ':strelations! ',   {open: true}],
  ]
);
||<

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
      :stqu[ality]:
        動画の品質を設定
    == Controls ==
      マウスのホイール:
        パネル上でホイールの上下することにより音量を上下できます
      時間をクリック:
        再生時間をの表示をクリックすることでシークできます。
        左の方をクリックすれば最初の方に、右の方をクリックすれば最後の方に跳びます。
      アイコンをクリック:
        再生・ポーズ
      アイコンをダブルクリック:
        フルスクリーン切り替え
      パネルの cflmr をクリック:
        以下の機能をオンオフします。
        (大文字の時がオン)
          C:
            コメント
          F:
            フルスクリーン (Stella によるもの)
          L:
            大画面
          M:
            ミュート(消音)
          R:
            リピート
    == Local Mappings Sample ==
    >||
function addLocalMappings(buffer, maps) {
  maps.forEach(
    function (map) {
      let [cmd, action, extra] = map;
      let actionFunc = action;
      extra || (extra = {});

      if (typeof action == "string") {
        if (action.charAt(0) == ':')
          actionFunc = extra.open ? function () commandline.open("", action, modes.EX)
                                  : function () liberator.execute(action);
        else
          actionFunc = function () events.feedkeys(action, extra.noremap, true);
      }
      extra.matchingUrls = buffer;
      mappings.addUserMap(
        [modes.NORMAL],
        [cmd],
        "Local mapping for " + buffer,
        actionFunc,
        extra
      );
    }
  );
}

addLocalMappings(
  /^(http:\/\/(es|www).nicovideo.jp\/(watch|playlist\/mylist)|http:\/\/(jp|www)\.youtube\.com\/watch|http:\/\/(www\.)?vimeo\.com\/(channels\/(hd)?#)?\d+)/,
  [
    ['<C-g>', ':pageinfo S',      ],
    ['p',     ':stplay',          ],
    ['m',     ':stmute',          ],
    ['c',     ':stcomment',       ],
    ['zz',    ':stlarge',         ],
    ['r',     ':strepeat',        ],
    ['+',     ':stvolume! 10',    ],
    ['-',     ':stvolume! -10',   ],
    ['h',     ':stseek! -10',     ],
    ['l',     ':stseek! 10',      ],
    ['k',     ':stvolume! 10',    ],
    ['j',     ':stvolume! -10',   ],
    ['s',     ':stseek ',         {open: true}],
    ['S',     ':stseek! ',        {open: true}],
    ['v',     ':stvolume ',       {open: true}],
    ['V',     ':stvolume! ',      {open: true}],
    ['o',     ':strelations ',    {open: true}],
    ['O',     ':strelations! ',   {open: true}],
  ]
);
||<
    == Link ==
      http://d.hatena.ne.jp/nokturnalmortum/20081213/1229168832
  ]]></detail>
</VimperatorPlugin>;
// }}}

/* {{{
TODO
   ・Icons
   ・動的な command の追加削除 (nice rabbit!)
   ・ツールチップみたいな物で、マウスオー馬したときに動画情報を得られるようにしておく。
   ・外から呼ぶべきでない関数(プライベート)をわかりやすくしたい
   ・argCount の指定が適当なのを修正 (動的な userCommand と平行でうまくできそう？)
   ・実際のプレイヤーが表示されるまで待機できようにしたい(未表示に時にフルスクリーン化すると…)
   ・isValid とは別にプレイヤーの準備が出来ているか？などをチェックできる関数があるほうがいいかも
      -> isValid ってなまえはどうなの？
      -> isReady とか
   ・パネルなどの要素にクラス名をつける
   ・上書き保存
   ・Fx の pref と liberator.globalVariables の両方で設定をできるようにする (Setting)
   ・ext_setInputMessage(String, String)

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
}}} */

(function () {

  /*********************************************************************************
  * Const                                                                        {{{
  *********************************************************************************/

  const ID_PREFIX = 'anekos-stella-';
  const InVimperator = !!(liberator && modules && modules.liberator);
  const DOUBLE_CLICK_INTERVAL = 300;

  // }}}

  /*********************************************************************************
  * Utils                                                                        {{{
  *********************************************************************************/

  const U = {
    bindr: function (_this, f)
      function () f.apply(_this, arguments),

    capitalize: function (s)
      s.replace(/^[a-z]/, String.toUpperCase).replace(/-[a-z]/, function (s) s.slice(1).toUpperCase()),

    get currentURL() content.document.location.href,

    download: function (url, filepath, ext, title, postData) {
      function makePostStream (postData) {
        let sis = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);
        sis.setData(postData, postData.length);
        let mis = Cc["@mozilla.org/network/mime-input-stream;1"].createInstance(Ci.nsIMIMEInputStream);
        mis.addHeader("Accept-Charset", "utf-8");
        mis.addHeader("Content-Type", "application/x-www-form-urlencoded");
        mis.addContentLength = true;
        mis.setData(sis);
        return mis;
      }

      let dm = Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager);
      let wbp = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
      let file;

      if (filepath) {
        file = io.File(io.expandPath(filepath));
      } else {
        file = dm.userDownloadsDirectory;
      }

      if (file.exists() && file.isDirectory() && title)
          file.appendRelativePath(U.fixFilename(title) + ext);

      if (file.exists())
        return U.echoError('The file already exists! -> ' + file.path);

      file = makeFileURI(file);

      let dl = dm.addDownload(0, U.makeURL(url, null, null), file, title, null, null, null, null, wbp);
      wbp.progressListener = dl;
      wbp.persistFlags |= wbp.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
      wbp.saveURI(U.makeURL(url), null, null, postData && makePostStream(postData), null, file);

      return file;
    },

    // FIXME
    echo: function (msg)
      (void liberator.echo(msg)),

    // FIXME
    echoError: function (msg)
      (void liberator.echoerr(msg)),

    fixDoubleClick: function (obj, click, dblClick) {
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
    },

    fixFilename: function (filename) {
      const badChars = /[\\\/:;*?"<>|]/g;
      return filename.replace(badChars, '_');
    },

    fromTemplate: function (template, args) {
      let index = 0;
      function get (name)
        (args instanceof Array ? args[index++] : args[name]);
      return template.replace(/--([^-]+)--/g, function (_, n) get(n) || '');
    },

    // 上手い具合に秒数に直すよ
    fromTimeCode: function (code, max) {
      var m;
      if (max && (m = /^(-?\d+(?:\.\d)?)%/.exec(code)))
        return Math.round(max * (parseFloat(m[1]) / 100));
      if (m = /^(([-+]?)\d+):(\d+)$/.exec(code))
        return parseInt(m[1], 10) * 60 + (m[2] == '-' ? -1 : 1) * parseInt(m[3], 10);
      if (m = /^([-+]?\d+\.\d+)$/.exec(code))
        return Math.round(parseFloat(m[1]) * 60);
      return parseInt(code, 10);
    },

    getElementById: function (id)
      content.document.getElementById(id),

    getElementByIdEx: function (id)
      let (p = content.document.getElementById(id))
        (p && (p.wrappedJSObject || p)),

    httpRequest: function (uri, data, onComplete) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200)
            onComplete && onComplete(xhr);
          else
            U.raise(xhr.statusText);
        }
      };
      xhr.open(data ? 'POST' : 'GET', uri, !!onComplete);
      xhr.send(data || null); // XXX undefined を渡すのはまずいのかな
      return xhr;
    },

    id: function (value)
      value,

    isNum: function (v)
      (typeof v === 'number' && !isNaN(v)),

    lz: function (s, n)
      String(Math.pow(10, n) + s).substring(1),

    log: function (msg)
      Application.console.log(msg),

    makeFile: function (s) {
      var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      file.initWithPath(s);
      return file;
    },

    makeURL: function (s) {
      let url = Cc["@mozilla.org/network/standard-url;1"].createInstance(Ci.nsIURL);
      url.spec = s;
      return url;
    },

    parseParameter: function (str) {
      let result = {};
      str.split(/&/).forEach(function (it)
                               let ([_, n, v] = it.match(/^([^=]*)=(.*)$/))
                                 (result[n] = unescape(v)));
      return result;
    },

    raise: (InVimperator ? function (error) liberator.echoerr(error)
                         : function (error) {throw new Error(error)}),

    raiseNotSupportedPage:
      function () this.raise('Stella: Current page is not supported'),

    raiseNotSupportedFunction:
      function () this.raise('Stella: The function is not supported in this page.'),

    restoreStyle: function (target, doDelete) {
      let style = target.style;
      if (!style.__stella_backup)
        return;
      let backup = style.__stella_backup;
      for (let name in Iterator(backup))
        style[name] = backup[name];
      if (doDelete)
        delete style.__stella_backup;
    },

    s2b: function (s, d) (!/^(\d+|false)$/i.test(s)|parseInt(s)|!!d*2)&1<<!s,

    storeStyle: function (target, values, overwrite) {
      let [style, cstyle] = [target.style, content.getComputedStyle(target, '')];
      let backup = {};
      for (let [name, value] in Iterator(values)) {
        backup[name] = cstyle[name];
        style[name] = value;
      }
      if (overwrite || !style.__stella_backup)
        style.__stella_backup = backup;
    },

    toTimeCode: function (v)
      (U.isNum(v) ? (parseInt((v / 60)) + ':' + U.lz(v % 60, 2))
                : '??:??'),

    toXML: function (html) {
      function createHTMLDocument (source) {
        let wcnt = window.content;
        let doc = wcnt.document.implementation.createDocument(
          'http://www.w3.org/1999/xhtml',
          'html',
          wcnt.document.implementation.createDocumentType(
            'html',
            '-//W3C//DTD HTML 4.01//EN',
            'http://www.w3.org/TR/html4/strict.dtd'
          )
        );
        let range = wcnt.document.createRange();
        range.selectNodeContents(wcnt.document.documentElement);
        let content = doc.adoptNode(range.createContextualFragment(source));
        doc.documentElement.appendChild(content);
        return doc;
      }

      function replaceHTML (s)
        s.replace(/<br>/g, '<br />').replace(/&nbsp;/g, '<span style="margin-left: 0.5em"></span>');

      return replaceHTML(createHTMLDocument(html).documentElement.innerHTML);
    },

    xpathGet: function (xpath, doc, root) {
      if (!doc)
        doc = content.document;
      if (!root)
        root = doc;
      return doc.evaluate(xpath, doc, null, 9, null, 7, null).singleNodeValue;
    },

    xpathGets: function (xpath, doc, root) {
      if (!doc)
        doc = content.document;
      if (!root)
        root = doc;
      let result = [];
      let r = doc.evaluate(xpath, root, null, 7, null);
      for (let i = 0, l = r.snapshotLength; i < l; i++) {
        result.push(r.snapshotItem(i));
      }
      return result;
    }
  };


  // }}}

  /*********************************************************************************
  * Setting                                                                      {{{
  *********************************************************************************/

  function Setting (isVimp) {
    function ul (s)
      s.replace(/[a-z][A-Z]/g, function (s) (s[0] + '_' + s[1].toLowerCase()));

    function readFrom (obj, reader) {
      function _readFrom (obj, parents) {
        for (let [name, value] in Iterator(obj)) {
          let _parents = parents.concat([name]);
          if (typeof value === 'object') {
            _readFrom(value, _parents);
          } else {
            let newValue = reader(ul(_parents.join('_')));
            if (typeof newValue !== 'undefined')
              obj[name] = newValue;
          }
        }
      }
      return _readFrom([]);
    }

    function vimpReader (name)
      liberator.globalVariables['stella_' + name];

    function firefoxReader (name)
      undefined;

    let setting = {
      common: {
        autoFullscreenDelay: 500
      },
      nico: {
        useComment: false
      }
    };

    readFrom(setting, isVimp ? vimpReader : firefoxReader);

    return setting;
  }

  // }}}

  /*********************************************************************************
  * Player                                                                       {{{
  *********************************************************************************/

  function Player (stella) {
    let self = this;

    this.initialize.apply(this, arguments);

    this.stella = stella;

    this.last = {
      screenMode: null
    };

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
    if (!this.functions.large)
      this.functions.large = this.functions.fullscreen;
  }

  Player.ST_ENDED   = 'ended';
  Player.ST_OTHER   = 'other';
  Player.ST_PAUSED  = 'paused';
  Player.ST_PLAYING = 'playing';

  Player.URL_ID     = 'id';
  Player.URL_SEARCH = 'search';
  Player.URL_TAG    = 'tag';
  Player.URL_URL    = 'url';

  // rwxt で機能の有無を表す
  // r = read
  // w = write
  // x = function
  // t = toggle
  Player.prototype = {
    functions: {
      comment: '',
      currentTime: '',
      fileExtension: 'r',
      fileURL: '',
      fullscreen: '',
      large: '',
      makeURL: '',
      muted: '',
      pageinfo: '',
      pause: '',
      play: '',
      playEx: '',
      relations: '',
      repeating: '',
      say: '',
      tags: '',
      title: '',
      totalTime: '',
      volume: '',
      quality: '',
      qualities: ''
      // auto setting => fetch maxVolume playOrPause relations seek seekRelative turnUpDownVolume
    },

    icon: null,

    xpath: {},

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

    get large () this.fullscreen,
    set large (value) (this.fullscreen = value),

    get maxVolume () 100,

    get muted () undefined,
    set muted (value) value,

    get ready () undefined,

    get relations () undefined,

    get repeating () undefined,
    set repeating (value) value,

    get state () undefined,

    get statusText () this.timeCodes,

    get storage ()
      (content.document.__stella_player_storage || (content.document.__stella_player_storage = {})),

    get timeCodes () (U.toTimeCode(this.currentTime) + '/' + U.toTimeCode(this.totalTime)),

    get title () undefined,

    get isValid () /^http:\/\/(tw|es|de|www)\.nicovideo\.jp\/(watch|playlist\/mylist)\//.test(U.currentURL),

    get volume () undefined,
    set volume (value) value,

    fetch: function (filepath)
      U.download(this.fileURL, filepath, this.fileExtension, this.title),

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
      v = U.fromTimeCode(v, this.totalTime);
      if (v < 0)
        v = this.totalTime + v;
      return this.currentTime = Math.min(Math.max(v, 0), this.totalTime);
    },

    seekRelative: function (v)
      this.currentTime = Math.min(Math.max(this.currentTime + U.fromTimeCode(v, this.totalTime), 0), this.totalTime),

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
    get command () this._command,
    get description () this._description,
    get thumbnail () this._thumbnail,
    get completionText () this.command,
    get completionItem () ({
      text: this.completionText,
      description: this.description,
      thumbnail: this.thumbnail
    })
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



  function RelatedID (id, title, img) {
    this.id = id;
    this.title = title;
    this._thumbnail = img;
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

  YouTubePlayer.getIDfromURL = function (url) let ([_, r] = url.match(/[?;&]v=([-\w]+)/)) r;
  YouTubePlayer.isVideoURL = function (url) /^https?:\/\/(www\.)?youtube\.com\/watch\?.+/.test(url);

  YouTubePlayer.prototype = {
    __proto__: Player.prototype,

    functions: {
      currentTime: 'rw',
      fetch: 'x',
      fileURL: 'r',
      makeURL: 'x',
      muted: 'rwt',
      pageinfo: 'r',
      pause: 'x',
      play: 'x',
      playEx: 'x',
      playOrPause: 'x',
      relations: 'r',
      title: 'r',
      totalTime: 'r',
      volume: 'rw',
      quality: 'rw',
      qualities: 'r'
    },

    icon: 'http://www.youtube.com/favicon.ico',

    xpath: {
      comment: '//span[@class="description"]',
      tags: '//div[@id="watch-video-tags"]'
    },

    get currentTime () parseInt(this.player.getCurrentTime()),
    set currentTime (value) (this.player.seekTo(U.fromTimeCode(value)), this.currentTime),

    get fileExtension () '.mp4',

    get fileURL ()
      let (as = content.document.defaultView.wrappedJSObject.swfArgs)
        ('http://www.youtube.com/get_video?fmt=22&video_id=' + as.video_id + '&t=' + as.t),

    get id ()
      YouTubePlayer.getIDfromURL(U.currentURL),

    get muted () this.player.isMuted(),
    set muted (value) ((value ? this.player.mute() : this.player.unMute()), value),

    get pageinfo () {
      let doc = content.document;
      let desc = doc.querySelector('#eow-description');
      return [
        [
          'comment',
          desc ? desc.textContent.trim() : ''
        ],
        [
          'tags',
          XMLList([
            <span>[<a href={v.href}>{v.textContent}</a>]</span>
            for ([, v] in Iterator(doc.querySelectorAll('#eow-tags > li > a')))
          ].join(''))
        ],
        [
          'quality',
          this.quality
        ]
      ];
    },

    get player ()
      U.getElementByIdEx('movie_player'),

    get quality () this.player.getPlaybackQuality(),
    set quality (value) this.player.setPlaybackQuality(value),

    get qualities () this.player.getAvailableQualityLevels(),

    get ready () !!this.player,

    get relations () {
      let result = [];
      let doc = content.document;
      for each (let item in Array.slice(doc.querySelectorAll('#watch-tags > div > a'))) {
        result.push(new RelatedTag(item.textContent));
      }
      for each (let item in Array.slice(doc.querySelectorAll('.video-list-item'))) {
        let url = item.querySelector('a').href;
        if (!YouTubePlayer.isVideoURL(url))
          continue;
        let id = YouTubePlayer.getIDfromURL(url);
        result.push(
          new RelatedID(
            id,
            item.querySelector('span.title').textContent,
            'http://img.youtube.com/vi/' + id + '/1.jpg'
          )
        );
      }
      return result;
    },

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

    get isValid () U.currentURL.match(/^http:\/\/(?:[^.]+\.)?youtube\.com\/watch/),

    get volume () parseInt(this.player.getVolume()),
    set volume (value) (this.player.setVolume(value), this.volume),

    fetch: function (filepath) {
      // all(1080p,720p,480p,360p) -> 37, 22, 35, 34, 5
      // FIXME 一番初めが最高画質だと期待
      let cargs = content.wrappedJSObject.yt.config_.PLAYER_CONFIG.args;
      cargs.url_encoded_fmt_stream_map.split(',')[0].split('&').forEach(function(x) {
        let [key, val] = x.split('=');
        if (key == 'url') {
          U.download(decodeURIComponent(val), filepath, '.flv', this.title);
        }
      }, this);
    },

    makeURL: function (value, type) {
      switch (type) {
        case Player.URL_ID:
          return 'http://www.youtube.com/watch?v=' + value;
        case Player.URL_TAG:
          return 'http://www.youtube.com/results?search=tag&search_query=' + encodeURIComponent(value);
        case Player.URL_SEARCH:
          return 'http://www.youtube.com/results?search_query=' + encodeURIComponent(value);
      }
      return value;
    },

    play: function () this.player.playVideo(),

    pause: function () this.player.pauseVideo()
  };

  // }}}

  /*********************************************************************************
  * YouTubeUserChannelPlayer                                                                {{{
  *********************************************************************************/

  function YouTubeUserChannelPlayer () {
    Player.apply(this, arguments);
  }

  YouTubeUserChannelPlayer.getIDfromURL = function (url) let ([_, r] = url.match(/\/([^\/]+)($|[\?]+)/)) r;
  YouTubeUserChannelPlayer.isVideoURL = function (url) /^https?:\/\/(www\.)?youtube\.com\/watch\?.+/.test(url);

  YouTubeUserChannelPlayer.prototype = {
    __proto__: YouTubePlayer.prototype,

    get id ()
      YouTubeUserChannelPlayer.getIDfromURL(U.currentURL),

    get isValid () U.currentURL.match(/^http:\/\/(?:[^.]+\.)?youtube\.com\/user\//),

    fetch: function (filepath) {
      // TODO 動画変数が手に入らない？
      throw "not implmented!!";
    },

    get pageinfo () {
      let doc = content.document;
      let wd = doc.querySelector('#playnav-curvideo-description');
      return [
        [
          'comment',
          wd.textContent
        ]
      ];
    },

    get relations () {
      let result = [];
      let doc = content.document;
      for each (let item in Array.slice(doc.querySelectorAll('div.playnav-item.playnav-video'))) {
        let link = item.querySelector('a.playnav-item-title.ellipsis');
        let url = link.href;
        if (!YouTubePlayer.isVideoURL(url))
          continue;
        result.push(
          new RelatedID(
            YouTubePlayer.getIDfromURL(url),
            link.querySelector('span').textContent,
            item.querySelector('img').src
          )
        );
      }
      return result;
    },

  };

  // }}}

  /*********************************************************************************
  * NicoPlayer                                                                   {{{
  *********************************************************************************/

  function NicoPlayer () {
    Player.apply(this, arguments);
  }

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
      pageinfo: 'r',
      pause: 'x',
      play: 'x',
      playEx: 'x',
      playOrPause: 'x',
      relations: 'r',
      repeating: 'rwt',
      say: 'x',
      tags: 'r',
      title: 'r',
      totalTime: 'r',
      volume: 'rw',
      quality: '',
      qualities: ''
    },

    icon: 'http://www.nicovideo.jp/favicon.ico',

    xpath: {
      comment: 'id("itab_description")'
    },

    initialize: function () {
      this.__info_cache = {};
    },

    get baseURL () 'http://www.nicovideo.jp/',

    get cachedInfo () {
      let url = U.currentURL;
      if (this.__info_cache.url != url)
        this.__info_cache = {url: url};
      return this.__info_cache;
    },

    get comment () this.player.ext_isCommentVisible(),
    set comment (value) (this.player.ext_setCommentVisible(value), value),

    get currentTime () {
      try {
      return parseInt(this.player.ext_getPlayheadTime())
      } catch (e) {
        U.log(e)
        U.log(e.stack)
      }
    },
    set currentTime (value) (this.player.ext_setPlayheadTime(U.fromTimeCode(value)), this.currentTime),

    get fileExtension () '.flv',

    get fullscreen () this.large,
    set fullscreen (value) (this.large = value),

    get id ()
      let (m = U.currentURL.match(/\/(?:watch|playlist\/mylist)\/([a-z\d]+)/))
        (m && m[1]),

    get muted () this.player.ext_isMute(),
    set muted (value) (this.player.ext_setMute(value), value),

    get pageinfo () {
      let v = content.wrappedJSObject.Video;
      return [
        ['thumbnail', <img src={v.thumbnail} />],
        ['comment', U.toXML(v.description)],
        [
          'tag',
          [
            <span>[<a href={this.makeURL(t, Player.URL_TAG)}>{t}</a>]</span>
            for each (t in Array.slice(v.tags))
          ].join('')
        ]
      ];
    },

    get player () content.document.getElementById('flvplayer').wrappedJSObject.__proto__,

    get playerContainer () U.getElementByIdEx('flvplayer_container'),

    get ready () {
      try {
        if (!this.player)
          return false;
        return this.player.ext_getLoadedRatio() > 0.0
      } catch (e) {
        return false;
      }
    },

    get relations () {
      let self = this;

      function IDsFromAPI () {
        if (self.__rid_last_url == U.currentURL)
          return self.__rid_cache || [];

        let failed = false, videos = [];

        try {
          let uri = 'http://www.nicovideo.jp/api/getrelation?sort=p&order=d&video=' + self.id;
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
            videos.push(
              new RelatedID(
                video.url.replace(/^.+?\/watch\//, ''),
                video.title,
                video.thumbnail
              )
            );
          }

          self.__rid_last_url = U.currentURL;
          self.__rid_cache = videos;
        } catch (e) {
          U.log('stella: ' + e)
        }

        return videos;
      }

      function IDsFromComment () {
        let videos = [];
        // コメント欄のリンクの前のテキストをタイトルと見なす
        // textContent を使うと改行が理解できなくなるので、innerHTML で頑張ったけれど頑張りたくない
        try {
          let xpath = self.xpath.comment;
          let comment = U.xpathGet(xpath).innerHTML;
          let links = U.xpathGets(xpath + '//a')
                       .filter(function (it) /(watch|playlist\/mylist)\//.test(it.href))
                       .map(function(v) v.textContent);
          links.forEach(function (link) {
            let re = RegExp('(?:^|[\u3000\\s\\>])([^\u3000\\s\\>]+)\\s*<a href="http:\\/\\/www\\.nicovideo\\.\\w+\\/(?:watch|playlist\\/mylist)\\/' + link + '" class="(watch|video)">');
            let r = re.exec(comment);
            if (r)
              videos.push(new RelatedID(link, r[1].slice(-20)));
          });
        } catch (e) {
          U.log('stella: ' + e)
        }
        return videos;
      }

      function tagsFromPage () {
        let nodes = content.document.getElementsByClassName('nicopedia');
        return [new RelatedTag(it.textContent) for each (it in nodes) if (it.rel == 'tag')];
      }

      return [].concat(IDsFromComment(), IDsFromAPI(), tagsFromPage());
    },

    get repeating () this.player.ext_isRepeat(),
    set repeating (value) (this.player.ext_setRepeat(value), value),

    get large () this.player.ext_getVideoSize() === NicoPlayer.SIZE_LARGE,
    set large (value) {
        if (value && !this.large) {
          let win = Buffer.findScrollableWindow();
          this.storage.scrollPositionBeforeLarge = {x: win.scrollX, y: win.scrollY};
        }

        this.player.ext_setVideoSize(value ? NicoPlayer.SIZE_LARGE : NicoPlayer.SIZE_NORMAL);

        let pos = this.storage.scrollPositionBeforeLarge;
        if (!value && typeof pos != "undefined")
            setTimeout(function () buffer.scrollTo(pos.x, pos.y), 0);

        this.last.screenMode = this.large ? 'large' : null;

        return this.large;
    },

    get state () {
      switch (this.player.ext_getStatus()) {
        case 'end':
          return Player.ST_ENDED;
        case 'playing':
          return this.storage.bug_paused ? Player.ST_PAUSED : Player.ST_PLAYING;
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
      let self = this;

      let watchURL = U.currentURL;
      let [,id] = watchURL.match(/watch\/(.+)$/);
      let apiURL = 'http://www.nicovideo.jp/api/getflv?v=' + id;

      U.httpRequest(
        watchURL,
        null,
        function () {
          U.httpRequest(
            'http://www.nicovideo.jp/api/getflv?v=' + self.id,
            null,
            function (xhr) {
              let res = xhr.responseText;
              let info = {};
              res.split(/&/).forEach(function (it) let ([n, v] = it.split(/=/)) (info[n] = v));
              U.download(decodeURIComponent(info.url), filepath, self.fileExtension, self.title);
              let postData = '<thread thread="' + info.thread_id + '"' + ' version="20061206" res_from="-1000" />';
              // FIXME
              let msgFilepath = filepath.replace(/\.[^\.]+$/, '.xml');
              U.download(decodeURIComponent(info.ms), msgFilepath, '.xml', self.title, postData);
            }
          );
        }
      );
    },

    makeURL: function (value, type) {
      switch (type) {
        case Player.URL_ID:
          return 'http://www.nicovideo.jp/watch/' + value;
        case Player.URL_TAG:
          return 'http://www.nicovideo.jp/tag/' + encodeURIComponent(value);
        case Player.URL_SEARCH:
          return 'http://www.nicovideo.jp/search/' + encodeURIComponent(value);
      }
      return value;
    },

    pause: function () {
      this.storage.bug_paused = true;
      this.player.ext_play(false);
    },

    play: function () {
      this.storage.bug_paused = false;
      this.player.ext_play(true)
    },

    playOrPause: function () {
      if (this.is(Player.ST_PLAYING)) {
        this.pause();
      } else {
        let base = this.currentTime;
        setTimeout(U.bindr(this, function () (base === this.currentTime ? this.playEx() : this.pause())), 100);
      }
    },

    say: function (message) {
      U.log('stsay');
      this.sendComment(message);
    },

    // みかんせいじん
    // test -> http://www.nicovideo.jp/watch/sm2586636
    // 自分のコメントが見れないので、うれしくないかも。
    sendComment: function (message, command, vpos) {
      let self = this;

      // コメント連打を防止
      {
        let now = new Date();
        let last = this.__last_comment_time;
        if (last && (now.getTime() - last.getTime()) < 5000)
          return U.raise('Shurrup!!');
        this.__last_comment_time = now;
      }

      function getThumbInfo () {
        U.log('getThumbInfo');
        if (self.cachedInfo.block_no !== undefined)
          return;
        let xhr = U.httpRequest(self.baseURL + 'api/getthumbinfo/' + self.id);
        let xml = xhr.responseXML;
        let cn = xml.getElementsByTagName('comment_num')[0];
        self.cachedInfo.block_no = cn.textContent.replace(/..$/, '');
      }

      function getFLV () {
        U.log('getFLV');
        if (self.cachedInfo.flvInfo !== undefined)
          return;
        let xhr = U.httpRequest(self.baseURL + 'api/getflv?v=' + self.id);
        let res = xhr.responseText;
        self.cachedInfo.flvInfo = U.parseParameter(res);
      }

      function getPostkey () {
        U.log('getPostkey');
        let info = self.cachedInfo;
        if (info.postkey !== undefined)
          return;
        let url = U.fromTemplate(
                    '--base--api/getpostkey?thread=--thread_id--&block_no=--block_no--',
                    {
                      base: self.baseURL,
                      thread_id: info.flvInfo.thread_id,
                      block_no: info.block_no
                    }
                  );
        U.log(url);
        let xhr = U.httpRequest(url);
        let res = xhr.responseText;
        info.postkey = res.replace(/^.*=/, '');
      }

      function getComments () {
        U.log('getComments');
        let info = self.cachedInfo;
        if (info.ticket !== undefined)
          return;
        let tmpl = '<thread res_from="-1" version="20061206" thread="--thread_id--"/>';
        let xhr = U.httpRequest(info.flvInfo.ms, U.fromTemplate(tmpl, info.flvInfo));
        let xml = xhr.responseXML;
        let r = xml.evaluate('//packet/thread', xml, null, 9, null, 7, null).singleNodeValue;
        info.ticket = r.getAttribute('ticket');
      }

      function sendChat () {
        U.log('sendChat');
        let info = self.cachedInfo;
        let tmpl = '<chat premium="--is_premium--" postkey="--postkey--" user_id="--user_id--" ticket="--ticket--" mail="--mail--" vpos="--vpos--" thread="--thread_id--">--body--</chat>';
        let args = {
          __proto__: info.flvInfo,
          ticket: info.ticket,
          postkey: info.postkey,
          vpos: vpos * 100,
          mail: command,
          body: message
        };
        U.log(args);
        let data = U.fromTemplate(tmpl, args);
        let xhr = U.httpRequest(info.flvInfo.ms, data);
        U.log(xhr.responseText);
      }

      function sendDummyComment (message, command, position) {
        self.player.ext_sendLocalMessage(message, command, vpos);
      }

      // 0 秒コメントはうざいらしいので勝手に自重する
      vpos = Math.max(1, parseInt(vpos || self.currentTime, 10));

      U.log('sendcommnet');
      getThumbInfo();
      getFLV();
      getPostkey();
      getComments();
      sendChat();
      sendDummyComment(message, command, vpos);
    }
  };

  // }}}

  /*********************************************************************************
  * VimeoPlayer                                                                  {{{
  *********************************************************************************/

  function VimeoPlayer () {
    Player.apply(this, arguments);
  }

  VimeoPlayer.getIDfromURL = function (url) let ([_, r] = url.match(/[?;&]v=([-\w]+)/)) r;

  VimeoPlayer.prototype = {
    __proto__: Player.prototype,

    functions: {
      currentTime: 'w',
      fetch: 'x',
      makeURL: 'x',
      muted: 'w',
      pause: 'x',
      play: 'x',
      playEx: 'x',
      playOrPause: 'x',
      title: 'r'
    },

    __initializePlayer: function (player) {
      if (!player || player.__stella_initialized)
        return player;

      player.__stella_mute = false;
      player.__stella_volume = 100;
      player.__stella_initialized = true;

      return player;
    },

    icon: 'http://www.vimeo.com/favicon.ico',

    set currentTime (value) (this.player.api_seekTo(U.fromTimeCode(value)), value),

    get muted () this.__mute,
    set muted (value) (this.volume = value ? 0 : 100),

    get player ()
      this.__initializePlayer(content.document.querySelector('.vimeo_holder * object').wrappedJSObject),

    get ready () !!this.player,

    get state () {
      if (this.player.api_isPlaying())
        return Player.ST_PLAYING
      if (this.player.api_isPaused())
        return Player.ST_PAUSED;
      return Player.ST_OTHER;
    },

    get title ()
      U.xpathGet('//div[@class="title"]').textContent,

    get isValid () U.currentURL.match(/^http:\/\/(www\.)?vimeo\.com\/(channels\/(hd)?#)?\d+$/),

    // XXX setVolume は実際には存在しない？
    get volume () parseInt(this.player.__stella_volume),
    set volume (value) (this.api_setVolume(value), this.player.__stella_volume = value),

    fetch: function(filepath) {
      let self = this;
      let id = U.currentURL.match(/vimeo\.com\/(\d+)/)[1];
      U.httpRequest(
        'http://www.vimeo.com/moogaloop/load/clip:' + id,
        null,
        function(xhr) {
          let doc = xhr.responseXML;
          let signature = U.xpathGet('/xml/request_signature', doc).textContent;
          let timestamp = U.xpathGet('/xml/timestamp', doc).textContent;
          let isHD = parseInt(U.xpathGet('/xml/video/isHD', doc).textContent);
          let url = 'http://www.vimeo.com/moogaloop/play/clip:' + id
            + '/' + signature + '/' + timestamp
            + '/?q=' + (isHD ? 'hd' : 'sd');
          U.download(url, filepath, isHD ? '.mp4' : '.flv', self.title);
        }
      );
    },

    makeURL: function (value, type) {
      switch (type) {
        case Player.URL_ID:
          return 'http://www.vimeo.com/' + value;
        case Player.URL_SEARCH:
          return 'http://www.vimeo.com/videos/search:' + encodeURIComponent(value);
      }
      return value;
    },

    play: function () this.player.api_play(),

    pause: function () this.player.api_pause()
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
    'repeating',
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
    },
    'cancel',
  ];

  function buildContextMenu (setting) {
    function append (parent, menu) {
      if (typeof menu == 'string')
        menu = {name: menu};
      if (menu instanceof Array)
        return menu.forEach(function (it) append(parent, it));
      if (!menu.label)
        menu.label = U.capitalize(menu.name);
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
    window.addEventListener('unload', U.bindr(this.uninstall), false);
  }

  WebProgressListener.prototype = {
    onStatusChange: function (webProgress, request, stateFlags, staus) undefined,
    onProgressChange: function (webProgress, request, curSelfProgress,
                                maxSelfProgress, curTotalProgress, maxTotalProgress) undefined,
    onLocationChange: function (webProgress, request, location) undefined,
    onStateChange: function (webProgress, request, status, message) undefined,
    onSecurityChange: function (webProgress, request, state) undefined,
    uninstall: function () getBrowser().removeProgressListener(this)
  };

  // }}}

  /*********************************************************************************
  * Stella                                                                       {{{
  *********************************************************************************/

  function Stella (setting) {
    this.initialize.apply(this, arguments);
    this.setting = setting;
  }

  Stella.MAIN_PANEL_ID  = ID_PREFIX + 'main-panel',
  Stella.MAIN_MENU_ID   = ID_PREFIX + 'main-menu',
  Stella.VOLUME_MENU_ID = ID_PREFIX + 'volume-menu',

  Stella.prototype = {
    // new 時に呼ばれる
    initialize: function () {
      let self = this;

      this.players = {
        niconico: new NicoPlayer(this.stella),
        youtube: new YouTubePlayer(this.stella),
        youtubeuc: new YouTubeUserChannelPlayer(this.stella),
        vimeo: new VimeoPlayer(this.stella)
      };

      // this.noGUI = true;
      this.createGUI();
      this.__onResize = window.addEventListener('resize', U.bindr(this, this.onResize), false);
      this.progressListener = new WebProgressListener({onLocationChange: U.bindr(this, this.onLocationChange)});
    },

    createGUI: function () {
      if (this.noGUI)
        return;
      this.createStatusPanel();
      this.onLocationChange();
      this.hidden = true;
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

    get player () (this.where && this.players[this.where]),

    get statusBar () document.getElementById('status-bar'),

    get statusBarVisible () !this.statusBar.getAttribute('moz-collapsed', false),
    set statusBarVisible (value) (this.statusBar.setAttribute('moz-collapsed', !value), value),

    get storage ()
      (content.document.__stella_storage || (content.document.__stella_storage = {})),

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
            : function (arg) {
                if (!self.isValid)
                  U.raiseNotSupportedPage();
                let p = self.player;
                let func = arg.bang ? funcB : funcS;
                if (p.has(func, 'rwt'))
                  p.toggle(func);
                else if (p.has(func, 'rw'))
                  p[func] = arg[0];
                else if (p.has(func, 'x'))
                  p[func].apply(p, arg);
                else
                  U.raiseNotSupportedFunction();
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
      if (U.s2b(liberator.globalVariables.stella_nico_use_comment, false))
        add('sa[y]', 'say');

      commands.addUserCommand(
        ['stfe[tch]'],
        'Download movie file - Stella',
        function (args) {
          if (!self.isValid)
            return U.raiseNotSupportedPage();
          if (!self.player.has('fetch', 'x'))
            return U.raiseNotSupportedFunction();

          self.player.fetch(args.literalArg);
        },
        {
          literal: 0,
          completer: function (context) completion.file(context)
        },
        true
      );

      commands.addUserCommand(
        ['stqu[ality]'],
        'Quality - Stella',
        function (args) {
          if (!self.isValid)
            return U.raiseNotSupportedPage();
          if (!self.player.has('quality', 'w'))
            return U.raiseNotSupportedFunction();

          self.player.quality = args.literalArg;
        },
        {
          literal: 0,
          completer: function (context) {
            if (!self.player.has('qualities', 'r'))
              return;
            context.title = ['Quality', 'Description'];
            context.completions = [[q, q] for each ([, q] in self.player.qualities)];
          }
        },
        true
      );

      let (lastCompletions = []) {
        commands.addUserCommand(
          ['strel[ations]'],
          'relations - Stella',
          function (args) {
            if (!self.isValid)
              return U.raiseNotSupportedPage();

            let arg = args.literalArg;
            let index = /^\d+:/.test(arg) && parseInt(arg, 10);
            if (index > 0)
              arg = lastCompletions[index - 1].command;
            let url = self.player.has('makeURL', 'x') ? makeRelationURL(self.player, arg) : arg;
            liberator.open(url, args.bang ? liberator.NEW_TAB : liberator.CURRENT_TAB);
          },
          {
            literal: 0,
            argCount: '*',
            bang: true,
            completer: function (context, args) {
              if (!self.isValid)
                U.raiseNotSupportedPage();
              if (!self.player.has('relations', 'r'))
                U.raiseNotSupportedFunction();

              context.filters = [CompletionContext.Filter.textDescription];
              context.anchored = false;
              context.title = ['Tag/ID', 'Description'];
              context.keys = {text: 'text', description: 'description', thumbnail: 'thumbnail'};
              let process = Array.slice(context.process);
              context.process = [
                process[0],
                function (item, text)
                  (item.thumbnail ? <><img src={item.thumbnail} style="margin-right: 0.5em; height: 3em;"/>{text}</>
                                  : process[1].apply(this, arguments))
              ];
              lastCompletions = self.player.relations;
              context.completions = lastCompletions.map(function (rel) rel.completionItem);
            },
          },
          true
        );
      }
    },

    addPageInfo: function () {
      let self = this;
      delete buffer.pageInfo.S;
      buffer.addPageInfoSection(
        'S',
        'Stella Info',
        function (verbose)
          (self.isValid && self.player.has('pageinfo', 'r')
            ? [
                [n, <div style="white-space: normal">{modules.template.maybeXML(v)}</div>]
                for each ([n, v] in self.player.pageinfo)
              ]
            : [])
      );
    },

    createStatusPanel: function () {
      let self = this;

      function setEvents (name, elem) {
        ['click', 'command', 'popupshowing'].forEach(function (eventName) {
          let onEvent = self[
            'on' +
              U.capitalize(name) +
              U.capitalize(eventName == 'command' ? 'click' : eventName)
          ];
          onEvent && elem.addEventListener(eventName, function (event) {
            if (eventName == 'click' && event.button != 0)
              return;
            onEvent.apply(self, arguments);
            self.update();
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
      icon.addEventListener('dblclick', U.bindr(this, this.onIconDblClick), false);

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
        onAppend: function (elem, menu) setEvents(U.capitalize(menu.name), elem)
      });

      let stbar = document.getElementById('status-bar');
      stbar.appendChild(panel);

      let relmenu = document.getElementById('anekos-stella-relations-menupopup');

      panel.addEventListener('DOMMouseScroll', U.bindr(this, this.onMouseScroll), true);
    },

    disable: function () {
      if (this.noGUI)
        return;
      this.hidden = true;
      if (this.__updateTimer) {
        clearInterval(this.__updateTimer);
        delete this.__updateTimer;
      }
      if (this.__autoFullscreenTimer) {
        clearInterval(this.__autoFullscreenTimer);
      }
    },

    enable: function () {
      if (this.noGUI)
        return;
      this.hidden = false;
      this.icon.setAttribute('src', this.player.icon);
      for (let name in this.toggles) {
        this.toggles[name].hidden = !this.player.has(name, 't');
      }
      if (!this.__updateTimer) {
        this.__updateTimer = setInterval(U.bindr(this, this.update), 500);
      }
    },

    removeStatusPanel: function () {
      let e = this.panel || document.getElementById(this.panelId);
      if (e && e.parentNode)
        e.parentNode.removeChild(e);
    },

    update: function () {
      if (!(this.isValid && this.player.ready))
        return;
      this.labels.main.text =
        let (v = this.player.statusText)
          (this.__currentTimeTo == undefined) ? v
                                              : v.replace(/^\d*\:\d*/,
                                                          U.toTimeCode(this.__currentTimeTo));
      this.labels.volume.text = this.player.volume;
      for (let name in this.toggles) {
        this.toggles[name].text = (this.player[name] ? String.toUpperCase : U.id)(name[0]);
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

    onLargeClick: function () {
      // XXX fullscreen と large の実装が同じ場合に問題になるので、toggle は使わない
      let old = this.player.large;
      if (this.player.fullscreen)
        this.player.fullscreen = false;
      this.player.large = !old;
    },

    onLocationChange: function () {
      if (this.__valid !== this.isValid) {
        (this.__valid = this.isValid) ? this.enable() : this.disable();
      }
      if (this.isValid) {
        clearInterval(this.__onReadyTimer);
        this.__onReadyTimer = setInterval(
          U.bindr(this, function () {
            if (this.player && this.player.ready) {
              clearInterval(this.__onReadyTimer);
              delete this.__onReadyTimer;
              this.onReady();
            }
          }),
          200
        );
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
      this.player.currentTime = parseInt(this.player.totalTime * per);
    },

    onMouseScroll: (function () {
      let timerHandle;
      return function (event) {
        if (!(this.isValid && this.player.ready && event.detail))
          return;
        if (event.target == this.labels.main) {
          if (this.__currentTimeTo == undefined)
            this.__currentTimeTo = this.player.currentTime;
          this.__currentTimeTo += (event.detail > 0) ? -5 : 5;
          this.__currentTimeTo = Math.min(Math.max(this.__currentTimeTo, 0), this.player.totalTime);
          clearTimeout(timerHandle);
          timerHandle = setTimeout(
            U.bindr(this, function () {
              this.player.currentTime = this.__currentTimeTo;
              delete this.__currentTimeTo;
            }),
            1000
          );
          this.update();
        } else {
          this.player.volume += (event.detail > 0) ? -5 : 5;
          this.update();
        }
      }
    })(),

    onMutedClick: function (event) this.player.toggle('muted'),

    onPauseClick: function () this.player.pause(),

    onPlayClick: function () this.player.play(),

    onReady: function () {
      if (this.player.last.screenMode && !this.storage.alreadyAutoFullscreen
      && !this.__autoFullscreenTimer) {
        this.__autoFullscreenTimer = setInterval(
          U.bindr(this, function () {
            if (!this.player.ready)
              return;
            clearInterval(this.__autoFullscreenTimer)
            setTimeout(
              U.bindr(this, function () (this.player[this.player.last.screenMode] = true)),
              this.setting.common.autoFullscreenDelay
            );
            delete this.__autoFullscreenTimer;
          }),
          200
        );
      }
      this.storage.alreadyAutoFullscreen = true;
    },

    onRepeatingClick: function () this.player.toggle('repeating'),

    onRelationsRootPopupshowing: function () {
      let self = this;

      function clickEvent (cmd)
        function () liberator.open(makeRelationURL(self.player, cmd));

      if (!this.player)
        return;

      let relmenu = document.getElementById('anekos-stella-relations-menupopup');
      let rels = this.player.relations;

      while (relmenu.firstChild)
        relmenu.removeChild(relmenu.firstChild);

      rels.forEach(function (rel) {
        let elem = document.createElement('menuitem');
        let prefix = rel instanceof RelatedID  ? 'ID: ' :
                     rel instanceof RelatedTag ? 'Tag: ' :
                     '';
        elem.setAttribute('label', prefix + rel.description);
        elem.addEventListener('command', clickEvent(rel.command), false);
        relmenu.appendChild(elem);
      }, this);
    },

    onResize: function () {
      if (this.__fullScreen !== window.fullScreen) {
        this.__fullScreen = window.fullScreen;
        this.onFullScreen(this.__fullScreen);
      }
    },

    onSetVolumeClick: function (event) (this.player.volume = event.target.getAttribute('volume'))
  };

  U.fixDoubleClick(Stella.prototype, 'onIconClick', 'onIconDblClick');

  // }}}

  /*********************************************************************************
  * Functions                                                                    {{{
  *********************************************************************************/

  function makeRelationURL (player, command) {
    if (!player.has('makeURL', 'x'))
      U.raise('Mysterious Error! makeURL has been not implmented.');
    if (command.match(/^[#\uff03]/))
      return player.makeURL(command.slice(1), Player.URL_ID);
    if (command.match(/^[:\uff1a]/))
      return player.makeURL(command.slice(1), Player.URL_TAG);
    if (command.indexOf('http://') == -1)
      return player.makeURL(encodeURIComponent(command), Player.URL_TAG);
    return command;
  }

  // }}}

  /*********************************************************************************
  * Install                                                                      {{{
  *********************************************************************************/

  if (InVimperator) {
    let estella = liberator.globalVariables.stella;

    let install = function () {
      let stella = liberator.globalVariables.stella = new Stella(new Setting());
      stella.addUserCommands();
      stella.addPageInfo();
      U.log('Stella: installed.');
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
