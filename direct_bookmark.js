// Vimperator plugin: 'Direct Post to Social Bookmarks'
// Version: 0.04
// Last Change: 18-Apr-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
// Parts:
//      http://d.hatena.ne.jp/fls/20080309/p1
//      Pagerization (c) id:ofk
//      AutoPagerize (c) id:swdyh
//      direct_delb.js id:mattn
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
//          'f': Places (Firefox bookmarks)
//      Usage: let g:direct_sbm_use_services_by_tag = "hdl"
//  'g:direct_sbm_use_services_by_post'
//      Use social bookmark services to post
//          'h': Hatena Bookmark
//          'd': del.icio.us
//          'l': livedoor clip
//          'f': Places (Firefox bookmarks)
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
//  ':bentry'
//      Goto Bookmark Entry Page
(function(){
    var useServicesByPost = liberator.globalVariables.direct_sbm_use_services_by_post || 'hdl';
    var useServicesByTag = liberator.globalVariables.direct_sbm_use_services_by_tag || 'hdl';
    var isNormalize = window.eval(liberator.globalVariables.direct_sbm_is_normalize) || true;
    var isUseMigemo = window.eval(liberator.globalVariables.direct_sbm_is_use_migemo) || true;

    var XMigemoCore;
    try{
        XMigemoCore = Components.classes['@piro.sakura.ne.jp/xmigemo/factory;1']
                                .getService(Components.interfaces.pIXMigemoFactory)
                                .getService("ja");
    }
    catch(ex if ex instanceof TypeError){}

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
            function zeropad(s, l){
                while(s.length < l){
                    s = "0" + s;
                }
                return s;
            }

            var result = [
                            zeropad(aDate.getUTCFullYear(), 4), "-",
                            zeropad(aDate.getUTCMonth() + 1, 2), "-",
                            zeropad(aDate.getUTCDate(), 2), "T",
                            zeropad(aDate.getUTCHours(), 2), ":",
                            zeropad(aDate.getUTCMinutes(), 2), ":",
                            zeropad(aDate.getUTCSeconds(), 2), "Z"
                         ].join("");
            return result;
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
    function parseHTML(str, ignore_tags){
        str = str.replace(/^[\s\S]*?<html(?:\s[^>]+?)?>|<\/html\s*>[\S\s]*$/ig, '');
        if (ignore_tags && ignore_tags instanceof Array && ignore_tags.length > 0)
            str = str.replace(new RegExp('<(?:' + ignore_tags.join('|') + ')(?:\\s[^>]+)?>|</(?:' + ignore_tags.join('|') + ')\\s*>', 'ig'), '');
        var res = document.implementation.createDocument(null, 'html', null);
        var range = document.createRange();
        range.setStartAfter(window.content.document.body);
        res.documentElement.appendChild(res.importNode(range.createContextualFragment(str), true));
        return res;
    }

    //
    //
    //
    //

    function httpGET(uri,callback){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                if(xhr.status == 200)
                    callback.call(this,xhr.responseText);
                else
                    throw new Error(xhr.statusText);
            }
        };
        xhr.open("GET",uri,true);
        xhr.send(null);
    }

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
            poster:function(user,password,url,comment,tags){
                var tagString = tags.length > 0 ? '[' + tags.join('][') + ']' : "";
                var request =
                    <entry xmlns="http://purl.org/atom/ns#">
                        <title>dummy</title>
                        <link rel="related" type="text/html" href={url}/>
                        <summary type="text/plain">{tagString + comment}</summary>
                    </entry>;
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function(){
                    if(xhr.readyState == 4){
                        if(xhr.status == 201)
                            liberator.echo("HatenaBookmark: success");
                        else
                            liberator.echoerr("HatenaBookmark:" + xhr.statusText);
                    }
                };
                var wsse = new WSSEUtils(user,password);
                xhr.open("POST","http://b.hatena.ne.jp/atom/post", true);
                xhr.setRequestHeader("X-WSSE",wsse.getWSSEHeader());
                xhr.setRequestHeader("Content-Type","application/atom+xml");
                xhr.send(request.toString());
            },
            tags:function(user,password){
                var xhr = new XMLHttpRequest();
                var hatena_tags = [];

                xhr.open("GET","http://b.hatena.ne.jp/my",false);
                xhr.send(null);

                var mypage_html = parseHTML(xhr.responseText, ['img', 'script']);
                var tags = getElementsByXPath("//ul[@id=\"taglist\"]/li/a",mypage_html);

                tags.forEach(function(tag){
                    hatena_tags.push(tag.innerHTML);
                });
                liberator.echo("HatenaBookmark: Tag parsing is finished. Taglist length: " + tags.length);
                return hatena_tags;
            },
        },
        'd': {
            description:'del.icio.us',
            account:['https://secure.delicious.com', 'https://secure.delicious.com', null],
            loginPrompt:{ user:'', password:'', description:'Enter username and password.' },
            entryPage:'http://del.icio.us/url/%URL::MD5%',
            poster:function(user,password,url,comment,tags){
                var title = liberator.buffer.title;
                var request_url = 'https://api.del.icio.us/v1/posts/add?' + [
                    ['url', url], ['description', title], ['extended', comment], ['tags', tags.join(' ')]
                ].map(function(p) p[0] + '=' + encodeURIComponent(p[1])).join('&');
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function(){
                    if(xhr.readyState == 4){
                        if(xhr.status == 200)
                            liberator.echo("DeliciousBookmark: success");
                        else
                            liberator.echoerr("DeliciousBookmark:" + xhr.statusText);
                    }
                };
                xhr.open("GET", request_url, true, user, password);
                xhr.send(null);
            },
            tags:function(user,password){
                const feed_url = 'http://feeds.delicious.com/feeds/json/tags/';
                var returnValue = [];
                var xhr = new XMLHttpRequest();
                xhr.open("GET", feed_url + user + "?raw", false, user, password);
                xhr.send(null);

                var tags = window.eval("(" + xhr.responseText + ")");
                for(var tag in tags)
                    returnValue.push(tag);
                liberator.echo("DeliciousBookmark: Tag parsing is finished. Taglist length: " + returnValue.length);
                return returnValue;
            },
        },
        'l': {
            description:'livedoor clip',
            account:['http://api.clip.livedoor.com', 'http://api.clip.livedoor.com', null],
            loginPrompt:{ user:'', password:'apikey', description:'Enter username and apikey.\nyou can get "api-key" from\n\thttp://clip.livedoor.com/config/api' },
            entryPage:'http://clip.livedoor.com/page/%URL%',
            poster:function(user,password,url,comment,tags){
                var title = liberator.buffer.title;
                var request_url = 'http://api.clip.livedoor.com/v1/posts/add?' + [
                    ['url', url], ['description', title], ['extended', comment], ['tags', tags.join(' ')]
                ].map(function(p) p[0] + '=' + encodeURIComponent(p[1])).join('&');
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function(){
                    if(xhr.readyState == 4){
                        if(xhr.status == 200)
                            liberator.echo("LivedoorClip: success");
                        else
                            liberator.echoerr("LivedoorClip:" + xhr.statusText);
                    }
                };
                xhr.open("GET", request_url, true, user, password);
                xhr.send(null);
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
                liberator.echo("LivedoorClip: Tag parsing is finished. Taglist length: " + tags.length);
                return ldc_tags;
            },
        },
        'f': { // p?
            description:'Places',
            account:null,
            loginPrompt:null,
            entryPage:'%URL%',
            poster:function(user,password,url,comment,tags){
                const taggingService = Cc["@mozilla.org/browser/tagging-service;1"].getService(Ci.nsITaggingService);
                var nsUrl = Cc["@mozilla.org/network/standard-url;1"].createInstance(Ci.nsIURL);
                nsUrl.spec = url;
                taggingService.tagURI(nsUrl,tags);
                Application.bookmarks.tags.addBookmark(nsUrl,window.content.document.title);
            },
            tags:function(user,password)
                Application.bookmarks.tags.children.map(function(x) x.title),
        },
    };
    liberator.plugins.direct_bookmark = { services: services, tags: [] };

    function getTags(arg){
        var user,password;
        var tags = liberator.plugins.direct_bookmark.tags;
        liberator.plugins.direct_bookmark.tags = [];
        useServicesByTag.split(/\s*/).forEach(function(service){
            var currentService = services[service] || null;
            [user,password] = currentService.account ? getUserAccount.apply(currentService,currentService.account) : [null, null];
            tags = tags.concat(currentService.tags(user,password));
        });
        // unique tags
        for(var i = tags.length; i --> 0; tags.indexOf(tags[i]) == i || tags.splice(i, 1));
        liberator.plugins.direct_bookmark.tags = tags.sort();
    }
    liberator.commands.addUserCommand(['btags'],"Update Social Bookmark Tags",getTags,{});
    liberator.commands.addUserCommand(['bentry'],"Goto Bookmark Entry Page",
        function(service){
            service = service || useServicesByPost.split(/\s*/)[0];
            var currentService = services[service] || null;
            if(!currentService || !currentService.entryPage) {
                return;
            }
            liberator.open(currentService.entryPage
                .replace(/%URL(?:::(ESC|MD5))?%/g, function(x, t){
                    if(!t) return liberator.buffer.URL;
                    if(t == "ESC") return encodeURIComponent(liberator.buffer.URL);
                    if(t == "MD5"){
                        var url = liberator.buffer.URL;
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
                }), liberator.NEW_TAB);
        },{
            completer: function(filter)
                [0, useServicesByPost.split(/\s*/).map(function(p) [p, services[p].description])]
        }
    );
    liberator.commands.addUserCommand(['sbm'],"Post to Social Bookmark",
        function(comment){
            var user, password;
            var tags = [];
            var re = /\[([^\]]+)\]([^\[].*)?/g;

            if(/^\[[^\]]+\]/.test(comment)){
                var tag, text;
                while((tag = re.exec(comment))){
                    [, tag, text] = tag;
                    tags.push(tag);
                }
                comment = text || '';
            }

            useServicesByPost.split(/\s*/).forEach(function(service){
                var currentService = services[service] || null;
                [user,password] = currentService.account ? getUserAccount.apply(currentService,currentService.account) : [null, null];
                currentService.poster(
                    user,password,
                    isNormalize ? getNormalizedPermalink(liberator.buffer.URL) : liberator.buffer.URL,
                    comment,
                    tags
                );
            });
        },{
            completer: function(filter){
                var match_result = filter.match(/((?:\[[^\]]*\])+)?\[?(.*)/); //[all, commited, now inputting]
                var m = new RegExp(XMigemoCore && isUseMigemo ? "^(" + XMigemoCore.getRegExp(match_result[2]) + ")" : "^" + match_result[2],'i');
                var completionList = [];
                if(liberator.plugins.direct_bookmark.tags.length == 0)
                    getTags();
                liberator.plugins.direct_bookmark.tags.forEach(function(tag){
                    if(m.test(tag))
                        completionList.push([(match_result[1] || "") + "[" + tag + "]","Tag"]);
                });
                return [0, completionList];
            }
        }
    );
})();
// vim:sw=4 ts=4 et:
