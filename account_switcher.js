/**
 * ==VimperatorPlugin==
 * @name           account_switcher.js
 * @description    switch account easily
 * @description-ja 複数のアカウントを切り替える
 * @minVersion     2.1a1pre
 * @author         masa138
 * @version        0.0.5
 * ==/VimperatorPlugin==
 *
 * Usage:
 * :account {username}@{servicename}
 *
 */
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

    var _services = {
        google: {
            host   : 'https://www.google.com',
            login  : '/accounts/LoginAuth',
            id     : 'Email',
            pw     : 'Passwd',
            logout : '/accounts/Logout',
            jump   : '/accounts/ManageAccount'
        },
        hatena: {
            host   : 'https://www.hatena.ne.jp',
            login  : '/login',
            id     : 'name',
            pw     : 'password',
            logout : '/logout'
        },
        hatelabo: {
            host   : 'https://www.hatelabo.jp',
            login  : '/login',
            id     : 'mode=enter&key',
            pw     : 'password',
            logout : '/logout',
            jump   : 'http://hatelabo.jp/'
        }
    };

    function init() {
        var rcServices = liberator.globalVariables.accountSwitcherServices;
        rcServices = !rcServices ? [] : rcServices;

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
            for (var i = 0; i < logins.length; i++) {
                var login = logins[i];
                accounts[[login.username, host].join('@')] = {};
                var a = accounts[[login.username, host].join('@')];
                a.username = login.username,
                a.password=login.password,
                a.host = host;
            }
        }
        isFirst = false;
    }

    function changeAccount(user) {
        var service = services[accounts[user].host];
        if (service.host == null || service.logout == null) return;

        var username = accounts[user].username;
        var password = accounts[user].password;
        var req = new XMLHttpRequest();
        var url = (service.logout.indexOf('http') != 0) ? service.host + service.logout : service.logout;
        req.open("POST", url, true);
        req.onload = function(e) {
            if (service.login == null || service.id == null || service.pw == null) return;
            var req = new XMLHttpRequest();
            var url = (service.login.indexOf('http') != 0) ? service.host + service.login : service.login;
            req.open("POST", url, true);
            req.onload = function(e) {
                if (service.jump != null) {
                    var url = (service.jump.indexOf('http') == -1) ? service.host + service.jump : service.jump;
                    content.location = url;
                } else if(content.location != 'about:blank') {
                    content.location.reload();
                }
                var needle = '.hatena.ne.jp';
                if (service.host.toLowerCase().lastIndexOf(needle) == service.host.length - needle.length) {
                    img.setAttribute('src', 'http://www.hatena.ne.jp/users/' + username.substr(0, 2) + '/' + username + '/profile_s.gif');
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
            req.send(
                service.id + '=' + encodeURIComponent(username) + '&' +
                service.pw + '=' + encodeURIComponent(password)
            );
            nowLogin[user.substr(user.lastIndexOf('@') + 1)] = user;
        };
        req.onerror = function(e) { liberator.echoerr('Logout error in account_switcher.js'); };
        req.send(null);
    }

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
