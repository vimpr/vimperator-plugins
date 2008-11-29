// Vimperator plugin: 'Direct Post to Social Bookmarks'
// Version: 0.12
// Last Change: 27-Nov-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
// Parts:
//      http://d.hatena.ne.jp/fls/20080309/p1
//      Pagerization (c) id:ofk
//      AutoPagerize (c) id:swdyh
//      direct_delb.js id:mattn
//      JSDeferred id:cho45
//
// Social Bookmark direct add script for Vimperator 0.6.*
// for Migemo search: require XUL/Migemo Extension
//
// Variables:
//  'g:direct_sbm_use_services_by_tag'
//      Use social bookmark services to extract tags
//          'h': Hatena Bookmark
//          'd': del.icio.us
//          'l': livedoor clip
//          'p': Places (Firefox bookmarks)
//      Usage: let g:direct_sbm_use_services_by_tag = "hdl"
//  'g:direct_sbm_use_services_by_post'
//      Use social bookmark services to post
//          'h': Hatena Bookmark
//          'd': del.icio.us
//          'l': livedoor clip
//          'g': Google Bookmarks
//          'p': Places (Firefox bookmarks)
//      Usage: let g:direct_sbm_use_services_by_post = "hdl"
//  'g:direct_sbm_is_normalize'
//      Use normalize permalink
//  'g:direct_sbm_is_use_migemo'
//      Use Migemo completion
// Commands:
//  ':btags'
//      Extract tags from social bookmarks for completion
//  ':sbm'
//      Post a current page to social bookmarks
//      Arguments
//          -s,-service: default:"hdl"
//              Specify target SBM services to post
//  ':bentry'
//      Goto Bookmark Entry Page
//  ':bicon'
//      Show Bookmark Count as Icon
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
    var isNormalize = liberator.globalVariables.direct_sbm_is_normalize ?
        evalFunc(liberator.globalVariables.direct_sbm_is_normalize) : true;
    var isUseMigemo = liberator.globalVariables.direct_sbm_is_use_migemo ?
        evalFunc(liberator.globalVariables.direct_sbm_is_use_migemo) : true;

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
    http.get  = function (url)       http({method:"get",  url:url});
    http.post = function (url, data) http({method:"post", url:url, data:data, headers:{"Content-Type":"application/x-www-form-urlencoded"}});

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

    //
    //
    //
    //

    function getNormalizedPermalink(url){
        var xhr = new XMLHttpRequest();
        xhr.open("GET","http://api.pathtraq.com/normalize_url?url=" + url,false);
        xhr.send(null);
        if(xhr.status != 200){
            liberator.echoerr("Pathtraq: FAILED to normalize URL!!");
            return undefined;
        }
        return xhr.responseText;
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

    //
    //
    //
    //

    var services = {
        'h': {
            description:'Hatena bookmark',
            account:['https://www.hatena.ne.jp', 'https://www.hatena.ne.jp', null],
            loginPrompt:{ user:'', password:'', description:'Enter username and password.' },
            entryPage:'http://b.hatena.ne.jp/entry/%URL%',
            poster:function(user,password,url,title,comment,tags){
                var tagString = tags.length > 0 ? '[' + tags.join('][') + ']' : "";
                var request =
                    <entry xmlns="http://purl.org/atom/ns#">
                        <title>dummy</title>
                        <link rel="related" type="text/html" href={url}/>
                        <summary type="text/plain">{tagString + comment}</summary>
                    </entry>;
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
                    if(xhr.status != 201) throw "Hatena Bookmark: faild";
                });
            },
            tags:function(user,password){
                var xhr = new XMLHttpRequest();
                var hatena_tags = [];

                //xhr.open("GET","http://b.hatena.ne.jp/my",false);
                xhr.open("GET","http://b.hatena.ne.jp/"+user,false);
                xhr.send(null);

                var mypage_html = parseHTML(xhr.responseText, ['img', 'script']);
                //var tags = getElementsByXPath("//ul[@id=\"taglist\"]/li/a",mypage_html);
                var tags = getElementsByXPath('id("tags")/li/a', mypage_html);

                tags.forEach(function(tag){
                    hatena_tags.push(tag.innerHTML);
                });
                liberator.echo("Hatena Bookmark: Tag parsing is finished. Taglist length: " + tags.length);
                return hatena_tags;
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
                    ['url', url], ['description', title], ['extended', comment], ['tags', tags.join(' ')]
                ].map(function(p) p[0] + '=' + encodeURIComponent(p[1])).join('&');
                return Deferred.http({
                    method: "get",
                    url: request_url,
                    user: user,
                    password: password,
                }).next(function(xhr){
                    if(xhr.status != 200) throw "del.icio.us: faild";
                });
            },
            tags:function(user,password){
                const feed_url = 'http://feeds.delicious.com/feeds/json/tags/';
                var returnValue = [];
                var xhr = new XMLHttpRequest();
                xhr.open("GET", feed_url + user + "?raw", false, user, password);
                xhr.send(null);

                var tags = evalFunc("(" + xhr.responseText + ")");
                for(var tag in tags)
                    returnValue.push(tag);
                liberator.echo("del.icio.us: Tag parsing is finished. Taglist length: " + returnValue.length);
                return returnValue;
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
                    ['url', url], ['description', title], ['extended', comment], ['rate', rate], ['tags', tags.join(' ')]
                ].map(function(p) p[0] + '=' + encodeURIComponent(p[1])).join('&');
                return Deferred.http({
                    method: "get",
                    url: request_url,
                    user: user,
                    password: password,
                }).next(function(xhr){
                    if(xhr.status != 200) throw "livedoor clip: faild";
                });
            },
            tags:function(user,password){
                var xhr = new XMLHttpRequest();
                var ldc_tags = [];

                xhr.open("GET","http://clip.livedoor.com/clip/add?link=http://example.example/",false);
                xhr.send(null);

                var mypage_html = parseHTML(xhr.responseText, ['img', 'script']);
                var tags = getElementsByXPath("id(\"tag_list\")/span",mypage_html);

                tags.forEach(function(tag){
                    ldc_tags.push(tag.textContent);
                });
                liberator.echo("livedoor clip: Tag parsing is finished. Taglist length: " + tags.length);
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
                    ['bkmk', url], ['title', title], ['labels', tags.join(',')]
                ].map(function(p) p[0] + '=' + encodeURIComponent(p[1])).join('&');
                return Deferred.http({
                    method: "post",
                    url: request_url,
                    data: params,
                    headers: {
                        "User-Agent": navigator.userAgent + " GoogleToolbarFF 3.0.20070525",
                    },
                }).next(function(xhr){
                    if(xhr.status != 200) throw "Google Bookmarks: faild";
                });
            },
            tags:function(user,password) [],
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
                    if(xhr.status != 200) throw "foves: faild";
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
                liberator.echo("foves: Tag parsing is finished. Taglist length: " + returnValue.length);
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
                    throw "Places: faild";
                }
            },
            tags:function(user,password)
                Application.bookmarks.tags.children.map(function(x) x.title),
        },
    };
    liberator.plugins.direct_bookmark = { services: services, tags: [] };

    function getTags(arg){
        var d,first;
        d = first = Deferred();

        useServicesByTag.split(/\s*/).forEach(function(service){
            var user, password, currentService = services[service] || null;
            [user,password] = currentService.account ? getUserAccount.apply(currentService,currentService.account) : ["", ""];
            d = d.next(function(t) t.concat(currentService.tags(user,password)));
        });
        d.next(function(tags){liberator.plugins.direct_bookmark.tags = tags.filter(function(e,i,a) a.indexOf(e) == i).sort()})
         .error(function(e){liberator.echoerr("direct_bookmark.js: Exception throwed! " + e)});
        return first;
    }
    liberator.modules.commands.addUserCommand(['btags'],"Update Social Bookmark Tags",
        function(arg){setTimeout(function(){getTags().call([])},0)}, {});
    liberator.modules.commands.addUserCommand(['bentry'],"Goto Bookmark Entry Page",
        function(service, special){
            service = service.string || useServicesByPost.split(/\s*/)[0];
            var currentService = services[service] || null;
            if(!currentService || !currentService.entryPage) {
                return;
            }
            liberator.open(currentService.entryPage
                .replace(/%URL(?:::(ESC|MD5))?%/g, function(x, t){
                    if(!t) return liberator.modules.buffer.URL.replace(/#/, '%23');
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
                }), special ? liberator.NEW_TAB : liberator.CURRENT_TAB);
        },{
            completer: function(filter)
                [0, useServicesByPost.split(/\s*/).map(function(p) [p, services[p].description])]
        }
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
        }, {});
    liberator.modules.commands.addUserCommand(['sbm'],"Post to Social Bookmark",
        function(arg){
            var comment = "";
            var targetServices = useServicesByPost;

            if (arg["-s"]) targetServices = arg["-s"];
            if (arg.length > 0) comment = arg.join(" ");

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

            var url = liberator.modules.buffer.URL;
            var title = liberator.modules.buffer.title;

            targetServices.split(/\s*/).forEach(function(service){
                var user, password, currentService = services[service] || null;
                [user,password] = currentService.account ? getUserAccount.apply(currentService,currentService.account) : ["", ""];
                d = d.next(function() currentService.poster(
                    user,password,
                    isNormalize ? getNormalizedPermalink(url) : url,title,
                    comment,tags
                //));
                )).next(function(){
                    liberator.echo("[" + services[service].description + "] post completed.");
                });
            });
            d.error(function(e){liberator.echoerr("direct_bookmark.js: Exception throwed! " + e);liberator.log(e);});
            setTimeout(function(){first.call();},0);
        },{
            completer: function(context, arg, special){
                let filter = context.filter;
                var match_result = filter.match(/((?:\[[^\]]*\])*)\[?(.*)/); //[all, commited, now inputting]
                var m = new RegExp(XMigemoCore && isUseMigemo ? "^(" + XMigemoCore.getRegExp(match_result[2]) + ")" : "^" + match_result[2],'i');
                var completionList = [];
                if(liberator.plugins.direct_bookmark.tags.length == 0)
                    getTags().call([]);
                context.title = ['Tag','Description'];
                context.advance( match_result[1].length );
                context.completions = [["[" + tag + "]","Tag"]
                            for each (tag in liberator.plugins.direct_bookmark.tags) if (m.test(tag) && match_result[1].indexOf('[' + tag + ']') < 0)];
            },
            options: [
                [['-s','-service'], liberator.modules.commands.OPTION_STRING],
            ]
        }
    );
})();
// vim:sw=4 ts=4 et:
