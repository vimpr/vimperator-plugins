var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>clear privacy data</description>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<author mail="teramako@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/teramako/">teramako</author>
<license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
<version>0.1</version>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/clear_privacy_data.js</updateURL>
<detail lang="ja"><![CDATA[
== 注意 ==
このプラグインはFirefox 3.1用です。

== Command ==
:clearp[rivacy]:
    既定の設定でプライバシーデータを削除します。

:clearp[rivacy] -l[ist] {itemName}:
    {itemName}のデータを削除します。
    省略すると既定の値が用いられます。
    既定の値は「プライバシー情報の消去」設定で行えます。

    {itemName}:
        cache: Webキャッシュ
        cookies: Cookie
        offlineApps: Webサイトのオフライン作業用データ
        history: 表示したページの履歴
        formdata: フォームと検索エントリーの履歴
        sessions: 現在のログイン情報

:clearp[rivacy] -t[ime] {timeSpan}:
    現在から{timeSpan}分の期間のデータを削除します。
    省略すると既定の値が用いられます。
    既定の値は、about:config にある privacy.sanitize.timeSpan になり、
    0:全て,1:1時間以内,2:2時間以内,3:4時間以内,4:今日 となっています。

    期間内指定で有効なのは
        + cookies
        + history
    のみで、それ以外は指定にかかわらず全て削除されます。

    {timeSpan} format:
        数値m数値d数値h
            - m は30日
            - d は日数
            - h は時間
        で 1m2d3h は 32日と3時間 という意味になり、現在から32日と3時間前までのデータを削除します。

]]></detail>
</VimperatorPlugin>;
liberator.plugins.privacySanitizer = (function(){

var isFx31 = (Application.version.substring(0, 3) == "3.1") 
var prefPrefix = isFx31 ? "privacy.cpd." : "privacy.item.";

var privacyManager = { // {{{
    cache: {
        clear: function(){
            var cacheService = Cc["@mozilla.org/network/cache-service;1"].getService(Ci.nsICacheService);
            try {
                getCacheService.evictEntries(Ci.nsICache.STORE_ANYWHERE);
            } catch (er){}
        },
        getPref: function() options.getPref(prefPrefix + "cache")
    },
    cookies: {
        clear: function(range){
            var cookieMgr = Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager);
            if (range){
                let cookiesEnum = cookieMgr.enumrator;
                while (cookiesEnum.hasMoreElements()){
                    let cookie = cookiesEnum.getNext().QueryInterface(Ci.nsICookie2);
                    if (cookie.creationTime > this.range[0])
                        cookieMgr.remove(cookie.host, cookie.name, cookie.path, false);
                }
            } else {
                cookieMgr.removeAll();
            }
        },
        getPref: function() options.getPref(prefPrefix + "cookies")
    },
    offlineApps: {
        clear: function(){
            var cacheService = Cc["@mozilla.org/network/cache-service;1"].getService(Ci.nsICacheService);
            try {
                cacheService.evictEntries(Ci.nsICache.STORE_OFFLINE);
            } catch(er){}

            var storageManagerService = Cc["@mozilla.org/dom/storagemanager;1"].getService(Ci.nsIDOMStorageManager);
            storageManagerService.clearOfflineApps();
        },
        getPref: function() options.getPref(prefPrefix + "offlineApps")
    },
    history: {
        clear: function(range){
            var globalHistory = Cc["@mozilla.org/browser/global-history;2"].getService(Ci.nsIBrowserHistory);
            if (range)
                globalHistory.removePageByTimeframe(range[0], range[1]);
            else
                globalHistory.removeAllPages();

            try {
                let os = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
                os.notifyObservers(null, "browser:purge-session-history", "");
            } catch(e){}
            var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch2);
            try {
                prefs.clearUserPref("general.open_location.last_url");
            } catch(er){}
        },
        getPref: function() options.getPref(prefPrefix + "history")
    },
    formdata: {
        clear: function(range){
            var windowManager = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
            var windows = windowManager.getEnumerator("navigator:browser");
            while (windows.hasMoreElements()){
                let searchBar = windows.getNext().document.getElementById("searchbar");
                if (searchBar){
                    searchBar.value = "";
                    searchBar.textbox.editor.transactionManager.clear();
                }
            }
            var formHistory = Cc["@mozilla.org/satchel/form-history;1"].getService(Ci.nsIFormHistory2);
            if (range)
                formHistory.removeEntriesByTimeframe(range[0], range[1]);
            else
                formHistory.removeAllEntries();
        },
        getPref: function() options.getPref(prefPrefix + "formdata")
    },
    downloads: {
        clear: function(range){
            var dlMgr = Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager);
            let dlIDsRemove = [];
            if (range){
                dlMgr.removeDownloadsByTimeframe(range[0], range[1]);
                let dlsEnum = dlMgr.activeDownloads;
                while (dlsEnum.hasMoreElements()){
                    let dl = dlsEnum.next();
                    if (dl.startTime >= range[0])
                        dlIDsRemove.push(dl.id);
                }
            } else {
                dlMgr.cleanUp();
                let dlsEnum = dlMgr.activeDownloads;
                while (dlsEnum.hasMoreElements()){
                    dlIDsRemove.push(dlsEnum.next().id)
                }
            }
            dlIDsRemove.forEach(function(id) {
                dlMgr.removeDownload(id);
            });
        },
        getPref: function() options.getPref(prefPrefix + "downloads")
    },
    sessions: {
        clear: function(){
            var sdr = Cc["@mozilla.org/security/sdr;1"].getService(Ci.nsISecretDecoderRing);
            sdr.logoutAndTeardown();
            var authMgr = Cc["@mozilla.org/network/http-auth-manager;1"].getService(Ci.nsIHttpAuthManager);
            authMgr.clearAll();
        },
        getPref: function() options.getPref(prefPrefix + "sessions")
    }
}; // }}}

function getDefaultClearList(){
    var list = [];
    for (let name in privacyManager){
        if (privacyManager[name].getPref())
            list.push(name);
    }
    return list;
}
function getTimeRange(ts, isPref){
    var endDate = Date.now() * 1000;
    var startDate;
    if (isPref){
        if (ts == 0) return null;
        switch (ts){
            case 1:
            case 2:
                startDate = endDate - (ts*60*60*1000000);
                break;
            case 3:
                startDate = endDate - (4*60*60*1000000);
                break;
            case 4:
                let d = new Date();
                d.setHours(0);
                d.setMinutes(0);
                d.setSeconds(0);
                startDate = d.valueof() * 1000;
                break;
            default:
                throw "Invalid time span for clear private data: " + ts;
        }
    } else {
        startDate = endDate - parseTime(ts);
    }
    return [startDate, endDate];

}
// TODO: かなり適当なので要修正
function parseTime(ts){
    var int = parseInt(ts, 10);
    if (isNaN(int)){
        let matches = ts.match(/^(?:(\d+)m)?(?:(\d+)d)?(?:(\d+)h)?$/);
        let [, month, day, hour] = matches;
        let time = (month ? month * 30 * 24 * 60 * 60 * 1000000 : 0) +
                   (day   ? day   *      24 * 60 * 60 * 1000000 : 0) +
                   (hour  ? hour            * 60 * 60 * 1000000 : 0);
        return time;
    }
    return int * 60 * 60 * 1000000;
}
var ops = [
    [["-list", "-l"], commands.OPTION_LIST, null, [[name, "-"] for (name in privacyManager)]],
];
if (isFx31) ops.push([["-time", "-t"], commands.OPTION_STRING]);

// --------------------------
// Command
// --------------------------
commands.addUserCommand(["clearp[rivacy]"], "Clear Privacy data",
    function(args){
        var clearList = args["-data"] || getDefaultClearList();
        var range = null;
        if (isFx31){
            range = args["-time"] ?
                    getTimeRange(args["-time"], false) :
                    getTimeRange(options.getPref("privacy.sanitize.timeSpan"), true);
        }
        clearList.forEach(function(name) this[name].clear(range), plugins.privacySanitizer);
    }, {
        options: ops,
    },
    true);

return privacyManager;

})();

// vim:sw=4 ts=4 et fdm=marker:
