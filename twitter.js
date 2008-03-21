// Vimperator plugin: 'Update Twitter'
// Last Change: 21-Mar-2008. Jan 2008
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

            sayTwitter(username,password,arg);
        },{ }
    );
})();
