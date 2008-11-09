/**
 * ==VimperatorPlugin==
 * @name            matanico.js
 * @description     update Twitter's status to current video name and comment
 * @description-ja  今見てる動画のタイトルとコメントを Twitter に投稿する
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.62
 * @minversion      1.2
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *   New BSD License
 *
 * USAGE
 *   :matanico [comment]
 *     Twitter に今見ている動画の情報をポストする。 comment はなくてもかまわない。
 *     動画ページではみている動画の情報を、タグ検索ページでは検索結果をポストする。
 *   :matanico! [comment]
 *     Twitter に送られる文字列をクリップボードにコピーする。 twitter には送られない。
 *     動画ページではみている動画の情報を、タグ検索ページでは検索結果をコピーする。
 *
 * VALIABLE
 *   g:matanico_status_format
 *     動画閲覧ページで投稿する文章の書式設定。動画ページで適用される。以下の変数指定が可能。
 *       $SERVICENAME : このプラグインが付加する文字列。 g:matanico_status_servicename で指定する。
 *       $SUBJECT     : 動画の名前。
 *       $PLAYTIME    : 再生時間。
 *       $URL         : 動画の URL。
 *       $COMMENT     : コメント。これがないとコメントを書いても反映されない。
 *     default
 *       let g:matanico_status_format='$SERVICENAME : $SUBJECT($PLAYTIME) - $URL $COMMENT'
 *
 *   g:matanico_status_servicename
 *     このプラグインが固定で付加する文字列。動画ページで適用される。
 *     default
 *       let g:matanico_status_servicename='またニコニコ動画見てる'
 *
 *   g:matanico_tag_format
 *     タグ検索ページで投稿する文章の書式設定。以下の変数指定が可能。
 *       $SERVICENAME : このプラグインが付加する文字列。 g:matanico_tag_servicename で指定する。
 *       $TAG         : 検索したタグ。複数の場合は半角スペースで区切られる。
 *       $NUMOFVIDEOS : 検索結果の件数。
 *       $URL         : 検索結果の URL。
 *       $COMMENT     : コメント。これがないとコメントを書いても反映されない。
 *     default
 *       let g:matanico_tag_format='$SERVICENAME : $TAG($NUMOFVIDEOS件) - $URL $COMMENT'
 *
 *   g:matanico_tag_servicename
 *     このプラグインが固定で付加する文字列。タグ検索ページで適用される。
 *     default
 *       let g:matanico_tag_servicename='またニコニコタグ検索してる'
 *
 *   g:matanico_related_tag_format
 *     キーワードによるタグ検索ページで投稿する文章の書式設定。以下の変数指定が可能。
 *       $SERVICENAME : このプラグインが付加する文字列。 g:matanico_tag_servicename で指定する。
 *       $KEYWORD     : 検索したタグ。複数の場合は半角スペースで区切られる。
 *       $NUMOFTAGS   : 検索結果の件数。
 *       $URL         : 検索結果の URL。
 *       $COMMENT     : コメント。これがないとコメントを書いても反映されない。
 *     default
 *       let g:matanico_related_tag_format='$SERVICENAME : $KEYWORD($NUMOFTAGS件) - $URL $COMMENT'
 *
 *   g:matanico_tag_servicename
 *     このプラグインが固定で付加する文字列。キーワードによるタグ検索ページで適用される。
 *     default
 *       let g:matanico_related_tag_servicename='またキーワードでニコニコタグ検索してる'
 *
 * HISTORY
 *   2008/06/14 ver. 0.10   - initial written.
 *   2008/06/27 ver. 0.20   - change replace argument to regexp with 'g' option.
 *                          - add matanico! command.
 *                          - refactoring
 *                          - display sended status if succeed.
 *   2008/06/28 ver. 0.21   - change display strings, 'Yanked ' and 'Posted '.
 *   2008/07/13 ver. 0.30   - change xpath function and xpath query.
 *   2008/07/14 ver. 0.40   - change url checking.
 *   2008/07/15 ver. 0.50   - make NicoScraper class.
 *                          - add function to post tag page.
 *                            refer : http://nicovideo.g.hatena.ne.jp/koizuka/20080322/matanico_tag
 *   2008/09/04 ver. 0.60   - add function to post related tag page.
 *   2008/10/08 ver. 0.61   - correspond vimperator specification
 *                            "bang" in extra object on addUserCommand.
 * */

(function() {

// information functions
// change XPath query when html changed.
function NicoScraper() {}
NicoScraper.prototype = {
    constants: {
        VERSION:          '0.62',
        WATCH_PAGE:       1,
        WATCH_URL:        '^http://www\\.nicovideo\\.jp/watch/[a-z]{2}\\d+',
        TAG_PAGE:         2,
        TAG_URL:          '^http://www\\.nicovideo\\.jp/tag/',
        RELATED_TAG_PAGE: 3,
        RELATED_TAG_URL:  '^http://www\\.nicovideo\\.jp/related_tag/',
    },

    version: function() { return this.constants.VERSION; },

    pagecheck: function() {
        if(this.getURL().match(this.constants.WATCH_URL))       return this.constants.WATCH_PAGE;
        if(this.getURL().match(this.constants.TAG_URL))         return this.constants.TAG_PAGE;
        if(this.getURL().match(this.constants.RELATED_TAG_URL)) return this.constants.RELATED_TAG_PAGE;
        throw 'current tab is not nicovideo.jp';
    },

    _flvplayer: function() {
        if(this.pagecheck() === this.constants.WATCH_PAGE) {
            let flvplayer = window.content.document.getElementById('flvplayer');
            if(! flvplayer) throw 'flvplayer is not found';

            return flvplayer.wrappedJSObject ? flvplayer.wrappedJSObject : flvplayer ? flvplayer : null;
        }
        return null;
    },

    getURL: function() { return liberator.buffer.URL; },

    getSubject: function() {
        if(this.pagecheck() === this.constants.WATCH_PAGE) {
            let subject = $f('//h1/a[contains(concat(" ",@class," "), " video ")]');
            return subject ? subject.text : null;
        }
        return null;
    },

    getPlaytime: function() {
        var p = this._flvplayer();
        var playtime = p ? Math.round(p.ext_getTotalTime()) : null;
        if(playtime) {
            let min = Math.floor(playtime / 60);
            let sec = playtime % 60;
            if(sec < 10) sec = '0' + sec;
            return playtime ? [min, sec].join(':') : null;
        }
        else return null;
    },

    getTagName: function() {
        if(this.pagecheck() === this.constants.TAG_PAGE) {
            let word_nodes = $s('id("search_words")/span[contains(concat(" ",@class," "), " search_word ")]');
            let words = [];
            word_nodes.forEach(function(node) { words.push(node.textContent); });
            return words.length ? words.join(' ') : null;
        }
        return null;
    },

    getNumofVideos: function() {
        if(this.pagecheck() === this.constants.TAG_PAGE) {
            let numofVideos = $f('//strong[contains(concat(" ",@class," "), " result_total ")]');
            return numofVideos.textContent ? numofVideos.textContent : null;
        }
        return null;
    },

    getKeyword: function() {
        if(this.pagecheck() === this.constants.RELATED_TAG_PAGE) {
            let keyword = $f('//strong[contains(concat(" ",@class," "), " search_word ")]');
            return keyword.textContent ? keyword.textContent : null;
        }
        return null;
    },

    getNumofTags: function() {
        if(this.pagecheck() === this.constants.RELATED_TAG_PAGE) {
            let numofTags = $f('//strong[contains(concat(" ",@class," "), " result_total ")]');
            return numofTags.textContent ? numofTags.textContent : null;
        }
        return null;
    },
};

var scraper = new NicoScraper;

liberator.commands.addUserCommand(['matanico'], "update Twitter's status to current video name and comment",
    function(arg, special) {
        try {
            // build post string -----
            let post_string;
            // domain check
            switch(scraper.pagecheck()) {
                // video page
                case scraper.constants.WATCH_PAGE:
                    {
                        // get value from global variable or set default
                        let format      = liberator.globalVariables.matanico_status_format || '$SERVICENAME : $SUBJECT($PLAYTIME) - $URL $COMMENT';
                        let serviceName = liberator.globalVariables.matanico_status_servicename || 'またニコニコ動画見てる';

                        // expand variable ( evaluate variable ? )
                        post_string = format.replace(/\$SERVICENAME/g, serviceName)
                                            .replace(/\$SUBJECT/g,     scraper.getSubject())
                                            .replace(/\$PLAYTIME/g,    scraper.getPlaytime())
                                            .replace(/\$URL/g,         scraper.getURL())
                                            .replace(/\$COMMENT/g,     arg);
                    }
                    break;

                // tag search page
                case scraper.constants.TAG_PAGE:
                    {
                        // get value from global variable or set default
                        let format      = liberator.globalVariables.matanico_tag_format || '$SERVICENAME : $TAG($NUMOFVIDEOS件) - $URL $COMMENT';
                        let serviceName = liberator.globalVariables.matanico_tag_servicename || 'またニコニコタグ検索してる';

                        // expand variable ( evaluate variable ? )
                        post_string = format.replace(/\$SERVICENAME/g, serviceName)
                                            .replace(/\$TAG/g,         scraper.getTagName())
                                            .replace(/\$NUMOFVIDEOS/g, scraper.getNumofVideos())
                                            .replace(/\$URL/g,         scraper.getURL())
                                            .replace(/\$COMMENT/g,     arg);
                    }
                    break;

                // related_tag search page
                case scraper.constants.RELATED_TAG_PAGE:
                    {
                        // get value from global variable or set default
                        let format      = liberator.globalVariables.matanico_related_tag_format || '$SERVICENAME : $KEYWORD($NUMOFTAGS件) - $URL $COMMENT';
                        let serviceName = liberator.globalVariables.matanico_related_tag_servicename || 'またキーワードでニコニコタグ検索してる';

                        // expand variable ( evaluate variable ? )
                        post_string = format.replace(/\$SERVICENAME/g, serviceName)
                                            .replace(/\$KEYWORD/g,     scraper.getKeyword())
                                            .replace(/\$NUMOFTAGS/g,   scraper.getNumofTags())
                                            .replace(/\$URL/g,         scraper.getURL())
                                            .replace(/\$COMMENT/g,     arg);
                    }
                    break;

                default:
                    throw 'current tab is not nicovideo.jp';
                    break;
            }

            // ':matanico!' display the evaluated format.
            if(special) {
                liberator.util.copyToClipboard(post_string, true);
                return;
            }

            // ready posting -----
            // URI encode
            let parameter = 'status=' + encodeURIComponent(post_string);

            // twitter's URL to post
            let domain  = 'http://twitter.com/';
            let postURL = 'https://twitter.com/statuses/update.json';

            // get user account for twitter
            let [user, pass] = getUserAccount(domain, postURL, null);

            // send status
            let req = new XMLHttpRequest();
            if(req) {
                req.open('POST', postURL, true, user, pass);
                req.onreadystatechange = function() {
                    if(req.readyState == 4) {
                        if(req.status == 200) liberator.echo('Posted ' + post_string)
                        else throw 'failure in posting status to Twitter. HTTP status code : ' + req.status;
                    }
                }
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                req.send(parameter);
            }
        }
        catch(e) {
            liberator.echoerr(e);
            liberator.log(e);
        }
    },
    // complete logic is none.
    {
        bang: true,
    }
);

// stuff functions
function $f(query, node) {
    node = node || window.content.document;
    var result = (node.ownerDocument || node).evaluate(
        query,
        node,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );
    return result.singleNodeValue ? result.singleNodeValue : null;
}

function $s(query, node) {
    node = node || window.content.document;
    var result = (node.ownerDocument || node).evaluate(
        query,
        node,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    var nodes = [];
    for(let i=0 ; i<result.snapshotLength ; ++i) nodes.push(result.snapshotItem(i));
    return nodes;
}

// user account manager
// from direct_bookmark.js
// thanks to Trapezoid
function getUserAccount(form,post,arg) {
    var user, password;
    try {
        let passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
        let logins = passwordManager.findLogins({}, form, post, arg);
        if(logins.length > 0) {
            [user, password] = [logins[0].username, logins[0].password];
        } else {
            let promptUser = { value : '' }, promptPass = { value : '' };
            let promptSvc = Cc["@mozilla.org/embedcomp/prompt-service;1"]
                .getService(Ci.nsIPromptService);

            let nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                    Ci.nsILoginInfo,
                    "init");

            let ret = promptSvc.promptUsernameAndPassword(
                    window, form, 'Enter e-mail address and password.',
                    promptUser, promptPass, null, {}
                    );
            if(ret) {
                [user, password] = [promptUser.value, promptPass.value];
                let formLoginInfo = new nsLoginInfo(form,
                        post, null,
                        user, password, '', '');
                passwordManager.addLogin(formLoginInfo);
            } else {
                liberator.echoerr("account not found - " + form);
            }
        }
    }
    catch(ex) {
        liberator.echoerr("handled exception during getting username and password");
        liberator.log(ex);
    }
    return [user, password];
}

})();
// vim:sw=4 ts=4 et:
