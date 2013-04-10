// PLUGIN_INFO//{{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>atodeyomu</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.0.1</version>
    <minVersion>2.2</minVersion>
    <maxVersion>2.3</maxVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/atodeyomu.js</updateURL>
    <license>public domain</license>
    <detail><![CDATA[
]]></detail>
</VimperatorPlugin>`;
//}}}

(function(){
var yomudata = storage.newMap("atodeyomu", {store: true});
if(!yomudata.get("yomulist"))
    yomudata.set("yomulist", {});
var yomulist = yomudata.get("yomulist");

__context__.funcs = {
    yomulist: function() yomulist,
    onload: function()
    {
        let url = content.location.href;
        if (yomulist[url]) {
            delete yomulist[url];
        }
    },
    install: function() gBrowser.addEventListener("load", __context__.funcs.onload, true),
    uninstall: function() gBrowser.removeEventListener("load", __context__.funcs.onload, true),
};

__context__.funcs.install();

commands.addUserCommand(["atode"], "atode yomu",
    function(args){
        yomulist[content.location.href] = args.literalArg || content.document.title;
    }, {
    literal: 0
    }, true);
commands.addUserCommand(["yomu"], "ima yomu",
    function(args){
        let url = args.literalArg;
        let where = options.get("activate").has("tabopen") ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB;
        liberator.open(url, where);
    }, {
        literal: 0,
        completer: function(context, args){
            context.title = ["yomu"];
            context.completions = [[url, yomulist[url]] for(url in yomulist)];
        },
    }, true);
})();
// vim: fdm=marker sw=4 ts=4 et:
