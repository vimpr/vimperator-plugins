/*** BEGIN LICENSE BLOCK {{{
    Copyright (c) 2008 suVene<suvene@zeromemory.info>

    distributable under the terms of an MIT-style license.
    http://www.opensource.jp/licenses/mit-license.html
}}}  END LICENSE BLOCK ***/
// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>Wassr change notice.</description>
    <description lang="ja">Wassr変更通知。</description>
    <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
    <version>0.1.1</version>
    <license>MIT</license>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/notifier/subject_wassr.js</updateURL>
</VimperatorPlugin>;
//}}}
(function() {

var notifier = liberator.plugins.notifier;
if (!notifier) return;

var libly = notifier.libly;
var $U = libly.$U;
var logger = $U.getLogger('subject_wassr');

var URL = 'http://api.wassr.jp/statuses/friends_timeline.json?id=';

notifier.subject.register(notifier.SubjectHttp, {
    interval: 60,
    options: {
        url: '',
        headers: null,
        extra: {}
    },
    preInitialize: function() {
        var [username, password] = $U.getUserAndPassword('http://wassr.jp', 'http://wassr.jp');
        this.options.url = URL + username;
        this.options.extra.username = username;
        this.options.extra.password = password;
        return (username && password) ? true : false;
    },
    parse: function(res) {
        // if (this.count == 0) return []; // for debug
        return $U.evalJson(res.responseText) || [];
    },
    diff: function(cache, parsed)
        parsed.filter(function(item)
            !cache.some(function(c) c.html == item.html)),
    buildMessages: function(diff)
        diff.map($U.bind(this, function(d)
            new notifier.Message('Wassr', <div>
                {d.reply_status_url ? <p><a href={d.reply_status_url}>{'> ' + d.reply_message + ' by ' + d.reply_user_nick}</a></p> : ''}
                <p>
                <img src={d.user.profile_image_url} alt={d.user_login_id} width="16" height="16"/>
                {d.photo_thumbnail_url ? <img src={d.photo_thumbnail_url} alt=""/> : ''}
                {d.html || ''}
                </p>
            </div>.toString(), d.link)))
});

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

