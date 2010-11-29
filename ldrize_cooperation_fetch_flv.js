// Last Change: 12-Jun-2009. Jan 2008
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>Flv Downloader for Nicovideo</description>
    <author mail="trapezoid.g@gmail.com" homepage="http://unsigned.g.hatena.ne.jp/Trapezoid">Trapezoid</author>
    <version>0.5</version>
    <license>MIT License</license>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/ldrizecooperation_fetch_flv.js</updateURL>
    <detail><![CDATA[
== Detail ==
Flv downloader for nicovideo.


== Needs ==
- LDRize
- Minibuffer
- ldrize_cooperation.js 0.25<

== Commands ==
=== :fetchflv ===
>||
    Direct download flv from Nicovideo.
||<
=== :nicomylist ===
>||
    Select Nicovideo Mylist of registration destination.
||<

== Parts ==
- http://d.hatena.ne.jp/fls/20080309/p1
- Pagerization (c) id:ofk
- AutoPagerize (c) id:swdyjh
- JSDeferred id:cho45


== Variables ==
=== g:nicovideo_mylist ==
>||
    Nicovideo Mylist of registration destination.
||<
    ]]></detail>
</VimperatorPlugin>;

(function () {
function Deferred () this instanceof Deferred ? this.init(this) : new Deferred();
Deferred.prototype = {
    init : function () {
        this._next    = null;
        this.callback = {
            ok: function (x) x,
            ng: function (x) { throw  x }
        };
        return this;
    },

    next  : function (fun) this._post("ok", fun),
    error : function (fun) this._post("ng", fun),
    call  : function (val) this._fire("ok", val),
    fail  : function (err) this._fire("ng", err),

    cancel : function () {
        (this.canceller || function () {})();
        return this.init();
    },

    _post : function (okng, fun) {
        this._next = new Deferred();
        this._next.callback[okng] = fun;
        return this._next;
    },

    _fire : function (okng, value) {
        var self = this, next = "ok";
        try {
            value = self.callback[okng].call(self, value);
        } catch (e) {
            next  = "ng";
            value = e;
        }
        if (value instanceof Deferred) {
            value._next = self._next;
        } else if (self._next) {
            self._next._fire(next, value);
        }
        return this;
    }
};

Deferred.next = function (fun) {
    var d = new Deferred();
    var id = setTimeout(function () { clearTimeout(id); d.call() }, 0);
    if (fun) d.callback.ok = fun;
    d.canceller = function () { try { clearTimeout(id) } catch (e) {} };
    return d;
};

Deferred.wait = function (n) {
    var d = new Deferred(), t = new Date();
    var id = setTimeout(function () {
        d.call((new Date).getTime() - t.getTime());
    }, n * 1000);
    d.canceller = function () { clearTimeout(id) };
    return d;
};

function http (opts) {
    var d = Deferred();
    var req = new XMLHttpRequest();
    req.open(opts.method, opts.url, true, opts.user || null, opts.password || null);
    if (opts.headers) {
        for (var k in opts.headers) if (opts.headers.hasOwnProperty(k)) {
            req.setRequestHeader(k, opts.headers[k]);
        }
    }
    req.onreadystatechange = function () {
        if (req.readyState == 4) d.call(req);
    };
    req.send(opts.data || null);
    d.xhr = req;
    return d;
}
http.get  = function (url)       http({method:"get",  url:url});
http.post = function (url, data) http({method:"post", url:url, data:data, headers:{"Content-Type":"application/x-www-form-urlencoded"}});

Deferred.Deferred = Deferred;
Deferred.http     = http;


// copied from AutoPagerize (c) id:swdyh
function getElementsByXPath(xpath, node){
    node = node || document;
    var nodesSnapshot = (node.ownerDocument || node).evaluate(xpath, node, null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    var data = [];
    for(var i = 0, l = nodesSnapshot.snapshotLength; i < l;
            data.push(nodesSnapshot.snapshotItem(i++)));
    return (data.length > 0) ? data : null;
}

function getFirstElementByXPath(xpath, node){
    node = node || document;
    var result = (node.ownerDocument || node).evaluate(xpath, node, null,
            XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue ? result.singleNodeValue : null;
}

// copied from Pagerization (c) id:ofk
function parseHTML(str, ignoreTags) {
    var exp = "^[\\s\\S]*?<html(?:\\s[^>]*)?>|</html\\s*>[\\S\\s]*$";
    if (ignoreTags) {
        if (typeof ignoreTags == "string") ignoreTags = [ignoreTags];
        var stripTags = [];
        ignoreTags = ignoreTags.filter(function(tag) tag[tag.length - 1] == "/" || !stripTags.push(tag))
                               .map(function(tag) tag.replace(/\/$/, ""));
        if (stripTags.length > 0) {
            stripTags = stripTags.length > 1
                      ? "(?:" + stripTags.join("|") + ")"
                      : String(stripTags);
            exp += "|<" + stripTags + "(?:\\s[^>]*|/)?>|</" + stripTags + "\\s*>";
        }
    }
    str = str.replace(new RegExp(exp, "ig"), "");
    var res = document.implementation.createDocument(null, "html", null);
    var range = document.createRange();
    range.setStartAfter(window.content.document.body);
    res.documentElement.appendChild(res.importNode(range.createContextualFragment(str), true));
    if (ignoreTags) ignoreTags.forEach(function(tag) {
        var elements = res.getElementsByTagName(tag);
        for (var i = elements.length, el; el = elements.item(--i); el.parentNode.removeChild(el));
    });
    return res;
}

var DownloadManager = Cc['@mozilla.org/download-manager;1']
    .getService(Ci.nsIDownloadManager);

const nicoApiEndPoint = 'http://www.nicovideo.jp/api/getflv?v=';
const nicoWatchEndPoint = 'http://www.nicovideo.jp/watch/';

var groupId = liberator.globalVariables.nicovideo_mylist || '';

function NiconicoFlvHandler(url, title) {
    let videoId = url.match(/\w{2}\d+/)[0];
    let fileName = title.replace(/[?\\*\/:<>|"]/g, '_') + '.flv';

    Deferred.http.get(nicoApiEndPoint + videoId).next(function(apiResult){
        let flvUrl = decodeURIComponent(apiResult.responseText.match(/url=(.*?)&/)[1]);
        return Deferred.http.get(nicoWatchEndPoint + videoId).next(function(watchPage){
            let WebBrowserPersist = Cc['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
                .createInstance(Ci.nsIWebBrowserPersist);
            let sourceUri = makeURI(flvUrl, null, null);
            let file = DownloadManager.userDownloadsDirectory;
            file.appendRelativePath(fileName);
            let fileUri = makeFileURI(file);

            let download = DownloadManager.addDownload(
                0, sourceUri, fileUri, fileName,
                null, null, null, null, WebBrowserPersist
            );
            WebBrowserPersist.progressListener = download;
            WebBrowserPersist.saveURI(sourceUri, null, null, null, null, file);
        });
    }).error(function(e){
        log(e);
        liberator.echoerr(e);
    });
}
var count = 0;
function NiconicoMylistHandler(url, title){
    let videoId = url.match(/\w{2}\d+/)[0];

    Deferred.wait(count++ * 5).next(function(est){
        return Deferred.http.get(nicoWatchEndPoint + videoId).next(function(watchResult){
            var html = parseHTML(watchResult.responseText, ['img', 'script']);
            var csrfToken = getElementsByXPath('//input[@name="csrf_token"]', html)[0].value;
            var mylists = getElementsByXPath('id("mylist_add_group_id")/option', html).map(function(element) [element.innerHTML, element.value]);

            var params = [['ajax', '1'], ['mylist', 'add'], ['mylist_add', '“o˜^'], ['csrf_token', csrfToken], ['group_id', groupId]].map(function(p) p[0] + "=" + encodeURIComponent(p[1])).join("&");
            return Deferred.wait(count++ * 5).next(function(est){
                return Deferred.http.post(nicoWatchEndPoint + videoId, params).next(function(mylistResult){
                        liberator.log(mylistResult.responseText);
                });
            });
        });
    }).error(function(e){
        log(e);
        liberator.echoerr(e);
    });
}

function setupLDRizeCooperationNiconicoFlvFetcher() {
    let NiconicoFlvFetcher = {
        pattern: 'http://www.nicovideo.jp/watch/*',
        handler: {
            download: NiconicoFlvHandler,
            mylist: NiconicoMylistHandler
        },
        wait: 5000,
    };
    this.convertHandlerInfo([NiconicoFlvFetcher]);
    this.handlerInfo.unshift(NiconicoFlvFetcher);
}

if (liberator.plugins.LDRizeCooperation === undefined) {
    liberator.plugins.LDRizeCooperationPlugins = liberator.plugins.LDRizeCooperationPlugins || [];
    liberator.plugins.LDRizeCooperationPlugins.push(setupLDRizeCooperationNiconicoFlvFetcher);
}
else {
    setupLDRizeCooperationNiconicoFlvFetcher.apply(liberator.plugins.LDRizeCooperation);
}

function httpGET(uri, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) callback.call(this,xhr.responseText);
            else throw new Error(xhr.statusText)
        }
    };
    xhr.open('GET', uri, true);
    xhr.send(null);
}

liberator.modules.commands.addUserCommand(
    ['fetchflv'],
    'Download flv file from Nicovideo',
    function (arg) {
        httpGET(
            arg.string || liberator.modules.buffer.URL,
            function (responseText) {
                let [, title] = responseText.match(/<title(?:[ \t\r\n][^>]*)?>([^<]*)<\/title[ \t\n\r]*>/i);
                liberator.log(title);
                NiconicoFlvHandler(arg.string || liberator.modules.buffer.URL, title);
            }
        );
    },
    {}
);
liberator.modules.commands.addUserCommand(
    ['nicomylist'],
    'Select Nicovideo mylist',
    function (arg) {
        groupId = arg.string;
    },
    {
        completer: function(context,arg){
            Deferred.http.get(nicoWatchEndPoint + "sm2757983").next(function(watchResult){
                var html = parseHTML(watchResult.responseText, ['img', 'script']);
                var mylists = getElementsByXPath('id("mylist_add_group_id")/option', html).map(function(element) [element.value, element.innerHTML]);
                context.title = ['ID', 'Name'];
                context.advance = mylists.length;
                context.completions = mylists;
            }).error(function(e){
                log(e);
                liberator.echoerr(e);
            });
        }
    });
})();
