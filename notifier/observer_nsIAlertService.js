var PLUGIN_INFO =
<VimperatorPlugin>
  <name>{NAME}</name>
  <description>notification using nsIAlertService</description>
  <description lang="ja">nsIAlertServiceを使用したnotifier用通知プラグイン</description>
  <author mail="teramako@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/teramako/">teramako</author>
  <version>0.1</version>
  <license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/notifier/observer_nsIAlertService.js</updateURL>
  <detail><![CDATA[
notifier.js 用の通知プラグイン
OSのプラットフォーム依存の通知なのでプラットフォームによってはうまく動作しない可能性があります。
Mac OSのGrowlが設定されている場合があやしいです。

== 設定値 ==
about:config や :set! コマンドでアラートのポップアップ時間等を変更できます。

alerts.slideIncrement:
  ポップアップ時の上昇/下降量(px) (default: 1)
alerts.slideIncrementTime:
  ポップアップ時の上昇/下降インターバル(millisec.) (default: 10)
alerts.totalOpenTime:
  アラートの表示時間(millisec.) (default: 4000)

== 動作確認済プラットフォーム ==
- Debian/GNU Linux (GNOME)
- Windows XP

== 既知の問題点 ==
- アラートが連続すると重なってしまう
- 稀に左上隅にアラートがあがり消えない
  解決方法:
    以下のコマンドを実行すると消すことが出来ます
    >||
    :js Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("alert:alert").close()
    ||<
  ]]></detail>
</VimperatorPlugin>;
//}}}
(function(){

var notifier = liberator.plugins.notifier;
if (!notifier){
    return;
}

var libly = notifier.libly;
var $U = libly.$U;
var logger = $U.getLogger("observer_alert");

const alertService = Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
const ICON_URL = "chrome://vimperator/skin/icon.png";
var observer = {
    observe: function(aSubject, aTopic, aData){
        if (aTopic == "alertclickcallback" && aData){
            liberator.open(aData, liberator.NEW_TAB);
        }
    }
};
function getAlertWindows(){
    return Cc["@mozilla.org/appshell/window-mediator;1"]
            .getService(Ci.nsIWindowMediator)
            .getXULWindowEnumerator("alert:alert");
}
function alertNotify(count, message){
    alertService.showAlertNotification(
        ICON_URL,
        count + ": " + message.title,
        "",
        message.link ? true : false,
        message.link,
        observer
    );
    (function(){
        var fixed = false;
        var winEnum = getAlertWindows();
        var win;
        while (winEnum.hasMoreElements()){
            win = winEnum.getNext()
                    .QueryInterface(Ci.nsIXULWindow).docShell
                    .QueryInterface(Ci.nsIInterfaceRequestor)
                    .getInterface(Ci.nsIDOMWindow);
            if (win.arguments[1] == count + ": " + message.title){
                let box = win.document.getElementById("alertTextBox");
                let t = box.firstChild;
                if (box.lastChild.hasAttribute("clickable")){
                    t.style.cursor = "pointer";
                    t.style.color = "#1455D6";
                    t.style.textDecoration = "underline";
                }
                t.setAttribute("onclick", "onAlertClick();");
                box.removeChild(box.lastChild);
                box.appendChild($U.xmlToDom(new XMLList(
                    '<div xmlns="http://www.w3.org/1999/xhtml" class="alertText plain">' + message.message + "</div>"),
                    document
                ));
                win.onAlertLoad();
                fixed = true;
            }
        }
        if (!fixed) setTimeout(arguments.callee, 10);
    })();
}

notifier.observer.register(notifier.Observer, {
    initialize: function (){
        this.count = 1;
    },
    update: function(message){
        alertNotify(this.count, message);
        this.count++;
    }
});

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

