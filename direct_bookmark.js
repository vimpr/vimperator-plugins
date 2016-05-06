var INFO = xml`<plugin name=${NAME} version="0.19.0"
        href="https://github.com/vimpr/vimperator-plugins/raw/master/direct_bookmark.js"
        summary="Direct Post to Social Bookmarks"
        lang="en_US"
        xmlns="http://vimperator.org/namespaces/liberator">
    <project name="Vimperator" minVersion="3.6"/>
    <author email="trapezoid.g@gmail.com" homepage="http://unsigned.g.hatena.ne.jp/Trapezoid/">Trapezoid</author>
    <license>GPL</license>
    <p>Social Bookmark direct add script</p>
    <p>for Migemo search: require XUL/Migemo Extension</p>
    <h3 tag="directBookmark_Parts">Parts</h3>
    <ul>
        <li>http://d.hatena.ne.jp/fls/20080309/p1</li>
        <li>Pagerization (c) id:ofk</li>
        <li>AutoPagerize (c) id:swdyh</li>
        <li>direct_delb.js id:mattn</li>
        <li>JSDeferred id:cho45</li>
    </ul>
    <h3 tag="directBookmark_variables">Viriables</h3>
    <h4 tag="direct_sbm_use_services_by_tag">g:direct_sbm_use_services_by_tag</h4>
    <p>Use social bookmark services to extract tags</p>
    <dl>
        <dt>h</dt><dd>Hatena Bookmark</dd>
        <dt>d</dt><dd>del.icio.us</dd>
        <dt>l</dt><dd>livedoor clip</dd>
        <dt>g</dt><dd>Google Bookmarks</dd>
        <dt>p</dt><dd>Places (Firefox bookmarks)</dd>
        <dt>P</dt><dd>pinboard.in</dd>
    </dl>
    <p>Usage: <ex>let g:direct_sbm_use_services_by_tag = "hdl"</ex></p>

    <h4 tag="direct_sbm_use_services_by_post">g:direct_sbm_use_services_by_post</h4>
    <p>Use social bookmark services to post</p>
    <dl>
        <dt>h</dt><dd>Hatena Bookmark</dd>
        <dt>d</dt><dd>del.icio.us</dd>
        <dt>l</dt><dd>livedoor clip</dd>
        <dt>g</dt><dd>Google Bookmarks</dd>
        <dt>P</dt><dd>pinboard.in</dd>
    </dl>
    <p>Usage: <ex>let g:direct_sbm_use_services_by_post = "hdl"</ex></p>

    <h4 tag="direct_sbm_echo_type">g:direct_sbm_echo_type</h4>
    <p>Post message type</p>
    <dl>
        <dt>simple</dt><dd>single line, no posted services description</dd>
        <dt>multiline</dt><dd>multi line, display services description</dd>
        <dt>none</dt><dd>hide post message</dd>
    </dl>

    <h4 tag="direct_sbm_is_normalize">g:direct_sbm_is_normalize</h4>
    <p>Use normalize permalink</p>

    <h4 tag="direct_sbm_is_use_migemo">g:direct_sbm_is_use_migemo</h4>
    <p>Use Migemo completion</p>

    <h4 tag="direct_sbm_private">g:direct_sbm_private</h4>
    <p>Private bookmark</p>

    <item>
        <tags>:btags</tags>
        <spec>:btags</spec>
        <description>
            <p>Extract tags from social bookmarks for completion</p>
        </description>
    </item>
    <item>
        <tags>:sbm</tags>
        <spec>:sbm <oa>-s<oa>ervice</oa> <a>service</a></oa></spec>
        <description>
            <p>Post a current page to social bookmarks.</p>
            <p><a>service</a>: Specify target SBM services to post (default: "hdl")</p>
        </description>
    </item>
    <item>
        <tags>:bentry</tags>
        <spec>:bentry</spec>
        <description>
            <p>Goto Bookmark Entry Page</p>
        </description>
    </item>
    <item>
        <tags>:bicon</tags>
        <spec>:bicon</spec>
        <description>
            <p>Show Bookmark Count as Icon</p>
        </description>
    </item>
</plugin>`;

(function(){
    var evalFunc = window.eval;
    try {
        var sandbox = new Components.utils.Sandbox(window);
        if (Components.utils.evalInSandbox("true", sandbox) === true) {
            evalFunc = function(text) {
                return Components.utils.evalInSandbox(text, sandbox);
            }
        }
    } catch(e) { liberator.log('warning: direct_bookmark.js is working with unsafe sandbox.'); }

    var useServicesByPost = liberator.globalVariables.direct_sbm_use_services_by_post || 'hdl';
    var useServicesByTag = liberator.globalVariables.direct_sbm_use_services_by_tag || 'hdl';
    var echoType = liberator.globalVariables.direct_sbm_echo_type || 'multiline';
    var isNormalize = typeof liberator.globalVariables.direct_sbm_is_normalize == 'undefined' ? 
                      true : evalFunc(liberator.globalVariables.direct_sbm_is_normalize); 
    var isUseMigemo = typeof liberator.globalVariables.direct_sbm_is_use_migemo == 'undefined' ? 
                      true : evalFunc(liberator.globalVariables.direct_sbm_is_use_migemo);
    var isPrivate = typeof liberator.globalVariables.direct_sbm_private == 'undefined' ? 
                    false : evalFunc(liberator.globalVariables.direct_sbm_private);

    var XMigemoCore;
    try{
        XMigemoCore = Components.classes['@piro.sakura.ne.jp/xmigemo/factory;1']
                                .getService(Components.interfaces.pIXMigemoFactory)
                                .getService("ja");
    }
    catch(ex if ex instanceof TypeError){}


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

    Deferred.Deferred = Deferred;
    Deferred.http     = http;


    function WSSEUtils(aUserName, aPassword){
        this._init(aUserName, aPassword);
    }

    WSSEUtils.prototype = {

        get userName() this._userName,
        get noce() this._nonce,
        get created() this._created,
        get passwordDigest() this._passwordDigest,

        getWSSEHeader: function(){
            var result = [
                'UsernameToken Username="' + this._userName + '", ',
                'PasswordDigest="' + this._passwordDigest + '=", ',
                'Nonce="' + this._nonce + '", ',
                'Created="' + this._created + '"'
            ].join("");

            return result;
        },

        _init: function(aUserName, aPassword){
            var uuidGenerator = Cc["@mozilla.org/uuid-generator;1"].getService(Ci.nsIUUIDGenerator);
            var seed = (new Date()).toUTCString() + uuidGenerator.generateUUID().toString();

            this._userName = aUserName;
            this._nonce = this._getSha1Digest(seed, true);
            this._created = this._getISO8601String((new Date()));
            this._passwordDigest = this._getSha1Digest(this._getSha1Digest(seed, false) + this._created + aPassword, true);
        },

        _getSha1Digest: function(aString, aBase64){
            var cryptoHash = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
            cryptoHash.init(Ci.nsICryptoHash.SHA1);

            var inputStream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);
            inputStream.setData(aString, aString.length);
            cryptoHash.updateFromStream(inputStream, -1);

            return cryptoHash.finish(aBase64);
        },

        _getISO8601String: function(aDate){
            var result = [
                zeropad(aDate.getUTCFullYear(), 4), "-",
                zeropad(aDate.getUTCMonth() + 1, 2), "-",
                zeropad(aDate.getUTCDate(), 2), "T",
                zeropad(aDate.getUTCHours(), 2), ":",
                zeropad(aDate.getUTCMinutes(), 2), ":",
                zeropad(aDate.getUTCSeconds(), 2), "Z"
            ].join("");
            return result;

            function zeropad(s, l){
                s = String(s);
                while(s.length < l){
                    s = "0" + s;
                }
                return s;
            }
        }

    };

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

    // copied from http://d.hatena.ne.jp/odz/20060901/1157165797 id:odz
    function parseHTML(text) {
        var createHTMLDocument = function() {
            var xsl = (new DOMParser()).parseFromString(
                ['<?xml version="1.0"?>',
                 '<stylesheet version="1.0" xmlns="http://www.w3.org/1999/XSL/Transform">',
                 '<output method="html"/>',
                 '</stylesheet>'].join("\n"), "text/xml");

            var xsltp = new XSLTProcessor();
            xsltp.importStylesheet(xsl);
            var doc = xsltp.transformToDocument(
                document.implementation.createDocument("", "", null));
            return doc;
        };

        var doc = createHTMLDocument();
        var range = doc.createRange();
        doc.appendChild(doc.createElement("html"));
        range.selectNodeContents(doc.documentElement);
        doc.documentElement.appendChild(
            range.createContextualFragment(text));
        return doc;
    }

    function getNormalizedPermalink(url){
        var canonical = liberator.plugins.libly.$U.getFirstNodeFromXPath('//link[@rel="canonical"]');
        return canonical ? canonical.href : url;
    }

    function getUserAccount(form,post,arg){
        var user, password;
        try{
            var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
            var logins = passwordManager.findLogins({}, form, post, arg);
            if(logins.length > 0){
                [user, password] = [logins[0].username, logins[0].password];
            } else {
                var promptUser = { value : this.loginPrompt.user }, promptPass = { value : this.loginPrompt.password };
                var promptSvc = Cc["@mozilla.org/embedcomp/prompt-service;1"]
                    .getService(Ci.nsIPromptService);

                var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                        Ci.nsILoginInfo,
                        "init");

                var ret = promptSvc.promptUsernameAndPassword(
                    window, form, this.loginPrompt.description,
                    promptUser, promptPass, null, {}
                );
                if(ret){
                    [user, password] = [promptUser.value, promptPass.value];
                    var formLoginInfo = new nsLoginInfo(form,
                            post, null,
                            user, password, '', '');
                    passwordManager.addLogin(formLoginInfo);
                } else {
                    liberator.echoerr("Direct Social Bookmark: account not found - " + form);
                }
            }
        }
        catch(ex){
            liberator.echoerr("Direct Social Bookmark: handled exception during tag extracting");
            liberator.log(ex);
        }
        return [user, password];
    }

    var services = {
        'h': {
            description:'Hatena bookmark',
            account:['https://www.hatena.ne.jp', 'https://www.hatena.ne.jp', null],
            loginPrompt:{ user:'', password:'', description:'Enter username and password.' },
            entryPage:'http://b.hatena.ne.jp/entry/%URL::HATENA%',
            poster:function(user,password,url,title,comment,tags){
                var tagString = tags.length > 0 ? '[' + tags.join('][') + ']' : "";
                // TODO: xml`...` を使うとillegal character 言われる、、、何故？
                /*
                var request = xml`<entry xmlns="http://purl.org/atom/ns#">
                    <title>dummy</title>
                    <link rel="related" type="text/html" href=${url}/>
                    <summary type="text/plain">${tagString + comment}</summary>
                </entry>`;
                */
                var request = '<entry xmlns="http://purl.org/atom/ns#">' +
                        '<title>dummy</title>' +
                        '<link rel="related" type="text/html" href="' + url + '"/>' +
                        '<summary type="text/plain">' + tagString + comment + '</summary>' +
                    '</entry>';
                var wsse = new WSSEUtils(user,password);

                return Deferred.http({
                    method: "post",
                    url: "http://b.hatena.ne.jp/atom/post",
                    data: request.toString(),
                    headers: {
                        "X-WSSE": wsse.getWSSEHeader(),
                        "Content-Type": "application/atom+xml",
                    },
                }).next(function(xhr){
                    if(xhr.status != 201) throw "Hatena Bookmark: failed";
                });
            },
            tags:function(user,password){
                var xhr = new XMLHttpRequest();
                var hatena_tags = [];

                // http://b.hatena.ne.jp/retlet/20110322#bookmark-34906937
                xhr.open("GET","http://b.hatena.ne.jp/"+user+"/sidebar?with_tags=1",false);
                xhr.send(null);

                var mypage_html = parseHTML(xhr.responseText);
                var tags = getElementsByXPath('id("tags")/li/a', mypage_html);

                tags.forEach(function(tag){
                    hatena_tags.push(tag.innerHTML);
                });
                return hatena_tags;
            },
            userTags:function(url, results){
                var url = 'http://b.hatena.ne.jp/entry/jsonlite/?url=' + encodeURIComponent(url)

                return Deferred.http({
                    method: "get",
                    url: url,
                }).next(function(xhr){
                    if(xhr.status != 200)
                        return;
                    let json = JSON.parse(xhr.responseText);
                    if (!json)
                        return;
                    let tags = json.bookmarks.map(function(it) it.tags);
                    tags = tags.filter(function(it) it.length);
                    if (!tags.length)
                        return;
                    tags = Array.concat.apply([], tags);
                    tags = tags.map(String.trim);
                    tags = util.Array.uniq(tags);
                    results.push(tags);
                });
            },
            icon:function(url){
                return '<img src="http://b.hatena.ne.jp/entry/image/' + url + '" style="vertical-align: middle;" />';
            },
        },
        'd': {
            description:'del.icio.us',
            account:['https://secure.delicious.com', 'https://secure.delicious.com', null],
            loginPrompt:{ user:'', password:'', description:'Enter username and password.' },
            entryPage:'http://del.icio.us/url/%URL::MD5%',
            poster:function(user,password,url,title,comment,tags){
                var request_url = 'https://api.del.icio.us/v1/posts/add?' + [
                    ['url', url], ['description', title], ['extended', comment], ['tags', tags.join(',')]
                ].map(function(p) p[0] + '=' + encodeURIComponent(p[1])).join('&');
                return Deferred.http({
                    method: "get",
                    url: request_url,
                    user: user,
                    password: password,
                }).next(function(xhr){
                    if(xhr.status != 200) throw "del.icio.us: failed";
                });
            },
            tags:function(user,password){
                const url = 'https://api.del.icio.us/v1/tags/get?';
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false, user, password);
                xhr.send(null);

                return Array.slice(xhr.responseXML.querySelectorAll('tag')).map(function (e) {
                    return e.getAttribute("tag")
                });
            },
            icon:function(url){
                var url = liberator.modules.buffer.URL;
                var cryptoHash = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
                cryptoHash.init(Ci.nsICryptoHash.MD5);
                var inputStream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);
                inputStream.setData(url, url.length);
                cryptoHash.updateFromStream(inputStream, -1);
                var hash = cryptoHash.finish(false), ascii = [];
                const hexchars = '0123456789ABCDEF';
                var hexrep = new Array(hash.length * 2);
                for(var i = 0; i < hash.length; i++) {
                    ascii[i * 2] = hexchars.charAt((hash.charCodeAt(i) >> 4) & 0xF);
                    ascii[i * 2 + 1] = hexchars.charAt(hash.charCodeAt(i) & 0xF);
                }
                return '<img src="http://del.icio.us/feeds/img/savedcount/' + ascii.join('').toLowerCase() + '?aggregate" style="vertical-align: middle;" />';
            },
        },
        'l': {
            description:'livedoor clip',
            account:['http://api.clip.livedoor.com', 'http://api.clip.livedoor.com', null],
            loginPrompt:{ user:'', password:'apikey', description:'Enter username and apikey.\nyou can get "api-key" from\n\thttp://clip.livedoor.com/config/api' },
            entryPage:'http://clip.livedoor.com/page/%URL%',
            poster:function(user,password,url,title,comment,tags){
                var rate=0;
                var starFullRate=5;
                if(comment.match(/\*+$/)){
                    comment = RegExp.leftContext;
                    rate = (RegExp.lastMatch.length > starFullRate)? starFullRate : RegExp.lastMatch.length;
                }
                var request_url = 'http://api.clip.livedoor.com/v1/posts/add?' + [
                    ['url', url], ['description', title], ['extended', comment], ['rate', rate], ['tags', tags.join(' ')], ['cache', (new Date()).getTime()]
                ].map(function(p) p[0] + '=' + encodeURIComponent(p[1])).join('&');
                return Deferred.http({
                    method: "get",
                    url: request_url,
                    user: user,
                    password: password,
                }).next(function(xhr){
                    if(xhr.status != 200) {
                        throw "livedoor clip: failed";
                    }
                });
            },
            tags:function(user,password){
                var xhr = new XMLHttpRequest();
                var ldc_tags = [];

                xhr.open("GET","http://clip.livedoor.com/clip/add?link=http://example.example/",false);
                xhr.send(null);

                var mypage_html = parseHTML(xhr.responseText);
                var tags = getElementsByXPath("id(\"tag_list\")/div/span",mypage_html);
                if (!tags)
                    return [];

                tags.forEach(function(tag){
                    ldc_tags.push(tag.textContent);
                });
                return ldc_tags;
            },
            icon:function(url){
                return '<img src="http://image.clip.livedoor.com/counter/' + url + '" style="vertical-align: middle;" />';
            },
        },
        'g': {
            description:'Google Bookmarks',
            account:null,
            loginPrompt:null,
            entryPage:'%URL%',
            poster:function(user,password,url,title,comment,tags){
                var request_url = 'http://www.google.com/bookmarks/mark';
                var params = [
                    ['bkmk', url], ['title', title], ['labels', tags.join(',')], ['annotation', comment]
                ].map(function(p) p[0] + '=' + encodeURIComponent(p[1])).join('&');
                return Deferred.http({
                    method: "post",
                    url: request_url,
                    data: params,
                    headers: {
                        "User-Agent": navigator.userAgent + " GoogleToolbarFF 3.0.20070525",
                    },
                }).next(function(xhr){
                    if(xhr.status != 200) throw "Google Bookmarks: failed";
                });
            },
            tags:function(user,password){
                return [];

                // FIXME: NOT WORKS
                //
                // var returnValue = [];
                // var xhr = new XMLHttpRequest();
                // xhr.open("GET", "https://www.google.com/bookmarks", false, user, password);
                // xhr.send(null);

                // var html = parseHTML(xhr.responseText);
                // var tags = getElementsByXPath('id("sidenav")/div/ul/li/a[count(*)=1]/text()',html);

                // tags.forEach(function(tag){
                //     returnValue.push(tag.textContent.match(/\S+/));
                // });
                // return returnValue;
            },
        },
        'f': {
            description:'foves',
            account:['https://secure.faves.com', 'https://secure.faves.com', null],
            loginPrompt:{ user:'', password:'', description:'Enter username and password.' },
            entryPage:'%URL%',
            poster:function(user,password,url,title,comment,tags){
                var request_url = 'https://secure.faves.com/v1/posts/add?' + [
                    ['url', url], ['description', title], ['extended', comment], ['tags', tags.join(' ')]
                ].map(function(p) p[0] + '=' + encodeURIComponent(p[1])).join('&');
                return Deferred.http({
                    method: "get",
                    url: request_url,
                    user: user,
                    password: password,
                }).next(function(xhr){
                    if(xhr.status != 200) throw "foves: failed";
                });
            },
            tags:function(user,password){
                const feed_url = 'https://secure.faves.com/v1/tags/get';
                var returnValue = [];
                var xhr = new XMLHttpRequest();
                xhr.open("GET", feed_url, false, user, password);
                xhr.send(null);

                var tags = xhr.responseXML.getElementsByTagName('tag');
                for(var n = 0; n < tags.length; n++)
                    returnValue.push(tags[n].getAttribute('tag'));
                return returnValue;
            },
        },
        'p': {
            description:'Places',
            account:null,
            loginPrompt:null,
            entryPage:'%URL%',
            poster:function(user,password,url,title,comment,tags){
                const taggingService = Cc["@mozilla.org/browser/tagging-service;1"].getService(Ci.nsITaggingService);
                var nsUrl = Cc["@mozilla.org/network/standard-url;1"].createInstance(Ci.nsIURL);
                nsUrl.spec = url;
                taggingService.tagURI(nsUrl,tags);
                try{
                    Application.bookmarks.tags.addBookmark(title, nsUrl);
                }catch(e){
                    throw "Places: failed";
                }
            },
            tags:function(user,password)
                Application.bookmarks.tags.children.map(function(x) x.title),
        },
        'P': {
            description:'pinboard',
            account:['https://pinboard.in', 'https://pinboard.in', null],
            loginPrompt:{ user:'', password:'', description:'Enter username and password.' },
            entryPage:'%URL%',
            poster:function(user,password,url,title,comment,tags){
                var rate=0;
                var starFullRate=5;
                if(comment.match(/\*+$/)){
                    comment = RegExp.leftContext;
                    rate = (RegExp.lastMatch.length > starFullRate)? starFullRate : RegExp.lastMatch.length;
                }
                var request_url = 'https://api.pinboard.in/v1/posts/add?' + [
                    ['url', url], ['description', title], ['extended', comment], ['tags', tags.join(' ')],
                    ['shared', isPrivate ? 'no' : 'yes'], ['toread', 'no'],
                ].map(function(p) p[0] + '=' + encodeURIComponent(p[1])).join('&');
                return Deferred.http({
                    method: "get",
                    url: request_url,
                    user: user,
                    password: password,
                }).next(function(xhr){
                    if(xhr.status != 200) {
                        throw "pinboard.in: failed";
                    }
                });
            },
            tags:function(user,password){
                const url = 'https://api.pinboard.in/v1/tags/get?';
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false, user, password);
                xhr.send(null);

                return Array.slice(xhr.responseXML.querySelectorAll('tag')).map(function (e) {
                    return e.getAttribute("tag")
                });
            },
            //icon:function(url){
            //    return '<img src="http://image.clip.livedoor.com/counter/' + url + '" style="vertical-align: middle;" />';
            //},
        },
    };
    __context__.services = services;

    (function () {
        let _tags = {}, _empty = true;
        __context__.tags = {
            __iterator__: function () Iterator(_tags, true),
            update: function (atags) {
                _tags = {};
                _empty = atags.length === 0;
                for (let [, t] in Iterator(atags))
                    _tags[t] = true;
            },
            add: function (newTag) {
                _tags[newTag] = true;
            },
            get isEmpty () _empty,
        };
    })();

    function getTagsAsync(onComplete){
        var d,first;
        d = first = Deferred();

        useServicesByTag.split(/\s*/).forEach(function(service){
            var user, password, currentService = services[service] || null;
            [user,password] = currentService.account ? getUserAccount.apply(currentService,currentService.account) : ["", ""];
            d = d.next(function(t) {
                var tags = currentService.tags(user,password);
                liberator.echo(currentService.description + ": Tag parsing is finished. Taglist length: " + tags.length);
                return t.concat(tags);
            });
        });
        d.next(function(tags){
            tags = tags.filter(function(e,i,a) a.indexOf(e) == i);
            tags.sort();
            __context__.tags.update(tags);
            if (onComplete)
                onComplete(__context__.tags);
        }).error(function(e){liberator.echoerr(e, null, "direct_bookmark.js: ")});
        return first;
    }
    function getUserTags(url, onComplete){
        var d = new Deferred();
        var first = d;
        var results = [];

        useServicesByTag.split(/\s*/).forEach(function(service){
            var user, password, currentService = services[service] || null;
            if (!(currentService && currentService.userTags))
                return;
            d = d.next(currentService.userTags(url, results));
        });
        d.next(function(){
            let tags = results.length ? Array.concat.apply([], results) : [];
            onComplete(tags);
        });

        first.call([]);
    }
    function getTitleByURL(url) {
        if (url === liberator.modules.buffer.URL)
            return liberator.modules.buffer.title;

        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        let html = parseHTML(xhr.responseText);
        let title = getFirstElementByXPath("//title/text()", html);

        // FIXME: encoding (see charset and must I convert...?)
        return title.nodeValue;
    }
    liberator.modules.commands.addUserCommand(['btags'],"Update Social Bookmark Tags",
        function(arg){setTimeout(function(){getTagsAsync().call([])},0)}, {}, true);
    liberator.modules.commands.addUserCommand(['bentry'],"Goto Bookmark Entry Page",
        function(args){
            var service = args.string || useServicesByPost.split(/\s*/)[0];
            var currentService = services[service] || null;
            if(!currentService || !currentService.entryPage) {
                return;
            }
            liberator.open(currentService.entryPage
                .replace(/%URL(?:::(HATENA|ESC|MD5))?%/g, function(x, t){
                    if(!t) return liberator.modules.buffer.URL.replace(/#/, '%23');
                    if(t == "HATENA") return liberator.modules.buffer.URL.replace(/^http:\/\//, '').replace(/^https:\/\//, 's/').replace(/#/, '%23');
                    if(t == "ESC") return encodeURIComponent(liberator.modules.buffer.URL);
                    if(t == "MD5"){
                        var url = liberator.modules.buffer.URL;
                        var cryptoHash = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
                        cryptoHash.init(Ci.nsICryptoHash.MD5);
                        var inputStream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);
                        inputStream.setData(url, url.length);
                        cryptoHash.updateFromStream(inputStream, -1);
                        var hash = cryptoHash.finish(false), ascii = [];
                        const hexchars = '0123456789ABCDEF';
                        var hexrep = new Array(hash.length * 2);
                        for(var i = 0; i < hash.length; i++) {
                            ascii[i * 2] = hexchars.charAt((hash.charCodeAt(i) >> 4) & 0xF);
                            ascii[i * 2 + 1] = hexchars.charAt(hash.charCodeAt(i) & 0xF);
                        }
                        return ascii.join('').toLowerCase();
                    }
                }), args.bang ? liberator.NEW_TAB : liberator.CURRENT_TAB);
        },{
            completer: function(filter)
                [0, useServicesByPost.split(/\s*/).map(function(p) [p, services[p].description])]
        },
        true
    );
    liberator.modules.commands.addUserCommand(['bicon'],"Show Bookmark Count as Icon",
        function(arg){
            var url = getNormalizedPermalink(liberator.modules.buffer.URL);
            var html = useServicesByTag.split(/\s*/).map(function(service){
                var currentService = services[service] || null;
                return (currentService && typeof currentService.icon === 'function') ?
                        (currentService.description + ': ' + currentService.icon(url)) : null;
            }).join('<br />');
            liberator.echo(html, true);
        }, {}, true);
    // Add :sbm, :sbmo {{{
    {
        let makeAction = function(withUrl) {
            return function(arg){
                var targetServices = useServicesByPost;
                var url = liberator.modules.buffer.URL;

                if (arg["-s"]) targetServices = arg["-s"];
                if (arg[0] && withUrl) url = arg[0];
                var comment = arg.literalArg;

                var tags = [];
                var re = /\[([^\]]+)\]([^\[].*)?/g;

                var d = new Deferred();
                var first = d;

                if(/^\[[^\]]+\]/.test(comment)){
                    var tag, text;
                    while((tag = re.exec(comment))){
                        [, tag, text] = tag;
                        tags.push(tag);
                    }
                    comment = text || '';
                }

                tags.forEach(function (t) __context__.tags.add(t));

                targetServices.split(/\s*/).forEach(function(service){
                    var user, password, currentService = services[service] || null;
                    [user,password] = currentService.account ? getUserAccount.apply(currentService,currentService.account) : ["", ""];
                    d = d.next(function() currentService.poster(
                        user,password,
                        isNormalize ? getNormalizedPermalink(url) : url,getTitleByURL(url),
                        comment,tags
                        ));
                    if(echoType == "multiline") {
                        d = d.next(function(){
                            liberator.echo("[" + services[service].description + "] post completed.");
                        });
                    }
                    d = d.error(function() {
                        liberator.echoerr(services[service].description + ": failed");
                    });
                });
                if(echoType == "simple") {
                    d = d.next(function(){
                        liberator.echo("post completed.");
                    });
                }
                d.error(function(e){liberator.echoerr("direct_bookmark.js: Exception throwed! " + e);liberator.log(e);});
                setTimeout(function(){first.call();},0);
            };
        };

        let completer =
            (function () {
                let lastURL, lastUserTags, onComplete, done = true;
                return function(context, arg){
                    function matchPosition (e){
                        let m = liberator.globalVariables.direct_sbm_tag_match || 'prefix';
                        switch (m) {
                        case 'infix': return e;
                        case 'suffix': return e + "$";
                        }
                        return "^" + e;
                    }

                    function set (context, tags) {
                        let filter = context.filter;
                        var match_result = filter.match(/((?:\[[^\]]*\])*)\[?(.*)/); //[all, commited, now inputting]
                        var expr = XMigemoCore && isUseMigemo ? "(" + XMigemoCore.getRegExp(match_result[2]) + ")"
                                                              : match_result[2];
                        var m = new RegExp(matchPosition(expr),'i');

                        context.advance( match_result[1].length );

                        context.incomplete = false;
                        context.completions = Array.from(Iterator(tags)).filter(function (tag) {
                            return m.test(tag) && match_result[1].indexOf('[' + tag + ']') < 0;
                        }).map(function (tag) {
                            return ["[" + tag + "]","Tag"];
                        });
                    }

                    let url = arg[0] || buffer.URL;
                    liberator.log(url);

                    context.fork('UserTags', 0, context, function(context){
                        context.title = ['User Tags', 'User Tags'];

                        onComplete = function(tags){
                            done = true;
                            lastUserTags = tags;
                            context.incomplete = false;
                            set(context, tags);
                        };

                        if (url == lastURL){
                            if (done) {
                                onComplete(lastUserTags);
                            } else {
                                context.incomplete = true;
                            }
                        } else {
                            lastURL = url;
                            context.incomplete = true;
                            done = false;
                            getUserTags(url, function (tags) onComplete(tags));
                        }
                    });

                    context.fork('MyTags', 0, context, function(context, arg){
                        context.title = ['My Tag','Description'];

                        if(__context__.tags.isEmpty){
                            context.incomplete = true;
                            getTagsAsync(set.bind(null, context)).call([]);
                        } else {
                            set(context, __context__.tags);
                        }
                    });
                };
            })();

        let options = [ [['-s','-service'], liberator.modules.commands.OPTION_STRING] ];

        let urlCompleter = function(context, args){
            if (args.length <= 1) {
                return completion.url(context, 'hsl');
            } else {
                return completer(context, args);
            }
        };

        liberator.modules.commands.addUserCommand(['sbm'],"Post to Social Bookmark (Current Buffer)",
            makeAction(false),
            {literal: 0, completer: completer, options: options},
            true
        );

        liberator.modules.commands.addUserCommand(['sbmo[ther]'],"Post to Social Bookmark",
            makeAction(true),
            {literal: 1, completer: urlCompleter, options: options},
            true
        );
    } // }}}
})();
// vim:sw=4 ts=4 et:
