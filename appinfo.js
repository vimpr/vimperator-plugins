// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>show application information</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.0.1</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.1</maxVersion>
    <license>CC0</license>
    <detail><![CDATA[

== COMMANDS ==
appinfo [information]:
    echo and copy mozilla information

     ]]></detail>
</VimperatorPlugin>;
//}}}

(function() {
    const appinfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    commands.add(['appinfo'], 'show application information',
        function(args) {
            if (args.length==1) {
                util.copyToClipboard(appinfo[args.string], true);
            } else {
                let descs = [[i,appinfo[i]] for(i in appinfo) if(i!="QueryInterface")];
                let list = template.genericTable(descs, { title: ["Application Information", "Value"] });
                commandline.echo(list, commandline.HL_INFOMSG);
            }
        },{
            argCount: '?',
            completer: function(context, args) {
                context.title = ["Application Information", "Value"];
                context.completions = [[i,appinfo[i]] for(i in appinfo) if(i!="QueryInterface")];
            },
        });
})();
// vim: fdm=marker sw=4 ts=4 et:
