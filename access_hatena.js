/**
 * ==VimperatorPlugin==
 * @name           access_hatena.js
 * @description    Access to Hatena Service quickly
 * @description-ja はてなのサービスに簡単にアクセス
 * @minVersion     2.1a1pre
 * @author         id:masa138, id:hitode909
 * @version        0.6.0
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
    var useWedata;
    var wedataCache;
    var ignoreIds;
    var ids;
    var recentHosts;
    var maxRecentHostsSize;
    var historyCompletions;
    var collectLogSpan;
    var pageFor;
    var title;
    var _old_title_length;

    function Title() {
        this.initialize.apply(this, arguments);
    }
    Title.prototype = {
        initialize: function() {
            this.title = [];
            this.n     = 0;
        },
        key: function(host, id) {
            return [host, id.replace('/', '')].join(':');
        },
        set: function(host, id, title) {
            var key = this.key(host, id);
            if (this.title[key] == null) {
                this.title[key] = title;
                this.n++;
            }
        },
        get: function(host, id, title) {
            if (!this.title[this.key(host, id)]) return host + '.hatena.ne.jp/' + id;
            return this.title[this.key(host, id)];
        },
        length: function() {
            return this.n;
        }
    };

    function init() {
        ids                = [];
        recentHosts        = [];
        historyCompletions = [];
        pageFor            = [];
        wedataCache        = [];
        title              = new Title();
        _old_title_length  = -1;

        maxRecentHostsSize = liberator.globalVariables.maxRecentHostsSize || 10;
        collectLogSpan     = liberator.globalVariables.collectLogSpan     || 24 * 7 * 4 * 60 * 60 * 1000000;
        alwaysCollect      = liberator.globalVariables.accessHatenaAlwaysCollect;
        useWedata          = liberator.globalVariables.accessHatenaUseWedata;
        ignoreIds          = liberator.globalVariables.accessHatenaIgnoreIds;
        alwaysCollect      = (alwaysCollect != null) ? alwaysCollect : false;
        useWedata          = (useWedata != null) ? useWedata         : true;
        ignoreIds          = (ignoreIds != null) ? ignoreIds         : ['login'];

        if (useWedata) {
            loadWedata();
            for (i in wedataCache) if (wedataCache.hasOwnProperty(i)) {
                var id = wedataCache[i];
                if (ignoreIds.indexOf(id) == -1) {
                    ignoreIds.push(id)
                }
            }
        }
    }
    init();

    function prepareSearch() {
        var historyService       = Components.classes["@mozilla.org/browser/nav-history-service;1"].getService(Components.interfaces.nsINavHistoryService);
        var options              = historyService.getNewQueryOptions();
        var query                = historyService.getNewQuery();
        query.beginTimeReference = query.TIME_RELATIVE_NOW;
        query.beginTime          = -1 * collectLogSpan;
        query.endTimeReference   = query.TIME_RELATIVE_NOW;
        query.endTime            = 0;
        query.domain             = "hatena.ne.jp";

        return historyService.executeQuery(query, options).root;
    }

    function collectLog() {
        var root             = prepareSearch();
        ids                  = [];
        recentHosts          = [];
        historyCompletions   = [];
        historyCompletions.h = [];
        var _title_length    = title.length();

        root.containerOpen = true;
        for (var i = 0, length = root.childCount; i < length; i++) {
            var page = root.getChild(i);
            page.uri.match('^https?://([a-zA-Z0-9.]+)\\.hatena\\.ne\\.jp/([a-zA-Z][a-zA-Z0-9_-]{1,30}[a-zA-Z0-9]/?)?');
            var host = RegExp.$1;
            var id   = RegExp.$2;
            var _recent_hosts_length = recentHosts.length;
            if (host != '') {
                if (!pageFor[host]) {
                    pageFor[host] = page;
                } else if (pageFor[host].uri.length > page.uri.length) {
                    pageFor[host] = page;
                }

                if (_recent_hosts_length < maxRecentHostsSize && recentHosts.indexOf(host) == -1) {
                    recentHosts.push(host);
                } else if (recentHosts.indexOf(host) == -1 && historyCompletions.h.indexOf(host) == -1) {
                    historyCompletions.push([host, pageFor[host].title]);
                    historyCompletions.h.push(host);
                }
            }
            if (id != '' && !id.match('^(?:' + ignoreIds.join('|') + ')$')) {
                if (ids.indexOf(id) == -1) {
                    ids.push(id);
                }
                if (_title_length > _old_title_length && id.indexOf('/') != -1) {
                    if (page.uri.match('^https?://' + host + '\\.hatena\\.ne\\.jp/' + id + '/?$') && title.get(host, id) != page.title) {
                        title.set(host, id, page.title);
                    }
                }
            }
        }
        root.containerOpen = false;

        _old_title_length = _title_length;
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
            historyCompletions = [];
        }, {
            completer: function (context, args) {
                if (args.length == 1) {
                    context.title = ["Host", "Service"];
                    if (alwaysCollect || historyCompletions.length == 0) {
                        collectLog();
                    }
                    context.completions = [[recentHosts[i], pageFor[recentHosts[i]].title] for (i in recentHosts) if (recentHosts.hasOwnProperty(i))].concat(historyCompletions);
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
            init();
            liberator.echo('Finish initializing.');
        }
    );
})();
// vim:sw=4 ts=4 et:
