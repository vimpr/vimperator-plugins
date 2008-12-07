/**
 * ==VimperatorPlugin==
 * @name            libly.js
 * @description     suvene's library
 * @description-ja  適当なライブラリっぽいものたち
 * @author          suVene suvene@zeromemory.info
 * @version         0.1.0
 * @minVersion      1.2
 * @maxVersion      2.0pre
 * Last Change:     07-Dec-2008.
 * ==/VimperatorPlugin==
 *
 * HEAD COMMENT {{{
 *  }}}
 */
if (!liberator.plugins.libly) {

liberator.plugins.libly = {};
var lib = liberator.plugins.libly;

lib.$U = {//{{{
    getLogger:  function(prefix) {
        return new function() {
            this.log = function(msg, level) {
                if (typeof msg == 'object') msg = util.objectToString(msg);
                liberator.log(lib.$U.dateFormat(new Date()) + ': ' + (prefix || '') + ': ' + msg, (level || 0));
            };
            this.echo = function(msg, flg) {
                flg = flg || commandline.FORCE_MULTILINE;
                // this.log(msg);
                liberator.echo(msg, flg);
            };
            this.echoerr = function(msg) {
                this.log('error: ' + msg);
                liberator.echoerr(msg);
            };
        }
    },
    extend: function(dst, src) {
        for (let prop in src)
            dst[prop] = src[prop];
         return dst;
    },
    A: function(hash, iter) {
        var ret = [];
        for each (let item in hash) ret.push(item);
        return ret;
    },
    bind: function(obj, func) {
        return function() {
            return func.apply(obj, arguments);
        }
    },
    stripTags: function(str, tags) {
        var ignoreTags = [].concat(tags);
        ignoreTags = '(?:' + ignoreTags.join('|') + ')';
        return str.replace(new RegExp('<' + ignoreTags + '(?:[ \\t\\n\\r][^>]*|/)?>([\\S\\s]*?)<\/' + ignoreTags + '[ \\t\\r\\n]*>', 'ig'), '');
    },
    eval: function(text) {
        var fnc = window.eval;
        var sandbox;
        try {
            sandbox = new Components.utils.Sandbox(window);
            if (Components.utils.evalInSandbox('true', sandbox) === true) {
                fnc = function(text) { return Components.utils.evalInSandbox(text, sandbox); };
            }
        } catch (e) { $U.log('warning: multi_requester.js is working with unsafe sandbox.'); }

        return fnc(text);
    },
    evalJson: function(str, toRemove) {
        var json;
        try {
            json = Components.classes['@mozilla.org/dom/json;1'].getService(Components.interfaces.nsIJSON);
            if (toRemove) str = str.substring(1, str.length - 1);
            return json.decode(str);
        } catch (e) { return null; }
    },
    getSelectedString: function() {
         return (new XPCNativeWrapper(window.content.window)).getSelection().toString();
    },
    pathToURL: function(path) {
        if (/^https?:\/\//.test(path)) return path;
        var link = document.createElement('a');
        link.href= path;
        return link.href;
    },
    dateFormat: function(dtm, fmt) {
        var d = {
            y: dtm.getFullYear(),
            M: dtm.getMonth() + 1,
            d: dtm.getDay(),
            h: dtm.getHours(),
            m: dtm.getMinutes(),
            s: dtm.getSeconds(),
            '%': '%'
        };
        for (let [n, v] in Iterator(d)) {
            if (v < 10)
                d[n] = '0' + v;
        }
        return (fmt || '%y/%M/%d %h:%m:%s').replace(/%([yMdhms%])/g, function (_, n) d[n]);
    },
    readDirectory: function(path, filter, func) {
        var d = io.getFile(path);
        if (d.exists() && d.isDirectory()) {
            let enm = d.directoryEntries;
            let flg = false;
            while (enm.hasMoreElements()) {
                let item = enm.getNext();
                item.QueryInterface(Components.interfaces.nsIFile);
                flg = false;
                if (typeof filter == 'string') {
                    if ((new RegExp(filter)).test(item.leafName)) flg = true;
                } else if (typeof filter == 'function') {
                    flg = filter(item);
                }
                if (flg) func(item);
            }
        }
    },
};
//}}}

lib.Request = function() {//{{{
        this.initialize.apply(this, arguments);
};
lib.Request.EVENTS = ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];
lib.Request.requestCount = 0;
lib.Request.prototype = {
    initialize: function(url, headers, options) {
        this.url = url;
        this.headers = headers || {};
        this.options = lib.$U.extend({
            asynchronous: true,
            encoding: 'UTF-8'
        }, options || {});
        this.observers = {};
    },
    addEventListener: function(name, func) {
        try {
            if (typeof this.observers[name] == 'undefined') this.observers[name] = [];
            this.observers[name].push(func);
        } catch (e) {
            if (!this.fireEvent('onException', e)) throw e;
        }
    },
    fireEvent: function(name, args, asynchronous) {
        if (!(this.observers[name] instanceof Array)) return false;
        this.observers[name].forEach(function(event) {
            if (asynchronous) {
                setTimeout(event, 10, args);
            } else {
                event(args);
            }
        });
        return true;
    },
    _complete: false,
    _request: function(method) {

        try {
            lib.Request.requestCount++;

            this.transport = new XMLHttpRequest();
            this.transport.open(method, this.url, this.options.asynchronous);

            this.transport.onreadystatechange = lib.$U.bind(this, this._onStateChange);
            this.setRequestHeaders();
            this.transport.overrideMimeType('text/html; charset=' + this.options.encoding);

            this.body = this.method == 'POST' ? this.options.postBody : null;

            this.transport.send(this.body);

            // Force Firefox to handle ready state 4 for synchronous requests
            if (!this.options.asynchronous && this.transport.overrideMimeType)
                this._onStateChange();

        } catch (e) {
            if (!this.fireEvent('onException', e, this.options.asynchronous)) throw e;
        }
    },
    _onStateChange: function() {
        var readyState = this.transport.readyState;
        if (readyState > 1 && !(readyState == 4 && this._complete))
            this.respondToReadyState(this.transport.readyState);
    },
    getStatus: function() {
        try {
            return this.transport.status || 0;
        } catch (e) { return 0; }
    },
    isSuccess: function() {
        return !status || (status >= 200 && status < 300);
    },
    respondToReadyState: function(readyState) {
        var state = lib.Request.EVENTS[readyState];
        var res = new lib.Response(this);

        if (state == 'Complete') {
            lib.Request.requestCount--;
            try {
                this._complete = true;
                this.fireEvent('on' + (this.isSuccess() ? 'Success' : 'Failure'), res, this.options.asynchronous);
            } catch (e) {
                if (!this.fireEvent('onException', e, this.options.asynchronous)) throw e;
            }
         }
    },
    setRequestHeaders: function() {
        var headers = {
            'Accept': 'text/javascript, application/javascript, text/html, application/xhtml+xml, application/xml, text/xml, */*;q=0.1'
        };

        if (this.method == 'POST') {
            headers['Content-type'] = 'application/x-www-form-urlencoded' +
                (this.options.encoding ? '; charset=' + this.options.encoding : '');

            if (this.transport.overrideMimeType) {
                let year = parseInt((navigator.userAgent.match(/\bGecko\/(\d{4})/) || [0, 2005])[1], 10);
                if (0 < year && year < 2005)
                     headers['Connection'] = 'close';
            }
        }

        for (let key in this.headers)
            if (this.headers.hasOwnProperty(key)) headers[key] = this.headers[key];

        for (let name in headers)
            this.transport.setRequestHeader(name, headers[name]);

    },
    get: function() {
        this._request('GET');
    },
    post: function() {
        this._request('POST');
    }
};//}}}

lib.Response = function() {//{{{
    this.initialize.apply(this, arguments);
};
lib.Response.prototype = {
    initialize: function(req) {
        this.req = req;
        this.transport = req.transport;
        this.isSuccess = req.isSuccess();
        this.readyState = this.transport.readyState;

        if (this.readyState == 4) {
            this.status = this.getStatus();
            this.statusText = this.getStatusText();
            this.responseText = (this.transport.responseText == null) ? '' : this.transport.responseText;
        }

        this.doc = null;
        this.htmlFragmentstr = '';
    },
    status: 0,
    statusText: '',
    getStatus: lib.Request.prototype.getStatus,
    getStatusText: function() {
        try {
            return this.transport.statusText || '';
        } catch (e) { return ''; }
    },
    getHTMLDocument: function(xpath, xmlns) {
        if (!this.doc) {
            this.htmlFragmentstr = this.responseText.replace(/^[\s\S]*?<html(?:[ \t\n\r][^>]*)?>|<\/html[ \t\r\n]*>[\S\s]*$/ig, '').replace(/[\r\n]+/g, ' ');
            let ignoreTags = ['script'];
            if (this.req.options.siteinfo.ignoreTags) {
                ignoreTags.concat(this.req.options.siteinfo.ignoreTags.split(','));
            }
            this.htmlStripScriptFragmentstr = lib.$U.stripTags(this.htmlFragmentstr, 'script');
            this.doc = this._createHTMLDocument(this.htmlStripScriptFragmentstr, xmlns);
        }

        var ret = this.doc;
        if (xpath) {
            ret = this.getNodeFromXPath(xpath, this.doc);
        }
        return ret;
    },
    _createHTMLDocument: function(str) {
        var htmlFragment = document.implementation.createDocument(null, 'html', null);
        var range = document.createRange();
        range.setStartAfter(window.content.document.body);
        htmlFragment.documentElement.appendChild(htmlFragment.importNode(range.createContextualFragment(str), true));
        return htmlFragment;
    },
    getNodeFromXPath: function(xpath, doc, parentNode) {
        if (!xpath || !doc) return doc;
        var node = doc || document;
        var nodesSnapshot = (node.ownerDocument || node).evaluate(xpath, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        if (nodesSnapshot.snapshotLength == 0) return parentNode;
        parentNode = parentNode || document.createElementNS(null, 'div');
        for (let i = 0, l = nodesSnapshot.snapshotLength; i < l; parentNode.appendChild(nodesSnapshot.snapshotItem(i++)));
        return parentNode;
    }
};
//}}}

}
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

