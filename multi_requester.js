/**
 * ==VimperatorPlugin==
 * @name             multi_requester.js
 * @description      request, and the result is displayed in the buffer.
 * @description-ja   リクエストの結果をバッファに出力する。
 * @author           suVene suvene@zeromemory.info
 * @version          0.1.0
 * @minVersion       1.2
 * @maxVersion       1.2
 * ==/VimperatorPlugin==
 *
 * Usage:
 * :mr alc {ENY_TEXT or SELECTED_TEXT}  -> show the buffer.
 * :mr goo! {ENY_TEXT or SELECTED_TEXT} -> show the new tab.
 *
 * custom:
 * [COMMAND](default [mr])
 *   let g:multi_requester_command = "ANY1, ANY2, ……";
 *     or
 *   liberator.globalVariables.multi_requester_command = [ANY1, ANY2, ……];
 *
 * [SITEINFO]
 * ex.)
 * javascript <<EOM
 * liberator.globalVariables.multi_requester_siteinfo = [
 *     {
 *         name:        'lo',                             // required
 *         description: 'local',                          // required
 *         url:         'http://localhost/index.html?%s', // required, %s <-- replace string
 *         resultXpath: '//*',                            // optional(default all)
 *         srcEncode:   'SHIFT-JIS',                      // optional(default UTF-8)
 *         urlEncode:   'SHIFT-JIS',                      // optional(default srcEncode)
 *         ignoreTags:  'img',                            // optional(default script), syntax tag1,tag2,……
 *     },
 * ];
 * EOM
 *
 * [MAPPINGS]
 * ex.)
 * javascript <<EOM
 * liberator.globalVariables.multi_requester_mappings = [
 *     [',ml', 'lo'],              // <-- :mr lo
 *     [',ma', 'alc'],             // <-- :mr alc
 *     [',mg', 'goo', '!'],        // <-- :mr! goo
 * ];
 * EOM
 *
 */
(function() {

var DEFAULT_COMMAND = ['mr'];
var DEFAULT_SITEINFO = [
    {
        name:        'alc',
        description: 'SPACE ALC (\u82F1\u8F9E\u6717 on the Web)',
        url:         'http://eow.alc.co.jp/%s/UTF-8/',
        resultXpath: 'id("resultList")'
     },
     {
        name:        'goo',
        description: 'goo \u8F9E\u66F8',
        url:         'http://dictionary.goo.ne.jp/search.php?MT=%s&kind=all&mode=0',
        resultXpath: '//div[@id="incontents"]/*[@class="ch04" or @class="fs14" or contains(@class, "diclst")]',
        srcEncode:   'EUC-JP',
        urlEncode:   'EUC-JP',
     },
];

// utilities
var $U = {
    log: function(msg, level) {
        liberator.log(msg, (level || 9));
    },
    debug: function(msg) {
        this.log(msg, 9);
        liberator.echo(msg);
    },
    echo: function(msg) {
        liberator.echo(msg, liberator.commandline.FORCE_MULTILINE);
    },
    echoerr: function(msg) {
        liberator.log(msg, 5);
        liberator.echoerr(msg);
    },
    extend: function(dst, src) {
        for (var prop in src)
            dst[prop] = src[prop];
         return dst;
    },
    bind: function(obj, func) {
        return function() {
            return func.apply(obj, arguments);
        }
    },
    stripTags: function(str, tags) {
        var ignoreTags = [].concat(tags);
        ignoreTags = '(?:' + ignoreTags.join('|') + ')';
        return str.replace(new RegExp('<' + ignoreTags + '(?:\\s[^>]*|/)?>([\\S\\s]*?)<\/' + ignoreTags + '\\s*>', 'img'), '');
    },
    stripScripts: function(str) {
        return this.stripScripts(str, 'script');
    },
    getCommand: function() {
        var c = liberator.globalVariables.multi_requester_command;
        var ret;
        if (typeof c == 'string') {
            ret = [c];
        } else if (typeof c == 'Array') {
            ret = check;
        } else {
            ret = DEFAULT_COMMAND;
        }
        return ret;
    },
    getSiteInfo: function() {
        var ret = {};

        DEFAULT_SITEINFO.forEach(function(site) {
            if (!ret[site.name]) ret[site.name] = {};
            $U.extend(ret[site.name], site);
        });

        if (liberator.globalVariables.multi_requester_siteinfo) {
            liberator.globalVariables.multi_requester_siteinfo.forEach(function(site) {
                if (!ret[site.name]) ret[site.name] = {};
                $U.extend(ret[site.name], site);
            });
        }

        var result = [];
        for (var v in ret)
            result.push(ret[v]);

        return result;
    },
};

// vimperator plugin command register
var CommandRegister = {
    register: function(cmdClass, siteinfo) {
        cmdClass.siteinfo = siteinfo;
        var options = undefined;
        if (typeof cmdClass.createOptions == 'function') options = cmdClass.createOptions();
        liberator.commands.addUserCommand(
            cmdClass.name,
            cmdClass.description,
            $U.bind(cmdClass, cmdClass.action),
            {
                completer: cmdClass.completer || function(filter, special) {
                    var allSuggestions = siteinfo.map(function(s) [s.name, s.description] );
                    if (!filter) return [0, allSuggestions];
                    var suggestions = allSuggestions.filter(function(s) {
                        return s[0].indexOf(filter) == 0;
                    });
                    return [0, suggestions];
                },
                options: options,
                argCount: cmdClass.argCount || undefined,
                bang: cmdClass.bang || true,
                count: cmdClass.count || false,
            }
        );

        if (liberator.globalVariables.multi_requester_mappings) {
            this.addUserMaps(cmdClass.name[0], liberator.globalVariables.multi_requester_mappings);
        }
    },
    addUserMaps: function(prefix, mapdef) {
        mapdef.forEach(function([key, command, special]) {
            var cmd = prefix + (special ? '! ' : ' ') + command + ' ';
            liberator.mappings.addUserMap(
                [liberator.modes.NORMAL, liberator.modes.VISUAL],
                [key],
                "user defined mapping",
                function() {
                    var sel = (new XPCNativeWrapper(window.content.window)).getSelection();
                    if (sel.toString().length) {
                        liberator.execute(cmd + sel.getRangeAt(0));
                    } else {
                        liberator.commandline.open(':', cmd, liberator.modes.EX);
                    }
                },
                {
                    rhs: ':' + cmd,
                    norremap: true
                }
            );
        });
    },
};


// like prototype.js
var Requester = function() {
    this.initialize.apply(this, arguments);
};
Requester.EVENTS = ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];
Requester.requestCount = 0;
Requester.prototype = {
    initialize: function(url, headers, options) {
        this.url = url;
        this.headers = headers || {};
        this.options = $U.extend({
            asynchronous: true,
            encoding: 'UTF-8',
        }, options || {});
        this.observers = {};
    },
    addEventListener: function(name, func) {
        try {
            if (typeof this.observers[name] == 'undefined') this.observers[name] = [];
            this.observers[name].push(func);
        } catch(e) {
            if (!this.fireEvent('onException', e)) throw e;
        }
    },
    fireEvent: function(name, args) {
        if (!(this.observers[name] instanceof Array)) return false;
        this.observers[name].forEach(function(event) {
            setTimeout(function() { event(args) }, 10);
        });
        return true;
    },
    _complete: false,
    _request: function(method) {

        Requester.requestCount++;
        this.transport = new XMLHttpRequest();
        this.transport.open(method, this.url, this.options.asynchronous);

        this.transport.onreadystatechange = $U.bind(this, this._onStateChange);
        this.setRequestHeaders();
        this.transport.overrideMimeType('text/html; charset=' + this.options.encoding);

        this.body = this.method == 'POST' ? this.options.postBody : null;

        this.transport.send(this.body);
    },
    _onStateChange: function() {
        var readyState = this.transport.readyState;
        if (readyState > 1 && !((readyState == 4) && this._complete))
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
        var state = Requester.EVENTS[readyState];
        var response = new Response(this);

        if (state == 'Complete') {
            Requester.requestCount--;
            try {
                this._complete = true;
                this.fireEvent((this.isSuccess() ? 'onSuccess' : 'onFailure'), response);
            } catch (e) {
                if (!this.fireEvent('onException', e)) throw e;
            }
         }
    },
    setRequestHeaders: function() {
        var headers = {
            'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
        };

        if (this.method == 'POST') {
            headers['Content-type'] = 'application/x-www-form-urlencoded' +
                (this.options.encoding ? '; charset=' + this.options.encoding : '');

            if (this.transport.overrideMimeType && (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
                 headers['Connection'] = 'close';
        }

        for (var key in this.headers)
            if (this.headers.hasOwnProperty(key)) headers[key] = this.headers[key];

        for (var name in headers)
            this.transport.setRequestHeader(name, headers[name]);

    },
    get: function() {
        this._request('GET');
    },
    post: function() {
        this._request('POST');
    },
};

var Response = function() {
    this.initialize.apply(this, arguments);
};
Response.prototype = {
    initialize: function(request) {
        this.request = request;
        this.transport = request.transport;
        this.isSuccess = request.isSuccess();
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
    getStatus: Requester.prototype.getStatus,
    getStatusText: function() {
        try {
            return this.transport.statusText || '';
        } catch (e) { return ''; }
    },

    getHTMLDocument: function(xpath, xmlns) {
        if (!this.doc) {
            this.htmlFragmentstr = this.responseText.replace(/^[\s\S]*?<html(?:\s[^>]+?)?>|<\/html\s*>[\S\s]*$/ig, '').replace(/[\r\n]+/g,' ');
            var ignoreTags = ['script'];
            if (this.request.options.siteinfo.ignoreTags) {
              ignoreTags.concat(this.request.options.siteinfo.ignoreTags.split(','));
            }
            this.htmlStripScriptFragmentstr = $U.stripTags(this.htmlFragmentstr, 'script');
            this.doc = this._createHTMLDocument(this.htmlStripScriptFragmentstr, xmlns);
        }

        var ret = this.doc;
        if (xpath) {
            ret = this.getNodeFromXPath(xpath, this.doc);
        }
        return ret;
    },
    _createHTMLDocument: function(str, xmlns) {
        //str = '<html><title>hoge</title><body><span id="resultList">fuga</span></body></html>';
        var doc = (new DOMParser).parseFromString(
            '<root' + (xmlns ? ' xmlns="' + xmlns + '"' : '') + '>' + str + '</root>',
            'application/xml');
        var imported = document.importNode(doc.documentElement, true);
        var range = document.createRange();
        range.selectNodeContents(imported);
        var fragment = range.extractContents();
        range.detach();
        var dom = fragment.lastChild;
        if (dom.tagName == 'parserError' || dom.namespaceURI == 'http://www.mozilla.org/newlayout/xml/parsererror.xml') {
            return this._createHTMLDocument2(str);
        } else {
          return fragment.childNodes.length > 1 ? fragment : fragment.firstChild;
        }
    },
    _createHTMLDocument2: function(str) {
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
        parentNode = parentNode || document.createElementNS(null, 'div');
        for(var i = 0, l = nodesSnapshot.snapshotLength; i < l; parentNode.appendChild(nodesSnapshot.snapshotItem(i++)));
        return parentNode;
    },
};

// main controller
var MultiRequester = {
    name: $U.getCommand(),
    description: 'request, and show the result in the buffer',
    action: function(args, special, count) {

        var arg = this.parseArgs(args);
        if (!arg.str) { return; } // do nothing

        var site = arg.site;

        var url = site.url;
        // see: http://fifnel.com/2008/11/14/1980/
        var srcEncode = site.srcEncode || 'UTF-8';
        var urlEncode = site.urlEncode || srcEncode;

        // via. lookupDictionary.js
        var ttbu = Components.classes['@mozilla.org/intl/texttosuburi;1']
                        .getService(Components.interfaces.nsITextToSubURI);
        url = url.replace(/%s/g, ttbu.ConvertAndEscape(urlEncode, arg.str));
        $U.debug(url);

        if (special) {
            liberator.open(url, liberator.NEW_TAB)
        } else {
            var req = new Requester(url, null, {
                encoding: srcEncode,
                siteinfo: site,
                args: {
                    args: args,
                    special: special,
                    count: count,
                }
            });
            req.addEventListener('onException', $U.bind(this, this.onException));
            req.addEventListener('onSuccess', $U.bind(this, this.onSuccess));
            req.addEventListener('onFailure', $U.bind(this, this.onFailure));

            req.get();
        }
    },
    // return {name: '', site: {}, str: ''} or null
    parseArgs: function(args) {
        var ret = null;
        if (!args) return ret;

        ret = {};
        var ary = args.split(/ +/);
        ret.name = ary.shift();
        if (ary.length >= 1) {
            ret.site = this.getSite(ret.name);
        }
        ret.str = ary.join(' ');

        return ret;
    },
    getSite: function(name) {
        if (!name) this.siteinfo[0];
        var ret = null;
        this.siteinfo.forEach(function(s) {
            if (s.name == name) ret = s;
        });
        return ret ? ret : this.siteinfo[0];
    },
    onSuccess: function(res) {
        if (!res.isSuccess || res.responseText == '') {
            return $U.echoerr('request error.');
        }
        try {
            var doc = res.getHTMLDocument(res.request.options.siteinfo.resultXpath);
            var args = res.request.options.args;
            var xs  = new XMLSerializer();
            $U.echo('<base href="' + res.request.url + '"/>' + xs.serializeToString(doc));

        } catch(e) {
            $U.echoerr('parse error');
        }

    },
    onFailure: function(res) {
        $U.echoerr('request error!!:  ' + res.statusText);
    },
    onException: function(e) {
        $U.echoerr('error!!: ' + e);
    },
};

CommandRegister.register(MultiRequester, $U.getSiteInfo());
return MultiRequester;

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:
