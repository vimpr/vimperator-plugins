// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>login manager</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.2.1</version>
    <minVersion>2.0pre</minVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/loginManger.js</updateURL>
    <license>public domain</license>
    <detail><![CDATA[
        Default login user setting:
        >||
            let g:login_manager_default_user='nicovideo=mymail@addre.ss, slashdotjp=hogelogger'
        ||<

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
        NAME: "はてな",
        URL: /^https?:\/\/\w+\.hatena\.ne.\jp/,
        HOST: ["https://www.hatena.ne.jp", "http://www.hatena.ne.jp"],
        LOGIN: "/login",
        LOGOUT: "/logout",
        usernameField: "name",
        passwordField: "password",
        logoutBeforeLogin: true,
    },
    hatelabo: {
        NAME: "はてラボ",
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
        NAME: "tumblr",
        HOST: ["https://www.tumblr.com"],
        URL: /^https?:\/\/(?:\w+\.)?tumblr\.com\//,
        LOGIN: "/svc/account/register",
        LOGOUT: "/logout",
        usernameField: "user[email]",
        passwordField: "user[password]",
        extraField: {
            action: 'signup_login'
        },
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
    delicious: {
        HOST: ["https://secure.delicious.com"],
        LOGIN: "/login",
        LOGOUT: "/logout",
        usernameField: "username",
        passwordField: "password",
        extraField: {
            rememberme: "1",
        },
    },
    evernote: {
        HOST: ["https://www.evernote.com"],
        LOGIN: "/Login.action",
        LOGOUT: "/Logout.action",
        usernameField: "username",
        passwordField: "password",
        extraField: {
            rememberMe: "true",
            _sourcePage: tokenGetterLoginURL(/_sourcePage.+value="(.+?)"/),
            __fp: tokenGetterLoginURL(/__fp.+value="(.+?)"/),
            login: "Sign In",
        },
    },
    readitlater: {
        HOST: ["http://readitlaterlist.com"],
        LOGIN: "/login_process/",
        LOGOUT: "/lo",
        usernameField: "feed_id",
        passwordField: "password",
    },
    nicovideo: {
        URL: /^https?:\/\/\w+\.nicovideo.\jp/,
        NAME: "ニコニコ動画",
        HOST: ["https://secure.nicovideo.jp"],
        LOGIN: "/secure/login",
        usernameField: "mail",
        passwordField: "password",
        extraField: {
            site: "niconico"
        }
    },
    slashdotjp: {
        NAME: "スラッシュドットジャパン",
        HOST: ["http://slashdot.jp"],
        LOGIN: "/login.pl",
        usernameField: "unickname",
        passwordField: "upasswd",
        extraField: {
            op: "userlogin",
        }
    },
    livedoor: {
        NAME: "livedoor",
        HOST: ["https://member.livedoor.com", "http://api.livedoor.com"],
        URL: /^https?:\/\/(?:\w+\.)?livedoor\.com\//,
        LOGIN: "/login/?.sv=top",
        LOGOUT: "/logout/", /* FIXME not works */
        usernameField: "livedoor_id",
        passwordField: "password",
    },
};
for (let [name, service] in Iterator(services)){
    if (!service.NAME)
        service.NAME = name;
    services[name] = new Service(service);
}
let (gv = liberator.globalVariables.userLoginServices || liberator.globalVariables.login_manager_services) {
    if (gv) {
        let userServices = gv;
        for (name in userServices){
            services[name] = new Service(userServices[name]);
        }
    }
}
for (let [name, service] in Iterator(services)){
    if (!service.NAME)
        service.NAME = name;
}
let (gv = liberator.globalVariables.userLoginDefaults || liberator.globalVariables.login_manager_default_user) {
    if (typeof gv === 'string') {
        for (let [, sn] in Iterator(gv.split(','))) {
            let [s, v] = sn.split('=');
            services[s.trim()].DEFAULT_USER = v.trim();
        }
    } else if (typeof gv === 'object') {
        for (let [n, v] in Iterator(gv))
            services[n].DEFAULT_USER = v;
    }
}

Object.defineProperty(
    services,
    "auto",
    {
        enumerable: true,
        get: function(){
            let currentURI = makeURI(buffer.URL);
            if (/^https?/.test(currentURI.scheme)) {
                for (let n in Iterator(this, true)){
                    if (n === "auto") continue;
                    let s = this[n];
                    if (s.URL && s.URL.test(buffer.URL))
                        return s;
                    for (let [, h] in Iterator(s.HOST)){
                        let sURI = makeURI(h);
                        if (sURI.host === currentURI.host) return s;
                    }
                }
            }
            // XXX (補完に|エラーを)出さないためのダミー
            return {getUsernames: function() ([])};
        }
    }
)

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
        liberator.log(loginURL);
        let error = function(e) liberator.echo('login failed "'+host+'" as '+username);
        let success = function(e) liberator.echo('login "'+host+'" as '+username);
        let login = function() request(loginURL, content, success, error);
        if (service.logoutBeforeLogin) {
            let logoutURL = host+service.LOGOUT;
            return request(logoutURL, content, login, error);
        }

        login();
    };
    self.logout = function(username){
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
}
function tokenGetterLoginURL(pattern) //{{{
{
    return function(service){
        let res = util.httpGet(service.HOST[0]+service.LOGIN);
        if (pattern.test(res.responseText)){
            return RegExp.$1;
        }
    };
}
function getServiceAndUsernameFromArgs(args, logout)
{
    let [servicename, username] = args;
    let service = services[servicename];
    if (!service)
        service = services.auto;
    if (!service)
        return;
    if (!username) {
        let names = service.getUsernames();
        if (names.length === 1) {
            username = names[0];
        } else {
            username = service.DEFAULT_USER;
        }
    }
    return [service, username];
} //}}}

// Commands
// {{{
commands.addUserCommand(["login"], "Login",
    function(args){
        let [service, username] = getServiceAndUsernameFromArgs(args);
        if (!service)
            return liberator.echoerr("Argument required. Please supply service name.");
        if (!username)
            return liberator.echoerr("Argument required. Please supply user name.");
        service.login(username);
    }, {
        completer: function(context, args){
            if (args.completeArg == 0){
                context.title = ["service"];
                context.completions = [[n,s.NAME] for([n,s] in Iterator(services)) if (s.getUsernames().length)];
            } else if (args.completeArg == 1){
                let service = services[args[0]];
                if (!service) return false;
                context.title = ["username"];
                context.completions = [[u,] for each(u in service.getUsernames())];
            }
        },
        literal: 1,
    }, true);
commands.addUserCommand(["logout"], "Logout",
    function(args){
        let [service, username] = getServiceAndUsernameFromArgs(args);
        if (!service)
            return liberator.echoerr("Argument required. Please supply service name.");
        service.logout(username);
    }, {
        completer: function(context, args){
            context.title = ["service"];
            context.completions = [[n,s.NAME] for([n,s] in Iterator(services)) if (s.getUsernames().length)];
        },
    }, true);
// }}}

})();
// vim: fdm=marker sw=4 ts=4 et:
