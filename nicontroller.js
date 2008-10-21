/*
 * ==VimperatorPlugin==
 * @name            nicontroller.js
 * @description     this script give you keyboard opration for nicovideo.jp.
 * @description-ja  ニコニコ動画のプレーヤーをキーボードで操作できるようにする。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.53
 * @minversion      2.0pre 2008/10/16
 * ==VimperatorPlugin==
 *
 * LICENSE
 *   New BSD License
 *
 * USAGE
 *   :nicoinfo
 *     プレーヤーに関しての情報を表示する。今のところバージョンだけ。
 *   :nicopause
 *     再生 / 一時停止を切り替える。
 *   :nicomute
 *     音声あり / なしを切り替える。
 *   :nicommentvisible
 *     コメント表示 / 非表示を切り替える。
 *   :nicorepeat
 *     リピート再生するかどうかを切り替える。
 *   :nicosize
 *     最大化 / ノーマルを切り替える。
 *   :nicoseek [position]
 *     指定した場所にシークする。秒数で指定が可能。
 *     指定なしの場合一番最初にシークする。
 *   :nicoseek! delta
 *     現在の位置から delta 分離れた所にシークする。秒数で指定が可能。
 *     マイナスを指定すると戻る。指定なしの場合変化しない。
 *   :nicovolume [volume]
 *     ボリュームを設定する。 0 ～ 100 が指定できる。
 *     指定なしの場合 100 にセットする。
 *   :nicovolume! delta
 *     ボリュームを現在の値から変更する。 -100 ～ +100 を指定可能。
 *     指定なしの場合変化しない。
 *   :nicodescription
 *     説明文・メニューの表示 / 非表示を切り替える
 *   :nicomment comment
 *     コメント欄を指定した文字列で埋める。
 *     詳しい機能は http://d.hatena.ne.jp/janus_wel/20080913/1221317583
 *   :nicommand command
 *     コマンド欄を指定した文字列で埋める。
 *     プレミアムかどうかで補完可能なコマンドも変化。
 *     補完はけっこう賢くなったと思う。
 *
 * HISTORY
 *   2008/07/13 ver. 0.10   - initial written.
 *   2008/07/14 ver. 0.20   - add nicosize, nicoseek, nicovolume.
 *   2008/07/15 ver. 0.30   - add nicoinfo.
 *   2008/07/19 ver. 0.31   - allow assign mm:ss format to seekTo method.
 *                              thanks to id:nokturnalmortum
 *                              refer: http://d.hatena.ne.jp/nokturnalmortum/20080718#1216314934
 *                          - fix error message.
 *   2008/09/12 ver. 0.40   - completer function of :nicommand -> usefull.
 *                          - add feature: comment input assistance.
 *   2008/09/14 ver. 0.41   - fix the bug that happen by adding method to Array.
 *                          - fix the nicopause bug associated with
 *                            flvplayer's status('buffering' and 'end').
 *                              thanks to なまえ (no name ?)
 *                              refer: http://d.hatena.ne.jp/janus_wel/20080914/1221387317
 *   2008/10/01 ver. 0.50   - add :nicodescription.
 *   2008/10/02 ver. 0.51   - refactoring.
 *                          - use Error object when throw exception.
 *                          - extract constant variables from code
 *                            and define in NicoPlayerController.constants.
 *   2008/10/08 ver. 0.52   - correspond vimperator specification
 *                            "bang" in extra object on addUserCommand.
 * */

/*
_vimperatorrc に以下のスクリプトを貼り付けると幸せになれるかも
コマンド ( [',n-'] や [',n+'] の部分 ) は適宜変えてね。

javascript <<EOM
// [N],n-
// N 秒前にシークする。
// 指定なしの場合 10 秒前。
liberator.modules.mappings.addUserMap(
    [liberator.modules.modes.NORMAL],
    [',n-'],
    'seek by count backward',
    function(count) {
        if(count === -1) count = 10;
        liberator.execute(':nicoseek! ' + '-' + count);
    },
    { flags: liberator.modules.Mappings.flags.COUNT }
);

// [N],n+
// N 秒後にシークする。
// 指定なしの場合 10 秒後。
liberator.modules.mappings.addUserMap(
    [liberator.modules.modes.NORMAL],
    [',n+'],
    'seek by count forward',
    function(count) {
        if(count === -1) count = 10;
        liberator.execute(':nicoseek! ' + count);
    },
    { flags: liberator.modules.Mappings.flags.COUNT }
);
EOM
*/

(function(){

// class definition
// cookie manager
function CookieManager() {
    this.initialize.apply(this, arguments);
}
CookieManager.prototype = {
    initialize: function (uri) {
        const Cc = Components.classes;
        const Ci = Components.interfaces;

        const MOZILLA = '@mozilla.org/';
        const IO_SERVICE = MOZILLA + 'network/io-service;1';
        const COOKIE_SERVICE = MOZILLA + 'cookieService;1';

        this.ioService = Cc[IO_SERVICE].getService(Ci.nsIIOService);
        this.cookieService = Cc[COOKIE_SERVICE].getService(Ci.nsICookieService);
        if (!this.ioService || !this.cookieService) {
            throw new Error('error on CookieManager initialize.');
        }

        this.readCookie(uri);
    },

    readCookie: function (uri) {
        if (uri) {
            this.uri = uri;
            this.uriObject = this.ioService.newURI(uri, null, null);
            this.cookie = this._deserializeCookie(this._getCookieString());
        }
    },

    _getCookieString: function () {
        return this.uriObject
            ? this.cookieService.getCookieString(this.uriObject, null)
            : null;
    },

    _setCookieString: function (cookieString) {
        if (this.uriObject && cookieString) {
            this.cookieService.setCookieString(this.uriObject, null, cookieString, null);
        }
    },

    _deserializeCookie: function (cookieString) {
        var cookies = cookieString.split('; ');
        var cookie = {};
        var key, val;
        for (var i=0, max=cookies.length ; i<max ; ++i) {
            [key, val] = cookies[i].split('=');
            cookie[key] = val;
        }
        return cookie;
    },

    getCookie: function (key) {
        return this.cookie[key] ? this.cookie[key] : null;
    },

    setCookie: function (obj) {
        this.cookie[obj.key] = obj.value;
        var string = [
            obj.key + '=' + obj.value,
            'domain=' + obj.domain,
            'expires=' + new Date(new Date().getTime() + obj.expires),
        ].join(';');
        this._setCookieString(string);
    },
};

// NicoPlayerController Class
function NicoPlayerController() {
    this.initialize.apply(this, arguments);
}
NicoPlayerController.prototype = {
    initialize: function () {
        this.cookieManager = new CookieManager();
    },

    constants: {
        VERSION:        '0.53',

        CARDINAL_NUMBER:    10,

        NICO_DOMAIN:    '.nicovideo.jp',
        NICO_URL:       'http://www.nicovideo.jp/',
        WATCH_URL:      'http://www.nicovideo.jp/watch/',
        WATCH_PAGE:     1,

        FLVPLAYER_NODE_ID: 'flvplayer',

        STATE_PLAYING:  'playing',
        PLAY:           true,
        PAUSE:          false,

        STATE_SIZE_NORMAL:  'normal',
        STATE_SIZE_FIT:     'fit',

        NAME_PREMIUM_NO:     'premiumNo',
        NAME_PLAYER_VERSION: 'PLAYER_VERSION',

        SEEKTO_DEFAULT:     0,
        SEEKBY_DEFAULT:     0,
        VOLUMETO_DEFAULT:   100,
        VOLUMEBY_DEFAULT:   0,

        DESCRIPTION_HIDDEN_NODE_ID:    'des_1',
        DESCRIPTION_DISPLAYED_NODE_ID: 'des_2',

        DESCRIPTION_HIDDEN_STATE:       0,
        DESCRIPTION_DISPLAYED_STATE:    1,

        COOKIE_DESCRIPTION_NAME:    'desopen',
        COOKIE_EXPIRES:             60 * 60 * 24 * 365 * 1000,

        COMMAND_NORMAL: [
            ['naka',      'normal comment (flow right to left)'],
            ['ue',        'fix comment to vertical top and horizonal center of the screen'],
            ['shita',     'fix comment to vertical bottom and horizonal center of the screen'],
            ['medium',    'normal size comment'],
            ['big',       'big size comment'],
            ['small',     'small size comment'],
            ['white',     'white color comment'],
            ['red',       'red color comment'],
            ['pink',      'pink color comment'],
            ['orange',    'orange color comment'],
            ['yellow',    'yellow color comment'],
            ['green',     'green color comment'],
            ['cyan',      'cyan color comment'],
            ['blue',      'bule color comment'],
            ['purple',    'purple color comment'],
            ['184',       'anonymouse comment'],
            ['sage',      'post comment on "sage" mode'],
            ['invisible', 'invisible comment'],
        ],
        COMMAND_PREMIUM: [
            ['niconicowhite',  'nicinicowhite color comment'],
            ['truered',        'truered color comment'],
            ['passionorange',  'passionorange comment'],
            ['madyellow',      'madyellow comment'],
            ['elementalgreen', 'elementalgreen comment'],
            ['marineblue',     'marineblue'],
            ['nobleviolet',    'nobleviolet'],
            ['black',          'black'],
        ],
    },

    getControllerVersion: function () { return this.constants.VERSION; },
    getPlayerVersion: function () { return this.getValue(this.constants.NAME_PLAYER_VERSION); },

    pagecheck: function() {
        if(this.getURL().match(this.constants.WATCH_URL)) return this.constants.WATCH_PAGE;
        throw new Error('current tab is not watch page on nicovideo.jp');
    },

    getURL: function() { return liberator.modules.buffer.URL; },

    _flvplayer: function() {
        if(this.pagecheck() === this.constants.WATCH_PAGE) {
            var flvplayer = window.content.document.getElementById(this.constants.FLVPLAYER_NODE_ID);
            if(! flvplayer) throw new Error('flvplayer is not found');

            return flvplayer.wrappedJSObject
                ? flvplayer.wrappedJSObject
                : flvplayer ? flvplayer : null;
        }
        return null;
    },

    togglePlay: function() {
        var p = this._flvplayer();
        (p.ext_getStatus() !== this.constants.STATE_PLAYING)
            ? p.ext_play(this.constants.PLAY)
            : p.ext_play(this.constants.PAUSE);
    },

    toggleMute: function() {
        var p = this._flvplayer();
        p.ext_setMute(! p.ext_isMute());
    },

    toggleCommentVisible: function() {
        var p = this._flvplayer();
        p.ext_setCommentVisible(! p.ext_isCommentVisible());
    },

    toggleRepeat: function() {
        var p = this._flvplayer();
        p.ext_setRepeat(! p.ext_isRepeat());
    },

    toggleSize: function() {
        var p = this._flvplayer();
        (p.ext_getVideoSize() === this.constants.STATE_SIZE_NORMAL)
            ? p.ext_setVideoSize(this.constants.STATE_SIZE_FIT)
            : p.ext_setVideoSize(this.constants.STATE_SIZE_NORMAL);
    },

    toggleDescription: function () {
        if (!(this.pagecheck() === this.constants.WATCH_PAGE)) {
            return;
        }

        // get nodes
        var hidden = window.content.document.getElementById(this.constants.DESCRIPTION_HIDDEN_NODE_ID);
        var displayed = window.content.document.getElementById(this.constants.DESCRIPTION_DISPLAYED_NODE_ID);

        // get cookie
        this.cookieManager.readCookie(this.constants.NICO_URL);
        var val = this.cookieManager.getCookie(this.constants.COOKIE_DESCRIPTION_NAME);

        if (!(hidden && displayed && val !== undefined && val !== null)) {
            return;
        }

        // change 'display' property of description nodes
        var escape = hidden.style.display;
        hidden.style.display = displayed.style.display;
        displayed.style.display = escape;

        // change cookie
        var change = (val == this.constants.DESCRIPTION_HIDDEN_STATE)
            ? this.constants.DESCRIPTION_DISPLAYED_STATE
            : this.constants.DESCRIPTION_HIDDEN_STATE;
        this.cookieManager.setCookie({
            key:        this.constants.COOKIE_DESCRIPTION_NAME,
            value:      change,
            domain:     this.constants.NICO_DOMAIN,
            expires:    this.constants.COOKIE_EXPIRES,
        });
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

        var p = this._flvplayer();
        p.ext_setPlayheadTime(position);
    },

    seekBy: function(delta) {
        if(delta) {
            if(isNaN(delta)) throw new Error('assign signed number : seekBy()');
        }
        else delta = this.constants.SEEKBY_DEFAULT;

        var p = this._flvplayer();
        var position = p.ext_getPlayheadTime();
        position += parseInt(delta, this.constants.CARDINAL_NUMBER);

        p.ext_setPlayheadTime(position);
    },

    volumeTo: function(volume) {
        if(volume) {
            if(isNaN(volume)) throw new Error('assign unsigned number : volumeTo()');
        }
        else volume = this.constants.VOLUMETO_DEFAULT;

        var p = this._flvplayer();
        p.ext_setVolume(volume);
    },

    volumeBy: function(delta) {
        if(delta) {
            if(isNaN(delta)) throw new Error('assign signed number : volumeBy()');
        }
        else delta = this.constants.VOLUMEBY_DEFAULT;

        var p = this._flvplayer();
        var volume = p.ext_getVolume();
        volume += parseInt(delta, this.constants.CARDINAL_NUMBER);

        p.ext_setVolume(volume);
    },

    getValue: function(name) {
        return this._flvplayer().GetVariable(name);
    },

    setValue: function(name, value) {
        return this._flvplayer().SetVariable(name, value);
    },

    // return the clone not to damage
    // Array.apply() is cloning Array
    // (adding method to Array has a lot of troubles)
    // refer: http://la.ma.la/blog/diary_200510062243.htm
    getAvailableCommands: function() {
        return this.getValue(this.constants.NAME_PREMIUM_NO)
            ? this.constants.COMMAND_NORMAL.concat(this.constants.COMMAND_PREMIUM)
            : Array.apply(null, this.constants.COMMAND_NORMAL)
    }

};

// global object
var controller = new NicoPlayerController();

// command register
liberator.modules.commands.addUserCommand(
    ['nicoinfo'],
    'display player information',
    function() {
        try {
            var info = [
                'player version     : ' + controller.getPlayerVersion(),
                'controller version : ' + controller.getControllerVersion(),
            ].join("\n");
            liberator.echo(info, liberator.modules.commandline.FORCE_MULTILINE);
        }
        catch(e) { liberator.echoerr(e); }
    },
    {}
);

liberator.modules.commands.addUserCommand(
    ['nicopause'],
    'toggle play / pause',
    function() {
        try      { controller.togglePlay(); }
        catch(e) { liberator.echoerr(e); }
    },
    {}
);

liberator.modules.commands.addUserCommand(
    ['nicomute'],
    'toggle mute',
    function() {
        try      { controller.toggleMute(); }
        catch(e) { liberator.echoerr(e); }
    },
    {}
);

liberator.modules.commands.addUserCommand(
    ['nicommentvisible'],
    'toggle comment visible',
    function() {
        try      { controller.toggleCommentVisible(); }
        catch(e) { liberator.echoerr(e); }
    },
    {}
);

liberator.modules.commands.addUserCommand(
    ['nicorepeat'],
    'toggle repeat',
    function() {
        try      { controller.toggleRepeat(); }
        catch(e) { liberator.echoerr(e); }
    },
    {}
);

liberator.modules.commands.addUserCommand(
    ['nicoseek'],
    'controll seek bar',
    function(args, special) {
        try      {
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
    ['nicovolume'],
    'controll volume',
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
    ['nicosize'],
    'toggle video size',
    function() {
        try      { controller.toggleSize(); }
        catch(e) { liberator.echoerr(e); }
    },
    {}
);

liberator.modules.commands.addUserCommand(
    ['nicodescription'],
    'toggle display or not the description for video',
    function() {
        try      { controller.toggleDescription(); }
        catch(e) { liberator.echoerr(e); }
    },
    {}
);

liberator.modules.commands.addUserCommand(
    ['nicomment'],
    'fill comment box',
    function(args) {
        try      {
            var arg = args.string;

            var command, comment;
            [command, comment] = expandExCommand(arg);

            comment = comment.replace(/&emsp;/g, EMSP)
                             .replace(/&nbsp;/g, NBSP)
                             .replace(/<LF>/g,   LF);

            if(command) {
                controller.setValue('inputArea.MailInput.text', command);
            }
            controller.setValue('ChatInput.text', comment);
        }
        catch(e) { liberator.echoerr(e); }
    },
    {}
);

liberator.modules.commands.addUserCommand(
    ['nicommand'],
    'fill command box',
    function(arg) {
        try      { controller.setValue('inputArea.MailInput.text', arg.string); }
        catch(e) { liberator.echoerr(e); }
    },
    {
        completer: function(args){
            var arg = args.string;

            // get available commands by roll
            var availableCommands = controller.getAvailableCommands();

            // for no argument
            if(!arg) { return [0, availableCommands]; }

            // make array of inputted words
            // and current input word shoud be last (dayone ?)
            var inputted = arg.toLowerCase().split(/\s+/);
            var current = inputted[inputted.length - 1];
            // complete position is the top of last word
            var completePosition = arg.lastIndexOf(' ') + 1;

            // exclude inputted word from candidates
            var candidates = availableCommands.filter( function(commandSet) {
                for(var i=0, numofInputted=inputted.length ; i<numofInputted ; ++i) {
                    if(commandSet[0] === inputted[i]){
                        inputted.splice(i, 1);
                        return false;
                    }
                }
                return true;
            });

            // display all candidates in after space ' '
            if(inputted[inputted.length - 1] !== current) {
                // complete position is the next of last space
                completePosition = arg.length + 1;
                return [completePosition, candidates];
            }

            // return the set that start with current word
            var commands = candidates.filter( function(commandSet) {
                return (commandSet[0].indexOf(current) === 0);
            });

            return [completePosition, commands];
        },
    }
);


// for ex-command -------------------------------------------------------
// constants
const MAX_LINE = {
    big:    16,
    medium: 25,
    small:  38,
};
const EMSP = '\u3000';
const NBSP = '\u00a0';
const LF = '\u000a';
const PROPATIES_DEFAULT = {
    fixFlag: false,
    max    : MAX_LINE['medium'],
    line   : 1,
    size   : '',
};
const COMMAND_SEPARATOR = '|';

// functions
function expandExCommand(arg) {
    var command, comment;

    // command and comment is separated by COMMAND_SEPARATOR
    var temp = arg.split(COMMAND_SEPARATOR);
    if(temp.length > 1) {
        command = temp.shift();
        comment = temp.join(COMMAND_SEPARATOR);
    }
    else {
        comment = arg;
    }

    // ex_command is putted in braces
    if(comment.match(/^\{([^{}]+)\}(.+)/)) {
        var exCommand = RegExp.$1;
        var text = RegExp.$2;

        var properties = analysisExCommand(exCommand);

        // fine tune command about comment size
        if(properties.size) {
            if(command) {
                command = command.replace(/\s*big\s*/g, ' ')
                                 .replace(/\s*medium\s*/g, ' ')
                                 .replace(/\s*small\s*/g, ' ');
            }
            command += ' ' + properties.size;
        }

        // expand!!
        comment = buildLineBreakString(properties.line) + text;
        if(properties.fixFlag) {
            var post = buildLineBreakString(properties.max - properties.line + 1);
            comment += post + NBSP;
        }
    }

    return [command, comment];
}

// "&nbsp;" and <LF> on each line
function buildLineBreakString(numof) {
    // faster than string concatenate (+, +=)
    var string = Array(numof * 2);
    for(var i=1 ; i<numof ; ++i) {
        string.push(NBSP);
        string.push(LF);
    }

    return string.join('');
}

// RegExp hell
function analysisExCommand(exCommand) {
    // default set
    var properties = PROPATIES_DEFAULT;

    // fix or not
    if(exCommand.match(/\bfix\b/)) {
        properties.fixFlag = true;
    }

    // comment size and max line
    if(exCommand.match(/\b(big|medium|small)\b/)) {
        properties.size = RegExp.$1;
        properties.max = MAX_LINE[properties.size];
    }
    else if(exCommand.match(/\bmax(\d+)\b/)) {
        properties.max = RegExp.$1;
    }

    // line
    if(exCommand.match(/\bline(-?\d+)\b/)) {
        var line = parseInt(RegExp.$1, 10);
        if(line < 0) line = properties.max + line + 1;
        if(line > properties.max) line = properties.max;
        properties.line = line;
    }

    return properties;
}
})();

// vim: set sw=4 ts=4 et;
