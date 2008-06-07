/**
 * ==VimperatorPlugin==
 * @name    Split Browser for Vimperator
 * @author  teramako <teramako@gmail.com>
 * @version 1.1a
 * @depend  "Split Browser" {29c4afe1-db19-4298-8785-fcc94d1d6c1d}
 * ==/VimperatorPlugin==
 *
 * Usage:
 *
 * ----------------------------
 * Commands
 * ----------------------------
 * :sp[lit] [arg1], [arg2], ... [destination]
 *          split horizontal and open [arg1]
 *          opens [arg2] ... to background tab, if [arg2] ... is applied
 *          [destination] is -top, if omitted
 *
 * :vs[plit] [arg1], [arg2], ... [destination]
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

/*
var origGetBrowser = getBrowser;

getBrowser = function(){
    return SplitBrowser.activeBrowser;
};
*/
function getPositionForOpen(args){
    var p = null;
    if (!args || args.length == 0) return p;
    for (var i=0; i<args.length; i++){
        switch (args[i][0]){
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

/* ----------------------------------------------
 * Commands
 * --------------------------------------------*/
liberator.commands.addUserCommand(['sp[lit]'], 'split browser', //{{{
	function(args){ liberator.plugins.splitBrowser.openSubBrowser(args, SplitBrowser.POSITION_TOP); },
    { completer: function(filter) liberator.completion.url(filter) }
); //}}}
liberator.commands.addUserCommand(['vs[plit]'], 'split browser', //{{{
	function(args){ liberator.plugins.splitBrowser.openSubBrowser(args, SplitBrowser.POSITION_RIGHT); },
	{ completer: function(filter) liberator.completion.url(filter) }
); //}}}
liberator.commands.addUserCommand(['on[ly]'], 'Close or gather all subbrowsers', //{{{
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
liberator.mappings.addUserMap([liberator.modes.NORMAL],['s'], 'SplitBrowser motion  Map', //{{{
    function(key, count){
        gBrowser = SplitBrowser.activeBrowser;
        try {
            var map = liberator.mappings.get(liberator.modes.NORMAL, key)
            map.execute(null, count);
        } catch(e) {
            liberator.log(e);
        } finally {
            gBrowser = document.getElementById('content');
        }
    },{
        flags: liberator.Mappings.flags.MOTION + liberator.Mappings.flags.COUNT
    }
);
//}}}
liberator.mappings.addUserMap([liberator.modes.NORMAL], ['<C-w>'], 'select subbrowser', //{{{
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
            case '<C-v>':
                liberator.plugins.splitBrowser.openSubBrowser(liberator.buffer.URL,SplitBrowser.POSITION_RIGHT);
                break;
            case '<C-s>':
                liberator.plugins.splitBrowser.openSubBrowser(liberator.buffer.URL,SplitBrowser.POSITION_TOP);
                break;
        }
	},{ flags: liberator.Mappings.flags.COUNT + liberator.Mappings.flags.ARGUMENT }
); //}}}

/**
 * Overwrite liberator.open for SplitBrowser
 * @see liberator.js::vimperaotr.open
 */
liberator.open = function(urls, where){ //{{{
	if (typeof urls == 'string') urls = liberator.util.stringToURLArray(urls);
	if (urls.length == 0) return false;
    if (liberator.forceNewTab && liberator.has("tabs")){
        where = liberator.NEW_TAB;
    } else if (!where || !liberator.has("tabs")){
        where = liberator.CURRENT_TAB;
    }
	var url = typeof urls[0] == 'string' ? urls[0] : urls[0][0];
	var postdata = typeof urls[0] == 'string' ? null : urls[0][1];
	var whichwindow = window;
	var activeBrowser = SplitBrowser.activeBrowser;

	switch (where) {
		case liberator.CURRENT_TAB:
			activeBrowser.loadURIWithFlags(url, null, null, null, postdata);
			break;
		case liberator.NEW_TAB:
			var firsttab = activeBrowser.addTab(url, null, null, postdata);
			activeBrowser.selectedTab = firsttab;
			break;
		case liberator.NEW_BACKGROUND_TAB:
			activeBrowser.addTab(url, null, null, postdata);
			break;
		case liberator.NEW_WINDOW:
			window.open();
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			                   .getService(Components.interfaces.nsIWindowMediator);
			whichwindow = vm.getMostRecentWindow('navigator:browser');
			whichwindow.loadURI(url, null, postdata);
			break;
		default:
			liberator.echoerr("Exxx: Invalid 'where' directive in liberator.open(...)");
			return false;
	}
    if (!liberator.has("tabs")) return true;

	for (var i=1, l=urls.length; i < l; i++){
		url = typeof urls[i] == 'string' ? urls[i] : urls[i][0];
		postdata = typeof urls[i] == 'string' ? null : urls[i][1];
		whichwindow.SplitBrowser.activeBrowser.addTab(url, null, null, postdata);
	}
    return true;
}; //}}}

var manager = {
    splitBrowserId: SplitBrowserAppID,
    args: [ [['-l','-left'],   liberator.commands.OPTION_NOARG],
            [['-r','-right'],  liberator.commands.OPTION_NOARG],
            [['-t','-top'],    liberator.commands.OPTION_NOARG],
            [['-b','-bottom'], liberator.commands.OPTION_NOARG] ],
    get gBrowser(){
        return origGetBrowser();
    },
    /**
     * create new subBrowser and load url
     * @param {String} args command aruguments
     * @param {Number} defPosition default split direction
     */
    openSubBrowser: function(args, defPosition){
        var url;
        var urls = [];
        var position = defPosition || SplitBrowser.POSITION_TOP;
        if (args){
            var res = liberator.commands.parseArgs(args, this.args);
            position = getPositionForOpen(res.opts) || position;
            if (res.args.length > 0){
                liberator.log(res.args);
                urls = liberator.util.stringToURLArray(res.args.join(' '));
                liberator.log(urls);
                if (urls.length == 0) {
                    url = liberator.buffer.URL;
                } else {
                    url = urls[0];
                    urls.shift();
                }
            } else {
                url = liberator.buffer.URL;
            }
        } else {
            url = liberator.buffer.URL;
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

// vim: set fdm=marker sw=4 ts=4 et:
