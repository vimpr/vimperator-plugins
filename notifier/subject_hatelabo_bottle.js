/*** BEGIN LICENSE BLOCK {{{
    Copyright (c) 2008 suVene<suvene@zeromemory.info>

    distributable under the terms of an MIT-style license.
    http://www.opensource.jp/licenses/mit-license.html
}}}  END LICENSE BLOCK ***/
// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>hatena bottle change notice.</description>
    <description lang="ja">はてなボトルの変更通知。</description>
    <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
    <version>0.1.2</version>
    <license>MIT</license>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/notifier/subject_hatelabo_bottle.js</updateURL>
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
    parse: function(res) {
        // if (this.count == 0) return []; // for debug
        var doc = res.getHTMLDocument('id("body")//div[contains(concat(" ", @class, " "), " entry ")]');
        return doc;
    },
    diff: function(cache, parsed)
        parsed.filter(function(element)
            !cache.some(function(c) c.textContent == element.textContent)),
    buildMessages: function(diff) {
        return diff.map($U.bind(this, function(d) {
            var permalink = $U.getFirstNodeFromXPath('descendant::a[@class="hatena-star-uri"]', d);
            if (permalink)
                permalink = URL + permalink;
            return new notifier.Message('Hatelabo bottle', $U.xmlSerialize(d), permalink)
        }));
    }
});

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

