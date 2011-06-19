var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Access to Hatena Sevices quickly.</description>
<description lang="ja">はてなのサーヴィスに簡単にアクセス出来ます．</description>
<minVersion>2.1a1pre</minVersion>
<maxVersion>2.1a1pre</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/access_hatena.js</updateURL>
<author mail="masa138@gmail.com" homepage="http://www.hatena.ne.jp/masa138/">Masayuki KIMURA and id:hitode909</author>
<version>0.63</version>
<detail><![CDATA[

== Commands ==
:accesshatena
    Access to http://www.hatena.ne.jp/

:accesshatena {host}
    Access to http://{host}.hatena.ne.jp/

:accesshatena {host} {user_id}
    Access to http://{host}.hatena.ne.jp/{user_id}/

:accesshatena {group_name}.g {user_id}
    Access to http://{group_name}.g.hatena.ne.jp/{user_id}/


== Global variables ==
maxRecentHostsSize
    直近何件の履歴を検索してホスト補完をするか

collectLogSpan
    どのくらいの期間の履歴を検索するか

accessHatenaUseWedata
    Wedata から拒否 ID リストを取ってくるか

accessHatenaIgnoreIds
    Wedata の拒否リストに含まれないけれど拒否したい ID の記入用


== .vimperatorrc ==
コマンドが長いので，以下の様に短い物にマッピングすると便利です．
>||
map ; :accesshatena 
||<
# 最後にスペースを入れておくと直ぐにホストの入力から始められます．

]]></detail>
</VimperatorPlugin>;
(function(){
    var useWedata;
    var ignoreIds;
    var ids;
    var recentHosts;
    var maxRecentHostsSize;
    var historyCompletions;
    var collectLogSpan;
    var pageFor;
    var title;
    var isFirst;
    var isIncreased;
    var isUpdated;
    var lastLocation;

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
        }
    };

    function init() {
        ids                = [];
        recentHosts        = [];
        historyCompletions = [];
        pageFor            = [];
        title              = new Title();
        isFirst            = true;
        isIncreased        = false;
        isUpdated          = false;
        lastLocation       = window.content.location.href.replace(/^https?:\/\//, '');

        maxRecentHostsSize = liberator.globalVariables.maxRecentHostsSize || 10;
        collectLogSpan     = liberator.globalVariables.collectLogSpan     || 24 * 7 * 4 * 60 * 60 * 1000000; // 4 weeks
        useWedata          = liberator.globalVariables.accessHatenaUseWedata;
        ignoreIds          = liberator.globalVariables.accessHatenaIgnoreIds;
        useWedata          = (useWedata != null) ? useWedata : true;
        ignoreIds          = (ignoreIds != null) ? ignoreIds : ['login'];

        if (useWedata) {
            loadWedata();
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

        root.containerOpen = true;
        for (var i = 0, length = root.childCount; i < length; i++) {
            var page = root.getChild(i);
            page.uri.match('^https?://([a-zA-Z0-9.]+)\\.hatena\\.ne\\.jp/([a-zA-Z][a-zA-Z0-9_-]{1,30}[a-zA-Z0-9](?:\\+[a-zA-Z0-9_-]{1,30})?/?)?');
            var host = RegExp.$1;
            var id   = RegExp.$2;
            var _recent_hosts_length = recentHosts.length;
            if (host != '') {
                if (!page.uri) continue;

                if (!pageFor[host]) {
                    pageFor[host] = page;
                    isIncreased = true;
                } else if (pageFor[host].uri.length > page.uri.length) { // より短いアドレスのタイトルが妥当
                    pageFor[host] = page;
                    isUpdated = true;
                }

                if (_recent_hosts_length < maxRecentHostsSize && recentHosts.indexOf(host) == -1) {
                    recentHosts.push(host);
                } else if (recentHosts.indexOf(host) == -1 && historyCompletions.h.indexOf(host) == -1) {
                    historyCompletions.push([host, pageFor[host].title]);
                    historyCompletions.h.push(host);
                }
            }
            if (id != '' && !id.replace('/', '').match(new RegExp('^(?:' + ignoreIds.join('|') + ')$'))) { // Wedata の拒否リストに入っていなかったら
                var index = ids.indexOf(id);
                if (index == -1) {
                    ids.unshift(id);
                } else {
                    ids.splice(index, 1);
                    ids.unshift(id);
                }
                if (isFirst || isIncreased || isUpdated) { // 初回か，pageFor に何か追加されたか，pageFor が更新されたら
                    isIncreased = false;
                    isUpdated   = false;
                    if (page.title != '' && title.get(host, id) != page.title) {
                        title.set(host, id, page.title);
                    }
                }
            }
        }
        root.containerOpen = false;
        isFirst = false;
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
            if (ignoreIds.indexOf(id) == -1 && id != '') {
                ignoreIds.push(id)
            }
        }
    }

    commands.addUserCommand(["accesshatena"], "Access to Hatene Service Quickly",
        function(args) {
            var host = args[0] ? encodeURIComponent(args[0].toString()) : 'www';
            var id   = args[1] ? encodeURIComponent(args[1].toString()).replace('%2F', '/') : '';
            var uri  = 'http://' + host + '.hatena.ne.jp/' + id;
            var targetTab = args.bang ? liberator.CURRENT_TAB : liberator.NEW_TAB;
            liberator.open(uri, targetTab);
            lastLocation = '';
        }, {
            completer: function (context, args) {
                if (args.length == 1) {
                    context.title = ["Host", "Service"];
                    if (window.content.location.href.replace(/^https?:\/\//, '') != lastLocation) { // ページ遷移がない場合に何度も collectLog() しないように
                        collectLog();
                        lastLocation = window.content.location.href.replace(/https?:\/\//, '');
                    }
                    context.completions = [[recentHosts[i], pageFor[recentHosts[i]].title] for (i in recentHosts) if (recentHosts.hasOwnProperty(i))].concat(historyCompletions);
                } else if (args.length == 2) {
                    var host = args[0].toString();
                    context.title = ["ID", "Page"];
                    var _completions = [[ids[i], title.get(host, ids[i])] for (i in ids) if (ids.hasOwnProperty(i))];
                    context.completions = host != 'd' ? _completions.filter(function(i){ return !/\+/.test(i[0]) }) : _completions;
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
