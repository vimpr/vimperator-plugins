let PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>clock</description>
<description lang="ja">とけい</description>
<author mail="janus_wel@fb3.so-net.ne.jp" homepage="http://d.hatena.ne.jp/janus_wel">janus_wel</author>
<license document="http://www.opensource.org/licenses/bsd-license.php">New BSD License</license>
<version>0.15.2</version>
<minVersion>2.0pre</minVersion>
<maxVersion>2.2pre</maxVersion>
<updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/clock.js</updateURL>
<detail><![CDATA[
== USAGE ==
you can customize below variable.

clock_format: clock format. default is '[%t]'. available below special tokens.
%t:
    time hh:mm
%d:
    day  MM/DD
%y:
    year YYYY
%a:
    A abbreviation for the day of the week.

refer:
    http://d.hatena.ne.jp/janus_wel/20081128/1227849365

== EX-COMMANDS ==
:clockhide:
    hide clock
:clockappear:
    appear clock
:clockstop:
    stop clock
:clockstart:
    start clock
:clockjustify:
    justify clock position

== EXAMPLE ==
in .vimperatorrc

>||
let clock_format='(%t %d)'
||<

this exapmple show clock like below

>||
(20:34 12/12)
||<

]]></detail>
<detail lang="ja"><![CDATA[
== USAGE ==
以下の設定を変更することができます。

clock_format: 時計の書式。設定なしの場合 '[%t]' として扱われます。以下の特殊な識別子が使えます。
%t:
    時間 hh:mm 形式
%d:
    月日 MM/DD 形式
%y:
    西暦年 YYYY 形式
%a:
    曜日

参考:
    http://d.hatena.ne.jp/janus_wel/20081128/1227849365

== EX-COMMANDS ==
:clockhide:
    時計を隠します。
:clockappear:
    時計を出します。
:clockstop:
    時計を止めます。
:clockstart:
    時計を動かします。
:clockjustify:
    時計の位置を調節します。

== EXAMPLE ==
.vimperatorrc に、

>||
let clock_format='(%t %d)'
||<

と書くと以下のように表示されます。

>||
(20:34 12/12)
||<

]]></detail>
</VimperatorPlugin>;

( function () {

// definitions ---
// default settings
const format = liberator.globalVariables.clock_format || '[%t]';

// class definitions
function Clock() {
    this._initialize.apply(this, arguments);
}
Clock.prototype = {
    _initialize: function (format) {
        this._format = format;
        this._master = window.document.createElement('label');
        this._master.setAttribute('style', this._constants.style);

        this._intervalInfo = {};
    },

    _constants: {
        // default style
        style: [
            'margin: 0;',
            'padding: 1px;',
            'border: 0 none;',
            'color: black;',
            'background-color: white;',
            'font-family: monospace;',
            'font-weight: bold;',
        ].join(''),

        // prefix of id and class name
        prefix: 'liberator-plugin-clock-',

        driver: {
            t: function (label) {
                return setInterval(function () label.setAttribute('value', time()), 100);
            },
            a: function (label) {
                return setInterval(function () label.setAttribute('value', weekDay()), 60 * 1000);
            },
            d: function (label) {
                return setInterval(function () label.setAttribute('value', day()), 60 * 1000);
            },
            y: function (label) {
                return setInterval(function () label.setAttribute('value', year()), 60 * 1000);
            },
        },

        generator: {
            t: function (self) {
                let l = self._master.cloneNode(false);
                l.setAttribute('id', self._constants.prefix + 'clock');
                l.setAttribute('value', time());
                let id = self._constants.driver.t(l);
                return {
                    node: l,
                    intervalId: id,
                };
            },
            a: function (self) {
                let l = self._master.cloneNode(false);
                l.setAttribute('id', self._constants.prefix + 'wday');
                l.setAttribute('value', weekDay());
                let id = self._constants.driver.a(l);
                return {
                    node: l,
                    intervalId: id,
                };
            },
            d: function (self) {
                let l = self._master.cloneNode(false);
                l.setAttribute('id', self._constants.prefix + 'day');
                l.setAttribute('value', day());
                let id = self._constants.driver.d(l);
                return {
                    node: l,
                    intervalId: id,
                };
            },
            y: function (self) {
                let l = self._master.cloneNode(false);
                l.setAttribute('id', self._constants.prefix + 'year');
                l.setAttribute('value', year());
                let id = self._constants.driver.y(l);
                return {
                    node: l,
                    intervalId: id,
                };
            },
            raw: function (self, str) {
                let l = self._master.cloneNode(false);
                l.setAttribute('class', self._constants.prefix + 'raw');
                l.setAttribute('value', str);
                return {
                    node: l,
                };
            },
        },
    },

    // generate
    generate: function () {
        let box = window.document.createElement('hbox');
        box.setAttribute('id', this._constants.prefix + 'box');
        box.setAttribute('style', 'display: block;');
        box.setAttribute('class', 'liberator-container');
        let format = this._format;
        let generator = this._constants.generator;

        let raw = '';
        let formatFlag = false;
        for (let i=0, l=format.length ; i<l ; ++i) {
            let c = format[i];
            switch(c) {
                case '%':
                    formatFlag = true;
                    if (raw) {
                        box.appendChild(generator['raw'](this, raw).node);
                        raw = '';
                    }
                    break;
                default:
                    if (formatFlag) {
                        if (c in generator) {
                            let g = generator[c](this);
                            box.appendChild(g.node);
                            if (g.intervalId) this._intervalInfo[c] = g;
                        }
                        formatFlag = false;
                    }
                    else {
                        raw += c;
                    }
                    break;
            }
        }
        if (raw.length > 0) box.appendChild(generator['raw'](this, raw).node);

        this._box = box;
    },

    get instance() this._box,
    get width() this._box.boxObject.width,

    hide:   function () this._box.setAttribute('style', 'display: none;'),
    appear: function () this._box.setAttribute('style', 'display: block;'),

    justify: function (parentWidth) this._box.setAttribute('left', parentWidth - this.width),

    start: function () {
        let info = this._intervalInfo;
        for (let [k, i] in Iterator(info)) {
            if (!i.intervalId) {
                i.intervalId = this._constants.driver[k](i.node);
            }
        }
    },
    stop: function () {
        let info = this._intervalInfo;
        for (let [k, i] in Iterator(info)) {
            if (i.intervalId) {
                clearInterval(i.intervalId);
                i.intervalId = undefined;
            }
        }
    },
};


// main ---
let commandlineStack = getCommandlineStack();
if (!commandlineStack) {
    let errmsg = 'clock.js: not found the commandline.';
    liberator.log(errmsg, 0);
    liberator.echoerr(errmsg);
    return;
}

// build clock
let clock = new Clock(format);
clock.generate();

// insert
commandlineStack.appendChild(clock.instance);

// register command
[
    [['clockhide'],    'hide clock',   function () clock.hide()   ],
    [['clockappear'],  'clock appear', function () clock.appear() ],
    [['clockstart'],   'start clock',  function () clock.start()  ],
    [['clockstop'],    'stop clock',   function () clock.stop()   ],
    [['clockjustify'], 'justify',      function () clock.justify(window.innerWidth) ],
].forEach( function ([n, d, f]) commands.addUserCommand(n, d, f, {}) );

window.addEventListener(
    'resize',
    function () {
        clock.justify(window.innerWidth);
    },
    false
);

autocommands.add(
    'VimperatorEnter',
    /.*/,
    function () {
        clock.justify(window.innerWidth);
    }
);

// stuff functions ---
function time() {
    let now = new Date();
    let hour = now.getHours().toString(10);
    let min  = now.getMinutes().toString(10);
    if (hour.length < 2) hour = '0' + hour;
    if (min.length < 2)  min  = '0' + min;
    return hour + (now.getMilliseconds() < 400 ? ' ' : ':') + min;
}
function weekDay() {
    const wdays = 'sun mon tue wed thu fri sat'.split(/%s/);
    let now = new Date();
    return now.toLocaleFormat ? now.toLocaleFormat('%a')
                              : wdays[now.getDay()];
}
function day() {
    let now = new Date();
    let date  = now.getDate().toString(10);
    let month = (now.getMonth() + 1).toString(10);
    if (date.length < 2)  date  = '0' + date;
    if (month.length < 2) month = '0' + month;
    return month + '/' + date;
}
function year() {
    return new Date().getFullYear().toString(10);
}

// node control
function getCommandlineStack() {
    let messageTextarea = window.document.getElementById('liberator-message');
    let commandlineStack = messageTextarea.parentNode;
    return commandlineStack.localName === 'stack' ? commandlineStack : null;
}

} )();

// vim: set sw=4 ts=4 et;
