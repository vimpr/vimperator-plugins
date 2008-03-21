// Vimperator plugin: 'Direct Hatena Bookmark'
// Last Change: 21-Mar-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
// Parts:
//      http://d.hatena.ne.jp/fls/20080309/p1
//      Pagerization (c) id:ofk
//      AutoPagerize(c) id:swdyh
//
// Hatena bookmark direct add script for vimperator0.6.*
(function(){
    var isNormalize = true;

    function WSSEUtils(aUserName, aPassword){
        this._init(aUserName, aPassword);
    }

    WSSEUtils.prototype = {

        get userName(){
            return this._userName;
        },

        get noce(){
            return this._nonce;
        },

        get created(){
            return this._created;
        },

        get passwordDigest(){
            return this._passwordDigest;
        },

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

    // copied from AutoPagerize(c) id:swdyh
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
        str = str.replace(/^[\S\s]*?<html[^>]*>|<\/html\s*>[\S\s]*$/ig, '');
        var res = document.implementation.createDocument(null, 'html', null);
        var range = document.createRange();
        range.setStartAfter(window.content.document.body);
        res.documentElement.appendChild(
                res.importNode(range.createContextualFragment(str), true)
        );
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
            liberator.echoerr("Pathtraq: URL normalize faild!!");
            return undefined;
        }
        return xhr.responseText;
    }

    function getTags(arg){
        liberator.plugins.hatena_tags = [];
        httpGET("http://b.hatena.ne.jp/my",
                function(mypage_text){
                    var mypage_html = parseHTML(mypage_text);
                    var tags = getElementsByXPath("//ul[@id=\"taglist\"]/li/a",mypage_html);
                    for(var i in tags)
                        liberator.plugins.hatena_tags.push(tags[i].innerHTML);
                    liberator.echo("Hatena bookmark: Tag parsing is finished. taglist length: " + tags.length);
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
        xhr.setRequestHeader("Content-Type","application/x.atom+xml");
        xhr.send(request.toString());
    }
    liberator.commands.addUserCommand(['hbtags'],"Update HatenaBookmark Tags",
        getTags,
        {}
    );
    liberator.commands.addUserCommand(['hb'],"Post to HatenaBookmark",
        function(arg){
            try {
                var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
                var logins = passwordManager.findLogins({}, 'https://www.hatena.ne.jp', 'https://www.hatena.ne.jp', null);
                if(logins.length)
                    [hatenaUser, hatenaPassword] = [logins[0].username, logins[0].password];
                else
                    liberator.echoerr("Hatena bookmark: account not found");
            }
            catch(ex) {
            }
            addHatenaBookmarks(hatenaUser,hatenaPassword,liberator.buffer.URL,arg,isNormalize);
        },{
            completer: function(filter){
                var match_result = filter.match(/(.*)\[(\w*)$/); //[all, commited , now inputting]
                var m = new RegExp("^" + match_result[2]);
                var completionList = [];
                for(var i in liberator.plugins.hatena_tags)
                    if(m.test(liberator.plugins.hatena_tags[i])){
                        completionList.push([match_result[1] + "[" + liberator.plugins.hatena_tags[i] + "]","Tag"]);
                    }
                return [0, completionList];
            }
        }
    );
})();
