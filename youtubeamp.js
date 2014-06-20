/*
 * ==VimperatorPlugin==
 * @name            youtubeamp.js
 * @description     this script gives you keyboard oprations for YouTube.com.
 * @description-ja  YouTube のプレーヤーをキーボードで操作できるようにする。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.12
 * @minversion      2.0pre 2008/10/16
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *   New BSD License
 *
 * USAGE
 *   :ytinfo
 *     プレーヤーに関しての情報を表示する。今のところバージョンだけ。
 *   :ytpause
 *     再生 / 一時停止を切り替える。
 *   :ytmute
 *     音声あり / なしを切り替える。
 *   :ytsize
 *     最大化 / ノーマルを切り替える。動いてない。
 *   :ytseek [position]
 *     指定した場所にシークする。秒数で指定が可能。
 *     指定なしの場合一番最初にシークする。
 *   :ytseek! delta
 *     現在の位置から delta 分離れた所にシークする。秒数で指定が可能。
 *     マイナスを指定すると戻る。指定なしの場合変化しない。
 *   :ytvolume [volume]
 *     ボリュームを設定する。 0 ～ 100 が指定できる。
 *     指定なしの場合 100 にセットする。
 *   :ytvolume! delta
 *     ボリュームを現在の値から変更する。 -100 ～ +100 を指定可能。
 *     指定なしの場合変化しない。
 *
 * SEE ALSO
 *   http://code.google.com/apis/youtube/js_api_reference.html
 *
 * HISTORY
 *   2008/10/07 ver. 0.10   - initial written.
 * */

(function() {

let bind = function(__method, object) {
    return function() {
        return __method.apply(object, arguments);
    };
};

// class definition
// YouTubePlayerController Class
function YouTubePlayerController() {
    this.initialize.apply(this, arguments);
}
YouTubePlayerController.prototype = {
    initialize: function() {
        this.fuller = bind(this._changeToFull, this);
    },

    constants: {
        VERSION: '0.12',

        CARDINAL_NUMBER: 10,

        YOUTUBE_DOMAIN: '.youtube.jp',
        YOUTUBE_URL:    '^https?://[^.]+\\.youtube\\.com/',
        WATCH_URL:      'https?://[^.]+\\.youtube\\.com/watch',
        WATCH_PAGE:     1,

        PLAYER_NODE_ID: 'movie_player',

        STATE_PLAYING: 1,

        SIZE_WIDTH_DEFAULT:  480,
        SIZE_HEIGHT_DEFAULT: 385,

        NAME_PLAYER_VERSION: 'PLAYER_VERSION',

        SEEKTO_DEFAULT:   0,
        SEEKBY_DEFAULT:   0,
        VOLUMETO_DEFAULT: 100,
        VOLUMEBY_DEFAULT: 0,

        HIDE_NODES: [
            'old-masthead',
            'watch-vid-title',
            'watch-other-vids',
            'old-footer',
            'copyright',
            'watch-main-area',
            'watch-comments-stats',
            'watch-video-response',
            'chrome-promo',
            'watch-video-quality-setting',
        ],

        PLAYER_WRAPPER_NODE_ID: 'player-api',
        TOGGLE_PLAYER_WRAPPER_STYLE: {
            position:        'fixed',
            visibility:      'visible',
            top:             '0px',
            left:            '0px',
            margin:          '0px',
            padding:         '0px',
            width:           '100%',
            height:          '100%',
            zIndex:          '99999999999',
            borderWidth:     '0px',
            backgroundImage: 'none',
            backgroundColor: '#000',
            overflow:        'hidden',
        },
    },

    getControllerVersion: function() { return this.constants.VERSION; },

    pagecheck: function() {
        if(this.getURL().match(this.constants.WATCH_URL)) return this.constants.WATCH_PAGE;
        throw new Error('current tab is not watch page on youtube.com');
    },

    getURL: function() { return liberator.modules.buffer.URL; },

    _player: function() {
        if(this.pagecheck() === this.constants.WATCH_PAGE) {
            let player = this._getElementById(this.constants.PLAYER_NODE_ID);
            if(! player) throw new Error('player is not found');

            return player;
        }
        return null;
    },

    togglePlay: function() {
        var p = this._player();
        (p.getPlayerState() !== this.constants.STATE_PLAYING)
            ? p.playVideo()
            : p.pauseVideo();
    },

    toggleMute: function() {
        var p = this._player();
        p.isMuted() ? p.unMute() : p.mute();
    },

    toggleSize: function() {
        var playerWrapper = this._getElementById(this.constants.PLAYER_WRAPPER_NODE_ID);

        (playerWrapper.style.position == 'fixed')
            ? this._normalSize()
            : this._fullSize();
    },

    _changeToFull: function() {
        var p = this._player();
        setTimeout(function() {
            p.width = content.innerWidth;
            p.height = content.innerHeight;
        }, 0);
    },

    _getElementById: function(id) {
        var e = window.content.document.getElementById(id);
        if(!e) return null;

        return e.wrappedJSObject
            ? e.wrappedJSObject
            : e;
    },

    _fullSize: function() {
        var playerWrapper = this._getElementById(this.constants.PLAYER_WRAPPER_NODE_ID);
        this._setStyle(playerWrapper, this.constants.TOGGLE_PLAYER_WRAPPER_STYLE);
    },

    _normalSize: function() {
        var playerWrapper = this._getElementById(this.constants.PLAYER_WRAPPER_NODE_ID);
        this._clearStyle(playerWrapper, this.constants.TOGGLE_PLAYER_WRAPPER_STYLE);
    },

    _setStyle: function(ele, style) {
        Object.keys(style).forEach(function (key) {
            ele.style[key] = style[key];
        });
    },

    _clearStyle: function(ele, style) {
        Object.keys(style).forEach(function (key) {
            ele.style[key] = '';
        });
    },

    seekTo: function(position) {
        var p = this._player();

        if(position) {
            if(position.match(/^(\d+)%$/)) {
                var duration = p.getDuration();
                position = parseInt((duration * RegExp.$1 / 100), this.constants.CARDINAL_NUMBER);
            }
            else if(position.match(/^(\d+):(\d+)$/)) {
                position = parseInt(RegExp.$1, this.constants.CARDINAL_NUMBER) * 60
                    + parseInt(RegExp.$2, this.constants.CARDINAL_NUMBER);
            }
            if(isNaN(position)) throw new Error('assign unsigned number : seekTo()');
        }
        else position = this.constants.SEEKTO_DEFAULT;

        p.seekTo(position);
    },

    seekBy: function(delta) {
        var p = this._player();

        if(delta) {
            if(delta.match(/^([-+]?)(\d+)%$/)) {
                var duration = p.getDuration();
                delta = parseInt((duration * RegExp.$2 / 100), this.constants.CARDINAL_NUMBER);
                if(RegExp.$1 == '-') delta = -delta;
            }
            if(isNaN(delta)) throw new Error('assign signed number : seekBy()');
        }
        else delta = this.constants.SEEKBY_DEFAULT;

        var position = p.getCurrentTime();
        position += parseInt(delta, this.constants.CARDINAL_NUMBER);

        p.seekTo(position);
    },

    volumeTo: function(volume) {
        if(volume) {
            if(isNaN(volume)) throw new Error('assign unsigned number : volumeTo()');
        }
        else volume = this.constants.VOLUMETO_DEFAULT;

        var p = this._player();
        p.setVolume(volume);
    },

    volumeBy: function(delta) {
        if(delta) {
            if(isNaN(delta)) throw new Error('assign signed number : volumeBy()');
        }
        else delta = this.constants.VOLUMEBY_DEFAULT;

        var p = this._player();
        var volume = p.getVolume();
        volume += parseInt(delta, this.constants.CARDINAL_NUMBER);

        p.setVolume(volume);
    },
};

// global object
var controller = new YouTubePlayerController();

// command register
liberator.modules.commands.addUserCommand(
    ['ytinfo'],
    'display player information',
    function() {
        try {
            let info = [
                'controller version : ' + controller.getControllerVersion(),
            ].join('\n');
            liberator.echo(info, liberator.modules.commandline.FORCE_MULTILINE);
        }
        catch(e) { liberator.echoerr(e); }
    },
    {}
);

liberator.modules.commands.addUserCommand(
    ['ytpause'],
    'toggle play / pause',
    function() {
        try      { controller.togglePlay(); }
        catch(e) { liberator.echoerr(e); }
    },
    {}
);

liberator.modules.commands.addUserCommand(
    ['ytmute'],
    'toggle mute',
    function() {
        try      { controller.toggleMute(); }
        catch(e) { liberator.echoerr(e); }
    },
    {}
);

liberator.modules.commands.addUserCommand(
    ['ytseek'],
    'controll seek bar',
    function(args) {
        try {
            let arg = (args.length > 1)
                ? args[0].toString()
                : args.string;
            args.bang ? controller.seekBy(arg) : controller.seekTo(arg);
        }
        catch(e) { liberator.echoerr(e); }
    },
    {
        bang: true,
    }
);

liberator.modules.commands.addUserCommand(
    ['ytvolume'],
    'controll volume',
    function(args) {
        try {
            let arg = (args.length > 1)
                ? args[0].toString()
                : args.string;
            args.bang ? controller.volumeBy(arg) : controller.volumeTo(arg);
        }
        catch(e) { liberator.echoerr(e); }
    },
    {
        bang: true,
    }
);

liberator.modules.commands.addUserCommand(
    ['ytsize'],
    'toggle video size',
    function() {
        try      { controller.toggleSize(); }
        catch(e) { liberator.echoerr(e); }
    },
    {}
);

})()

// vim: set sw=4 ts=4 et;
