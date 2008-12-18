// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>notification from the subjects is notified to you by the Growl style.</description>
    <description lang="ja">Growl風通知。</description>
    <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
    <version>0.1.1</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <detail><![CDATA[
== Settings ==
>||
liberator.globalVariables.observer_growl_settings = {
    'message title': {
        life: number,           // sec (10 sec by default)
        sticky: bool,           // true or false (false by default)
        sticky_keyword: [       // keyword ary
            'keyword1',
            'keyword2'
        ],
        hide: bool              // true or false (false by default)
                                //   however it's displayed when there is a keyword in the message.
    }
};
||<
e.g.)
>||
javascript <<EOM
liberator.globalVariables.observer_growl_settings = {
    'Hatelabo bottle': { life: 20, keyword: 'はてな' },
    'Weather forecast by Yahoo!': { sticky: true }
};
EOM
||<

== Todo ==
- sticky_keyword
- hide
- close all
    ]]></detail>
</VimperatorPlugin>;
//}}}
(function() {

var notifier = liberator.plugins.notifier;
if (!notifier) return;

var libly = notifier.libly;
var $U = libly.$U;
var logger = $U.getLogger('observer_growl');

var Growl = function() {//{{{
    this.initialize.apply(this, arguments);
};
Growl.prototype = {
    defaults: {
        life: 10,
        sticky: false,
        suticky_keyword: [],
        hide: false,
    },
    initialize: function(node, container, options) {
        this.node = node;
        this.container = container;
        this.created = new Date();
        this.options = $U.extend(this.defaults, (options || {}));
        node.childNodes[0].addEventListener("click", $U.bind(this, this.remove), false);
    },
    remove: function() {
        // TODO: animation!!!!
        this.container.removeChild(this.node);
    },

};//}}}

notifier.observer.register(notifier.Observer, {
    initialize: function () {
        this.count = 1;
        this.settings;

        io.getRuntimeDirectories('').forEach(function(dir) {
            var path = io.expandPath(dir.path + '/plugin/notifier');
            $U.readDirectory(path, '^growl', function(f) {
                try {
                    io.source(f.path, true);
                    logger.log('load success: ' + f.leafName);
                } catch (e) {
                    logger.log('load failed: ' + f.leafName);
                }
            });
        });

        this.settings = liberator.globalVariables.observer_growl_settings || {};
    },
    update: function(message) {

        var doc = window.content.document;
        var container = doc.getElementById("observer_growl");
        if (!container) {
            doc.body.appendChild($U.xmlToDom(<div id="observer_growl" class="observer_growl top-right"/>, doc));
            container = doc.getElementById("observer_growl");
        }

        var notification = this.createPopup(message, doc, container);
        // TODO: animation!!!
        //container.appendChild(doc.importNode(notification, true));
        container.appendChild(notification);

        if (container.childNodes.length == 1) {
            let interval = setInterval($U.bind(this, this.checkStatus), 1000);
            container.__interval__ = interval;
        }

        this.count++;
    },
    createPopup: function(message, doc, container) {
        var node;
        var html =
            <div class="observer_growl_notification" style="display: block;">
                <div class="close">&#215;</div>
                <div class="header">{new XMLList(
                    (message.link ? '<a href="' + message.link + '">' : '') +
                    this.count + ': ' + message.title +
                    (message.link ? '</a>' : '')
                    )}</div>
                <div class="message">{new XMLList(message.message || '')}</div>
            </div>;
        node = $U.xmlToDom(html, doc);
        node.__data__ = new Growl(node, container, this.settings[message.title]);
        return node;
    },
    checkStatus: function() {

        var doc = window.content.document;
        var container = doc.getElementById("observer_growl");
        if (!container) return;

        var removeNodes = [];
        for (let i = 0, len = container.childNodes.length; i < len; i++) {
            let item = container.childNodes[i];
            let growl = item.__data__;
            if (growl && growl.created &&
                !growl.options.sticky &&
                growl.created.getTime() + (growl.options.life * 1000) < (new Date()).getTime()) {
                removeNodes.push(item);
            }
        }
        removeNodes.forEach(function(element) element.__data__.remove());

        if (container.childNodes.length == 0)
            clearInterval(container.__interval__);

    }
});

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

