// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>force focuscontent</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.1.1</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/forcefocuscontent.js</updateURL>
</VimperatorPlugin>;
//}}}

if (__context__.__addedEventListener)
    getBrowser().removeEventListener("load", __context__.__addedEventListener, true);

getBrowser().addEventListener("load", onPageLoad, true);

function onPageLoad(event)
{
    try {
    let doc = event.originalTarget;
    if (doc != getBrowser().contentDocument)
        return;

    let eproto = doc.defaultView.wrappedJSObject.HTMLInputElement.prototype;
    let original = eproto.focus;

    let ignore  = function () { return void 0; };
    let remove = function () {
        liberator.log('removed');
        eproto.focus = original;
        if (handle)
            clearTimeout(handle);
    };

    doc.defaultView.wrappedJSObject.HTMLInputElement.prototype.focus = ignore;

    //let handle = setTimeout(remove, 5000);

    liberator.log('injected');
    } catch (e) {
        liberator.log(e);
    }
}

__context__.__addedEventListener = onPageLoad;

// vim: fdm=marker sw=4 ts=4 et:
