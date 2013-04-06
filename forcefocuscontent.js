// PLUGIN_INFO//{{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>force focuscontent</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.1.1</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/forcefocuscontent.js</updateURL>
</VimperatorPlugin>`;
//}}}

getBrowser().addEventListener("load", onPageLoad, true);
function onPageLoad(event)
{
    let doc = event.originalTarget;
    if (doc != getBrowser().contentDocument)
        return;
    setTimeout(function () {
        let focused = document.commandDispatcher.focusedElement;
        if (focused)
            focused.blur();
    }, 100);
}
// vim: fdm=marker sw=4 ts=4 et:
