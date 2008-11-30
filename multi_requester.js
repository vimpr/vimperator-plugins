/**
 * ==VimperatorPlugin==
 * @name             multi_requester.js
 * @description      request, and the result is displayed to the buffer.
 * @description-ja   リクエストの結果をバッファに出力する。
 * @author           suVene suvene@zeromemory.info
 * @version          0.3.3
 * @minVersion       2.0pre
 * @maxVersion       2.0pre
 * Last Change:      01-Dec-2008.
 * ==/VimperatorPlugin==
 *
 * Usage:
 *   command[!] subcommand [ANY_TEXT]
 *
 *     !                create new tab.
 *     ANY_TEXT         your input text
 *
 *   :mr  alc[,goo,any1,any2…] ANY_TEXT           -> request by the input text, and display to the buffer.
 *   :mr! goo[,any1,any2,…]    {window.selection} -> request by the selected text, and display to the new tab.
 *
 *   other siteinfo by wedata.
 *     @see http://wedata.net/databases/Multi%20Requester/items
 *
 * CUSTOMIZE .vimperatorrc:
 *
 * [COMMAND](default [mr])
 *   let g:multi_requester_command = "ANY1, ANY2, ……"
 *     or
 *   liberator.globalVariables.multi_requester_command = [ANY1, ANY2, ……];
 *
 * [SITEINFO]
 *   ex.)
 *   javascript <<EOM
 *   liberator.globalVariables.multi_requester_siteinfo = [
 *       {
 *           name:        'ex',                             // required
 *           description: 'example',                        // required
 *           url:         'http://example.com/?%s',         // required, %s <-- replace string
 *           xpath:       '//*',                            // optional(default all)
 *           srcEncode:   'SHIFT_JIS',                      // optional(default UTF-8)
 *           urlEncode:   'SHIFT_JIS',                      // optional(default srcEncode)
 *           ignoreTags:  'img'                             // optional(default script), syntax 'tag1,tag2,……'
 *       },
 *   ];
 *   EOM
 *
 * [MAPPINGS]
 *   ex.)
 *   javascript <<EOM
 *   liberator.globalVariables.multi_requester_mappings = [
 *       [',ml', 'ex'],                  // == :mr  ex
 *       [',mg', 'goo', '!'],            // == :mr! goo
 *       [',ma', 'alc',    , 'args'],    // == :mr  alc args
 *   ];
 *   EOM
 *
 * [OTHER OPTIONS]
 *   let g:multi_requester_use_wedata = "false"             // true by default
 *
 *
 * TODO:
 *    - wedata local cache.
 */
(function() {

var DEFAULT_COMMAND = ['mr'];
var SITEINFO = [
    {
        name:        'alc',
        description: 'SPACE ALC (\u82F1\u8F9E\u6717 on the Web)',
        url:         'http://eow.alc.co.jp/%s/UTF-8/',
        xpath:       'id("resultList")'
    },
    {
        name:        'goo',
        description: 'goo \u8F9E\u66F8',
        url:         'http://dictionary.goo.ne.jp/search.php?MT=%s&kind=all&mode=0&IE=UTF-8',
        xpath:       'id("incontents")/*[@class="ch04" or @class="fs14" or contains(@class, "diclst")]',
        srcEncode:   'EUC-JP',
        urlEncode:   'UTF-8'
    },
];

var mergedSiteinfo = {};

// utilities
var $U = {
    log: function(msg, level) {
        liberator.log(msg, (level || 8));
    },
    debug: function(msg) {
        this.log(msg, 8);
        liberator.echo(msg);
    },
    echo: function(msg, flg) {
        flg = flg || commandline.FORCE_MULTILINE
        liberator.echo(msg, flg);
    },
    echoerr: function(msg) {
        liberator.log(msg, 5);
        liberator.echoerr(msg);
    },
    extend: function(dst, src) {
        for (let prop in src)
            dst[prop] = src[prop];
         return dst;
    },
    A: function(hash) {
        var ret = [];
        for (let v in hash) ret.push(hash[v]);
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
    stripScripts: function(str) {
        return this.stripScripts(str, 'script');
    },
    eval: function(text) {
        var fnc = window.eval;
        var sandbox;
        try {
            sandbox = new Components.utils.Sandbox(window);
            if (Components.utils.evalInSandbox("true", sandbox) === true) {
                fnc = function(text) { return Components.utils.evalInSandbox(text, sandbox); };
            }
        } catch (e) { $U.log('warning: multi_requester.js is working with unsafe sandbox.'); }

        return fnc(text);
    },
    // via. sbmcommentsviwer.js
    evalJson: function(str, toRemove) {
        var json;
        try {
            json = Components.classes['@mozilla.org/dom/json;1'].getService(Components.interfaces.nsIJSON);
            if (toRemove) str = str.substring(1, str.length - 1);
            return json.decode(str);
        } catch (e) { return null; }
    },
    getSelectedString: function() {
         var sel = (new XPCNativeWrapper(window.content.window)).getSelection();
         return sel.toString();
    }
};

// vimperator plugin command register
var CommandRegister = {
    register: function(cmdClass, siteinfo) {
        cmdClass.siteinfo = siteinfo;

        commands.addUserCommand(
            cmdClass.name,
            cmdClass.description,
            $U.bind(cmdClass, cmdClass.cmdAction),
            {
                completer: cmdClass.cmdCompleter || function(context, arg) {
                    context.title = ['Name', 'Descprition'];
                    let filters = context.filter.split(',');
                    let prefilters = filters.slice(0, filters.length - 1);
                    let prefilter = !prefilters.length ? '' : prefilters.join(',') + ',';
                    let subfilters = siteinfo.filter(function(s) prefilters.every(function(p) s.name != p));
                    var allSuggestions = subfilters.map(function(s) [prefilter + s.name, s.description]);
                    context.completions = context.filter
                        ? allSuggestions.filter(function(s) s[0].indexOf(context.filter) == 0)
                        : allSuggestions;
                },
                options: cmdClass.cmdOptions,
                argCount: cmdClass.argCount || undefined,
                bang: cmdClass.bang || true,
                count: cmdClass.count || false
            },
            true // replace
        );

    },
    addUserMaps: function(prefix, mapdef) {
        mapdef.forEach(function([key, command, special, args]) {
            var cmd = prefix + (special ? '! ' : ' ') + command + ' ';
            mappings.addUserMap(
                [modes.NORMAL, modes.VISUAL],
                [key],
                "user defined mapping",
                function() {
                    if (args) {
                        liberator.execute(cmd + args);
                    } else {
                        let sel = $U.getSelectedString();
                        if (sel.length) {
                            liberator.execute(cmd + sel);
                        } else {
                            commandline.open(':', cmd, modes.EX);
                        }
                    }
                },
                {
                    rhs: ':' + cmd,
                    norremap: true
                }
            );
        });
    }
};


// like the Prototype JavaScript framework
var Request = function() {
    this.initialize.apply(this, arguments);
};
Request.EVENTS = ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];
Request.requestCount = 0;
Request.prototype = {
    initialize: function(url, headers, options) {
        this.url = url;
        this.headers = headers || {};
        this.options = $U.extend({
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

        Request.requestCount++;

        this.transport = new XMLHttpRequest();
        this.transport.open(method, this.url, this.options.asynchronous);

        this.transport.onreadystatechange = $U.bind(this, this._onStateChange);
        this.setRequestHeaders();
        this.transport.overrideMimeType('text/html; charset=' + this.options.encoding);

        this.body = this.method == 'POST' ? this.options.postBody : null;

        this.transport.send(this.body);

        // Force Firefox to handle ready state 4 for synchronous requests
        if (!this.options.asynchronous && this.transport.overrideMimeType)
            this._onStateChange();
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
        var state = Request.EVENTS[readyState];
        var response = new Response(this);

        if (state == 'Complete') {
            Request.requestCount--;
            try {
                this._complete = true;
                this.fireEvent('on' + (this.isSuccess() ? 'Success' : 'Failure'), response, this.options.asynchronous);
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
    getStatus: Request.prototype.getStatus,
    getStatusText: function() {
        try {
            return this.transport.statusText || '';
        } catch (e) { return ''; }
    },
    getHTMLDocument: function(xpath, xmlns) {
        if (!this.doc) {
            this.htmlFragmentstr = this.responseText.replace(/^[\s\S]*?<html(?:[ \t\n\r][^>]*)?>|<\/html[ \t\r\n]*>[\S\s]*$/ig, '').replace(/[\r\n]+/g, ' ');
            let ignoreTags = ['script'];
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

// initial data access.
var DataAccess = {
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

        var useWedata = typeof liberator.globalVariables.multi_requester_use_wedata == 'undefined' ?
                        true : $U.eval(liberator.globalVariables.multi_requester_use_wedata);

        if (useWedata) {
            $U.log('use Wedata');
            this.getWedata(function(site) {
                if (mergedSiteinfo[site.name]) return;
                mergedSiteinfo[site.name] = {};
                $U.extend(mergedSiteinfo[site.name], site);
            });
        }

        if (liberator.globalVariables.multi_requester_siteinfo) {
            liberator.globalVariables.multi_requester_siteinfo.forEach(function(site) {
                if (!mergedSiteinfo[site.name]) mergedSiteinfo[site.name] = {};
                $U.extend(mergedSiteinfo[site.name], site);
            });
        }

        SITEINFO.forEach(function(site) {
            if (!mergedSiteinfo[site.name]) mergedSiteinfo[site.name] = {};
            $U.extend(mergedSiteinfo[site.name], site);
        });

        return $U.A(mergedSiteinfo);
    },
    getWedata: function(func) {
        var req = new Request(
            'http://wedata.net/databases/Multi%20Requester/items.json'
        );
        req.addEventListener('onSuccess', function(res) {
            var text = res.responseText;
            if (!text) return;
            var json = $U.evalJson(text);
            if (!json) return;

            json.forEach(function(item) func(item.data));
            CommandRegister.register(MultiRequester, $U.A(mergedSiteinfo));

        });
        req.get();
    }
};

// main controller.
var MultiRequester = {
    doProcess: false,
    requestCount: 0,
    echoList: [],
    name: DataAccess.getCommand(),
    description: 'request, and display to the buffer',
    cmdAction: function(args) {

        if (MultiRequester.doProcess) return;

        var argstr = args.string;
        var bang = args.bang;
        var count = args.count;

        var parsedArgs = this.parseArgs(argstr);
        if (parsedArgs.count == 0) { return; } // do nothing

        MultiRequester.doProcess = true;
        MultiRequester.requestCount = 0;
        MultiRequester.echoList = [];
        var siteinfo = parsedArgs.siteinfo;
        for (let i = 0, len = parsedArgs.count; i < len; i++) {

            let info = siteinfo[i];
            var url = info.url;
            // see: http://fifnel.com/2008/11/14/1980/
            var srcEncode = info.srcEncode || 'UTF-8';
            var urlEncode = info.urlEncode || srcEncode;

            var idxRepStr = url.indexOf('%s');
            if (idxRepStr > -1 && !parsedArgs.str) continue;

            // via. lookupDictionary.js
            var ttbu = Components.classes['@mozilla.org/intl/texttosuburi;1']
                                 .getService(Components.interfaces.nsITextToSubURI);
            url = url.replace(/%s/g, ttbu.ConvertAndEscape(urlEncode, parsedArgs.str));
            $U.log(url + '[' + srcEncode + '][' + urlEncode + ']::' + info.xpath);

            if (bang) {
                liberator.open(url, liberator.NEW_TAB);
            } else {
                let req = new Request(url, null, {
                    encoding: srcEncode,
                    siteinfo: info,
                    args: {
                        args: args,
                        bang: bang,
                        count: count
                    }
                });
                req.addEventListener('onException', $U.bind(this, this.onException));
                req.addEventListener('onSuccess', $U.bind(this, this.onSuccess));
                req.addEventListener('onFailure', $U.bind(this, this.onFailure));
                req.get();
                MultiRequester.requestCount++;
            }
        }

        $U.echo('Loading ' + parsedArgs.names + ' ...', commandline.FORCE_SINGLELINE);
    },
    // return {names: '', str: '', count: 0, siteinfo: [{}]}
    parseArgs: function(args) {

        var self = this;
        var ret = {};
        ret.names = '';
        ret.str = '';
        ret.count = 0;
        ret.siteinfo = [];

        if (!args) return ret;

        var arguments = args.split(/ +/);
        var sel = $U.getSelectedString();

        if (arguments.length < 1) return ret;

        ret.names = arguments.shift();
        ret.str = (arguments.length < 1 ? sel : arguments.join()).replace(/[\n\r]+/g, '');

        ret.names.split(',').forEach(function(name) {
            let site = self.getSite(name);
            if (site) {
                ret.count++;
                ret.siteinfo.push(site);
            }
        });

        return ret;
    },
    getSite: function(name) {
        if (!name) this.siteinfo[0];
        var ret = null;
        this.siteinfo.forEach(function(s) {
            if (s.name == name) ret = s;
        });
        return ret;
    },
    onSuccess: function(res) {

        if (!MultiRequester.doProcess) {
            MultiRequester.requestCount = 0;
            return;
        }

        var url, escapedUrl, xpath, doc, html;
        $U.log('success!!!' + res.request.url);
        MultiRequester.requestCount--;

        try {

            if (!res.isSuccess || res.responseText == '') throw 'response is fail or null';

            url = res.request.url;
            escapedUrl = util.escapeHTML(url);
            xpath = res.request.options.siteinfo.xpath;
            doc = res.getHTMLDocument(xpath);
            if (!doc) throw 'XPath result is undefined or null.: XPath -> ' + xpath;

            html = '<div style="white-space:normal;"><base href="' + escapedUrl + '"/>' +
                   '<a href="' + escapedUrl + '" class="hl-Title" target="_self">' + escapedUrl + '</a>' +
                   (new XMLSerializer()).serializeToString(doc).replace(/<[^>]+>/g, function(all) all.toLowerCase()) +
                   '</div>';

            MultiRequester.echoList.push(html);

            if (MultiRequester.requestCount == 0) {
                MultiRequester.doProcess = false;
                let html = MultiRequester.echoList.join('');
                try { $U.echo(new XMLList(html)); } catch (e) { $U.echo(html); }
            }

        } catch (e) {
            $U.log('error!!: ' + e);
            MultiRequester.echoList.push('error!!:' + e);
        }
    },
    onFailure: function(res) {
        MultiRequester.doProcess = false;
        $U.echoerr('request failure!!: ' + res.statusText);
    },
    onException: function(e) {
        MultiRequester.doProcess = false;
        $U.echoerr('exception!!: ' + e);
    }
};

CommandRegister.register(MultiRequester, DataAccess.getSiteInfo());
if (liberator.globalVariables.multi_requester_mappings) {
    CommandRegister.addUserMaps(MultiRequester.name[0], liberator.globalVariables.multi_requester_mappings);
}

return MultiRequester;

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

