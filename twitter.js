// Vimperator plugin: "Update Twitter"
// Last Change: 21-Jan-2009. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// The script allows you to update Twitter status from Vimperator 0.6.*.
//
// Commands:
//  :twitter some thing text
//      post "some thing text" to Twitter.
//  :twitter! someone
//      show someone's statuses.
//  :twitter!? someword
//      show search result of 'someword' from "http://search.twitter.com/".
//  :twitter!@
//      show mentions.
//  :twitter!+ someone
//      fav someone's last status..
//  :twitter!- someone
//      un-fav someone's last status..
let PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>The script allows you to update Twitter status from Vimperator</description>
<version>1.2.0</version>
<updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/twitter.js</updateURL>
<author>Trapezoid</author>
<license>Creative Commons</license>
<detail><![CDATA[
    == Subject ==
    The script allows you to update Twitter status from Vimperator 0.6.*.

    == Commands ==
    :twitter some thing text:
        post "some thing text" to Twitter.
    :twitter! someone:
        show someone's statuses.
    :twitter!? someword:
        show search result of 'someword' from "http://search.twitter.com/".
    :twitter!@:
        show mentions.
    :twitter!+ someone:
        fav someone's last status..
    :twitter!- someone:
        un-fav someone's last status..
]]></detail>
</VimperatorPlugin>;

liberator.modules.twitter = (function(){
    var statuses = null;
    var expiredStatus = false;
    var autoStatusUpdate = !!parseInt(liberator.globalVariables.twitter_auto_status_update || 0);
    var statusValidDuration = parseInt(liberator.globalVariables.twitter_status_valid_duration || 90);
    var statusRefreshTimer;
    var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
    var evalFunc = window.eval;
    try {
        var sandbox = new Components.utils.Sandbox("about:blank");
        if (Components.utils.evalInSandbox("true", sandbox) === true){
            evalFunc = function(text){
                return Components.utils.evalInSandbox(text, sandbox);
            };
        }
    } catch (e){ liberator.log("warning: twitter.js is working with unsafe sandbox."); }

    function sprintf(format){
        var i = 1, re = /%s/, result = "" + format;
        while (re.test(result) && i < arguments.length) result = result.replace(re, arguments[i++]);
        return result;
    }
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
        var doc = node.ownerDocument;
        var result = (node.ownerDocument || node).evaluate(xpath, node, null,
                XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue ? result.singleNodeValue : null;
    }
    function sayTwitter(username, password, stat){
        var sendData = '';
        if (stat.match(/^(.*)@([^\s#]+)(?:#(\d+))(.*)$/)){
            var [replyUser, replyID] = [RegExp.$2, RegExp.$3];
            stat = RegExp.$1 + "@" + replyUser + RegExp.$4;
            sendData = "status=" + encodeURIComponent(stat) + "&in_reply_to_status_id=" + replyID;
        } else {
            sendData = "status=" + encodeURIComponent(stat);
        }
        sendData += "&source=Vimperator";
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://twitter.com/statuses/update.json", false, username, password);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(sendData);
        liberator.echo("[Twitter] Your post " + '"' + stat + '" (' + stat.length + " characters) was sent. " );
    }
    function favTwitter(username, password, user){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://twitter.com/statuses/user_timeline/" + user + ".json?count=1", false, username, password);
        xhr.send(null);
        xhr.open("POST", "https://twitter.com/favourings/create/" + window.eval(xhr.responseText)[0].id + ".json", false, username, password);
        xhr.send(null);
    }
    function unfavTwitter(username, password, user){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://twitter.com/statuses/user_timeline/" + user + ".json?count=1", false, username, password);
        xhr.send(null);
        xhr.open("DELETE", "https://twitter.com/favourings/destroy/" + window.eval(xhr.responseText)[0].id + ".json", false, username, password);
        xhr.send(null);
    }
    function showTwitterMentions(username, password){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://twitter.com/statuses/mentions.json", false, username, password);
        xhr.send(null);
        statuses = evalFunc(xhr.responseText);

        var html = <style type="text/css"><![CDATA[
            span.twitter.entry-content a { text-decoration: none; }
            img.twitter.photo { border; 0px; width: 16px; height: 16px; vertical-align: baseline; }
        ]]></style>.toSource()
                   .replace(/(?:\r\n|[\r\n])[ \t]*/g, " ") +
            statuses.map(function(status)
                <>
                    <img src={status.user.profile_image_url}
                         alt={status.user.screen_name}
                         title={status.user.screen_name}
                         class="twitter photo"/>
                    <strong>{status.user.name}&#x202C;</strong>
                </>.toSource()
                   .replace(/(?:\r\n|[\r\n])[ \t]*/g, " ") +
                    sprintf(': <span class="twitter entry-content">%s&#x202C;</span>', status.text))
                        .join("<br/>");

        //liberator.log(html);
        liberator.echo(html, true);
    }
    function getFollowersStatus(username, password, target, onComplete){
        // for debug
        //target = "otsune"
        function setRefresher(){
            expiredStatus = false;
            if (statusRefreshTimer)
                clearTimeout(statusRefreshTimer);
            statusRefreshTimer = setTimeout(function () expiredStatus = true, statusValidDuration * 1000);
        }

        var xhr = new XMLHttpRequest();
        var endPoint = target ? "https://twitter.com/statuses/user_timeline/" + target + ".json"
            : "https://twitter.com/statuses/friends_timeline.json";
        xhr.open("GET", endPoint, onComplete, username, password);
        liberator.log('get!');
        if (onComplete) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    liberator.log('got!');
                    setRefresher();
                    onComplete(statuses = evalFunc(xhr.responseText) || []);
                }
            }
        }
        xhr.send(null);
        if (onComplete)
            return;
        setRefresher();
        statuses = evalFunc(xhr.responseText) || [];
    }
    function showFollowersStatus(username, password, target){
        // for debug
        //target = "otsune"
        getFollowersStatus.apply(null, arguments);

        var html = <style type="text/css"><![CDATA[
            span.twitter.entry-content a { text-decoration: none; }
            img.twitter.photo { border; 0px; width: 16px; height: 16px; vertical-align: baseline; margin: 1px; }
        ]]></style>.toSource()
                   .replace(/(?:\r\n|[\r\n])[ \t]*/g, " ") +
            statuses.map(function(status)
                <>
                    <img src={status.user.profile_image_url}
                         alt={status.user.screen_name}
                         title={status.user.screen_name}
                         class="twitter photo"/>
                    <strong>{status.user.name}&#x202C;</strong>
                    : <span class="twitter entry-content">{detectLink(status.text)}</span>
                </>.toSource()
                   .replace(/(?:\r\n|[\r\n])[ \t]*/g, " "))
                        .join("<br/>");

        //liberator.log(html);
        liberator.echo(html, true);
    }
    function detectLink(str){
        let m = str.match(/https?:\/\/\S+/);
        if (m) {
            let left = str.substr(0, m.index);
            let url = m[0];
            let right = str.substring(m.index + m[0].length);
            return <>{detectLink(left)}<a highlight="URL" href={url}> {url} </a>{detectLink(right)}</>;
        }
        return str;
    }
    function getAccount(){
        try {
            var logins = passwordManager.findLogins({}, "http://twitter.com", "https://twitter.com", null);
            if (logins.length)
                return [logins[0].username, logins[0].password];
            else
                throw "Twitter: account not found";
        }
        catch (ex){
            liberator.echoerr(ex);
        }

    }
    function showTwitterSearchResult(word){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://search.twitter.com/search.json?q=" + encodeURIComponent(word), false);
        xhr.send(null);
        var results = (evalFunc("("+xhr.responseText+")") || {"results":[]}).results;

        var html = <style type="text/css"><![CDATA[
            span.twitter.entry-content a { text-decoration: none; }
            img.twitter.photo { border; 0px; width: 16px; height: 16px; vertical-align: baseline; margin: 1px; }
        ]]></style>.toSource()
                   .replace(/(?:\r\n|[\r\n])[ \t]*/g, " ") +
            results.map(function(result)
                <>
                    <img src={result.profile_image_url}
                         alt={result.from_user}
                         title={result.from_user}
                         class="twitter photo"/>
                    <strong>{result.from_user}&#x202C;</strong>
                    : <span class="twitter entry-content">{result.text}</span>
                </>.toSource()
                   .replace(/(?:\r\n|[\r\n])[ \t]*/g, " "))
                        .join("<br/>");

        //liberator.log(html);
        liberator.echo(html, true);
    }
    liberator.modules.commands.addUserCommand(["twitter"], "Change Twitter status",
        function(arg){
            var special = arg.bang;
            var [username, password] = getAccount();
            arg = arg.string.replace(/%URL%/g, liberator.modules.buffer.URL)
                .replace(/%TITLE%/g, liberator.modules.buffer.title);

            if (special && arg.match(/^\?\s*(.*)/))
                showTwitterSearchResult(RegExp.$1);
            else
            if (special && arg.match(/^\+\s*(.*)/))
                favTwitter(username, password, RegExp.$1);
            else
            if (special && arg.match(/^-\s*(.*)/))
                unfavTwitter(username, password, RegExp.$1);
            else
            if (special && arg.match(/^@/))
                showTwitterMentions(username, password);
            else
            if (special || arg.length == 0)
                showFollowersStatus(username, password, arg);
            else
                sayTwitter(username, password, arg);
        },{
            bang: true,
            literal: 0,
            completer: let (getting, targetContext) function(context, args){
                function compl(){
                    if (args.bang){
                        targetContext.title = ["Name","Entry"];
                        list = statuses.map(function(s) ["@" + s.user.screen_name, s.text]);
                    } else if (/RT\s+@\w*$/.test(args[0])){
                        targetContext.title = ["Name + Text"];
                        list = statuses.map(function(s) ["@" + s.user.screen_name + ": " + s.text, "-"]);
                    } else {
                        targetContext.title = ["Name#ID","Entry"];
                        list = statuses.map(function(s) ["@" + s.user.screen_name+ "#" + s.id + " ", s.text]);
                    }

                    if (target){
                        list = list.filter(function($_) $_[0].indexOf(target) >= 0);
                    }
                    targetContext.completions = list;
                    targetContext.incomplete = false;
                    targetContext = getting = null;
                }

                var matches= context.filter.match(/@(\w*)$/);
                if (!matches) return;
                var list = [];
                var target = matches[1];
                var doGet = (expiredStatus || !(statuses && statuses.length)) && autoStatusUpdate;
                context.offset += matches.index;
                context.incomplete = doGet;
                context.hasitems = !doGet;
                targetContext = context;
                if (doGet) {
                    if (!getting) {
                        getting = true;
                        var [username, password] = getAccount();
                        getFollowersStatus(username, password, null, compl);
                    }
                } else {
                    compl();
                }
            }
        },
        true
    );
    let self = {
        get statuses(){
            return statuses;
        },
    };
    return self;
})();
// vim:sw=4 ts=4 et:
