/**
 * ==VimperatorPlugin==
 * @name           feedSomeKeys
 * @description    feed some defined key events into the Web content
 * @description-ja 定義したkeyイベントをWebページ側へ送ってあげます
 * @author         teramako teramako@gmail.com
 * @version        0.1a
 * ==/VimperatorPlugin==
 *
 * 英語での説明を放棄する
 *
 * keyイベント(正確にはkepressイベント)をWebコンテンツ側へ送る事を可能にするプラグイン
 * Gmailとかlivedoor ReaderとかGreasemonkeyでキーを割り当てている場合に活躍するでしょう。
 * それ以外の場面ではむしろ邪魔になる諸刃の剣
 *
 * :f[eed]map lhs           -> lhsのキーマップをそのままWebコンテンツへ
 * :f[eed]map lhs [num]rhs  -> lhsのキーマップをrhsへ変換してWebコンテンツへ
 *                             [num]はフレームの番号(省略時はトップウィンドウへイベントが送られる)
 *
 * :fmapc
 * :feedmapclear            -> 全てを無に帰して元に戻す
 *
 * :f[eed]map! lhs          -> "!" をつけると、仮想キーコードでイベントを送るように
 *
 * == LDR の場合 ==
js <<EOF
autocommands.add('PageLoad,TabSelect',/reader\.livedoor\.com\/reader\//,
  'js plugins.feedKey.setup("j k s a p o v c <Space> <S-Space> z b < >".split(/ +/));');
EOF
 * とかやると幸せになれるかも。
 *
 * == Gmail の場合 ==
js <<EOF
autocommands.add('PageLoad,TabSelect',/mail\.google\.com\/mail/,[
  'js plugins.feedKey.setup(',
  '"c / j k n p o u e x s r a # [ ] z ? gi gs gt gd ga gc".split(/ +/).map(function(i) [i, "3" + i])',
  ');'
].join(''));
EOF
 * とかやると幸せになれるかもしれません。
 * 頭についている3の意味は3番目のフレームの意味。通常のmapと違い3回の意味ではないので注意
 *
 * Greasemonkey LDRizeの場合などにも使用可
 *
 * ※ 2008/11/1 に fmaps コマンドを追加
 *
 * .vimperatorrc に以下を追加することで、上記と同様のことができます。
 * == LDR の場合 ==
autocmd LocationChange http://reader\\.livedoor\\.com/reader fmaps j k s a p o v c <Space> <S-Space> z b < >
 * == Gmail の場合 ==
autocmd LocationChange mail\\.google\\.com/mail fmaps -d 4 c / j k n p o u e x s r a # [ ] z ? gi gs gt gd ga gc
 *
 */

liberator.plugins.feedKey = (function(){
var origMaps = [];
var feedMaps = [];

// keyTableの再定義...ひどく不毛...
const keyTable = [
    [ KeyEvent.DOM_VK_BACK_SPACE, ["BS"] ],
    [ KeyEvent.DOM_VK_TAB, ["Tab"] ],
    [ KeyEvent.DOM_VK_RETURN, ["Return", "CR", "Enter"] ],
    //[ KeyEvent.DOM_VK_ENTER, ["Enter"] ],
    [ KeyEvent.DOM_VK_ESCAPE, ["Esc", "Escape"] ],
    [ KeyEvent.DOM_VK_SPACE, ["Spc", "Space"] ],
    [ KeyEvent.DOM_VK_PAGE_UP, ["PageUp"] ],
    [ KeyEvent.DOM_VK_PAGE_DOWN, ["PageDown"] ],
    [ KeyEvent.DOM_VK_END, ["End"] ],
    [ KeyEvent.DOM_VK_HOME, ["Home"] ],
    [ KeyEvent.DOM_VK_LEFT, ["Left"] ],
    [ KeyEvent.DOM_VK_UP, ["Up"] ],
    [ KeyEvent.DOM_VK_RIGHT, ["Right"] ],
    [ KeyEvent.DOM_VK_DOWN, ["Down"] ],
    [ KeyEvent.DOM_VK_INSERT, ["Ins", "Insert"] ],
    [ KeyEvent.DOM_VK_DELETE, ["Del", "Delete"] ],
    [ KeyEvent.DOM_VK_F1, ["F1"] ],
    [ KeyEvent.DOM_VK_F2, ["F2"] ],
    [ KeyEvent.DOM_VK_F3, ["F3"] ],
    [ KeyEvent.DOM_VK_F4, ["F4"] ],
    [ KeyEvent.DOM_VK_F5, ["F5"] ],
    [ KeyEvent.DOM_VK_F6, ["F6"] ],
    [ KeyEvent.DOM_VK_F7, ["F7"] ],
    [ KeyEvent.DOM_VK_F8, ["F8"] ],
    [ KeyEvent.DOM_VK_F9, ["F9"] ],
    [ KeyEvent.DOM_VK_F10, ["F10"] ],
    [ KeyEvent.DOM_VK_F11, ["F11"] ],
    [ KeyEvent.DOM_VK_F12, ["F12"] ],
    [ KeyEvent.DOM_VK_F13, ["F13"] ],
    [ KeyEvent.DOM_VK_F14, ["F14"] ],
    [ KeyEvent.DOM_VK_F15, ["F15"] ],
    [ KeyEvent.DOM_VK_F16, ["F16"] ],
    [ KeyEvent.DOM_VK_F17, ["F17"] ],
    [ KeyEvent.DOM_VK_F18, ["F18"] ],
    [ KeyEvent.DOM_VK_F19, ["F19"] ],
    [ KeyEvent.DOM_VK_F20, ["F20"] ],
    [ KeyEvent.DOM_VK_F21, ["F21"] ],
    [ KeyEvent.DOM_VK_F22, ["F22"] ],
    [ KeyEvent.DOM_VK_F23, ["F23"] ],
    [ KeyEvent.DOM_VK_F24, ["F24"] ],
];
const vkeyTable = [
    [ KeyEvent.DOM_VK_0, ['0'] ],
    [ KeyEvent.DOM_VK_1, ['1'] ],
    [ KeyEvent.DOM_VK_2, ['2'] ],
    [ KeyEvent.DOM_VK_3, ['3'] ],
    [ KeyEvent.DOM_VK_4, ['4'] ],
    [ KeyEvent.DOM_VK_5, ['5'] ],
    [ KeyEvent.DOM_VK_6, ['6'] ],
    [ KeyEvent.DOM_VK_7, ['7'] ],
    [ KeyEvent.DOM_VK_8, ['8'] ],
    [ KeyEvent.DOM_VK_9, ['9'] ],
    [ KeyEvent.DOM_VK_SEMICOLON, [';'] ],
    [ KeyEvent.DOM_VK_EQUALS, ['='] ],
    [ KeyEvent.DOM_VK_A, ['a'] ],
    [ KeyEvent.DOM_VK_B, ['b'] ],
    [ KeyEvent.DOM_VK_C, ['c'] ],
    [ KeyEvent.DOM_VK_D, ['d'] ],
    [ KeyEvent.DOM_VK_E, ['e'] ],
    [ KeyEvent.DOM_VK_F, ['f'] ],
    [ KeyEvent.DOM_VK_G, ['g'] ],
    [ KeyEvent.DOM_VK_H, ['h'] ],
    [ KeyEvent.DOM_VK_I, ['i'] ],
    [ KeyEvent.DOM_VK_J, ['j'] ],
    [ KeyEvent.DOM_VK_K, ['k'] ],
    [ KeyEvent.DOM_VK_L, ['l'] ],
    [ KeyEvent.DOM_VK_M, ['m'] ],
    [ KeyEvent.DOM_VK_N, ['n'] ],
    [ KeyEvent.DOM_VK_O, ['o'] ],
    [ KeyEvent.DOM_VK_P, ['p'] ],
    [ KeyEvent.DOM_VK_Q, ['q'] ],
    [ KeyEvent.DOM_VK_R, ['r'] ],
    [ KeyEvent.DOM_VK_S, ['s'] ],
    [ KeyEvent.DOM_VK_T, ['t'] ],
    [ KeyEvent.DOM_VK_U, ['u'] ],
    [ KeyEvent.DOM_VK_V, ['v'] ],
    [ KeyEvent.DOM_VK_W, ['w'] ],
    [ KeyEvent.DOM_VK_X, ['x'] ],
    [ KeyEvent.DOM_VK_Y, ['y'] ],
    [ KeyEvent.DOM_VK_Z, ['z'] ],
    [ KeyEvent.DOM_VK_MULTIPLY, ['*'] ],
    [ KeyEvent.DOM_VK_ADD, ['+'] ],
    [ KeyEvent.DOM_VK_SUBTRACT, ['-'] ],
    [ KeyEvent.DOM_VK_COMMA, [','] ],
    [ KeyEvent.DOM_VK_PERIOD, ['.'] ],
    [ KeyEvent.DOM_VK_SLASH, ['/'] ],
    [ KeyEvent.DOM_VK_BACK_QUOTE, ['`'] ],
    [ KeyEvent.DOM_VK_OPEN_BRACKET, ['{'] ],
    [ KeyEvent.DOM_VK_BACK_SLASH, ['\\'] ],
    [ KeyEvent.DOM_VK_CLOSE_BRACKET, ['}'] ],
    [ KeyEvent.DOM_VK_QUOTE, ["'"] ],
];

function getKeyCode(str, vkey) {
    str = str.toLowerCase();
    var ret = 0;
    (vkey ? vkeyTable : keyTable).some(function(i) i[1].some(function(k) k.toLowerCase() == str && (ret = i[0])));
    return ret;
}
function init(keys, useVkey){
    destroy();
    keys.forEach(function(key){
        var origKey, feedKey;
        if (key instanceof Array){
            [origKey, feedKey] = key;
        } else if (typeof(key) == 'string'){
            [origKey, feedKey] = [key,key];
        }
        replaceUserMap(origKey, feedKey, useVkey);
    });
}
function replaceUserMap(origKey, feedKey, useVkey){
    if (mappings.hasMap(modes.NORMAL, origKey)){
        var origMap = mappings.get(modes.NORMAL,origKey);
        if (origMap.description.indexOf(origKey+' -> ') != 0) {
            // origMapをそのままpushするとオブジェクト内の参照先を消されてしまう
            // 仕方なく複製を試みる
            var clone = new Map(origMap.modes.map(function(m) m),
                                origMap.names.map(function(n) n),
                                origMap.description,
                                origMap.action,
                                { flags:origMap.flags, rhs:origMap.rhs, noremap:origMap.noremap });
            origMaps.push(clone);
        }
    }
    var map = new Map([modes.NORMAL], [origKey], origKey + ' -> ' + feedKey,
        function(count){
            count = count > 1 ? count : 1;
            for (var i=0; i<count; i++){
                feedKeyIntoContent(feedKey, useVkey);
            }
        }, { flags:Mappings.flags.COUNT, rhs:feedKey, noremap:true });
    addUserMap(map);
    if (feedMaps.some(function(fmap){
        if (fmap.names[0] != origKey) return false;
        for (var key in fmap) fmap[key] = map[key];
        return true;
    })) return;
    feedMaps.push(map);
}
function destroy(){
    try{
        feedMaps.forEach(function(map){
            mappings.remove(map.modes[0],map.names[0]);
        });
    }catch(e){ log(map); }
    origMaps.forEach(function(map){
        addUserMap(map);
    });
    origMaps = [];
    feedMaps = [];
}
function addUserMap(map){
    mappings.addUserMap(map.modes, map.names, map.description, map.action, { flags:map.flags,noremap:map.noremap,rhs:map.rhs });
}
function parseKeys(keys){
    var matches = /^\d+(?=\D)/.exec(keys);
    if (matches){
        var num = parseInt(matches[0],10);
        if (!isNaN(num)) return [keys.substr(matches[0].length), num];
    }
    return [keys, 0];
}
function getDestinationElement(frameNum){
    var root = document.commandDispatcher.focusedWindow;
    if (frameNum > 0){
        var frames = [];
        (function(frame){// @see liberator.buffer.shiftFrameFocus
            if (frame.document.body.localName.toLowerCase() == 'body') {
                frames.push(frame);
            }
            for (var i=0; i<frame.frames.length; i++){
                arguments.callee(frame.frames[i]);
            }
        })(window.content);
        frames = frames.filter(function(frame){
            frame.focus();
            if (document.commandDispatcher.focusedWindow == frame) return frame;
        });
        if (frames[frameNum]) return frames[frameNum];
    }
    return root;
}
function feedKeyIntoContent(keys, useVkey){
    var frameNum = 0;
    [keys, frameNum] = parseKeys(keys);
    var destElem = getDestinationElement(frameNum);
    destElem.focus();
    modes.passAllKeys = true;
    modes.passNextKey = false;
    for (var i=0; i<keys.length; i++){
        var keyCode;
        var shift = false, ctrl = false, alt = false, meta = false;
        if (useVkey && (keyCode = getKeyCode(keys[i], true))) {
            var charCode = 0;
        } else {
            var charCode = keys.charCodeAt(i);
            keyCode = 0;
        }
        if (keys[i] == '<'){ 
            var matches = keys.substr(i + 1).match(/^((?:[ACMSacms]-)*)([^>]+)/);
            if (matches) {
                if (matches[1]) {
                    ctrl  = /[cC]-/.test(matches[1]);
                    alt   = /[aA]-/.test(matches[1]);
                    shift = /[sS]-/.test(matches[1]);
                    meta  = /[mM]-/.test(matches[1]);
                }
                if (matches[2].length == 1) {
                    if (!ctrl && !alt && !shift && !meta) return false;
                    if (useVkey && (keyCode = getKeyCode(matches[2], true))) {
                        charCode = 0;
                    } else {
                        charCode = matches[2].charCodeAt(0);
                    }
                } else if (matches[2].toLowerCase() == "space") {
                    if (useVkey) {
                        charCode = 0;
                        keyCode = KeyEvent.DOM_VK_SPACE;
                    } else {
                        charCode = KeyEvent.DOM_VK_SPACE;
                    }
                } else if (keyCode = getKeyCode(matches[2])) {
                    charCode = 0;
                } else  {
                    return false;
                }
                i += matches[0].length + 1;
            }
        } else  {
            shift = (keys[i] >= "A" && keys[i] <= "Z");
        }

        //liberator.log({ctrl:ctrl, alt:alt, shift:shift, meta:meta, keyCode:keyCode, charCode:charCode, useVkey: useVkey});
        var evt = content.document.createEvent('KeyEvents');
        evt.initKeyEvent('keypress', true, true, content, ctrl, alt, shift, meta, keyCode, charCode);
        destElem.document.dispatchEvent(evt);
    }
    modes.passAllKeys = false;
}

// --------------------------
// Command
// --------------------------
commands.addUserCommand(['feedmap','fmap'],'Feed Map a key sequence',
    function(args, bang){
        var arg = args.string == undefined ? args: args.string;
        if(!arg){
            liberator.echo(feedMaps.map(function(map) map.description.replace(/</g,'&lt;').replace(/>/g,'&gt;')),true);
            return;
        }
        var [ ,lhs,rhs] = arg.match(/(\S+)(?:\s+(.+))?/);
        if (!rhs){
            replaceUserMap(lhs,lhs,bang);
        } else {
            replaceUserMap(lhs,rhs,bang);
        }
    },{
        bang: true
    }
);
commands.addUserCommand(['feedmapclear','fmapc'],'Clear Feed Maps',destroy);
var converter = {
    get origMap() origMaps,
    get feedMap() feedMaps,
    setup: init,
    reset: destroy
};
commands.addUserCommand(['feedmaps','fmaps'], '',
  function(args, bang){
    var feedkey = args["-depth"];
    var vkey = '-vkey' in args ? true: false;
    var keys = args.arguments;
    if ('-' in args) keys.push('-');
    
    if (feedkey) keys = keys.map( function(i) [i, (feedkey+"")+i] );
    liberator.plugins.feedKey.setup(keys, vkey);
  }, {
    bang : true,
    argCount : "*",
    options : [ [['-depth', '-d'], commands.OPTION_INT],
                [['-vkey', '-v'], commands.OPTION_NOARG],
                [['-'], commands.OPTION_NOARG ] 
              ]
  }
);
return converter;
})();
// vim: fdm=marker sw=4 ts=4 et:
