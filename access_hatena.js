/**
 * ==VimperatorPlugin==
 * @name           access_hatena.js
 * @description    Access to Hatena Service quickly
 * @description-ja はてなのサービスに簡単にアクセス
 * @minVersion     2.1a1pre
 * @author         id:masa138, id:hitode909
 * @version        0.5.8
 * ==/VimperatorPlugin==
 *
 * Usage:
 * :accesshatena -> access to http://www.hatena.ne.jp/
 *
 * :accesshatena {host} -> access to http://{host}.hatena.ne.jp/
 *
 * :accesshatena {host} {user_id} -> access to http://{host}.hatena.ne.jp/{user_id}/
 *
 * :accesshatena {group_name}.g {user_id} -> access to http://{group_name}.g.hatena.ne.jp/{user_id}/
 *
 */
(function(){
    var alwaysCollect;
    var useWedata;

    var wedataCache = [];
    var ignoreIds;
    var ids;
    var pageFor;
    var title;

    function Title() {
        this.initialize.apply(this, arguments);
    }
    Title.prototype = {
        initialize: function() {
            this.title = [];
        },
        key: function(host, id) {
            return [host, id.replace('/', '')].join(':');
        },
        set: function(host, id, title) {
            this.title[this.key(host, id)] = title;
        },
        get: function(host, id, title) {
            if (!this.title[this.key(host, id)]) return host + '.hatena.ne.jp/' + id;
            return this.title[this.key(host, id)];
        }
    };

    function init(flag) {
        ids     = [];
        pageFor = [];
        title   = new Title();

        alwaysCollect = liberator.globalVariables.accessHatenaAlwaysCollect;
        useWedata     = liberator.globalVariables.accessHatenaUseWedata;
        ignoreIds     = liberator.globalVariables.accessHatenaIgnoreIds;
        alwaysCollect = (alwaysCollect != null) ? alwaysCollect : true;
        useWedata     = (useWedata     != null) ? useWedata     : true;
        ignoreIds     = (ignoreIds     != null) ? ignoreIds     : ['login'];

        if (flag && useWedata) loadWedata();

        if (useWedata) {
            for (i in wedataCache) if (wedataCache.hasOwnProperty(i)) {
                var id = wedataCache[i];
                if (ignoreIds.indexOf(id) == -1) {
                    ignoreIds.push(id)
                }
            }
        }
    }
    init(true);

    function collectLog() {
        init(false);
        var visited = history.get('.hatena.ne.jp');
        for (i in visited) if (visited.hasOwnProperty(i)) {
            var page = visited[i];

            page.url.match('^https?://([a-zA-Z0-9.-]+)\\.hatena\\.ne\\.jp/([a-zA-Z][a-zA-Z0-9_-]{1,30}[a-zA-Z0-9]/?)?');
            var host = RegExp.$1;
            var id   = RegExp.$2;
            if (host != '') {
                if (!pageFor[host]) {
                    pageFor[host] = page;
                }
                if (pageFor[host].url.length > page.url.length) {
                    pageFor[host] = page;
                }
            }
            if (id != '' && !id.match('^(?:' + ignoreIds.join('|') + ')$') && ids.indexOf(id) == -1) {
                ids.push(id);
                if (id.indexOf('/') != -1) {
                    if (page.url.match('^https?://' + host + '\\.hatena\\.ne\\.jp/' + id + '$') && title.get(host, id) != page.title) {
                        title.set(host, id, page.title);
                    }
                }
            }
        }
    }
    collectLog();

    function loadWedata() {
        var url = 'http://wedata.net/databases/access_hatena_ignore_id/items.json';
        var req = XMLHttpRequest();

        req.open('GET', url, true);
        req.onload = registerIgnoreIds;
        req.onerror = function(e) { liberator.echoerr('Error in access_hatena.js: loadWedata'); };
        req.send(null);
    }

    function registerIgnoreIds(e) {
        var req = this;
        var json = eval(req.responseText);
        for (var i in json) if (json.hasOwnProperty(i)) {
            var id = json[i].data.id;
            if (wedataCache.indexOf(id) == -1 && id != '') {
                wedataCache.push(id);
            }
        }
    }

    commands.addUserCommand(["accesshatena"], "Access to Hatene Service Quickly",
        function(args) {
            var host = args[0] ? encodeURIComponent(args[0].toString()) : 'www';
            var id   = args[1] ? encodeURIComponent(args[1].toString()).replace('%2F', '/') : '';
            var uri  = 'http://' + host + '.hatena.ne.jp/' + id;
            liberator.open(uri, liberator.CURRENT_TAB);
        }, {
            completer: function (context, args) {
                if (args.length == 1) {
                    if (alwaysCollect) collectLog();
                    context.title = ["Host", "Service"];
                    context.completions = [[host, pageFor[host].title] for (host in pageFor) if (pageFor.hasOwnProperty(host))];
                } else if (args.length == 2) {
                    var host = args[0].toString();
                    context.title = ["ID", "Page"];
                    context.completions = [[ids[i], title.get(host, ids[i])] for (i in ids) if (ids.hasOwnProperty(i))];
                }
            }
        }
    );

    commands.addUserCommand(["accesshatenainit"], "Initialize Access Hatena",
        function() {
            init(true);
            liberator.echo('Finish initializing.');
        }
    );
})();
// vim:sw=4 ts=4 et:
