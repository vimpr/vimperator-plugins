// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{name}</name>
    <description>notifies if hatena bottle was changed.</description>
    <description lang="ja">はてなボトルの変更通知。</description>
    <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
    <version>0.1.0</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <detail><![CDATA[
    ]]></detail>
</VimperatorPlugin>;
//}}}
(function() {

var notifier = liberator.plugins.notifier;
if (!notifier) return;

var libly = notifier.libly;
var $U = libly.$U;
var logger = $U.getLogger('subject_hatelabo_bottle');

var URL = 'http://bottle.hatelabo.jp';
//var URL = 'http://localhost/index.html?a';

notifier.subject.register(notifier.SubjectHttp, {
    interval: 40,
    options: {
        url: URL,
        headers: null,
        extra: null
    },
    parse: function(res) {

        var ret, dom;

        if (!res.isSuccess() || res.responseText == '') return ret;

        dom = res.getHTMLDocument('id("body")//div[contains(concat(" ", @class, " "), " entry ")]');
        if (!dom) return ret;

        ret = [];
        for (let i = 0, len = dom.childNodes.length; i < len; i++) {
            ret.push(dom.childNodes[i]);
        }

        return ret;
    },
    diff: function(cache, parsed) {
        var ret = [];
        parsed.forEach(function(element) {
           if (!cache.some(function(c) { if (c.toString() == element.toString()) return true }))
               ret.push(element); 
        });

        return ret;
        var text = (new XMLSerializer()).serializeToString(parsed[0])
                            .replace(/<[^>]+>/g, function(all) all.toLowerCase())
                            .replace(/<!--(?:[^-]|-(?!->))*-->/g, ''); // actually
        return text;
    },
    buildMessages: function(diff) {
        var ret = [];
        diff.forEach(function(d) {
            ret.push(
                new notifier.Message('Hatelab bottle', $U.xmlSerialize(d), {
                        growl: {
                            life: 7000
                        }
                })
            );
        });
        return ret;
    }
});

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

