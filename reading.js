/*
 * ==VimperatorPlugin==
 * @name            reading.js
 * @description     update Twitter's status to current URL and comment
 * @description-ja  今見てるページの URL とタイトルをコメントといっしょに Twitter に投稿する
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.22
 * @minversion      2.0pre 2008/10/16
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *   New BSD License
 *
 * USAGE
 *   :reading [comment]
 *     Twitter に今見ているページの情報をポストする。 comment はなくてもかまわない。
 *   :reading! [comment]
 *     Twitter に送られる文字列をクリップボードにコピーする。実際には送られない。
 *
 * VALIABLE
 *   g:reading_format
 *     投稿する文章の書式設定。以下の変数指定が可能。
 *       $SERVICENAME : このプラグインが付加する文字列。 g:reading_servicename で指定する。
 *       $TITLE       : ページのタイトル。
 *       $URL         : ページの URL。
 *       $SELECTED    : visual mode やマウスで選択した文字列。
 *       $COMMENT     : コメント。これがないとコメントを書いても反映されない。
 *     default
 *       let g:reading_format='$SERVICENAME : $COMMENT "$TITLE" $URL $SELECTED'
 *
 *   g:reading_servicename
 *     このプラグインが固定で付加する文字列。
 *     default
 *       let g:reading_servicename='I'm reading now'
 *
 *   g:reading_title_default
 *     タイトルがない場合に付加される文字列。
 *     default
 *       let g:reading_title_default='no title'
 *
 * HISTORY
 *   2008/09/05 ver. 0.10   - initial written.
 *   2008/09/24 ver. 0.20   - add URL canonicalization.
 *   2008/10/02 ver. 0.21   - fix the bug not apply encodeURI
 *                            to querystring for Pathtraq API.
 * */

(function() {

// Twitter's URL to post
const DOMAIN   = 'http://twitter.com/';
const POST_URL = 'https://twitter.com/statuses/update.json';

// information functions
// change XPath query when HTML changed.
function Scraper() {}
Scraper.prototype = {
    constants: {
        VERSION: '0.22',
    },

    version: function() { return this.constants.VERSION; },

    getURL: function() {
        return liberator.modules.buffer.URL;
    },

    getTitle: function() {
        var title = $f('//title');
        return title
            ? title.text.replace(/^\s+|\s+$/g, '')
                        .replace(/\r\n|[\r\n\t]/g, ' ')
            : null;
    },

    getSelected: function() {
        var selected = window.content.getSelection().toString();
        return selected ? selected : '';
    }
};

liberator.modules.commands.addUserCommand(['reading'], "update Twitter's status to current page title, URL and comment",
    function(args, special) {
        try {
            let arg = args.string;

            // build post string -----
            let post_string;

            // get value from global variable or set default
            let format        = liberator.globalVariables.reading_format || '$SERVICENAME : $COMMENT "$TITLE" $URL $SELECTED';
            let serviceName   = liberator.globalVariables.reading_servicename || 'I\'m reading now';
            let title_default = liberator.globalVariables.reading_title_default || 'no title';

            let scraper = new Scraper;
            let title = scraper.getTitle() || title_default;
            let canonicalizedURL = canonicalizeURL(scraper.getURL());

            // expand variable ( evaluate variable ? )
            post_string = format.replace(/\$SERVICENAME/g, serviceName)
                                .replace(/\$TITLE/g,       title)
                                .replace(/\$URL/g,         canonicalizedURL)
                                .replace(/\$SELECTED/g,    scraper.getSelected())
                                .replace(/\$COMMENT/g,     arg);

            // ':matanico!' display the evaluated format.
            if(special) {
                liberator.modules.util.copyToClipboard(post_string, true);
                return;
            }

            // ready posting -----
            // URI encode
            let parameter = 'status=' + encodeURIComponent(post_string);

            // get user account for Twitter
            let [user, pass] = getUserAccount(DOMAIN, POST_URL, null);

            // send status
            let req = new XMLHttpRequest();
            if(req) {
                req.open('POST', POST_URL, true, user, pass);
                req.onreadystatechange = function() {
                    if(req.readyState == 4) {
                        if(req.status == 200) liberator.echo('Posted ' + post_string);
                        else throw new Error('failure in posting status to Twitter. HTTP status code : ' + req.status);
                    }
                };
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                req.send(parameter);
            }
        }
        catch(e) {
            liberator.echoerr(e.message);
            liberator.log(e.message);
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

function canonicalizeURL(url) {
    const PATHTRAQ_CANONICALIZE_URL_API = 'http://api.pathtraq.com/normalize_url2?api=json&url=';

    var req = new XMLHttpRequest();
    req.open('GET', PATHTRAQ_CANONICALIZE_URL_API + encodeURI(url), false);
    req.send(null);
    if(req.status === 200) {
        let canonicalized = req.responseText.replace(/^"|"$/g, '');
        return canonicalized ? canonicalized : url;
    }
    else {
        throw new Error(req.status + ' ' + req.statusText + "\n" + req.responseHeaders);
    }
}

// user account manager
// from direct_bookmark.js
// thanks to Trapezoid
function getUserAccount(form, post, arg) {
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
