// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>libly(filename _libly.js)</name>
    <description>vimperator plugins library?</description>
    <description lang="ja">適当なライブラリっぽいものたち。</description>
    <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
    <version>0.1.6</version>
    <minVersion>1.2</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <detail><![CDATA[
== Objects ==
- liberator.plugins.libly.$U
- liberator.plugins.libly.Request
- liberator.plugins.libly.Response

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
deteFormat(dtm, fmt):
  Date型インスタンスを、指定されたフォーマットで文字列に変換します。
  fmt を省略した場合、"%y/%M/%d %h:%m:%s" となります。

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
pathToURL(path):
  相対パスを絶対パスに変換します。
getHTMLFragment(html):
  <html>※1</html>
  ※1 の文字列を取得します。
stripTags(str, tags):
  str から tags で指定されたタグを取り除いて返却します。
  tags は文字列、または配列で指定して下さい。
createHTMLDocument(str):
  引数 str より、HTMLFragment を作成します。
getNodesFromXPath(xpath, doc, callback, obj):
  xpath を評価し snapshot の配列を返却します。
    ]]></detail>
</VimperatorPlugin>;
//}}}
if (!liberator.plugins.libly) {

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
        if (typeof iterable == 'undefined') return ret;
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
    // }}}
    // Browser {{{
    getSelectedString: function() {
         return (new XPCNativeWrapper(window.content.window)).getSelection().toString();
    },
    getUserAndPassword: function(hostname, formSubmitURL, username) {
        try {
            var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
            var logins = passwordManager.findLogins({}, hostname, formSubmitURL, null);
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
    pathToURL: function(a, doc) {
        if (!a) return '';
        var path = (a.href || a.action || a.value || a);
        if (/^https?:\/\//.test(path)) return path;
        var link = (doc || window.content.documtent).createElement('a');
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
    createHTMLDocument: function(str, doc) {
        doc = doc || window.content.document;
        var htmlFragment = doc.implementation.createDocument(null, 'html', null);
        var range = doc.createRange();
        range.setStartAfter(doc.body);
        htmlFragment.documentElement.appendChild(htmlFragment.importNode(range.createContextualFragment(str), true));
        return htmlFragment;
    },
    getNodesFromXPath: function(xpath, doc, callback, obj) {
        var ret = [];
        if (!xpath || !doc) return ret;
        var node = doc || window.content.document;
        var nodesSnapshot = (node.ownerDocument || node).evaluate(xpath, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0, l = nodesSnapshot.snapshotLength; i < l; i++) {
            if (typeof callback == 'function') callback.call(obj, nodesSnapshot.snapshotItem(i), i);
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
    getHTMLDocument: function(xpath, xmlns, ignoreTags, callback) {
        if (!this.doc) {
            this.htmlFragmentstr = libly.$U.getHTMLFragment(this.responseText);
            this.htmlStripScriptFragmentstr = libly.$U.stripTags(this.htmlFragmentstr, ignoreTags);
            this.doc = libly.$U.createHTMLDocument(this.htmlStripScriptFragmentstr, xmlns);
        }
        if (!xpath) xpath = '//*';
        return libly.$U.getNodesFromXPath(xpath, this.doc, callback);
    }
};
//}}}

}
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

