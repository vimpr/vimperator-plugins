/*** BEGIN LICENSE BLOCK {{{
    Copyright (c) 2008 suVene<suvene@zeromemory.info>

    distributable under the terms of an MIT-style license.
    http://www.opensource.jp/licenses/mit-license.html
}}}  END LICENSE BLOCK ***/
// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>notification from the subjects is notified to you by the Growl style.</description>
    <description lang="ja">Growl風通知。</description>
    <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
    <version>0.1.5</version>
    <license>MIT</license>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/notifier/observer_growl.js</updateURL>
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
    'Hatelabo bottle': { life: 20, sticky_keyword: 'はてな' },
    'Weather forecast by Yahoo!': { sticky: true }
};
EOM
||<

== Todo ==
- sticky_keyword
- hide
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
    initialize: function(node, options) {
        this.defaults = {
            life: 10,
            sticky: false,
            sticky_keyword: [],
            hide: false
        };
        this.node = node;
        this.created = new Date();
        this.options = $U.extend(this.defaults, (options || {}));
        var div = node.getElementsByTagName('div');
        div[0].addEventListener("click", $U.bind(this, this.remove), false);
    },
    remove: function() {
        // TODO: animation!!!!
        this.node.parentNode.removeChild(this.node);
    },

};//}}}

notifier.observer.register(notifier.Observer, {
    initialize: function () {
        this.count = 1;
        this.settings;
        this.intervalIDs = {};

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
            window.content.addEventListener('unload', $U.bind(this, function() {
                if (container.__interval__) {
                    clearInterval(container.__interval__);
                    this.intervalIDs[container.__interval__] = false;
                }
            }), false);
        }
        var closer = doc.getElementById("observer_growl_closer");

        var notification = this.createPopup(message, doc, container);
        // TODO: animation!!!
        //container.appendChild(doc.importNode(notification, true));
        container.appendChild(notification);

        if (container.childNodes.length == 1 && !container.__interval__) {
            let interval = setInterval($U.bind(this, this.checkStatus), 1000);
            this.intervalIDs[interval]  = true;
            container.__interval__ = interval;
        } else if (container.childNodes.length >= 2) {
            if (!closer) {
                closer = $U.xmlToDom(<div id="observer_growl_closer" class="observer_growl_closer center" style="display: block;">[close all]</div>, doc);
                container.insertBefore(closer, container.firstChild);
                closer.addEventListener("click", $U.bind(this, this.removeAll, 'test'), false);
            }
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
        node.__data__ = new Growl(node, this.settings[message.title]);
        return node;
    },
    checkStatus: function(force) {
        force = force == 'EVENT_REMOVE_ALL' ? true : false;

        var doc = window.content.document;
        var container = doc.getElementById("observer_growl");
        if (!container) return;

        var removeNodes = [];
        for (let i = 0, len = container.childNodes.length; i < len; i++) {
            let item = container.childNodes[i];
            let growl = item.__data__;
            if (force ||
                (growl &&
                    !(growl.options.sticky ||
                      growl.options.sticky_keyword.some(function(keyword) this.indexOf(keyword) > -1, item.childNodes[2].textContent)) &&
                    growl.created &&
                    growl.created.getTime() + (growl.options.life * 1000) < (new Date()).getTime()
                )
            ) {
                if (item.id != 'observer_growl_closer')
                    removeNodes.push(item);
            }

            if (len == 1) {
                let elem = container.childNodes[0];
                if (elem.id == 'observer_growl_closer')
                    elem.parentNode.removeChild(elem);
            }
        }
        removeNodes.forEach(function(element) element.__data__.remove());

        if (force || container.childNodes.length == 0) {
            clearInterval(container.__interval__);
            container.__interval__ = 0;
        }

    },
    removeAll: function(a) {
        this.checkStatus('EVENT_REMOVE_ALL');
        var closer = window.content.document.getElementById("observer_growl_closer");
        closer.parentNode.removeChild(closer);
    },
    shutdown: function() {
        for (let [id, flg] in Iterator(this.intervalIDs)) {
            if (!flg) return;
            clearInterval(id);
            this.intervalIDs[id] = false;
        }
    }
});

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

