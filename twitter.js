// Vimperator plugin: 'Update Twitter'
// Last Change: 09-Apr-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// update twitter status script for vimperator0.6.*

(function(){
    var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
    function sayTwitter(username,password,stat){
        var xhr = new XMLHttpRequest();
        xhr.open("POST","http://twitter.com/statuses/update.json",false,username,password);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send("status=" + encodeURIComponent(stat));
    }
    function sprintf(format) {
        var i = 1, re = /%s/, result = "" + format;
        while (re.test(result) && i < arguments.length) result = result.replace(re, arguments[i++]);
        return result;
    }
    function showFollowersStatus(username,password){
        var xhr = new XMLHttpRequest();
        //xhr.open("GET","http://twitter.com/statuses/friends_timeline.json",false,username,password);
        xhr.open("GET","http://twitter.com/statuses/user_timeline/otsune.json",false,username,password);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(null);
        var followers_status = window.eval(xhr.responseText);

        var html = <><![CDATA[
            <style tyep="text/css"><!--
            a { text-decoration: none; }
            img { border; 0px; width: 16px; height: 16px; vertical-align: baseline; }
            --></style>
        ]]></>.toString().replace(/\n\s*/g, '');
        for (var i = 0; i < followers_status.length; i++) {
            var stat = followers_status[i];
            stat.user.name += "\u202c";
            stat.text += "\u202c";
            html += sprintf(
                    <><![CDATA[
                        <img src="%s" title="%s" border="0" />
                        <strong>%s</strong>
                        : %s<br />
                    ]]></>.toString().replace(/\n\s*/g, ''),
                stat.user.profile_image_url,
                stat.user.screen_name,
                stat.user.name,
                stat.text
            );
        }
            liberator.log(html);
        liberator.echo(html, true);
    }
    liberator.commands.addUserCommand(['twitter'], 'Change twitter status',
        function(arg,special){
            var password;
            var username;
            try {
                var logins = passwordManager.findLogins({}, 'http://twitter.com',  'https://twitter.com', null);
                if(logins.length)
                    [username, password] = [logins[0].username, logins[0].password];
                else
                    liberator.echoerr("Twitter: account not found");
            }
            catch(ex) {
            }

            if(special){
                arg = arg.replace(/%URL%/g, liberator.buffer.URL)
                        .replace(/%TITLE%/g ,liberator.buffer.title);
            }

            if (!arg || arg.length == 0)
                showFollowersStatus(username,password);
            else
                sayTwitter(username,password,arg);
        },{ }
    );
})();
