/**
 * notifier.js plugin observer
 * @name            observer_growl.js
 * @description     growl when notified.
 * @description-ja  Growl風通知。
 * @author          suVene suvene@zeromemory.info
 * @version         0.1.0
 * Last Change:     07-Dec-2008.
 *
 * use jQuery
 *   http://jquery.com/
 * use JGrowl
 *   http://stanlemon.net/projects/jgrowl.html
 */
(function() {

var notifier = liberator.plugins.notifier;
if (!notifier) return;

var libly = notifier.libly;
var $U = libly.$U;
var logger = $U.getLogger('observer_growl');

var Growl = function() {//{{{
    this.initialize.apply(this, arguments);
}
Growl.prototype = {
    defaults: {
        life: 5000
    },
    initialize: function(dom, container) {
        this.dom = dom;
        this.container = container;
        this.created = new Date();
        this.life = this.defaults.life;
        dom.childNodes[0].addEventListener("click", $U.bind(this, this.remove), false);
    },
    remove: function() {
        this.container.removeChild(this.dom);
    },

}//}}}

notifier.observer.register({
    initialize: function () {
        logger.log('initialize');
        this.count = 1;

        io.getRuntimeDirectories('').forEach(function(dir) {
            var path = io.expandPath(dir.path + '/plugin/notifier');
            $U.readDirectory(path, '^growl', function(f) {
                try {
                    io.source(f.path, true)
                    logger.log('load success: ' + f.leafName);
                } catch (e) {
                    logger.log('load failed: ' + f.leafName);
                }
            });
        });
    },
    update: function(message) {
        logger.log('update:' + this.count);

        var doc = window.content.document;
        var container = doc.getElementById("observer_growl");
        if (!container) {
            doc.body.appendChild(util.xmlToDom(<div id="observer_growl" class="observer_growl top-right"/>, doc));
            container = doc.getElementById("observer_growl");
        }

        this.createPopup(doc, message, container);
        container.appendChild(this.createPopup(doc, message, container));

        if (container.childNodes.length == 1) {
            let interval = setInterval($U.bind(this, this.checkStatus), 1000);
            container.__interval__ = interval;
        }

        this.count++;
    },
    createPopup: function(doc, message, nodes) {
        var dom;
        var html =
        <div class="observer_growl_notification" style="display: block;">
            <div class="close">&#215;</div>
            <div class="header">{util.escapeHTML(this.count + ': ' + message.title)}</div>
            <div class="message">{util.escapeHTML(message.message)}</div>
        </div>;
        dom = util.xmlToDom(html, doc, nodes);
        dom.__data__ = new Growl(dom, nodes);

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
        removeNodes.forEach(function(n) container.removeChild(n));

        if (container.childNodes.length == 0)
            clearInterval(container.__interval__);

    }
});

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

