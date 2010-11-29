// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>add some tabmixplus commands</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.0.1</version>
    <minVersion>2.2</minVersion>
    <maxVersion>2.2</maxVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/tabmixplus.js</updateURL>
    <detail><![CDATA[
== COMMANDS ==
dup[licate]:
    duplicate current tab
ren[ame]:
    rename current tab
freeze:
    freeze (protect&lock) current tab
protect:
    protect current tab
lock:
    lock current tab

]]></detail>
</VimperatorPlugin>;
//}}}
(function(){
commands.add(["dup[licate]"], "duplicate current tab", function(args) {
    gBrowser.duplicateTab(gBrowser.mCurrentTab);
});
commands.add(["ren[ame]"], "rename current tab", function(args) {
    gBrowser.renameTab(gBrowser.mCurrentTab);
});
commands.add(["freeze"], "freeze current tab", function(args) {
    let protect = gBrowser.mCurrentTab.hasAttribute("protected");
    let lock = gBrowser.mCurrentTab.hasAttribute("locked");
    if (protect && lock) {
        gBrowser.mCurrentTab.removeAttribute("protected");
        gBrowser.mCurrentTab.removeAttribute("locked");
    } else 
        gBrowser.freezeTab(gBrowser.mCurrentTab);
});
commands.add(["protect"], "protect current tab", function(args) {
    let protect = gBrowser.mCurrentTab.hasAttribute("protected");
    if (protect)
        gBrowser.mCurrentTab.removeAttribute("protected");
    else
        gBrowser.mCurrentTab.setAttribute("protected", true);
});
commands.add(["lock"], "lock current tab", function(args) {
    let lock = gBrowser.mCurrentTab.hasAttribute("locked");
    if (lock)
        gBrowser.mCurrentTab.removeAttribute("locked");
    else
        gBrowser.mCurrentTab.setAttribute("locked", true);
});

})();
// vim: fdm=marker sw=4 ts=4 et:
