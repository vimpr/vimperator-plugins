var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>hatena message notifier</description>
    <description lang="ja">はてなメッセージの変更通知。</description>
    <author mail="teramako@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/teramako/">teramako</author>
    <version>0.1</version>
    <license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/notifier/subject_hatena_message.js</updateURL>
</VimperatorPlugin>;
//}}}
(function() {

var notifier = liberator.plugins.notifier;
if (!notifier) return;

var libly = notifier.libly;
var $U = libly.$U;
var logger = $U.getLogger('subject_hatena_message');

var URL = 'http://m.hatena.ne.jp';

notifier.subject.register(notifier.SubjectHttp, {
    interval: 60,
    options: {
        url: URL,
        headers: null,
        extra: {}
    },
    preInitialize: function() {
        var [username, password] = $U.getUserAndPassword('https://www.hatena.ne.jp', 'https://www.hatena.ne.jp');
        this.options.extra.username = username;
        this.options.extra.password = password;
        return (username && password) ? true : false;
    },
    parse: function(res)
        res.getHTMLDocument('//table[@class="list"]//tr'),
    diff: function(cache, parsed)
        parsed.filter(function(element)
            !cache.some(function(c) c.textContent == element.textContent)),
    buildMessages: function(diff)
        diff.map($U.bind(this, function(d) {
            var anchor = $U.getFirstNodeFromXPath('descendant::a[@class="message-title"]', d);
            var permalink = URL + (anchor.href ? anchor.href : '');
            var [title, message, date] = [elm.textContent.replace(/^\s+|\s+$/g,'').replace(/>\s+</g,'><') for ([i,elm] in Iterator(d.cells))];
            var html = title + ' (' + date + ')<br/>' + message;
            return new notifier.Message('Hatena::Message', html, permalink);
        }))
});

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

