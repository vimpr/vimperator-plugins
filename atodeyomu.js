// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>atodeyomu</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.0.1</version>
    <minVersion>2.2</minVersion>
    <maxVersion>2.2</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/stylish.js</updateURL>
    <license>public domain</license>
    <detail><![CDATA[
]]></detail>
</VimperatorPlugin>;
//}}}

(function(){
var yomudata = storage.newMap("atodeyomu", true);
if(!yomudata.get("yomulist"))
    yomudata.set("yomulist", {});
var yomulist = yomudata.get("yomulist");

plugins.atodeyomu.funcs = {
    yomulist: function() yomulist,
    onload: function()
    {
        let url = content.location.href;
        if (yomulist[url]) {
            delete yomulist[url];
        }
    },
    install: function() gBrowser.addEventListener("load", plugins.atodeyomu.funcs.onload, true),
    uninstall: function() gBrowser.removeEventListener("load", plugins.atodeyomu.funcs.onload, true),
};

plugins.atodeyomu.funcs.install();

commands.addUserCommand(["atode"], "atode yomu",
    function(args){
        yomulist[content.location.href] = content.document.title;
    }, {
    }, true);
commands.addUserCommand(["yomu"], "ima yomu",
    function(args){
        let url = args.string;
        let where = /\btabopen\b/.test(options["activate"]) ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB;
        liberator.open(url, where);
    }, {
        completer: function(context, args){
            context.title = ["yomu"];
            context.completions = [[url, yomulist[url]] for(url in yomulist)];
        },
    }, true);
})();
// vim: fdm=marker sw=4 ts=4 et:
