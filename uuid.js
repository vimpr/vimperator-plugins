// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>UUID generator</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.1</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/uuid.js</updateURL>
    <detail><![CDATA[

== COMMANDS ==
uuid:
    generate and copy UUID

== THANKS ==
http://moz-addon.g.hatena.ne.jp/ZIGOROu/20080417/1208413079
]]></detail>
</VimperatorPlugin>;
//}}}

(function() {
    const Ci = Components.interfaces;
    services.add("uuid", "@mozilla.org/uuid-generator;1", Ci.nsIUUIDGenerator);
    const UUID = services.get("uuid");

    commands.add(['uuid'], 'generate and copy UUID',
        function(args)
        {
            let uuid = UUID.generateUUID().number;
            util.copyToClipboard(uuid);
            liberator.echo("generate "+uuid);
        },
        {
            argCount: '0',
        });
})();
// vim: fdm=marker sw=4 ts=4 et:
