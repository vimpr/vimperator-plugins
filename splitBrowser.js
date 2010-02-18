/**
 * ==VimperatorPlugin==
 * @name    Split Browser for Vimperator
 * @author  teramako <teramako@gmail.com>
 * @version 1.1b
 * @depend  "Split Browser" {29c4afe1-db19-4298-8785-fcc94d1d6c1d}
 * ==/VimperatorPlugin==
 *
 * CAUTION:
 *  It's need "SplitBrowser" addon.
 *  Please install from
 *      - https://addons.mozilla.org/en-US/firefox/addon/4287
 *      or
 *      - https://addons.mozilla.org/ja/firefox/addon/4287
 *
 * Usage:
 *
 * ----------------------------
 * Commands
 * ----------------------------
 * :sp[lit] [arg1] [arg2] ... [destination]
 *          split horizontal and open [arg1]
 *          opens [arg2] ... to background tab, if [arg2] ... is applied
 *          [destination] is -top, if omitted
 *
 * :vs[plit] [arg1] [arg2] ... [destination]
 *          like sp[lit] command
 *          but [destination] is -right, if omitted
 *
 *  available [destination]
 *  -l or -left
 *  -r or -right
 *  -t or -top
 *  -b or -bottom
 *
 *  :on[ly] [-g]
 *          Close all subbrowsers
 *          or
 *          Gather all subbrowsers to main browser if `-g' option is applied
 *
 *  --------------------------
 *  Mappings
 *  --------------------------
 *  <C-w><C-w>   -> focus next browser
 *  <C-w>0       -> focus main browser
 *  <C-w>$       -> focus the last opened subbrowser
 *  <C-w><C-v>   -> virtical split
 *  <C-w><C-s>   -> horizontal split
 *  <C-w>d       -> close tab or subbrowser
 *  
 *  s[maps] -> [maps] is some nomral map names
 *  e.g.)
 *  sd           -> remove current tab
 *  sgt          -> switch focus to the next tab
 *  sgT          -> switch focus to the previous tab
 */

(function(){


const SplitBrowserAppID = '{29c4afe1-db19-4298-8785-fcc94d1d6c1d}';
if (!Application.extensions.get(SplitBrowserAppID).enabled) return;

liberator.plugins.splitBrowser = (function(){

function getPositionForOpen(obj){
    var p = null;
    for (var i in obj){
        switch (i){
            case '-l': p = SplitBrowser.POSITION_LEFT; break;
            case '-r': p = SplitBrowser.POSITION_RIGHT; break;
            case '-t': p = SplitBrowser.POSITION_TOP; break;
            case '-b': p = SplitBrowser.POSITION_BOTTOM; break;
        }
    }
    return p;
}

function focusSwitch(where, isAbsolute){ //{{{
    if (SplitBrowser.browsers.length == 0) return;
    var bs = SplitBrowser.browsers;
    if (isAbsolute && bs[key-1]){
        bs[key-1].browser.contentWindow.focus();
    } else if (where == 0){
        getBrowser().contentWindow.focus();
    } else if (where == '$'){
        bs[bs.length-1].browser.contentWindow.focus();
    } else if (/^[-+]?[0-9]+$/.test(where)){
        var length = bs.length;
        var count = parseInt(where,10) % (length + 1);
        if (SplitBrowser.activeBrowser == getBrowser()){
            if (count > 0){
                bs[count-1].browser.contentWindow.focus();
            } else if (count < 0){
                bs[length + count].browser.contentWindow.focus();
            } else {
                return;
            }
        } else {
            var id = SplitBrowser.activeSubBrowser.id;
            for (var i=0; i<length; i++){
                if (bs[i].id == id){
                    count = (count + i + 1) % (length + 1);
                    if (count > 0){
                        bs[count-1].browser.contentWindow.focus();
                    } else if (count < 0){
                        bs[length + count].browser.contentWindow.focus();
                    } else {
                        getBrowser().contentWindow.focus();
                    }
                    return true;
                }
            }
        }
    }
} //}}}

var commandExtra = {
    completer: function(filter) completion.url(filter),
    options: [ [['-l','-left'],   commands.OPTION_NOARG],
               [['-r','-right'],  commands.OPTION_NOARG],
               [['-t','-top'],    commands.OPTION_NOARG],
               [['-b','-bottom'], commands.OPTION_NOARG] ],
    argCount: "*"
};

/* ----------------------------------------------
 * Commands
 * --------------------------------------------*/
commands.addUserCommand(['sp[lit]'], 'split browser', //{{{
    function(args){ liberator.plugins.splitBrowser.openSubBrowser(args, SplitBrowser.POSITION_TOP); },
    commandExtra
); //}}}
commands.addUserCommand(['vs[plit]'], 'split browser', //{{{
    function(args){ liberator.plugins.splitBrowser.openSubBrowser(args, SplitBrowser.POSITION_RIGHT); },
    commandExtra
); //}}}
commands.addUserCommand(['on[ly]'], 'Close or gather all subbrowsers', //{{{
    function(args){
        if (SplitBrowser.browsers.length == 0) {
            liberator.echoerr('SubBrowser is none');
            return;
        }
        if (args == '-g') {
            SplitBrowser.gatherSubBrowsers();
        } else {
            SplitBrowser.removeAllSubBrowsers();
        }
  }
); //}}}

/* ----------------------------------------------
 * Mappings
 * --------------------------------------------*/
mappings.addUserMap([modes.NORMAL],['s'], 'SplitBrowser motion  Map', //{{{
    function(key, count){
        gBrowser = SplitBrowser.activeBrowser;
        try {
            var map = mappings.get(modes.NORMAL, key)
            map.execute(null, count);
        } catch(e) {
            liberator.log(e);
        } finally {
            gBrowser = document.getElementById('content');
        }
    },{
        motion: true,
        count: true,
        rhs: 'Motion map for SplitBrowser'
    }
);
//}}}
mappings.addUserMap([modes.NORMAL], ['<C-w>'], 'select subbrowser', //{{{
    function(count, key){
        if (/[1-9]/.test(key)){
            focusSwitch(parseInt(key), true);
            return;
        }
        switch (key){
            case '0':
            case '$':
                focusSwitch(key);
                break;
            case 'h': //FIXME: How to get subbrowser of relative position ?
            case 'j':
            case '<C-w>':
            case 'w':
                focusSwitch(count > 0 ? count : 1);
                break;
            case 'k':
            case 'l':
            case 'W':
                forcusSwitch('-' + (count > 0 ? count : 1));
                break;
            case 'd':
                liberator.plugins.splitBrowser.closeSubBrowser();
                break;
            case 'v':
            case '<C-v>':
                liberator.plugins.splitBrowser.openSubBrowser([buffer.URL],SplitBrowser.POSITION_RIGHT);
                break;
            case 's':
            case '<C-s>':
                liberator.plugins.splitBrowser.openSubBrowser([buffer.URL],SplitBrowser.POSITION_TOP);
                break;
        }
    },{
        //flags: Mappings.flags.COUNT + Mappings.flags.ARGUMENT,
        count: true,
        arg: true,
        rhs: 'select subbrowser'
    }
); //}}}

/**
 * Overwrite for SplitBrowser
 */
config.__defineGetter__('browser', function () SplitBrowser.activeBrowser);
config.__defineGetter__('tabbrowser', function () SplitBrowser.activeBrowser);

var manager = {
    splitBrowserId: SplitBrowserAppID,
    /**
     * create new subBrowser and load url
     * @param {Object} args command aruguments
     * @param {Number} defPosition default split direction
     */
    openSubBrowser: function(args, defPosition){
        var url;
        var urls = [];
        var position = defPosition || SplitBrowser.POSITION_TOP;
        position = getPositionForOpen(args) || position;
        if (args.length > 0){
            urls = util.stringToURLArray(args.join(', '));
            if (urls.length == 0) {
                url = buffer.URL;
            } else {
                url = urls[0];
                urls.shift();
            }
        } else {
            url = buffer.URL;
        }
        var subBrowser = SplitBrowser.addSubBrowser(url, null, position);
        subBrowser.addEventListener('load',function(){
            subBrowser.removeEventListener('load',arguments.callee,true);
            subBrowser.browser.contentWindow.focus();
        },true);
        urls.forEach(function(url){
            subBrowser.browser.addTab(url, null, null, null);
        });
        return subBrowser;
    },
    closeSubBrowser: function(){
        var b = SplitBrowser.activeBrowser;
        if (b.mTabs.length > 1){
            b.removeTab(b.mCurrentTab);
        } else {
            if (b === getBrowser()){
                liberator.open('about:blank', liberator.NEW_BACKGROUND_TAB);
                getBrowser().removeTab(gBrowser.mCurrentTab);
            } else {
                SplitBrowser.activeBrowserCloseWindow();
            }
        }
    }
};
return manager;
})();


})();

// vim:fdm=marker sw=4 ts=4 et:
