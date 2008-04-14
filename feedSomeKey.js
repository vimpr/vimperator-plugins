/**
 * ==VimperatorPlugin==
 * @name           feedSomeKey
 * @description    feed some defined key events into the Web content
 * @description-ja 定義したkeyイベントをWebページ側へ送ってあげます
 * @author         teramako teramako@gmail.com
 * @version        0.1a
 * ==/VimperatorPlugin==
 *
 * 英語での説明を放棄する
 *
 * keyイベント(正確にはkepressイベント)をWebコンテンツ側へ送る事を可能にするプラグイン
 * GmailとかLivedoor ReaderとかGreasemonkeyでキーを割り当てている場合に活躍するでしょう。
 * それ以外の場面ではむしろ邪魔になる諸刃の剣
 *
 * :f[eed]map lhs           -> lhsのキーマップをそのままWebコンテンツへ
 * :f[eed]map lhs [num]rhs  -> lhsのキーマップをrhsへ変換してWebコンテンツへ
 *                             [num]はフレームの番号(省略時はトップウィンドウへイベントが送られる)
 *
 * :fmapc
 * :feedmapclear            -> 全てを無に帰して元に戻す
 *
 * == LDR の場合 ==
js <<EOF
autocommands.add('PageLoad,TabSelect',/reader\.livedoor\.com\/reader\//,
  'js plugins.feedKey.setup(["j","k","s","a","p","o","v","c","<Space>","<S-Space>","z","b","<",">"]);');
EOF
 * とかやると幸せになれるかも。
 * 
 * == Gmail の場合 ==
js <<EOF
autocommands.add('PageLoad,TabSelect',/mail\.google\.com\/mail/,[
  'js plugins.feedKey.setup([',
  '["c","3c"],["/","3/"],["j","3j"],["k","3k"],["n","3n"],["p","3p"],["o","3o"],["u","3u"],["e","3e"]',
  '["x","3x"],["s","3s"],["r","3r"],["a","3a"],["#","3#"],["[","3["],["]","3]"],["z","3z"],["?","3?"]',
  '["gi","3gi"],["gs","3gs"],["gt","3gt"],["gd","3gd"],["ga","3ga"],["gc","3gc"]',
  ']);'
].join(''));
EOF
 * とかやると幸せになれるかもしれません。
 * 頭についている3の意味は3番目のフレームの意味。通常のmapと違い3回の意味ではないので注意
 *
 * Greasemonkey LDRizeの場合などにも使用可
 */

liberator.plugins.feedKey = (function(){
var origMaps = [];
var feedMaps = [];

// keyTableの再定義...ひどく不毛...
var keyTable = [
    [ KeyEvent.DOM_VK_ESCAPE, ["Esc", "Escape"] ],
    [ KeyEvent.DOM_VK_LEFT_SHIFT, ["<"] ],
    [ KeyEvent.DOM_VK_RIGHT_SHIFT, [">"] ],
    [ KeyEvent.DOM_VK_RETURN, ["Return", "CR", "Enter"] ],
    [ KeyEvent.DOM_VK_TAB, ["Tab"] ],
    [ KeyEvent.DOM_VK_DELETE, ["Del"] ],
    [ KeyEvent.DOM_VK_BACK_SPACE, ["BS"] ],
    [ KeyEvent.DOM_VK_HOME, ["Home"] ],
    [ KeyEvent.DOM_VK_INSERT, ["Insert", "Ins"] ],
    [ KeyEvent.DOM_VK_END, ["End"] ],
    [ KeyEvent.DOM_VK_LEFT, ["Left"] ],
    [ KeyEvent.DOM_VK_RIGHT, ["Right"] ],
    [ KeyEvent.DOM_VK_UP, ["Up"] ],
    [ KeyEvent.DOM_VK_DOWN, ["Down"] ],
    [ KeyEvent.DOM_VK_PAGE_UP, ["PageUp"] ],
    [ KeyEvent.DOM_VK_PAGE_DOWN, ["PageDown"] ],
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
    [ KeyEvent.DOM_VK_F24, ["F24"] ]
];
function getKeyCode(str) {
    str = str.toLowerCase();
    for (var i in keyTable) {
        for (var k in keyTable[i][1]) {
            if (keyTable[i][1][k].toLowerCase() == str) return keyTable[i][0];
        }
    }
    return 0;
}
function init(keys){
    destroy();
    for each(var key in keys){
        var origKey, feedKey;
        if (typeof(key) == 'object'){
            [origKey, feedKey] = [key[0],key[1]];
        } else if (typeof(key) == 'string'){
            [origKey, feedKey] = [key,key];
        }
        replaceUserMap(origKey, feedKey);
    }
}
function replaceUserMap(origKey, feedKey){
    if (mappings.hasMap(modes.NORMAL, origKey)){
        var origMap = mappings.get(modes.NORMAL,origKey);
        if (origMap.description.indexOf(origKey+' -> ') != 0) {
            // origMapをそのままpushするとオブジェクト内の参照先を消されてしまう
            // 仕方なく複製を試みる
            var clone = new Map(origMap.modes.map(function(m){return m;}),
                                origMap.names.map(function(n){return n;}),
                                origMap.description,
                                origMap.action,
                                { flags: origMap.flags, rhs:origMap.rhs, noremap:origMap.noremap });
            origMaps.push(clone);
        }
    }
    var map = new (liberator.Map)([modes.NORMAL], [origKey], origKey + ' -> ' + feedKey,
        function(count){
            count = count > 1 ? count : 1;
            for (var i=0; i<count; i++){
                feedKeyIntoContent(feedKey);
            }
        }, { flags: liberator.Mappings.flags.COUNT, rhs:feedKey, noremap:true });
    addUserMap(map);
    for each(var fmap in feedMaps){
        if (fmap.names[0] == origKey){
            for (var key in fmap) fmap[key] = map[key];
            return;
        }
    }
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
    var matches = keys.match(/^(\d+).+/);
    if (matches){
        var num = parseInt(matches[1],10);
        if (!isNaN(num)) return [keys.substr(matches[1].length), num];
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
function feedKeyIntoContent(keys){
    var frameNum = 0;
    [keys, frameNum] = parseKeys(keys);
    var destElem = getDestinationElement(frameNum);
    destElem.focus();
    modes.passAllKeys = true;
    modes.passNextKey = false;
    for (var i=0; i<keys.length; i++){
        var charCode = keys.charCodeAt(i);
        var keyCode = 0;
        var shift = false, ctrl = false, alt = false, meta = false;
        if (charCode == 60){ // charCode:60 => "<"
            var matches = keys.substr(i + 1).match(/([CSMAcsma]-)*([^>]+)/);
            if (matches && matches[2]) {
                if (matches[1]) {
                    ctrl  = /[cC]-/.test(matches[1]);
                    alt   = /[aA]-/.test(matches[1]);
                    shift = /[sS]-/.test(matches[1]);
                    meta  = /[mM]-/.test(matches[1]);
                }
                if (matches[2].length == 1) {
                    if (!ctrl && !alt && !shift && !meta) return false;
                    charCode = matches[2].charCodeAt(0);
                } else if (matches[2].toLowerCase() == "space") {
                    charCode = 32;
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
    function(args){
        if(!args){
            echo(feedMaps.map(function(map){
                return map.description.replace(/</g,'&lt;').replace(/>/g,'&gt;');
            }),true);
        }
        var [ ,lhs,rhs] = args.match(/(\S+)(?:\s+(.+))?/);
        if (!rhs){
            replaceUserMap(lhs,lhs);
        } else {
            replaceUserMap(lhs,rhs);
        }
    }
);
commands.addUserCommand(['feedmapclear','fmapc'],'Clear Feed Maps',
    function(){
        destroy();
    }
);
var converter = {
    setup: function(keys){
        init(keys);
    },
    get origMap(){
        return origMaps;
    },
    get feedMap(){
        return feedMaps;
    },
    reset: function(){
        destroy();
    }
};
return converter;
})();
// vim: fdm=marker sw=4 ts=4 et:
