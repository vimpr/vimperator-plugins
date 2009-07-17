// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>login manager</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.0.4</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.2pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/loginManger.js</updateURL>
    <license>public domain</license>
    <detail><![CDATA[

=== TODO ===

]]></detail>
</VimperatorPlugin>;
//}}}

(function(){

var loginManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);

var services = {
    pixiv: {
        HOST: ["http://www.pixiv.net"],
        LOGIN: "/index.php",
        LOGOUT: "/logout.php",
        usernameField: "pixiv_id",
        passwordField: "pass",
        extraField: {
            mode: "login",
            skip: "1",
        },
    },
    drawr: {
        HOST: ["http://drawr.net"],
        LOGIN: "/login.php",
        LOGOUT: "/logout.php",
        usernameField: "user_uid",
        passwordField: "user_upw",
        extraField: {
            mode: "autologin",
        },
    },
    mixi: {
        HOST: ["https://mixi.jp", "http://mixi.jp"],
        LOGIN: "/login.pl",
        LOGOUT: "/logout.pl",
        usernameField: "email",
        passwordField: "password",
        extraField: {
            next_url: "/home.pl",
        },
    },
    hatena: {
        HOST: ["https://www.hatena.ne.jp", "http://www.hatena.ne.jp"],
        LOGIN: "/login",
        LOGOUT: "/logout",
        usernameField: "name",
        passwordField: "password",
        logoutBeforeLogin: true,
    },
    hatelabo: {
        HOST: ["https://www.hatelabo.jp", "http://www.hatelabo.jp"],
        LOGIN: "/login",
        LOGOUT: "/logout",
        usernameField: "key",
        passwordField: "password",
        logoutBeforeLogin: true,
        extraField: {
            mode: "enter",
        },
    },
    tumblr: {
        HOST: ["http://www.tumblr.com"],
        LOGIN: "/login",
        LOGOUT: "/logout",
        usernameField: "email",
        passwordField: "password",
    },
    twitter: {
        HOST: ["https://twitter.com", "http://twitter.com"],
        LOGIN: "/sessions",
        LOGOUT: "/sessions/destroy",
        usernameField: "session[username_or_email]",
        passwordField: "session[password]",
        extraField: {
            authenticity_token: tokenGetter(/authenticity_token.+value="(.+?)"/),
        },
    },
    "wassr.com": {
        HOST: ["https://wassr.com", "http://wassr.com", "https://wassr.jp", "http://wassr.jp"],
        LOGIN: "/account/login",
        LOGOUT: "/account/logout",
        usernameField: "login_id",
        passwordField: "login_pw",
        extraField: {
            CSRFPROTECT: tokenGetter(/CSRFPROTECT.+value="(.+?)"/),
        },
    },
    "wassr.jp": {
        HOST: ["https://wassr.jp", "http://wassr.jp", "https://wassr.com", "http://wassr.com"],
        LOGIN: "/account/login",
        LOGOUT: "/account/logout",
        usernameField: "login_id",
        passwordField: "login_pw",
        extraField: {
            CSRFPROTECT: tokenGetter(/CSRFPROTECT.+value="(.+?)"/),
        },
    },
};
for (name in services){
    services[name] = new Service(services[name]);
}
if (liberator.globalVariables.userLoginServices) {
    let userServices = liberator.globalVariables.userLoginServices;
    for (name in userServices){
        services[name] = new Service(userServices[name]);
    }
}

// Library
function Service(service) //{{{
{
    let self = this;
    self.login = function(username){
        let content = {};
        let host = service.HOST[0];
        content[service.usernameField] = username;
        if (!self.setPassword(content, username)) {
            liberator.echoerr('failed get password "'+host+'" as '+username);
            return false;
        }
        if (service.extraField && !self.setExtraField(content)) return false;

        let loginURL = host+service.LOGIN;
        let error = function(e) liberator.echo('login failed "'+host+'" as '+username);
        let success = function(e) liberator.echo('login "'+host+'" as '+username);
        let login = function() request(loginURL, content, success, error);
        if (service.logoutBeforeLogin) {
            let logoutURL = host+service.LOGOUT;
            return request(logoutURL, content, login, error);
        }

        login();
    };
    self.logout = function(){
        let content = {};
        let host = service.HOST[0];
        if (service.extraField && !self.setExtraField(content)) return false;
        let logoutURL = host+service.LOGOUT;
        let error = function() liberator.echo('logout failed "'+host+'" as '+username);
        let success = function() liberator.echo('logout "'+host+'" as '+username);
        request(logoutURL, content, success, error);
    };
    self.getLogins = function() {
        return [loginManager.findLogins({}, host, host, null) for each(host in service.HOST)]
        .reduce(function(sum, logins){
            return sum.concat(logins.filter(function(login)
                sum.length==0 || sum.filter(function(x)
                    x.username==login.username).length==0))
                }, []);
    };
    self.getUsernames = function(){
        return [x.username for each(x in self.getLogins()) if(x.username)];
    };
    self.setPassword = function(content, username){
        let logins = self.getLogins()
            .filter(function(x) x.username==username);

        if(logins.length==0) return false;
        content[service.passwordField] = logins[0].password;
        return content;
    };
    self.setExtraField = function(content){
        if (!service.extraField) return false;
        for (field in service.extraField){
            value = service.extraField[field];
            switch(typeof value) {
            case "function":
                content[field] = value(service);
                break;
            case "string":
                content[field] = value;
                break;
            }
            if (!content[field]){
                liberator.echoerr("failed get "+field);
                return false;
            }
        }
        return content;
    };
    for (prop in service){
        if (self[prop]) self["_"+prop] = self[prop];
        self[prop] = service[prop];
    }
} //}}}

function encode(content)
    [k+"="+encodeURIComponent(content[k]) for(k in content)].join("&");
function request(url, content, onload, onerror)
{
    let req = new XMLHttpRequest;
    req.open("POST", url, true);
    req.onload = onload;
    req.onerror = onerror;
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send(encode(content));
}
function tokenGetter(pattern) //{{{
{
    return function(service){
        let res = util.httpGet(service.HOST[0]);
        if (pattern.test(res.responseText)){
            return RegExp.$1;
        }
    };
} //}}}

// Commands
// {{{
commands.addUserCommand(["login"], "Login",
    function(args){
        let [servicename, username] = args;
        let service = services[servicename];
        if (!service) return false;
        service.login(username);
    }, {
        completer: function(context, args){
            if (args.completeArg == 0){
                context.title = ["service"];
                context.completions = [[s,""] for(s in services)];
            } else if (args.completeArg == 1){
                let service = services[args[0]];
                if (!service) return false;
                context.title = ["username"];
                context.completions = [[u,""] for each(u in service.getUsernames())];
            }
        },
        literal: 1,
    });
commands.addUserCommand(["logout"], "Logout",
    function(args){
        let [servicename, username] = args;
        let service = services[servicename];
        if (!service) return false;
        service.logout(username);
    }, {
        completer: function(context, args){
            context.title = ["service"];
            context.completions = [[s,""] for(s in services)];
        },
    });
// }}}

})();
// vim: fdm=marker sw=4 ts=4 et:
