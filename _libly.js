/*** BEGIN LICENSE BLOCK {{{
    Copyright (c) 2008 suVene<suvene@zeromemory.info>

    distributable under the terms of an MIT-style license.
    http://www.opensource.jp/licenses/mit-license.html
}}}  END LICENSE BLOCK ***/
// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>libly(filename _libly.js)</name>
    <description>Vimperator plugins library?</description>
    <description lang="ja">適当なライブラリっぽいものたち。</description>
    <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
    <license>MIT</license>
    <version>0.1.15</version>
    <minVersion>1.2</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/_libly.js</updateURL>
    <detail><![CDATA[
== Objects ==
- liberator.plugins.libly.$U
- liberator.plugins.libly.Request
- liberator.plugins.libly.Response
- liberator.plugins.libly.Wedata

== Logger ==
getLogger(prefix):
    log(msg, level), echo(msg, flg), echoerr(msg)
    のメソッドを持つ logger インスタンスを取得します。
    ログの書式は prefix + ': ' + yyyy/MM/dd + msg となります。

== Object Utility ==
extend(dst, src):
    オブジェクトを拡張します。
A(iterable):
    オブジェクトを配列にします。
around(obj, name, func):
  obj がもつ name 関数を、func に置き換えます。
  func は
    function (next, args) {...}
  という形で呼ばれます。
  next はオリジナルの関数を呼び出すための関数、
  args はオリジナルの引数列です。
  next には引数を渡す必要はありません。
bind(obj, func):
    func に obj を bind します。
    func内からは this で obj が参照できるようになります。
eval(text):
    Sandbox による、window.eval を極力利用するようにします。
    Snadbox が利用できない場合は、unsafe な window の eval が直接利用されます。
evalJson(str, toRemove):
    str を decode します。
    toRemove が true の場合、文字列の前後を1文字削除します。
    "(key:value)" 形式の場合などに true を指定して下さい。
dateFormat(dtm, fmt):
    Date型インスタンスを、指定されたフォーマットで文字列に変換します。
    fmt を省略した場合、"%y/%M/%d %h:%m:%s" となります。
runnable(generator):
    gererator を実行し、再帰的に resume する為の引数を渡します。

==  Browser ==
getSelectedString:
    window の選択文字列を返却します。
getUserAndPassword(hostname, formSubmitURL, username):
    login-manager から [username, password] を取得します。
    引数の username が省略された場合、検索された 1件目を返却します。
    データが存在しない場合は、null を返却します。

== System ==
readDirectory(path, fileter, func):
    path で指定したディレクトリから、filter で指定された正規表現に match する場合、
    func をファイル名を引数にコールバックします。
    filter は Function を指定することも可能です。

== HTML, XML, DOM, E4X ==
pathToURL(a, baseURL, doc):
    相対パスを絶対パスに変換します。
getHTMLFragment(html):
    <html>※1</html>
    ※1 の文字列を取得します。
stripTags(str, tags):
    str から tags で指定されたタグを取り除いて返却します。
    tags は文字列、または配列で指定して下さい。
createHTMLDocument(str, xmlns):
    引数 str より、HTMLFragment を作成します。
getFirstNodeFromXPath(xpath, context):
    xpath を評価しオブジェクトをを返却します。
getNodesFromXPath(xpath, context, callback, thisObj):
    xpath を評価し snapshot の配列を返却します。
xmlSerialize(xml):
    xml を文字列化します。
xmlToDom(node, doc, nodes):
    for vimperator1.2.
    @see vimperator2.0pre util.
getElementPosition(elem):
    elem の offset を返却します。
    return {top: 0, left: 0}
    ]]></detail>
</VimperatorPlugin>;
//}}}
//if (!liberator.plugins.libly) {

liberator.plugins.libly = {};
var libly = liberator.plugins.libly;

libly.$U = {//{{{
    // Logger {{{
    getLogger: function(prefix) {
        return new function() {
            this.log = function(msg, level) {
                if (typeof msg == 'object') msg = util.objectToString(msg);
                liberator.log(libly.$U.dateFormat(new Date()) + ': ' + (prefix || '') + ': ' + msg, (level || 0));
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
    // }}}
    // Object Utility {{{
    extend: function(dst, src) {
        for (let prop in src)
            dst[prop] = src[prop];
         return dst;
    },
    A: function(iterable) {
        var ret = [];
        if (!iterable) return ret;
        if (typeof iterable == 'string') return [iterable];
        if (!(typeof iterable == 'function' && iterable == '[object NodeList]') &&
            iterable.toArray) return iterable.toArray();
        if (typeof iterable.length != 'undefined') {
            for (let i = 0, len = iterable.length; i < len; ret.push(iterable[i++]));
        } else {
            for each (let item in iterable) ret.push(item);
        }
        return ret;
    },
    around: function around (obj, name, func) {
        let next = obj[name];
        let current = obj[name] = function () {
            let self = this, args = arguments;
            return func.call(self, function () next.apply(self, args), args);
        };
        return [next, current];
    },
    bind: function(obj, func) {
        return function() {
            return func.apply(obj, arguments);
        }
    },
    eval: function(text) {
        var fnc = window.eval;
        var sandbox;
        try {
            sandbox = new Components.utils.Sandbox(window);
            if (Components.utils.evalInSandbox('true', sandbox) === true) {
                fnc = function(text) { return Components.utils.evalInSandbox(text, sandbox); };
            }
        } catch (e) { liberator.log('warning: _libly.js is working with unsafe sandbox.'); }

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
    /**
     * example)
     *  $U.runnable(function(resume) {
     *      // execute asynchronous function.
     *      // goto next yield;
     *      var val = yield setTimeout(function() { resume('value!'), 1000) });
     *      alert(val);  // value!
     *      yield;
     *  });
     */
    runnable: function(generator) {
        var it = generator(function(value) {
                    try { it.send(value); } catch (e) {}
                 });
        it.next();
    },
    // }}}
    // Browser {{{
    getSelectedString: function() {
         return (new XPCNativeWrapper(window.content.window)).getSelection().toString();
    },
    getUserAndPassword: function(hostname, formSubmitURL, username) {
        var passwordManager, logins;
        try {
            passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
            logins = passwordManager.findLogins({}, hostname, formSubmitURL, null);
            if (logins.length) {
                if (username) {
                    for (let i = 0, len = logins.lengh; i < len; i++) {
                        if (logins[i].username == username)
                            return [logins[i].username, logins[i].password]
                    }
                    throw 'username notfound.';
                } else {
                    return [logins[0].username, logins[0].password];
                }
            } else {
                throw 'account notfound.';
            }
        } catch (e) {
            liberator.log('[getUserAndPassword] error: ' + e, 0);
            return null;
        }
    },
    // }}}
    // System {{{
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
    // }}}
    // HTML, XML, DOM, E4X {{{
    pathToURL: function(a, baseURL, doc) {
        if (!a) return '';
        var XHTML_NS = "http://www.w3.org/1999/xhtml";
        var XML_NS   = "http://www.w3.org/XML/1998/namespace";
        //var path = (a.href || a.getAttribute('src') || a.action || a.value || a);
        var path = (a.getAttribute('href') || a.getAttribute('src') || a.action || a.value || a);
        if (/^https?:\/\//.test(path)) return path;
        var link = (doc || window.content.documtent).createElementNS(XHTML_NS, 'a');
        link.setAttributeNS(XML_NS, 'xml:base', baseURL);
        link.href = path;
        return link.href;
    },
    getHTMLFragment: function(html) {
        if (!html) return html;
        return html.replace(/^[\s\S]*?<html(?:[ \t\n\r][^>]*)?>|<\/html[ \t\r\n]*>[\S\s]*$/ig, '').replace(/[\r\n]+/g, ' ');
    },
    stripTags: function(str, tags) {
        var ignoreTags = '(?:' + [].concat(tags).join('|') + ')';
        return str.replace(new RegExp('<' + ignoreTags + '(?:[ \\t\\n\\r][^>]*|/)?>([\\S\\s]*?)<\/' + ignoreTags + '[ \\t\\r\\n]*>', 'ig'), '');
    },
    createHTMLDocument: function(str, xmlns, doc) {
        doc = doc || window.content.document;
        var htmlFragment = doc.implementation.createDocument(null, 'html', null);
        var range = doc.createRange();
        range.setStartAfter(doc.body);
        htmlFragment.documentElement.appendChild(htmlFragment.importNode(range.createContextualFragment(str), true));
        return htmlFragment;
    },
    getFirstNodeFromXPath: function(xpath, context) {
        if (!xpath) return null;
        context = context || window.content.document;
        var result = (context.ownerDocument || context).evaluate(xpath, context, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue || null;
    },
    getNodesFromXPath: function(xpath, context, callback, thisObj) {
        var ret = [];
        if (!xpath) return ret;
        context = context || window.content.document;
        var nodesSnapshot = (context.ownerDocument || context).evaluate(xpath, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0, l = nodesSnapshot.snapshotLength; i < l; i++) {
            if (typeof callback == 'function') callback.call(thisObj, nodesSnapshot.snapshotItem(i), i);
            ret.push(nodesSnapshot.snapshotItem(i));
        }
        return ret;
    },
    xmlSerialize: function(xml) {
        try {
            return (new XMLSerializer()).serializeToString(xml)
                                        .replace(/<!--(?:[^-]|-(?!->))*-->/g, '')
                                        .replace(/<[^>]+>/g, function(all) all.toLowerCase());
        } catch (e) { return '' }
    },
    xmlToDom: function xmlToDom(node, doc, nodes)
    {
        XML.prettyPrinting = false;
        switch (node.nodeKind())
        {
            case "text":
                return doc.createTextNode(node);
            case "element":
                let domnode = doc.createElementNS(node.namespace(), node.localName());
                for each (let attr in node.@*)
                    domnode.setAttributeNS(attr.name() == "highlight" ? NS.uri : attr.namespace(), attr.name(), String(attr));
                for each (let child in node.*)
                    domnode.appendChild(arguments.callee(child, doc, nodes));
                if (nodes && node.@key)
                    nodes[node.@key] = domnode;
                return domnode;
        }
    },
    getElementPosition: function(elem) {
        var offsetTrail = elem;
        var offsetLeft  = 0;
        var offsetTop   = 0;
        while (offsetTrail) {
            offsetLeft += offsetTrail.offsetLeft;
            offsetTop  += offsetTrail.offsetTop;
            offsetTrail = offsetTrail.offsetParent;
        }
        offsetTop = offsetTop || null;
        offsetLeft = offsetLeft || null;
        return {top: offsetTop, left: offsetLeft};
    }
    // }}}
};
//}}}

libly.Request = function() {//{{{
    this.initialize.apply(this, arguments);
};
libly.Request.EVENTS = ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];
libly.Request.requestCount = 0;
libly.Request.prototype = {
    initialize: function(url, headers, options) {
        this.url = url;
        this.headers = headers || {};
        this.options = libly.$U.extend({
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
            if (!this.fireEvent('onException', new libly.Response(this), e)) throw e;
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
            libly.Request.requestCount++;

            this.transport = new XMLHttpRequest();
            this.transport.open(method, this.url, this.options.asynchronous);

            this.transport.onreadystatechange = libly.$U.bind(this, this._onStateChange);
            this.setRequestHeaders();
            this.transport.overrideMimeType('text/html; charset=' + this.options.encoding);

            this.body = this.method == 'POST' ? this.options.postBody : null;

            this.transport.send(this.body);

            // Force Firefox to handle ready state 4 for synchronous requests
            if (!this.options.asynchronous && this.transport.overrideMimeType)
                this._onStateChange();

        } catch (e) {
            if (!this.fireEvent('onException', new libly.Response(this), e)) throw e;
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
        var status = this.getStatus();
        return !status || (status >= 200 && status < 300);
    },
    respondToReadyState: function(readyState) {
        var state = libly.Request.EVENTS[readyState];
        var res = new libly.Response(this);

        if (state == 'Complete') {
            libly.Request.requestCount--;
            try {
                this._complete = true;
                this.fireEvent('on' + (this.isSuccess() ? 'Success' : 'Failure'), res, this.options.asynchronous);
            } catch (e) {
                if (!this.fireEvent('onException', res, e)) throw e;
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

libly.Response = function() {//{{{
    this.initialize.apply(this, arguments);
};
libly.Response.prototype = {
    initialize: function(req) {
        this.req = req;
        this.transport = req.transport;
        this.isSuccess = req.isSuccess;
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
    getStatus: libly.Request.prototype.getStatus,
    getStatusText: function() {
        try {
            return this.transport.statusText || '';
        } catch (e) { return ''; }
    },
    getHTMLDocument: function(xpath, xmlns, ignoreTags, callback, thisObj) {
        if (!this.doc) {
            //if (doc.documentElement.nodeName != 'HTML') {
            //    return new DOMParser().parseFromString(str, 'application/xhtml+xml');
            //}
            this.htmlFragmentstr = libly.$U.getHTMLFragment(this.responseText);
            this.htmlStripScriptFragmentstr = libly.$U.stripTags(this.htmlFragmentstr, ignoreTags);
            this.doc = libly.$U.createHTMLDocument(this.htmlStripScriptFragmentstr, xmlns);
        }
        if (!xpath) xpath = '//*';
        return libly.$U.getNodesFromXPath(xpath, this.doc, callback, thisObj);
    }
};
//}}}

libly.Wedata = function(dbname) { // {{{
    this.initialize.apply(this, arguments);
};
libly.Wedata.prototype = {
    initialize: function(dbname) {
        this.HOST_NAME = 'http://wedata.net/';
        this.dbname = dbname;
        this.logger = libly.$U.getLogger('libly.Wedata');
    },
    getItems: function(expire, itemCallback, finalCallback) {

        var logger = this.logger;
        var STORE_KEY = 'plugins-libly-wedata-' + this.dbname + '-items';
        var store = storage.newMap(STORE_KEY, true);

        expire = expire || 0;

        if (store && store.get('data') && new Date(store.get('expire')) > new Date()) {
            logger.log('return cache. ');
            store.get('data').forEach(function(item) { if (typeof itemCallback == 'function') itemCallback(item); });
            if (typeof finalCallback == 'function') 
                finalCallback(true, store.get('data'));
            return;
        }

        function errDispatcher(msg, cache) {
            if (cache) {
                logger.log('return cache. -> ' + msg);
                cache.forEach(function(item) { if (typeof itemCallback == 'function') itemCallback(item); });
                if (typeof finalCallback == 'function') 
                    finalCallback(true, cache);
            } else {
                if (typeof finalCallback == 'function')
                    finalCallback(false, msg);
            }
        }

        var req = new libly.Request(this.HOST_NAME + 'databases/' + this.dbname + '/items.json');
        req.addEventListener('onSuccess', libly.$U.bind(this, function(res) {
            var text = res.responseText;
            if (!text) {
                errDispatcher('respons is null.', store.get('data'));
                return;
            };
            var json = libly.$U.evalJson(text);
            if (!json) {
                errDispatcher('uailed eval json.', store.get('data'));
                return;
            };
            store.set('expire', new Date(new Date().getTime() + expire).toString());
            store.set('data', json);
            store.save();
            json.forEach(function(item) { if (typeof itemCallback == 'function') itemCallback(item); });
            if (typeof finalCallback == 'function')
                finalCallback(true, json);
        }));
        req.addEventListener('onFailure', function() errDispatcher('onFailure'));
        req.addEventListener('onException', function() errDispatcher('onException') );
        req.get();
    }
};
//}}}

//}
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

