/*** BEGIN LICENSE BLOCK {{{
    Copyright (c) 2009 suVene<suvene@zeromemory.info>

    distributable under the terms of an MIT-style license.
    http://www.opensource.jp/licenses/mit-license.html
}}}  END LICENSE BLOCK ***/
// PLUGIN_INFO//{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>liberator.echomsg notice.</description>
    <description lang="ja">liberator.echomsg 通知。</description>
    <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
    <version>0.1.1</version>
    <license>MIT</license>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/notifier/subject_liberator_echomsg.js</updateURL>
    <detail><![CDATA[
== Settings ==
>||
liberator.globalVariables.subject_liberator_echomsg_filter = [
    'Auto commands for',
    '^autocommand'
];
||<
    ]]></detail>
</VimperatorPlugin>;
//}}}
(function() {

var notifier = liberator.plugins.notifier;
if (!notifier) return;

var libly = notifier.libly;
var $U = libly.$U;
var logger = $U.getLogger('subject_liberator_echomsg');

notifier.subject.register(notifier.Subject, {
    interval: 5,
    initialize: function() {
        this.original = liberator.echomsg;
        this.__updating__ = false;
        this.messages = [];
        this.filter = liberator.globalVariables.subject_liberator_echomsg_filter || [];

        var self = this;

        liberator.echomsg = function(message) {
            while (self.waiting)
                liberator.sleep(100);

            self.messages.push(message);
            return self.original.apply(null, arguments);
        };
    },
    check: function() {
        try {
            this.__updating__ = true;
            this.messages = this.messages.filter(function(m) !this.filter.some(function(f) m.indexOf(f) > -1 || m.match(f) ? true : false), this);
            if (!this.messages.length) return;

            let msg = '<ul><li>' + this.messages.join('</li><li>') + '</li></ul>';
            this.messages = [];

            this.notify(new notifier.Message('liberator.echomsg', msg));

        } finally {
            this.__updating__ = false;
        }
    },
    shutdown: function() {
        liberator.echomsg = this.original;
        this.__updating__ = false;
    }

});

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

