// Vimperator plugin: direct_delb
// Maintainer: mattn <mattn.jp@gmail.com> - http://mattn.kaoriya.net
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

    liberator.plugins.delicious_tags = [];
    var deliciousUser, deliciousPassword;

    try {
        var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
        var logins = passwordManager.findLogins({}, 'https://secure.delicious.com', 'https://secure.delicious.com', null);
        if(logins.length)
            [deliciousUser, deliciousPassword] = [logins[0].username, logins[0].password];
        else
        liberator.echoerr("DeliciousBookmark: account not found");
    } catch(ex) { }

    function getTags(){
        const feed_url = 'https://api.del.icio.us/v1/tags/get';
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                if(xhr.status == 200) {
                    var tags = xhr.responseXML.getElementsByTagName('tag');
                    for each(var tag in tags)
                        liberator.plugins.delicious_tags.push(tag.getAttribute('tag'));
                    liberator.echo("DeliciousBookmark: Tag parsing is finished. Taglist length: " + tags.length);
                } else
                    throw new Error(xhr.statusText)
            }
        };
        xhr.open("GET", feed_url, true, deliciousUser, deliciousPassword);
        xhr.send(null);
    }

    getTags();

    function addDeliciousBookmarks(url, title, comment, normalize) {
        var target = normalize ? getNormalizedPermalink(url) : url;
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
        var request_url = 'https://api.del.icio.us/v1/posts/add?' + [
            ['url', target], ['description', title], ['extended', comment], ['tags', tags.join(' ')]
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
        xhr.open("GET", request_url, true);
        xhr.send(null);
    }

    liberator.commands.addUserCommand(['delbtags'],"Update DeliciousBookmark Tags", getTags, {});
    liberator.commands.addUserCommand(['delb'],"Post to DeliciousBookmark",
        function(arg){
            addDeliciousBookmarks(liberator.buffer.URL, liberator.buffer.title, arg, isNormalize);
        },{
            completer: function(filter){
                var match_result = filter.match(/(\[[^\]]*\])?\[?(.*)/); //[all, commited, now inputting]
                var m = new RegExp(XMigemoCore ? "^(" + XMigemoCore.getRegExp(match_result[2]) + ")" : "^" + match_result[2],'i');
                var completionList = [];
                for each(var tag in liberator.plugins.delicious_tags)
                    if(m.test(tag)){
                        completionList.push([(match_result[1] || "") + "[" + tag + "]","Tag"]);
                    }
                return [0, completionList];
            }
        }
    );
})();
