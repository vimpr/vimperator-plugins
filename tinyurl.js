// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>TinyURL from Vimperator</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.1</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/tinyurl.js</updateURL>
    <detail><![CDATA[

== COMMANDS ==
tinyurl [URL]:
    echo and copy URL
expandurl URL:
    expand URL

== LIBRARY ==
plugins.tinyurl.getTiny(url):
    return TinyURL
plugins.tinyurl.getExpand(url):
    return ExpandURL

    ]]></detail>
</VimperatorPlugin>;
//}}}

(function() {
    const TinyAPI = 'http://tinyurl.com/api-create.php?url=';

    commands.add(['tinyurl'], 'echo and copy TinyURL',
        function(args) util.copyToClipboard(tiny.getTiny(args.length==0 ? buffer.URL : args.string), true),
        {
            argCount: '?',
        });
    commands.add(['expandurl'], 'expand TinyURL',
        function(args) util.copyToClipboard(tiny.getExpand(args.string), true),
        {
            argCount: '1',
        });

    var tiny = plugins.tinyurl = {
        getTiny: function(url)
            util.httpGet(TinyAPI+encodeURIComponent(url)).responseText,
        getExpand: function (url)
            util.httpGet(url).channel.name
    };
})();
// vim: fdm=marker sw=4 ts=4 et:
