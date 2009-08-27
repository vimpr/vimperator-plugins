// Vimperator plugin: 'Direct Hatena Bookmark'
// Last Change: 10-Apr-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
// Parts:
//      http://d.hatena.ne.jp/fls/20080309/p1
//      Pagerization (c) id:ofk
//      AutoPagerize (c) id:swdyh
//
// Hatena Bookmark direct add script for Vimperator 0.6.*
// for Migemo search: require XUL/Migemo Extension
(function(){
    var isNormalize = true;

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
        for (var i = 0, l = nodesSnapshot.snapshotLength; i < l;
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
    function parseHTML(str){
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

    function getTags(arg){
        liberator.plugins.hatena_tags = [];
        httpGET("http://b.hatena.ne.jp/my",
                function(mypage_text){
                    var mypage_html = parseHTML(mypage_text);
                    var tags = getElementsByXPath("//ul[@id=\"tags\"]/li/a",mypage_html);
                    tags.forEach(function(tag){
                        liberator.plugins.hatena_tags.push(tag.innerHTML);
                    });
                    liberator.echo("HatenaBookmark: Tag parsing is finished. Taglist length: " + tags.length);
                });
    }
    getTags();

    function addHatenaBookmarks(user,password,url,comment,normalize){
        var target = normalize ? getNormalizedPermalink(url) : url;
        var request =
            <entry xmlns="http://purl.org/atom/ns#">
                <title>dummy</title>
                <link rel="related" type="text/html" href={target}/>
                <summary type="text/plain">{comment}</summary>
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
    }
    commands.addUserCommand(['hbtags'],"Update HatenaBookmark Tags",
        getTags,
        {}
    );
    commands.addUserCommand(['hb'],"Post to HatenaBookmark",
        function(args){
            var arg = args.string;
            try {
                var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
                var logins = passwordManager.findLogins({}, 'https://www.hatena.ne.jp', 'https://www.hatena.ne.jp', null);
                if(logins.length)
                    [hatenaUser, hatenaPassword] = [logins[0].username, logins[0].password];
                else
                    liberator.echoerr("HatenaBookmark: account not found");
            }
            catch(ex){
            }
            addHatenaBookmarks(hatenaUser,hatenaPassword,modules.buffer.URL,arg,isNormalize);
        },{
            completer: function(context, arg){
                let filter = context.filter;
                //var match_result = filter.match(/(.*)\[(\w*)$/); //[all, commited, now inputting]
                var match_result = filter.match(/((?:\[[^\]]*\])+)?\[?(.*)/); //[all, commited, now inputting]
                //var m = new RegExp("^" + match_result[2]);
                var m = new RegExp(XMigemoCore ? "^(" + XMigemoCore.getRegExp(match_result[2]) + ")" : "^" + match_result[2],'i');
                var completionList = [];
                liberator.plugins.hatena_tags.forEach(function(tag){
                    if(m.test(tag)){
                        completionList.push([(match_result[1] || "") + "[" + tag + "]","Tag"]);
                    }
                });
                context.title = ['Tag','Description'];
//                context.advance(match_result[1].length);
                context.completions = completionList;
            }
        }
    );
})();
// vim:sw=4 ts=4 et:
