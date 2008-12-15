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
        life: 10000
    },
    initialize: function(dom, container, options) {
        this.dom = dom;
        this.container = container;
        this.created = new Date();
        this.options = $U.extend(this.defaults, (options || {}));
        this.life = this.options.life;
        dom.childNodes[0].addEventListener("click", $U.bind(this, this.remove), false);
    },
    remove: function() {
        // TODO: animation!!!!
        this.container.removeChild(this.dom);
    },

};//}}}

notifier.observer.register(notifier.Observer, {
    initialize: function () {
        this.count = 1;

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
        var node = doc.importNode(notification, true);
        container.appendChild(notification);

        if (container.childNodes.length == 1) {
            let interval = setInterval($U.bind(this, this.checkStatus), 1000);
            container.__interval__ = interval;
        }

        this.count++;
    },
    createPopup: function(message, doc, nodes) {
        var dom;
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
        dom = $U.xmlToDom(html, doc, nodes);
        // TODO: get settings
        var options = {};
        dom.__data__ = new Growl(dom, nodes, {});
        return dom;
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
                growl.created.getTime() + growl.life < (new Date()).getTime()) {
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

