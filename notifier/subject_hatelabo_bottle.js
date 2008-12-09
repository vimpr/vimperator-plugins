// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{name}</name>
    <description>notifies if hatena bottle was changed.</description>
    <description lang="ja">はてなボトルの変更通知。</description>
    <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
    <version>0.1.1</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
</VimperatorPlugin>;
//}}}
(function() {

var notifier = liberator.plugins.notifier;
if (!notifier) return;

var libly = notifier.libly;
var $U = libly.$U;
var logger = $U.getLogger('subject_hatelabo_bottle');

var URL = 'http://bottle.hatelabo.jp';

notifier.subject.register(notifier.SubjectHttp, {
    interval: 60,
    options: {
        url: URL,
        headers: null,
        extra: null
    },
    preInitialize: function() {
        logger.log('preInitialize: ');
    },
    parse: function(res) {
        // if (this.count == 0) return []; for debug
        if (!res.isSuccess() || res.responseText == '') return null;
        return res.getHTMLDocument('id("body")//div[contains(concat(" ", @class, " "), " entry ")]');
    },
    diff: function(cache, parsed)
        parsed.filter(function(element)
            !cache.some(function(c) c.textContent == element.textContent)),
    buildMessages: function(diff)
        diff.map(function(d)
            new notifier.Message('Hatelab bottle', $U.xmlSerialize(d), {
                growl: { life: 7000 }
            }))
});

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

