// Vimperator plugin: 'Direct Post to Social Bookmarks'
// Version: 0.01
// Last Change: 10-Apr-2008. Jan 2008
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
// Variable:
//  'g:direct_sbm_use_services_by_tag'
//      Use social bookmark services to extract tags
//          'h': Hatena Bookmark
//          'd': Del.icio.us
//      Usage: let g:direct_sbm_use_services_by_tag = "hd"
//  'g:direct_sbm_use_services_by_post'
//      Use social bookmark services to post
//          'h': Hatena Bookmark
//          'd': Del.icio.us
//      Usage: let g:direct_sbm_use_services_by_post = "hd"
//  'g:direct_sbm_is_normalize'
//      Use normalize permalink
//  'g:direct_sbm_is_use_migemo'
//      Use Migemo completion
// Command:
//  ':btags'
//      Extract social bookmarks tags for completion
//  ':sbm'
//      Post current page to social bookmarks
(function(){
    var useServicesByPost = liberator.globalVariables.direct_sbm_use_services_by_post || 'hd';
    var useServicesByTag = liberator.globalVariables.direct_sbm_use_services_by_tag || 'hd';
    var isNormalize = window.eval(liberator.globalVariables.direct_sbm_is_normalize) || true;
    var isUseMigemo = window.eval(liberator.globalVariables.direct_sbm_is_use_migemo) || true;

    try{
        var XMigemoCore = Components
            .classes['@piro.sakura.ne.jp/xmigemo/factory;1']
            .getService(Components.interfaces.pIXMigemoFactory)
            .getService("ja");
    }catch(ex){
        var XMigemoCore = undefined;
    }

    function WSSEUtils(aUserName, aPassword){
        this._init(aUserName, aPassword);
    }

    WSSEUtils.prototype = {

        get userName()
            this._userName,

        get noce()
            this._nonce,

        get created()
            this._created,

        get passwordDigest()
            this._passwordDigest,

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
            function zeropad(s, l) {
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
    function getElementsByXPath(xpath, node) {
        node = node || document;
        var nodesSnapshot = (node.ownerDocument || node).evaluate(xpath, node, null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        var data = [];
        for (var i = 0, l = nodesSnapshot.snapshotLength; i < l;
                data.push(nodesSnapshot.snapshotItem(i++)));
        return (data.length > 0) ? data : null;
    }

    function getFirstElementByXPath(xpath, node) {
        node = node || document;
        var result = (node.ownerDocument || node).evaluate(xpath, node, null,
                XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue ? result.singleNodeValue : null;
    }

    // copied from Pagerization (c) id:ofk
    function parseHTML(str) {
        str = str.replace(/^[\s\S]*?<html(?:\s[^>]+?)?>|<\/html\s*>[\S\s]*$/ig, '');
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
                    throw new Error(xhr.statusText)
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
        var user,password;
        try {
            var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
            var logins = passwordManager.findLogins({}, form, post, arg);
            if(logins.length > 0){
                [user, password] = [logins[0].username, logins[0].password];
            } else {
                var promptUser = { value : "" }, promptPass = { value : "" };
                var promptSvc = Cc["@mozilla.org/embedcomp/prompt-service;1"]
                    .getService(Ci.nsIPromptService);

                var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                        Ci.nsILoginInfo,
                        "init");

                var ret = promptSvc.promptUsernameAndPassword(
                    window, form, "Enter username and password.",
                    promptUser, promptPass, null, {}
                );
                if (ret){
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
        catch(ex) {
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
            description:'hatena bookmark',
            account:['https://www.hatena.ne.jp', 'https://www.hatena.ne.jp', null],
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

                var mypage_html = parseHTML(xhr.responseText);
                var tags = getElementsByXPath("//ul[@id=\"taglist\"]/li/a",mypage_html);

                for each(var tag in tags)
                    hatena_tags.push(tag.innerHTML);
                liberator.echo("Hatena Bookmark: Tag parsing is finished. Taglist length: " + tags.length);
                return hatena_tags;
            },
        },
        'd': {
            description:'del.cio.us',
            account:['https://secure.delicious.com', 'https://secure.delicious.com', null],
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
                for (var tag in tags)
                    returnValue.push(tag);
                liberator.echo("DeliciousBookmark: Tag parsing is finished. Taglist length: " + returnValue.length);
                return returnValue;
            },
        },
    };
    liberator.plugins.direct_bookmark = {services: services, tags: []};


    function getTags(arg){
        var user,password;
        liberator.plugins.direct_bookmark.tags = [];
        for (var i = 0; i < useServicesByTag.length; i++){
            var currentService = services[useServicesByTag[i]] || null;
            liberator.log(currentService);
            [user,password] = getUserAccount.apply(currentService,currentService.account);
            liberator.plugins.direct_bookmark.tags =
                liberator.plugins.direct_bookmark.tags.concat(currentService.tags(user,password));
        }
    }
    liberator.commands.addUserCommand(['btags'],"Update Social Bookmark Tags",
        getTags, {}
    );
    liberator.commands.addUserCommand(['sbm'],"Post to Social Bookmark",
        function(comment){
            var user,password
            var tags = [];
            var re = /\[([^\]]+)\]([^\[].*)?/g;

            if (/^\[.*\]/.test(comment)) {
                var tag, text;
                while((tag = re.exec(comment))) {
                    [, tag, text] = tag;
                    tags.push(tag);
                }
                comment = text || '';
            }

            for (var i = 0; i < useServicesByPost.length; i++){
                var currentService = services[useServicesByPost[i]] || null;
                [user,password] = getUserAccount.apply(currentService,currentService.account);
                currentService.poster(
                    user,password,
                    isNormalize ? getNormalizedPermalink(liberator.buffer.URL) : liberator.buffer.URL,
                    comment,
                    tags
                );
            }
        },{
            completer: function(filter){
                var match_result = filter.match(/((?:\[[^\]]*\])*)?\[?(.*)/); //[all, commited, now inputting]
                var m = new RegExp(XMigemoCore && isUseMigemo ? "^(" + XMigemoCore.getRegExp(match_result[2]) + ")" : "^" + match_result[2],'i');
                var completionList = [];
                if(liberator.plugins.direct_bookmark.tags.length == 0)
                    getTags();
                for each(var tag in liberator.plugins.direct_bookmark.tags)
                    if(m.test(tag)){
                        completionList.push([(match_result[1] || "") + "[" + tag + "]","Tag"]);
                    }
                return [0, completionList];
            }
        }
    );
})();
