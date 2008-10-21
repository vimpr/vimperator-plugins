/*
 * ==VimperatorPlugin==
 * @name            youtubeamp.js
 * @description     this script gives you keyboard oprations for YouTube.com.
 * @description-ja  YouTube のプレーヤーをキーボードで操作できるようにする。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.12
 * @minversion      2.0pre 2008/10/16
 * ==VimperatorPlugin==
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

Function.prototype.bind = function(object) {
    var __method = this;
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
        this.fuller = this._changeToFull.bind(this);
    },

    constants: {
        VERSION: '0.12',

        CARDINAL_NUMBER: 10,

        YOUTUBE_DOMAIN: '.youtube.jp',
        YOUTUBE_URL:    '^http://[^.]+\\.youtube\\.com/',
        WATCH_URL:      'http://[^.]+\\.youtube\\.com/watch',
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
        ],
    },

    getControllerVersion: function() { return this.constants.VERSION; },

    pagecheck: function() {
        if(this.getURL().match(this.constants.WATCH_URL)) return this.constants.WATCH_PAGE;
        throw new Error('current tab is not watch page on youtube.com');
    },

    getURL: function() { return liberator.modules.buffer.URL; },

    _player: function() {
        if(this.pagecheck() === this.constants.WATCH_PAGE) {
            var player = this._getElementById(this.constants.PLAYER_NODE_ID);
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
        var p = this._player();
        (p.width == this.constants.SIZE_WIDTH_DEFAULT && p.height == this.constants.SIZE_HEIGHT_DEFAULT)
            ? this._fullSize()
            : this._normalSize();
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
        var b = this._getElementById('baseDiv');
        this.defMargin = b.style.margin;
        this.defPadding = b.style.padding;
        this.defWidth = b.style.width;
        b.style.margin = 0;
        b.style.padding = 0;
        b.style.width = '100%';

        for(var i=0, max=this.constants.HIDE_NODES.length ; i<max ; ++i) {
            var h = this._getElementById(this.constants.HIDE_NODES[i]);
            if(h) { h.style.display = 'none'; }
        }

        this._changeToFull();

        window.addEventListener(
            'resize',
            this.fuller,
            false
        );
    },

    _normalSize: function() {
        var b = this._getElementById('baseDiv');
        b.style.margin  = this.defMargin;
        b.style.padding = this.defPadding;
        b.style.width   = this.defWidth;

        for(var i=0, max=this.constants.HIDE_NODES.length ; i<max ; ++i) {
            var h = this._getElementById(this.constants.HIDE_NODES[i]);
            if(h) { h.style.display = 'block'; }
        }

        var p = this._player();
        p.width = this.constants.SIZE_WIDTH_DEFAULT;
        p.height = this.constants.SIZE_HEIGHT_DEFAULT;

        window.removeEventListener(
            'resize',
            this.fuller,
            false
        );
    },

    seekTo: function(position) {
        if(position) {
            if(position.match(/^(\d+):(\d+)$/)) {
                position = parseInt(RegExp.$1, this.constants.CARDINAL_NUMBER) * 60
                    + parseInt(RegExp.$2, this.constants.CARDINAL_NUMBER);
            }
            if(isNaN(position)) throw new Error('assign unsigned number : seekTo()');
        }
        else position = this.constants.SEEKTO_DEFAULT;

        var p = this._player();
        p.seekTo(position);
    },

    seekBy: function(delta) {
        if(delta) {
            if(isNaN(delta)) throw new Error('assign signed number : seekBy()');
        }
        else delta = this.constants.SEEKBY_DEFAULT;

        var p = this._player();
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
            var info = [
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
    'control seek bar',
    function(args, special) {
        try {
            var arg = (args.arguments.length > 1)
                ? args.arguments[0].toString()
                : args.string;
            special ? controller.seekBy(arg) : controller.seekTo(arg);
        }
        catch(e) { liberator.echoerr(e); }
    },
    {
        bang: true,
    }
);

liberator.modules.commands.addUserCommand(
    ['ytvolume'],
    'control volume',
    function(args, special) {
        try      {
            var arg = (args.arguments.length > 1)
                ? args.arguments[0].toString()
                : args.string;
            special ? controller.volumeBy(arg) : controller.volumeTo(arg);
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
