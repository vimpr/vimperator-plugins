var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>Adds "Yank element's text/html/attrs" or "Paste to element" hint mode</description>
    <description lang="ja">要素の text/html/attrs をコピーするヒントモードを追加する</description>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.3</maxVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/hints-yank-paste.js</updateURL>
    <author mail="hotchpotch@gmail.com" homepage="http://d.hatena.ne.jp/secondlife/">Yuichi Tateno</author>
    <license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
    <version>0.1.1</version>
    <detail><![CDATA[
; の hint モードにおいて、c/C で要素の text / HTML / attributes をクリップボードにコピー(Yank)できるようにするプラグインです。
ソースコードや段落, 画像のURL, input/textarea の値などをさくっとコピーしたり、どこかの部分の HTML 自体をコピりたいなー、という時に活用できます。
また p/P で、input/textarea の要素に、現在のクリップボードの値を貼り付け(pが追加、Pが置換)することができます。エディタで書いた文章をそのまんま追加したい時などに利用できます。

== SETTINGS ==
マップするキーや hint の XPath などは変更できます。

liberator.globalVariables.hints_copy_maps = ['c', 'C', 'p', 'P'];
let g:hints_copy_maps = "c C p P"

例: paste のほうは設定しない
liberator.globalVariables.hints_copy_maps = ['c', 'C', null, null];
let g:hints_copy_maps = "c C <nop> <nop>"

set hintyanktags='//xpath|//xpath2';
set hintpastetags='//xpath|//xpath2';

== MAPPINGS ==
;c :
    Yank hint element's text or attributes.
;C :
    Yank hint element's HTML.
;p :
    Paste(append) to input/textarea.
;P :
    Paste(replace) to input/textarea.

]]></detail>
</VimperatorPlugin>;

(function() {
var p = function(msg) {
    liberator.log(msg, 0);
};

const DEFAULT_MAPS = ['c', 'C', 'p', 'P'];
const DEFAULT_YANK_HINTTAGS = 'h1 h2 h3 h4 h5 h6 pre p ul ol ul/li ol/li blockquote img code input textarea'.
    split(/\s+/).map(function(t) '//' + t).join(' | ');
const TEXT_ATTRS = 'src value href title alt'.split(/\s+/);

const DEFAULT_PASTE_HINTTAGS = '//input[@type="text" or @type="password" or @type="search" or not(@type)] | //textarea';

options.add(["hintyanktags"],
    "XPath string of hintable elements activated by 'hints-yank'",
    "string", DEFAULT_YANK_HINTTAGS);

options.add(["hintpastetags"],
    "XPath string of hintable elements activated by 'hints-paste'",
    "string", DEFAULT_PASTE_HINTTAGS);

let maps = liberator.globalVariables.hints_copy_maps || DEFAULT_MAPS;
if (typeof maps === "string")
  maps = maps.split(/\s+/);

var stripText = function(text) {
    text = text.replace(/^[ \t]+(?:\r\n|[\r\n])|\s+$/m, ''); //mg?
    let matched = text.match(/\r\n|[\r\n]/g);
    if (!matched || matched.length == 1)
        text = text.replace(/^\s+/, '');
    return text;
};

if (maps[0]) // c
    hints.addMode(maps[0], 'Yank TEXT', function(elem) {
        let text = elem.textContent;
        if (!text)
            TEXT_ATTRS.some(function(attr)
                (text = elem[attr]) ? true : false);

        util.copyToClipboard(stripText(text), true);
    }, function() options['hintyanktags']);

if (maps[1]) // C
    hints.addMode(maps[1], 'Yank HTML', function(elem) {
        elem = elem.cloneNode(true);
        let tmp = window.content.document.createElement('div');
        tmp.appendChild(elem);
        util.copyToClipboard(tmp.innerHTML, true);
    }, function() options['hintyanktags']);

var replaceOrAppend = function(replace) {
    return function(elem) {
        let clipboard = util.readFromClipboard();
        if (clipboard && clipboard.length) {
            if (elem.tagName.toUpperCase() == 'INPUT')
                clipboard.replace(/\r\n|[\r\n]/g, ' ');

            if (replace) {
                elem.value = clipboard;
            } else {
                elem.value += clipboard;
            }
        }
    };
};

if (maps[2]) // p
    hints.addMode(maps[2], 'Paste text (append)', replaceOrAppend(false), function() options['hintpastetags']);

if (maps[3]) // P
    hints.addMode(maps[3], 'Paste text (replace)', replaceOrAppend(true), function() options['hintpastetags']);

})();

