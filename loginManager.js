// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>login manager</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.0.1</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/loginManger.js</updateURL>
    <license>public domain</license>
    <detail><![CDATA[
This plugin use Tombloo library,
so require install Tombloo Addon.
http://wiki.github.com/to/tombloo

=== TODO ===
- solve depends Tombloo
- all

]]></detail>
</VimperatorPlugin>;
//}}}

(function(){

var loginManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
var Tombloo = Cc["@brasil.to/tombloo-service;1"].getService().wrappedJSObject;

var services = {
    pixiv: {
        HOST: "http://www.pixiv.net",
        LOGIN: "/index.php",
        LOGOUT: "/logout.php",
        usernameField: "pixiv_id",
        passwordField: "pass",
        extraField: {
            mode: function() "login",
            skip: function() "1",
        },
    },
    mixi: {
        HOST: "https://mixi.jp",
        LOGIN: "/login.pl",
        LOGOUT: "/logout.pl",
        usernameField: "email",
        passwordField: "password",
        extraField: {
            next_url: function() "/home.pl",
        },
    },
    hatena: {
        HOST: "https://www.hatena.ne.jp",
        LOGIN: "/login",
        LOGOUT: "/logout",
        usernameField: "name",
        passwordField: "password",
    },
    hatelabo: {
        HOST: "https://www.hatelabo.jp",
        LOGIN: "/login",
        LOGOUT: "/logout",
        usernameField: "name",
        passwordField: "password",
    },
    tumblr: {
        HOST: "http://www.tumblr.com",
        LOGIN: "/login",
        LOGOUT: "/logout",
        usernameField: "email",
        passwordField: "password",
    },
    twitter: {
        HOST: "https://twitter.com",
        LOGIN: "/sessions",
        LOGOUT: "/sessions/destroy",
        usernameField: "session[username_or_email]",
        passwordField: "session[password]",
        extraField: {
            authenticity_token: tokenGetter(/authenticity_token.+value="(.+?)"/),
        },
    },
    "wassr.com": {
        HOST: "https://wassr.com",
        LOGIN: "/account/login",
        LOGOUT: "/account/logout",
        usernameField: "login_id",
        passwordField: "login_pw",
        extraField: {
            CSRFPROTECT: tokenGetter(/CSRFPROTECT.+value="(.+?)"/),
        },
    },
    "wassr.jp": {
        HOST: "https://wassr.jp",
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
                    context.completions = [[u,""] for each(u in service.usernames())];
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

function Service(service)
{
    let self = this;
    self.login = function(username){
        let logins = loginManager.findLogins({}, service.HOST, service.HOST, null)
            .filter(function(x) x.username==username);
        if(logins.length==0) return;
        let password = logins[0].password;
        let page = service.HOST+service.LOGIN;
        let content = {};
        content[service.usernameField] = username;
        content[service.passwordField] = password;
        if (service.extraField){
            for (field in service.extraField){
                content[field] = service.extraField[field](service);
                if (!content[field]){
                    liberator.echoerr("failed get "+field);
                }
            }
        }
        return Tombloo
            .request(page, {sendContent: content})
            .addCallback(function()
                liberator.echo('login "'+service.HOST+'" as '+username));
    };
    self.logout = function(){
        let content = {};
        if (service.extraField){
            for (field in service.extraField){
                content[field] = service.extraField[field](service);
            }
        }
        return Tombloo
            .request(service.HOST+service.LOGOUT, {sendContent: content})
            .addCallback(function()
                liberator.echo('logout "'+service.HOST+'"'));
    };
    self.usernames = function(){
        let logins = loginManager.findLogins({}, service.HOST, service.HOST, null);
        return [x.username for each(x in logins) if(x.username)];
    };
    for (prop in service){
        if (self[prop]) self["_"+prop] = self[prop];
        self[prop] = service[prop];
    }
}
function tokenGetter(pattern)
{
    return function(service){
        let res = util.httpGet(service.HOST);
        if (pattern.test(res.responseText)){
            return RegExp.$1;
        }
    };
}

})();
// vim: fdm=marker sw=4 ts=4 et:
