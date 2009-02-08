/*** BEGIN LICENSE BLOCK {{{
    Copyright (c) 2008 suVene<suvene@zeromemory.info>

    distributable under the terms of an MIT-style license.
    http://www.opensource.jp/licenses/mit-license.html
}}}  END LICENSE BLOCK ***/
// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>Twitter change notice(need login).</description>
    <description lang="ja">Twitter変更通知(ログイン済みであること)。</description>
    <author mail="suvene@zeromemory.info" homepage="http://d.zeromemory.info/">suVene</author>
    <version>0.1.1</version>
    <license>MIT</license>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/notifier/subject_twitter_scraper.js</updateURL>
</VimperatorPlugin>;
//}}}
(function() {

var notifier = liberator.plugins.notifier;
if (!notifier) return;

var libly = notifier.libly;
var $U = libly.$U;
var logger = $U.getLogger('subject_twitter_scraper');

var URL = 'http://twitter.com/home';

notifier.subject.register(notifier.SubjectHttp, {
    interval: 60,
    options: {
        url: URL,
        headers: null,
        extra: {}
    },
    parse: function(res) {
        // if (this.count == 0) return []; // for debug
        return res.getHTMLDocument('id("timeline")/li[@class=contains(concat(" ", @class, " "), " hentry ")]');
    },
    diff: function(cache, parsed) {
        var self = this;
        return parsed.filter(function(element)
                !cache.some(function(c) self.getContent(c) == self.getContent(element)));
    },
    getContent: function(element)
        $U.getFirstNodeFromXPath('descendant::span[@class="entry-content"]', element).textContent,
    buildMessages: function(diff)
        diff.map($U.bind(this, function(d)
            new notifier.Message('Twitter', $U.xmlSerialize(d),
                                 $U.getFirstNodeFromXPath('descendant::a[@class="entry-date"]', d))))
});

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

