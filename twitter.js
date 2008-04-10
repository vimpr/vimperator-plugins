// Vimperator plugin: 'Update Twitter'
// Last Change: 10-Apr-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// update Twitter status script for Vimperator 0.6.*

(function(){
    var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
    function sayTwitter(username, password, stat){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://twitter.com/statuses/update.json", false, username, password);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send("status=" + encodeURIComponent(stat));
    }
    //function sprintf(format){
    //    var i = 1, re = /%s/, result = "" + format;
    //    while (re.test(result) && i < arguments.length) result = result.replace(re, arguments[i++]);
    //    return result;
    //}
    function showFollowersStatus(username, password){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://twitter.com/statuses/friends_timeline.json", false, username, password);
        // for debug
        //xhr.open("GET", "http://twitter.com/statuses/user_timeline/otsune.json", false, username, password);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(null);
        var followers_status = window.eval(xhr.responseText);

        var html = <><![CDATA[
            <style type="text/css"><!--
            a { text-decoration: none; }
            img { border; 0px; width: 16px; height: 16px; vertical-align: baseline; }
            --></style>
        ]]></>.toString()
              .replace(/(?:\r?\n|\r)\s*/g, '');
        followers_status.forEach(function(stat){
            stat.user.name += "\u202c";
            stat.text += "\u202c";
            html += <><![CDATA[
                <img src="{stat.user.profile_image_url}" 
                     title="{stat.user.screen_name}" 
                     border="0"/>
                <strong>{stat.user.name}</strong>
                : {stat.text}<br/>
            ]]></>.toString()
                  .replace(/(?:\r?\n|\r)\s*/g, '')
                  .replace(/\{([^}]+)\}/g, function(x){return window.eval(x)})
        });
        liberator.log(html);
        liberator.echo(html, true);
    }
    liberator.commands.addUserCommand(['twitter'], 'Change Twitter status',
        function(arg, special){
            var password;
            var username;
            try {
                var logins = passwordManager.findLogins({}, 'http://twitter.com',  'https://twitter.com', null);
                if (logins.length)
                    [username, password] = [logins[0].username, logins[0].password];
                else
                    throw "Twitter: account not found";
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
                sayTwitter(username, password, arg);
        }, { }
    );
})();
// vim:sw=4 ts=4 et:
