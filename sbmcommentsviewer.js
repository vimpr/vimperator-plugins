var PLUGIN_INFO =
<VimperatorPlugin>
    <name>SBM Comments Viewer</name>
    <description>List show Social Bookmark Comments</description>
    <description lang="ja">ソーシャル・ブックマーク・コメントを表示します</description>
    <version>0.2.5</version>
    <minVersion>2.0pre</minVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/sbmcommentsviewer.js</updateURL>
    <detail><![CDATA[
== Usage ==
>||
viewSBMComments [url] [options]
 url             : 省略時は現在のURL
 options:
     -f, -format : 出力時のフォーマット(`,'区切りのリスト)
                   (default: id,timestamp,tags,comment)
                   let g:def_sbm_format = ... で指定可能
     -t, -type   : 出力するSBMタイプ
                   (default: hdl)
                   let g:def_sbms = ... で指定可能
     -c, -count  : ブックマーク件数のみ出力
     -b, -browser: バッファ・ウィンドウではなくブラウザに開く
                   TODO:まだ出来てない
||<

== 指定可能フォーマット ==
  id, timpstamp, tags, comment

== SBMタイプ ==
- h : hatena bookmark
- d : Delicious
- l : livedoor clip
- z : Buzzurl
- t : Topsy
- XXX:今後増やしていきたい

>||
e.g.)
  :viewSBMComments http://d.hatena.ne.jp/teramako/ -t hdl -f id,comment -c
||<

== 備考 ==
 一度取得したものは(30分ほど)キャッシュに貯めてますので何度も見直すことが可能です。
 粋なコマンド名募集中
     ]]></detail>
</VimperatorPlugin>;
liberator.plugins.sbmCommentsViewer = (function(){

var isFilterNoComments = liberator.globalVariables.sbm_comments_viewer_filter_nocomments || false;

/**
 * SBMEntry Container {{{
 * @param {String} type
 * @param {Number} count
 * @param {Object} extra
 *  extra = {
 *      faviconURL,
 *      pageURL
 *  }
 */
function SBMContainer(type, count, extra){ //{{{
    this.type = type;
    this.count = count || 0;
    this.entries = [];
    if (extra){
        this.faviconURL = extra.faviconURL || '';
        this.pageURL = extra.pageURL || '';
    }
} //}}}
SBMContainer.prototype = { //{{{
    add: function(id, timestamp, comment, tags, extra){
        this.entries.push(new SBMEntry(
            id, timestamp, comment, tags, extra
        ));
    },
    toHTML: function(format, countOnly){
        var label = <>
            {this.faviconURL ? <img src={this.faviconURL} width="16" height="16" style="vertical-align: middle; margin-right: 5px;" /> : <></>}
            {manager.type[this.type] + ' ' + this.count + '(' + this.entries.length + ')'}
            {this.pageURL ? <a href="#" highlight="URL" style="margin-left: 5px;">{this.pageURL}</a> : <></>}
        </>;
        if (countOnly){
            return label;
        } else {
            let xml = <div highlight="CompGroup" class="liberator-sbmcommentsviewer" style="line-height: 1.6;">
                <div highlight="Completions"><div highlight="CompTitle"><li highlight="CompResult">{label}</li><li highlight="CompDesc"></li></div></div>
            </div>;
            let self = this;
            xml.* += (function(){
                var div = <></>;
                self.entries.forEach(function(e){
                    if (isFilterNoComments && !e.comment) return;
                    div += e.toHTML(format);
                });
                return div;
            })();
            return xml;
        }
    }
}; //}}}
// }}}
/**
 * SBM Entry {{{
 * @param {String} id UserName
 * @param {String|Date} timestamp
 * @param {String} comment
 * @param {String[]} tags
 * @param {Object} extra
 *  extra = {
 *      userIcon
 *      link
 *  }
 */
function SBMEntry(id, timestamp, comment, tags, extra){ //{{{
    this.id = id || '';
    this.timeStamp = timestamp instanceof Date ? timestamp : null;
    this.comment = comment || '';
    this.tags = tags || [];
    if (extra){
        this.userIcon = extra.userIcon || null;
        this.link     = extra.link     || null;
    }
} //}}}
SBMEntry.prototype = { //{{{
    toHTML: function(format){
        function makeLink(str, withLink){
            let s = str;
            let result = XMLList();
            while (s.length > 0) {
                let m = s.match(/(?:https?:\/\/|mailto:)\S+/);
                if (m) {
                    result += <>{s.slice(0, m.index)}<a href={withLink ? m[0] : '#'} highlight="URL">{m[0]}</a></>;
                    s = s.slice(m.index + m[0].length);
                } else {
                    result += <>{s}</>;
                    break;
                }
            }
            return result;
        }

        var xml = <div highlight="Completions" class="liberator-sbmcommentsviewer-content" style="margin: 0; padding: 3px 5px; border-bottom: 1px dotted;"/>;
        var self = this;
        format.forEach(function(colum){
            switch(colum){
                case 'id':
                    xml.* += <span class="liberator-sbmcommentsviewer-id" style="margin-right: 10px;">{self.userIcon ? <><img src={self.userIcon} width="16" height="16" style="margin-right: 5px; vertical-align: middle;"/>{self.id}</> : <>{self.id}</>}</span>;
                    break;
                case 'timestamp':
                    xml.* += <span class="liberator-sbmcommentsviewer-timestamp" style="margin-right: 10px;">{self.formatDate()}</span>;
                    break;
                case 'tags':
                    xml.* += <span class="liberator-sbmcommentsviewer-tags" highlight="Tag" style="margin-right: 10px;">{self.tags.join(',')}</span>; break;
                case 'comment':
                    xml.* += <span class="liberator-sbmcommentsviewer-comment" style="margin-right: 10px; white-space: normal;">{makeLink(self.comment)}</span>; break;
                default:
                    xml.* += <span>-</span>;
            }
        });
        return xml;
    },
    formatDate: function(){
        if (!this.timeStamp) return '';
        var [year,month,day,hour,min,sec] = [
            this.timeStamp.getFullYear(),
            this.timeStamp.getMonth()+1,
            this.timeStamp.getDate(),
            this.timeStamp.getHours(),
            this.timeStamp.getMinutes(),
            this.timeStamp.getSeconds()
        ];
        return [
            year, '/',
            (month < 10 ? '0'+month : month), '/',
            (day < 10 ? '0'+day : day), ' ',
            (hour < 10 ? '0'+hour : hour), ':',
            (min < 10 ? '0'+min : min), ':',
            (sec < 10 ? '0'+sec : sec)
        ].join('');
    }
}; //}}}
//}}}
/**
 * openSBM {{{
 * @param {String} url
 * @param {String} type
 * @param {String[]} format
 * @param {Boolean} countOnly
 * @param {Boolean} openToBrowser
 */
function openSBM(url, type, format, countOnly, openToBrowser){
    var sbmLabel = manager.type[type];
    var sbmURL = SBM[sbmLabel].getURL(url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', sbmURL, true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){
            if (xhr.status == 200){
                let sbmContainer = SBM[sbmLabel].parser.call(this, xhr);
                if (!sbmContainer) return;
                cacheManager.add(sbmContainer, url, type);
                if (openToBrowser)
                    manager.open(sbmContainer.toHTML(format,false));
                else
                    liberator.echo(sbmContainer.toHTML(format,countOnly));
            } else {
                liberator.echoerr(sbmURL + ' ' + xhr.status);
            }
        }
    };
    xhr.send(null);
} //}}}
/**
 * getURL と parser メソッドを供えること
 * getURL は 取得先のURLを返すこと
 * parser は SBMContainer オブジェクトを返すこと
 */
var SBM = { //{{{
    hatena: { //{{{
        getURL: function(url){
            var urlPrefix = 'http://b.hatena.ne.jp/entry/jsonlite/?url=';
            return urlPrefix + encodeURIComponent(url.replace(/%23/g,'#'));
        },
        parser: function(xhr){
            //var json = window.eval(xhr.responseText);
            var json = jsonDecode(xhr.responseText, false);
            var count = json.bookmarks.length;
            var c = new SBMContainer('h', json.count, {
                faviconURL:'http://b.hatena.ne.jp/favicon.ico',
                pageURL:   'http://b.hatena.ne.jp/entry/' + json.url
            });
            json.bookmarks.forEach(function(bm){
                c.add(bm.user, new Date(bm.timestamp), bm.comment, bm.tags, {
                    userIcon: 'http://www.hatena.ne.jp/users/' + bm.user.substring(0,2) + '/' + bm.user +'/profile_s.gif'
                });
            });
            return c;
        }
    }, //}}}
    delicious: { //{{{
        getURL: function(url){
            //var urlPrefix = 'http://del.icio.us/rss/url/';
            var urlPrefix = 'http://feeds.delicious.com/rss/url/';
            return urlPrefix + getMD5Hash(url);
        },
        parser: function(xhr){
            var rss = xhr.responseXML;
            if (!rss){
                liberator.echoerr('Delicious feed is none');
                return;
            }
            var pageURL, items;
            try {
                pageURL = evaluateXPath(rss, '//rss:channel/rss:link')[0].textContent;
                items = evaluateXPath(rss, '//rss:item');
            } catch(e){
                liberator.log(e);
            }
            var c = new SBMContainer('d', items.length, {
                faviconURL: 'http://delicious.com/favicon.ico',
                pageURL:    pageURL
            });
            items.forEach(function(item){
                var children = item.childNodes;
                var [id,date,tags,comment,link] = ['','',[],'',''];
                for (let i=0; i<children.length; i++){
                    let node = children[i];
                    if (node.nodeType == 1){
                        switch (node.localName){
                            case 'creator': id = node.textContent; break;
                            case 'link': link = node.textContent; break;
                            case 'date':
                                date = stringToDate(node.textContent);
                                break;
                            case 'description': comment = node.textContent; break;
                            case 'subject': tags = node.textContent.split(/\s+/); break;
                        }
                    }
                }
                c.add(id, date, comment, tags, {link: link});
            });
            return c;
        }
    }, //}}}
    livedoorclip: { //{{{
        getURL: function(url){
            var urlPrefix = 'http://api.clip.livedoor.com/json/comments?link=';
            return urlPrefix + encodeURIComponent(url.replace(/%23/g,'#')) + '&all=0';
        },
        parser: function(xhr){
        /*
            var json = Components.classes['@mozilla.org/dom/json;1'].
                       getService(Components.interfaces.nsIJSON).
                       decode(xhr.responseText);
        */
            var json = jsonDecode(xhr.responseText);
            if (json && json.isSuccess){
                let c = new SBMContainer('l', json.total_clip_count, {
                    faviconURL: 'http://clip.livedoor.com/favicon.ico',
                    pageURL:    'http://clip.livedoor.com/page/' + json.link
                });
                json.Comments.forEach(function(clip){
                    c.add( clip.livedoor_id, new Date(clip.created_on * 1000),
                           clip.notes ? clip.notes : '',
                           clip.tags,
                           {
                            userIcon: 'http://image.clip.livedoor.com/profile/' +
                                      '?viewer_id=[%%20member.livedoor_id%20Z%]&target_id=' +
                                      clip.livedoor_id,
                            link: 'http://clip.livedoor.com/clips/' + clip.livedoor_id
                           }
                    );
                });
                return c;
            } else {
                liberator.log('Faild: LivedoorClip');
            }
        }
    }, //}}}
    buzzurl: { //{{{
        getURL: function(url){
            var urlPrefix = 'http://api.buzzurl.jp/api/posts/get/v1/json/?url=';
            return urlPrefix + encodeURIComponent(url.replace(/%23/g,'#'));
        },
        parser: function(xhr){
            var url = 'http://buzzurl.jp/user/';
            var json = jsonDecode(xhr.responseText);
            if (json && json[0] && json[0].user_num){
                let c = new SBMContainer('buzzurl', json[0].user_num, {
                    faviconURL: 'http://buzzurl.jp/favicon.ico',
                    pageURL:    'http://buzzurl.jp/entry/' + json[0].url
                });
                json[0].posts.forEach(function(entry){
                    c.add( entry.user_name, stringToDate(entry.date),
                           entry.comment ? entry.comment : '', (entry.keywords || '').split(','),
                           {
                            userIcon: url + entry.user_name + '/photo',
                            link: url + '/' + entry.user_name
                           }
                    );
                });
                return c;
            } else {
                liberator.log('Faild: Buzzurl');
            }
        }
    }, //}}} 
    topsy: { //{{{
        getURL: function(url){
            var urlPrefix = 'http://otter.topsy.com/trackbacks.json?perpage=50&infonly=0&tracktype=tweet&url=';
            return urlPrefix + encodeURIComponent(url.replace(/%23/g,'#'));
        },
        parser: function(xhr){
            var json = jsonDecode(xhr.responseText);
            if (json && json.response){
                let c = new SBMContainer('t', json.response.trackback_total, {
                    faviconURL: 'http://topsy.com/favicon.ico',
                    pageURL:    json.response.topsy_trackback_url
                });
                json.response.list.forEach(function(entry){
                    c.add( entry.author.nick, new Date(entry.date*1000),
                           entry.content, null,
                           {
                            userIcon: entry.author.photo_url,
                            link: entry.author.topsy_author_url
                           }
                    );
                });
                return c;
            } else {
                liberator.echo('Faild: Topsy');
            }
        }
    } //}}}
}; //}}}

/**
 * jsonDecode {{{
 * @param {String} str JSON String
 * @param {Boolean} toRemove はてなブックマークのJSONの様に
 *                           前後に()が付いている場合に取り除くためのフラグ
 */
function jsonDecode(str, toRemove){
    var json = Components.classes['@mozilla.org/dom/json;1'].getService(Components.interfaces.nsIJSON);
    if (toRemove) str = str.substring(1, str.length -1);

    return json.decode(str);
}
//}}}
/**
 * getMD5Hash {{{
 * @param {String} str
 * @return {String} MD5HashString
 */
function getMD5Hash(str){
    var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
                    createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    converter.charset = 'UTF-8';
    var result = {};
    var data = converter.convertToByteArray(str, result);
    var ch = Components.classes['@mozilla.org/security/hash;1'].createInstance(Components.interfaces.nsICryptoHash);
    ch.init(ch.MD5);
    ch.update(data, data.length);
    var hash = ch.finish(false);
    function toHexString(charCode){
        return ('0' + charCode.toString(16)).slice(-2);
    }
    var s = [i < hash.length ? toHexString(hash.charCodeAt(i)) : '' for (i in hash)].join('');
    return s;
} //}}}
/**
 * stringToDate {{{
 * @param {String} Date String
 * @return {Date}
 */
function stringToDate(str){
    let args = str.split(/[-T:Z]/,6).map(function (v) parseInt(v, 10));
    args[1]--;
    return new Date(args[0], args[1], args[2], args[3], args[4], args[5]);
} //}}}
/**
 * evaluateXPath {{{
 * @param {Element} aNode
 * @param {String} aExpr XPath Expression
 * @return {Element[]}
 * @see http://developer.mozilla.org/ja/docs/Using_XPath
 */
function evaluateXPath(aNode, aExpr){
    var xpe = new XPathEvaluator();
    function nsResolver(prefix){
        var ns = {
            xhtml:   'http://www.w3.org/1999/xhtml',
            rdf:     'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            dc:      'http://purl.org/dc/elements/1.1/',
            rss:     'http://purl.org/rss/1.0/',
            taxo:    'http://purl.org/rss/1.0/modules/taxonomy/',
            content: 'http://purl.org/rss/1.0/modules/content/',
            syn:     'http://purl.org/rss/1.0/modules/syndication/',
            admin:   'http://webns.net/mvcb/'
        };
        return ns[prefix] || null;
    }
    var result = xpe.evaluate(aExpr, aNode, nsResolver, 0, null);
    var found = [];
    var res;
    while (res = result.iterateNext())
        found.push(res);
    return found;
} //}}}
/**
 * sbmCommentsView manager {{{
 * @alias liberator.plugins.sbmCommentsViewer
 */
var manager = {
    type: {
        h: 'hatena',
        d: 'delicious',
        l: 'livedoorclip',
        z: 'buzzurl', 
        t: 'topsy'
    },
    format: {
        id: 'ID',
        comment: 'Comment',
        timestamp: 'TimeStamp',
        tags: 'Tags',
    },
    // for debug
    convertMD5: function(str){
        return getMD5Hash(str);
    },
    // for debug
    getXML: function(url){
        var xhr = new XMLHttpRequest();
        xhr.open('GET',url,false);
        xhr.send(null);
        return xhr;
    },
    // for debug
    get cache(){
        return cacheManager;
    },
    /**
     * @param {String} str
     * @param {Number} where
     * TODO
     */
    open: function(str, where){
        /*
        getBrowser().addTab('data:text/html,'+str, null,null,null);
        */
    }
}; //}}}

var options = [
    [['-type','-t'], commands.OPTION_STRING, function(str) (new RegExp('^['+[t for(t in manager.type)].join('') + ']+$')).test(str)],
    [['-format','-f'], commands.OPTION_LIST,null, [[f,manager.format[f]] for (f in manager.format)]],
    [['-count','-c'], commands.OPTION_NOARG],
    [['-browser','-b'],commands.OPTION_NORARG]
];
commands.addUserCommand(['viewSBMComments'], 'SBM Comments Viewer', //{{{
    function(arg){ //{{{
        var types =  liberator.globalVariables.def_sbms || 'hdlz';
        var format = (liberator.globalVariables.def_sbm_format || 'id,timestamp,tags,comment').split(',');
        var countOnly = false, openToBrowser = false;
        var url = arg.literalArg || buffer.URL;
        [
            let (v = arg['-' + name]) (v && f(v))
            for ([name, f] in Iterator({
                count: function () countOnly = true,
                browser: function () openToBrowser = true,
                type: function (v) (types = v),
                format: function (v) (format = v),
                arguments: function (v) (v.length > 0 && (url = v[0]))
            }))
        ]

        for (let i=0; i<types.length; i++){
            let type = types.charAt(i);
            if ( manager.type[type] ){
                if ( cacheManager.isAvailable(url, type) ){
                    liberator.log('cache available');
                    if (openToBrowser)
                        // TODO
                        manager.open(cacheManager.get(url,type).toHTML(format,false), liberator.forceNewTab);
                    else
                        liberator.echo(cacheManager.get(url, type).toHTML(format,countOnly));
                } else {
                    try {
                        openSBM(url, type, format, countOnly, openToBrowser);
                    } catch(e){
                        liberator.log(e);
                    }
                }
            }
        }
    }, //}}}
    {
        literal: 0,
        argCount:"*",
        options: options,
        completer: function(context) completion.url(context, 'l')
    },
    true
); //}}}

/**
 * cacheManager {{{
 */
var cacheManager = (function(){
    var cache = {};
    //             min  sec   millisec
    var threshold = 30 * 60 * 1000;
    var interval  = 10 * 60 * 1000;
    var c_manager = {
        get raw(){
            return cache;
        },
        has: function(url){
            if (cache[url])
                return true;
            else
                return false;
        },
        add: function(sbmComments, url, type){
            if (!cache[url]) cache[url] = {};
            cache[url][type] = [new Date(), sbmComments];
        },
        get: function(url, type){
            return cache[url][type][1];
        },
        delete: function(url, type) {
            if (!cache[url]) return true;
            if (!type) return delete cache[url];
            return delete cache[url][type];
        },
        garbage: function(){
            var date = new Date();
            for (let url in cache){
                for (let type in cache[url]){
                    if (date - cache[url][type][0] > threshold) delete cache[url][type];
                }
            }
        },
        isAvailable: function(url, type){
            if (cache[url] && cache[url][type] && new Date() - cache[url][type][0] < threshold)
                return true;

            return false;
        }
    };
    return c_manager;
})();
//}}}

return manager;
})();
// vim: sw=4 ts=4 sts=0 et fdm=marker:
