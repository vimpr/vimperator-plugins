// Vimperator plugin: "Update Wassr"
// Last Change: 08-May-2008. Jan 2008
// License: Creative Commons
// Maintainer: mattn <mattn.jp@gmail.com> - http://mattn.kaoriya.net/
// Based On: twitter.js by Trapezoid
//
// The script allows you to update Wassr status from Vimperator 0.6.*.

(function(){
    var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
    function sayWassr(username, password, stat){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://api.wassr.jp/statuses/update.json", false, username, password);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send("status=" + encodeURIComponent(stat));
    }
    function sprintf(format){
        var i = 1, re = /%s/, result = "" + format;
        while (re.test(result) && i < arguments.length) result = result.replace(re, arguments[i++]);
        return result;
    }
    function showFollowersStatus(username, password){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://api.wassr.jp/statuses/friends_timeline.json", false, username, password);
        // for debug
        //xhr.open("GET", "http://api.wassr.jp/statuses/user_timeline/otsune.json", false, username, password);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(null);
        var statuses = window.eval(xhr.responseText);

        var html = <style type="text/css"><![CDATA[
            span.wassr.entry-content a { text-decoration: none; }
            img.wassr.photo { border; 0px; width: 16px; height: 16px; vertical-align: baseline; }
        ]]></style>.toSource()
                   .replace(/(?:\r?\n|\r)[ \t]*/g, " ") +
            statuses.map(function(status)
                <>
                    <img src={'http://wassr.jp/user/' + status.user_login_id + '/profile_img.png.32'}
                         alt={status.user.screen_name}
                         title={status.user.screen_name}
                         class="wassr photo"/>
                    <strong>{status.user_login_id}&#x202C;</strong>
                </>.toSource()
                   .replace(/(?:\r?\n|\r)[ \t]*/g, " ") +
                    sprintf(': <span class="wassr entry-content">%s&#x202C;</span>', status.text))
                        .join("<br/>");

        //liberator.log(html);
        liberator.echo(html, true);
    }
    liberator.commands.addUserCommand(["wassr"], "Change wassr status",
        function(arg, special){
            var password;
            var username;
            try {
                var logins = passwordManager.findLogins({}, "http://wassr.jp", "http://wassr.jp", null);
                if (logins.length)
                    [username, password] = [logins[0].username, logins[0].password];
                else
                    throw "Wassr: account not found";
            }
            catch (ex){
                liberator.echoerr(ex);
            }

            if (special){
                arg = arg.replace(/%URL%/g, liberator.buffer.URL)
                         .replace(/%TITLE%/g, liberator.buffer.title);
            }

            if (!arg || arg.length == 0)
                showFollowersStatus(username, password);
            else
                sayWassr(username, password, arg);
        },
    { });
})();
// vim:sw=4 ts=4 et:
