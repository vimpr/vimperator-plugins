var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Manage Cookies (list, remove, add/remove permission)</description>
<author mail="teramako@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/teramako/">teramako</author>
<version>1.1</version>
<license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/cookieManager.js</updateURL>
<detail lang="ja"><![CDATA[
Cookie の管理をするプラグイン

== Command ==
-permオプションの有無で2種類に分かれる

=== Cookieのパーミッション ===

:cookiem[anager] list {hostname and path}:
  {hostname and path}のCookieを表示

:cookiem[anager] remove {hostname and path}:
  {hostname and path}のCookieを削除

=== 現在保存されているCookie ===

:cookiem[anager] -p[erm] list {hostname}:
  {hostname}のCookieのパーミッションを表示

:cookiem[anager] -p[erm] add {hostname} {capability}:
  {hostname}のCookieのパーミッションを設定

:cookiem[anager] -p[erm] list {hostname}:
  {hostname}のCookieのパーミッションを削除

== pageinfo ==
:pageinfo c で現在開いているホストのCookieを表示

== どうでも良いこと ==
補完機能を存分にお楽しみください :)

]]></detail>
</VimperatorPlugin>;

liberator.plugins.cookieManager = (function(){

const CM = Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager2);
const PM = Cc["@mozilla.org/permissionmanager;1"].getService(Ci.nsIPermissionManager);
const I_CPM = Ci.nsICookiePermission;
const PERM_TYPE = "cookie";

function getIterator(_enum, interface){
    while (_enum.hasMoreElements()){
        let obj = _enum.getNext().QueryInterface(interface);
        yield obj;
    }
}
function cookieIterator() getIterator(CM.enumerator, Ci.nsICookie2);
function cookiePermissionIterator(){
    for (let perm in getIterator(PM.enumerator, Ci.nsIPermission)){
        if (perm.type = PERM_TYPE)
            yield perm;
    }
}
function capabilityToString(capability){
    switch (capability){
        case I_CPM.ACCESS_ALLOW: // 1
            return "ALLOW";
        case I_CPM.ACCESS_DENY: // 2
            return "DENY";
        case I_CPM.ACCESS_SESSION: // 8
            return "ONLY_SESSION";
        default:
            return "DEFAULT";
    }
}
function stringToCapability(str){
    switch (str){
        case "ALLOW":
            return I_CPM.ACCESS_ALLOW;
        case "DENY":
            return I_CPM.ACCESS_DENY;
        case "ONLY_SESSION":
            return I_CPM.ACCESS_SESSION;
        default:
            return I_CPM.ACCESS_DEFAULT;
    }
}
function getHost(){
    var host;
    try {
        host = content.document.location.host;
    } catch (e){}
    return host;
}

// --------------------------------------------------------
// PageInfo
// --------------------------------------------------------
buffer.addPageInfoSection("c", "Cookies", function(verbose){
    var hostname;
    try {
        hostname = content.window.location.host;
    } catch (e){ return []; }
    return [[c.rawHost + c.path, c.name + " = " + c.value] for (c in cManager.stored.getByHostAndPath(hostname))];
});

// --------------------------------------------------------
// Command
// -----------------------------------------------------{{{
commands.addUserCommand(["cookiem[anager]"], "Cookie Management",
    function(args){
        if (args["-perm"]){
            switch (args[0]){
                case "list":
                    let list = cManager.permission.list(args[1]);
                    liberator.echo(template.table("Cookie Permission", list));
                    break;
                case "remove":
                    if (cManager.permission.remove(args[1])){
                        liberator.echo("Removed permission: `" + args[1] + "'");
                    } else {
                        liberator.echo("Failed to removed permission: `" + args[1] + "'");
                    }
                    break;
                case "add":
                    cManager.permission.add(args[1], args[2]);
                    break;
                default:
                    liberator.echoerr("Invalid sub-command.");
            }
            return;
        }
        var host = args[1] || getHost();
        if (!host) return;
        switch (args[0]){
            case "list":
                let xml = <></>;
                let tree = cManager.stored.getTree(host);
                for (let name in tree){
                    xml += template.table(name, [[c.name, c.value] for each(c in tree[name])]);
                }
                liberator.echo(xml, true);
                break;
            case "remove":
                cManager.stored.remove(host);
                break;
            default:
                liberator.echoerr("Invalid sub-command.");
        }
    }, {
        options: [
            [["-perm", "-p"], commands.OPTION_NOARG]
        ],
        completer: function(context, args){
            if (args["-perm"]){
                plugins.cookieManager.permission.completer(context, args);
            } else {
                plugins.cookieManager.stored.completer(context, args);
            }
        },
    }, true);
// Command End }}}
var cManager = {
    stored: { // {{{
        getByHostAndPath: function(hostAndPath){
            for (let cookie in cookieIterator()){
                if (!hostAndPath || (cookie.rawHost + cookie.path).indexOf(hostAndPath) == 0)
                    yield cookie;
            }
        },
        remove: function(hostAndPath){
            if (!hostAndPath) return false;
            for (let cookie in this.getByHostAndPath(hostAndPath)){
                CM.remove(cookie.host, cookie.name, cookie.path, false);
            }
            return true;
        },
        getTree: function(hostAndPath){
            var tree = {};
            function getTree(name){
                if (name in tree) return tree[name];
                tree[name] = [];
                return tree[name];
            }
            for (let cookie in this.getByHostAndPath(hostAndPath)){
                getTree(cookie.rawHost + cookie.path).push(cookie);
            }
            return tree;
        },
        subcommands: [
            ["list",   "list cookie permission"],
            ["remove", "remove cookie premission"]
        ],
        completer: function(context, args){
            if (args.length == 1){
                context.title = ["SubCommand", "Description"];
                context.completions = context.filter ?
                    this.subcommands.filter(function(c) c[0].indexOf(context.filter) >= 0) :
                    this.subcommands;
            } else if (args.length == 2){
                let list = util.Array.uniq([c.rawHost + c.path for (c in this.getByHostAndPath())]).map(function(host) [host, "-"]);
                context.title = ["Host and Path"];
                context.completions = context.filter ?
                    list.filter(function(c) c[0].indexOf(context.filter) >= 0) :
                    list;
            }
        },
    }, // }}}
    permission: { // {{{
        getByHost: function(hostname){
            for (let permission in cookiePermissionIterator()){
                if (permission.host == hostname)
                    return permission;
            }
            return null;
        },
        add: function(hostname, capability, force){
            var uri = util.newURI("http://" + hostname);
            var perm = this.getByHost(hostname);
            switch (typeof capability){
                case "string":
                    capability = stringToCapability(capability);
                    break;
                case "number":
                    break;
                default:
                    throw "Invalid capability";
            }
            if (perm && force){
                this.remove(hostname);
            }
            PM.add(uri, PERM_TYPE, capability);
        },
        remove: function(hostname){
            if (this.getByHost(hostname)){
                PM.remove(hostname, PERM_TYPE);
                return true;
            }
            return false;
        },
        list: function(filterReg){
            if (filterReg && !(filterReg instanceof RegExp)){
                filterReg = new RegExp(filterReg.toString());
            } else if (!filterReg){
                filterReg = new RegExp("");
            }
            return [[p.host, capabilityToString(p.capability)] for (p in cookiePermissionIterator())].filter(function($_) filterReg.test($_[0]));
        },
        subcommands: [
            ["list",   "list cookie permission"],
            ["add",    "add cookie permission"],
            ["remove", "remove cookie premission"]
        ],
        capabilityList: [
            ["ALLOW", "-"],
            ["DENY", "-"],
            ["ONLY_SESSION", "-"]
        ],
        completer: function(context, args){
            if (args.length == 1){
                context.title = ["SubCommand", "Description"];
                context.completions = context.filter ?
                    this.subcommands.filter(function(c) c[0].indexOf(context.filter) >= 0) :
                    this.subcommands;
            } else {
                let suggestion = [];
                switch (args[0]){
                    case "add":
                        if (args.length == 3){
                            context.title = ["Capability"];
                            context.completions = context.filter ?
                                this.capabilityList.filter(function($_) $_[0].toLowerCase().indexOf(context.filter.toLowerCase()) == 0) :
                                this.capabilityList;
                        } else if (args.length == 2){
                            let host = getHost();
                            if (host){
                                let hosts = [];
                                host.split(".").reduceRight(function(p, c){
                                    let domain = c + "." + p;
                                    hosts.push([domain, "-"]);
                                    return domain;
                                });
                                suggestion = hosts.reverse();
                                context.title = ["Current Host"];
                                context.completions = context.filter ?
                                    suggestion.filter(function($_) $_[0].indexOf(context.filter) >= 0) : suggestion;
                                return;
                            }
                        }
                    case "list":
                    case "remove":
                        if (args.length > 2) return;
                        context.title = ["Host", "Capability"];
                        let list = this.list();
                        context.completions = context.filter ?
                            list.filter(function($_) $_[0].indexOf(context.filter) >= 0) : list;
                }
            }
        },
    }, // }}}
};
return cManager;
})();

// vim: sw=4 ts=4 et fdm=marker:
