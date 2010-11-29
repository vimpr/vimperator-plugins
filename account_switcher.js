var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Switch account easily.</description>
<description lang="ja">複数のアカウントを切り替えることができます．</description>
<minVersion>2.1a1pre</minVersion>
<maxVersion>2.1a1pre</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/account_switcher.js</updateURL>
<author mail="masa138@gmail.com" homepage="http://www.hatena.ne.jp/masa138/">Masayuki KIMURA</author>
<version>0.08</version>
<detail><![CDATA[

== Commands ==
:account {username}@{servicename}
    {servicename} に {username} でログインします．
    このとき，ログインマネージャーの値を使用するので，
    ログインマネージャーにパスワードを保存しておく必要があります．

:loginmultiaccounts
    .vimperatorrc であらかじめ設定しておいたアカウントすべてにログインします．
    日常的に使うサーヴィスのメインアカウントを登録しておくことで，コマンド一つで
    すべてにログインできます．


== Global variables ==
accountSwitcherServices
    Google, Hatena, Hatelabo 以外のアカウントにも対応することが出来ます．

accountSwitcherLoginServices
    :loginmultiaccounts でログインするアカウントの配列

== .vimperatorrc ==
以下の様に記述しておけば，:loginmultiaccounts を実行したときに
すべてのアカウントにログインできます．
>||
js <<EOM
liberator.globalVariables.accountSwitcherLoginServices = [
    'bar@hatena',
    'buz@hatelabo',
    'foo@google',
];
||<

accountSwitcherOpenNewTab
    ログイン後に jump 先を新しいタブで開くかどうか指定することが出来ます．
>||
js <<EOM
// タブで開く
liberator.accountSwitcherOpenNewTab = 1;
||<

]]></detail>
</VimperatorPlugin>;
(function(){
    var services = [];
    var accounts = [];
    var nowLogin = [];
    var isFirst  = true;

    var manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);

    var ns         = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
    var statusBar  = document.getElementById('status-bar');
    var targetElem = document.getElementById('page-report-button');
    var afterSLine = targetElem.nextSibling;
    var sbPannel   = document.createElementNS(ns, 'statusbarpannel');
    var img        = sbPannel.appendChild(document.createElementNS(ns, 'image'));
    sbPannel.id    = 'account-switcher-pannel';

    var loginServices;

    var _services = {
        google: {
            host   : 'https://www.google.com',
            login  : '/accounts/LoginAuth',
            id     : 'Email',
            pw     : 'Passwd',
            ex     : ['GALX'],
            logout : 'http://mail.google.com/mail/?logout',
        },
        hatena: {
            host   : 'https://www.hatena.ne.jp',
            login  : '/login',
            id     : 'name',
            pw     : 'password',
            logout : '/logout',
        },
        hatelabo: {
            host   : 'https://www.hatelabo.jp',
            login  : '/login',
            id     : 'key',
            pw     : 'password',
            ex     : ['mode=enter'],
            logout : '/logout',
        },
        twitter: {
            host   : 'https://twitter.com',
            login  : '/sessions',
            id     : 'session[username_or_email]',
            pw     : 'session[password]',
            ex     : ['authenticity_token'],
            exhost : 'https://twitter.com',
            logout : '/sessions/destroy',
            jump   : '/',
        },
        tumblr : {
            host   : 'http://www.tumblr.com',
            login  : '/login',
            id     : 'email',
            pw     : 'password',
            logout : '/logout',
            jump   : '/dashboard',
        },
    };

    function init() {
        var rcServices = liberator.globalVariables.accountSwitcherServices;
        rcServices = !rcServices ? [] : rcServices;

        // loginmultiaccounts でログインするアカウントの読み込み
        loginServices = liberator.globalVariables.accountSwitcherLoginServices;
        loginServices = !loginServices ? [] : loginServices;

        for (var key in _services)  if (_services.hasOwnProperty(key)) services[key] = _services[key];
        for (var key in rcServices) if (rcServices.hasOwnProperty(key)) {
            var s = rcServices[key];
            if (services[key] == null) services[key] = s;
            else {
                for (var k in s) if (s.hasOwnProperty(k)) {
                    services[key][k] = s[k];
                }
            }
        }

        var hosts = [key for (key in services)];
        for (var i in hosts) {
            var host = hosts[i];
            if (isFirst) nowLogin[host] = '';
            var logins = manager.findLogins({}, services[host].host, "", null);
            var ignoreAccounts = liberator.globalVariables.accountSwitcherIngnoreAccounts;
            for (var i = 0; i < logins.length; i++) {
                var login = logins[i];
                var usernameAndService = [login.username, host].join('@');
                if (!!ignoreAccounts && ignoreAccounts.indexOf(usernameAndService) != -1) continue;
                accounts[usernameAndService] = {};
                var a = accounts[usernameAndService];
                a.username = login.username;
                a.password = login.password;
                a.host     = host;
            }
        }

        isFirst = false;
    }

    function changeAccount(user) {
        var username = accounts[user].username;
        var password = accounts[user].password;
        var params   = [];

        var service = services[accounts[user].host];
        if (service.host == null || service.logout == null) return;
        if (!!service.params) params = service.params;

        var req = new XMLHttpRequest();
        var url = (service.logout.indexOf('http') != 0) ? service.host + service.logout : service.logout;
        req.open("POST", url, true);
        req.onload = function(e) {
            var url = (service.login.indexOf('http') != 0) ? service.host + service.login : service.login;
            var ex  = service.ex;
            if (!!ex) {
                var res;
                if (!!service.exhost) {
                    res = util.httpGet(service.exhost);
                } else {
                    res = util.httpGet(url);
                }
                for (var i = 0, length = ex.length; i < length; i++) {
                    var value = ex[i];
                    if (value.indexOf('=') > 0) {
                        params.push(value);
                    } else {
                        res.responseText.match(new RegExp('<([^<>]*?name=\"' + value + '\"[^<>]*?)>'));
                        RegExp.$1.match(/value=\"([\w-]+)\"/);
                        params.push(value + '=' + encodeURIComponent(RegExp.$1));
                    }
                }
            }
            if (service.login == null || service.id == null || service.pw == null) return;
            var req = new XMLHttpRequest();
            req.open("POST", url, true);
            req.onload = function(e) {
                if (service.jump != null) {
                    var url = (service.jump.indexOf('http') == -1) ? service.host + service.jump : service.jump;
                    if (!!liberator.globalVariables.accountSwitcherOpenNewTab && window.content.location.href != 'about:blank') {
                        liberator.open(url, liberator.NEW_BACKGROUND_TAB);
                    } else {
                        window.content.location.href = url;
                    }
                } else if(content.location.href != 'about:blank') {
                    window.content.location.reload();
                }
                var needle = '.hatena.ne.jp';
                if (service.host.toLowerCase().lastIndexOf(needle) == service.host.length - needle.length) {
                    img.setAttribute('src', 'http://www.hatena.ne.jp/users/' + username.substr(0, 2) + '/' + username + '/profile_s.gif');
                    img.setAttribute('tooltiptext', 'id:' + username);
                    if (!document.getElementById('account_switcher_pannel')) {
                        if (afterSLine != null) {
                            statusBar.insertBefore(sbPannel, afterSLine);
                        } else {
                            statusBar.appendChild(sbPannel);
                        }
                    }
                }
            };
            req.onerror = function(e) { liberator.echoerr('Login error in account_switcher.js'); };
            req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            params.push(service.id + '=' + encodeURIComponent(username));
            params.push(service.pw + '=' + encodeURIComponent(password));
            req.send(params.join('&'));
            nowLogin[user.substr(user.lastIndexOf('@') + 1)] = user;
        };
        req.onerror = function(e) { liberator.echoerr('Logout error in account_switcher.js'); };
        req.send(null);
    }

    function loginMultiAccounts() {
        for (var i = 0, length = loginServices.length; i < length; i++) {
            for (var key in accounts) if (accounts.hasOwnProperty(key)) {
                if (key == loginServices[i]) {
                    changeAccount(key);
                    continue;
                }
            }
        }
    }

    commands.addUserCommand(["loginmultiaccounts"], "Login multi accounts",
        function() {
            init();
            loginMultiAccounts();
        }
    );

    commands.addUserCommand(["account"], "Change Account",
        function(args) {
            if (!args) {
                liberator.echo("Usage: account {username}@{servicename}");
            } else {
                var user = args[args.length - 1];
                if (!user) return;
                changeAccount(user);
            }
        }, {
            completer: function(context, args) {
                init();
                context.title = ["Account", "Service"];
                for (var service in nowLogin) if (nowLogin.hasOwnProperty(service)) {
                    var username = nowLogin[service];
                    if (username != '') delete(accounts[username]);
                }
                var compls = [[key, accounts[key].host] for (key in accounts) if (accounts.hasOwnProperty(key))];
                if (args.length > 0) {
                    for (var i = 0; i < args.length; i++) {
                        var user = args[i];
                        if (user != '') {
                            compls = compls.filter(function(c) c[0].indexOf(user) != -1);
                        }
                    }
                }
                return [0, compls];
            }
        }
    );
})();
// vim:sw=4 ts=4 et:
