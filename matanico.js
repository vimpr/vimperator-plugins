let PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>update Twitter status to current video/search page information and comment.</description>
<description lang="ja">今見ている動画 / 検索結果の情報を Twitter に投稿する。</description>
<author mail="janus_wel@fb3.so-net.ne.jp" homepage="http://d.hatena.ne.jp/janus_wel">janus_wel</author>
<license document="http://www.opensource.org/licenses/bsd-license.php">New BSD License</license>
<version>0.74</version>
<minVersion>2.3pre</minVersion>
<maxVersion>2.3pre</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/matanico.js</updateURL>
<detail><![CDATA[
== EX-COMMANDS ==
:matanico [comment]:
    This command posts the information of current video/search result to Twitter. "comment" is optional.
:matanico! [comment]:
    This command copies string that be posted to Twitter, to clipboard. This is emulate command.

== SETTINGS ==
matanico_watch_format:
    This is the format that be used on video page. Following special tokens are available. default setting is "$SERVICENAME : $SUBJECT($PLAYTIME) - $URL $COMMENT".
        $SERVICENAME: the value of "matanico_watch_servicename".
        $SUBJECT:     video name.
        $PLAYTIME:    video duration.
        $URL:         video URL.
        $COMMENT:     comment. if this token is not specified, ex-command ":matanico" ignore any comments.

matanico_watch_servicename:
    the token "$SERVICENAME" specified by "matanico_watch_format" will be expanded to this value. this variable facilitate to change posted string without modefication of format. default value is "またニコニコ動画見てる".

matanico_live_format:
    This is the format that be used on live page. Following special tokens are available. default setting is "$SERVICENAME : $SUBJECT - $URL $COMMENT".
        $SERVICENAME: matanico_live_servicename で指定した文字列に展開されます。
        $SUBJECT:     live name.
        $URL:         live URL.
        $COMMENT:     comment. if this token is not specified, ex-command ":matanico" ignore any comments.

matanico_live_servicename:
    the token "$SERVICENAME" specified by "matanico_live_format" will be expanded to this value. this variable facilitate to change posted string without modefication of format. default value is "またニコニコ生放送見てる".

matanico_tag_format:
    This is the format that be used on tag search page. Following special tokens are available. default setting is "$SERVICENAME : $TAG($NUMOFVIDEOS件) - $URL $COMMENT".
        $SERVICENAME: the value of "matanico_tag_servicename".
        $TAG:         search tags. that will be separated by a space, when specified multiple tags.
        $NUMOFVIDEOS: the number of search result.
        $URL:         search result URL.
        $COMMENT:     comment. if this token is not specified, ex-command ":matanico" ignore any comments.

matanico_tag_servicename:
    the token "$SERVICENAME" specified by "matanico_tag_format" will be expanded to this value. this variable facilitate to change posted string without modefication of format. default value is "またニコニコタグ検索してる".

matanico_related_tag_format:
    This is the format that be used on tag search by keyword page. Following special tokens are available. default setting is "$SERVICENAME : $KEYWORD($NUMOFTAGS件) - $URL $COMMENT".
        $SERVICENAME: the value of "matanico_related_tag_servicename".
        $KEYWORD:     search keyword.
        $NUMOFVIDEOS: the number of search result.
        $URL:         search result URL.
        $COMMENT:     comment. if this token is not specified, ex-command ":matanico" ignore any comments.

matanico_related_tag_servicename:
    the token "$SERVICENAME" specified by "matanico_related_tag_format" will be expanded to this value. this variable facilitate to change posted string without modefication of format. default value is "またキーワードでニコニコタグ検索してる".
]]></detail>
<detail lang="ja"><![CDATA[
== EX-COMMANDS ==
:matanico [comment]:
    今見ている動画 / 検索した結果の情報を Twitter に投稿します。 comment はなくてもかまいません。
:matanico! [comment]:
    Twitter に投稿される文字列をクリップボードにコピーします。 Twitter には投稿しません。

== SETTINGS ==
matanico_watch_format:
    動画ページにおいて投稿される文章の書式設定です。以下の特殊な文字列を指定可能です。設定なしの場合 "$SERVICENAME : $SUBJECT($PLAYTIME) - $URL $COMMENT" になります。
        $SERVICENAME: matanico_watch_servicename で指定した文字列に展開されます。
        $SUBJECT:     動画の名前に展開されます。
        $PLAYTIME:    再生時間に展開されます。
        $URL:         動画の URL に展開されます。
        $COMMENT:     コメントに展開されます。この指定がないと :matanico コマンドでコメントを書いても反映されません。

matanico_watch_servicename:
    matanico_watch_format で指定した $SERVICENAME 部分がこの値で展開されます。書式はそのままで投稿する文字列のみを変更したい場合にこの値を変更することで設定が容易になります。設定なしの場合 "またニコニコ動画見てる" が使用されます。

matanico_live_format:
    生放送ページにおいて投稿される文章の書式設定です。以下の特殊な文字列を指定可能です。設定なしの場合 "$SERVICENAME : $SUBJECT - $URL $COMMENT" になります。
        $SERVICENAME: matanico_live_servicename で指定した文字列に展開されます。
        $SUBJECT:     動画の名前に展開されます。
        $URL:         動画の URL に展開されます。
        $COMMENT:     コメントに展開されます。この指定がないと :matanico コマンドでコメントを書いても反映されません。

matanico_live_servicename:
    matanico_live_format で指定した $SERVICENAME 部分がこの値で展開されます。書式はそのままで投稿する文字列のみを変更したい場合にこの値を変更することで設定が容易になります。設定なしの場合 "またニコニコ生放送見てる" が使用されます。

matanico_tag_format:
    タグ検索ページにおいて投稿される文章の書式設定です。以下の特殊な文字列を指定可能です。設定なしの場合 "$SERVICENAME : $TAG($NUMOFVIDEOS件) - $URL $COMMENT" が使用されます。
        $SERVICENAME: matanico_tag_servicename で指定した文字列に展開されます。
        $TAG:         検索したタグ名に展開されます。複数指定の場合、半角スペースで区切られます。
        $NUMOFVIDEOS: 検索結果の件数に展開されます。
        $URL:         検索結果の URL に展開されます。
        $COMMENT:     コメント展開されます。この指定がないと :matnico コマンドでコメントを書いても反映されません。

matanico_tag_servicename:
    matanico_tag_format で指定した $SERVICENAME 部分がこの値で展開されます。書式はそのままで投稿する文字列のみを変更したい場合にこの値を変更することで設定が容易になります。設定なしの場合 "またニコニコタグ検索してる" が使用されます。

matanico_related_tag_format:
    キーワードによるタグ検索ページにおいて投稿される文章の書式設定です。以下の特殊な文字列を指定可能です。設定なしの場合 "$SERVICENAME : $KEYWORD($NUMOFTAGS件) - $URL $COMMENT" が使用されます。
        $SERVICENAME: matanico_related_tag_servicename で指定した文字列に展開されます。。
        $KEYWORD:     検索したキーワードに展開されます。
        $NUMOFVIDEOS: 検索結果の件数に展開されます。
        $URL:         検索結果の URL に展開されます。
        $COMMENT:     コメント展開されます。この指定がないと :matnico コマンドでコメントを書いても反映されません。

matanico_related_tag_servicename:
    matanico_related_tag_format で指定した $SERVICENAME 部分がこの値で展開されます。書式はそのままで投稿する文字列のみを変更したい場合にこの値を変更することで設定が容易になります。設定なしの場合 "またキーワードでニコニコタグ検索してる" が使用されます。
]]></detail>
</VimperatorPlugin>;

(function () {

// class definitions
// change XPath query when html changed.
function NicoScraper() {}
NicoScraper.prototype = {
    _constants: {
        VERSION:          '0.73',
        PAGECHECK: [
            ['live',       '^http://live\\.nicovideo\\.jp/watch/'],
            ['watch',      '^http://[^.]+\\.nicovideo\\.jp/watch/'],
            ['tag',        '^http://[^.]+\\.nicovideo\\.jp/tag/'],
            ['relatedTag', '^http://[^.]+\\.nicovideo\\.jp/related_tag/'],
        ],
    },

    version: function () { return this.constants.VERSION; },

    pagecheck: function () {
        const pageCheckData = this._constants.PAGECHECK;
        const currentURL = this.getURL();
        for each (let [name, url] in pageCheckData) {
            if (currentURL.match(url)) return name;
        }
        throw new Error('current tab is not nicovideo.jp');
    },

    _flvplayer: function () {
        if (this.pagecheck() === 'watch') {
            let flvplayer = window.content.document.getElementById('flvplayer');
            if (!flvplayer) throw new Error('video player is not found');
            return flvplayer.wrappedJSObject || flvplayer;
        }
        throw new Error('current tab is not watch page on nicovideo.jp');
    },

    getURL: function () { return liberator.modules.buffer.URL; },

    getSubject: function () {
        let subjectNode;
        switch (this.pagecheck()) {
            case 'watch':
                subjectNode = $f('id("des_2")/table/tbody/tr/td/h1');
                break;
            case 'live':
                subjectNode = $f('id("stream_description")');
                break;
            default:
                break;
        }

        if (subjectNode) return subjectNode.textContent;
        throw new Error('current tab is not watch page on nicovideo.jp');
    },

    getPlaytime: function () {
        let p = this._flvplayer();
        if (p && p.ext_getTotalTime) {
            let playtime = Math.round(p.ext_getTotalTime());
            let min = Math.floor(playtime / 60);
            let sec = playtime % 60;
            if (sec < 10) sec = '0' + sec;
            return [min, sec].join(':');
        }
        throw new Error('current tab is not watch page on nicovideo.jp');
    },

    getTagName: function () {
        if (this.pagecheck() === 'tag') {
            let wordNodes = liberator.modules.util.evaluateXPath('id("search_words")/span[contains(concat(" ", @class, " "), " search_word ")]');
            let words = [];
            for (let wordNode in wordNodes) words.push(wordNode.textContent);
            return words.join(' ');
        }
        throw new Error('current tab is not tag search page on nicovideo.jp');
    },

    getNumofVideos: function () {
        if (this.pagecheck() === 'tag') {
            let numofVideos = $f('//strong[contains(concat(" ", @class, " "), " result_total ")]');
            return numofVideos.textContent;
        }
        throw new Error('current tab is not tag search page on nicovideo.jp');
    },

    getKeyword: function () {
        if (this.pagecheck() === 'relatedTag') {
            let keyword = $f('//strong[contains(concat(" ", @class, " "), " search_word ")]');
            return keyword.textContent;
        }
        throw new Error('current tab is not related tag search page on nicovideo.jp');
    },

    getNumofTags: function () {
        if (this.pagecheck() === 'relatedTag') {
            let numofTags = $f('//strong[contains(concat(" ", @class, " "), " result_total ")]');
            return numofTags.textContent;
        }
        throw new Error('current tab is not related tag search page on nicovideo.jp');
    },
};

function TwitterUpdaterFactory() {
    let pUsername, pPassword;
    let pEndPoint = 'https://twitter.com/statuses/update.json';

    function TwitterUpdater() {}
    TwitterUpdater.prototype.update = function (data) {
        let parameter = 'status=' + encodeURIComponent(data.newStatus);

        let req = new XMLHttpRequest();
        if (req) {
            req.open('POST', pEndPoint, true, pUsername, pPassword);
            req.onreadystatechange = function () {
                if (req.readyState === 4 && req.status === 200) {
                    data.onSuccess();
                    return;
                }
                throw new Error('failure to update status in Twitter. HTTP status code : ' + req.status);
            }
            req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            req.send(parameter);
        }
    };
    TwitterUpdater.prototype.__defineSetter__(
        'username',
        function (username) {
            pUsername = username;
            return this;
        }
    );
    TwitterUpdater.prototype.__defineSetter__(
        'password',
        function (password) {
            pPassword = password;
            return this;
        }
    );
    return new TwitterUpdater();
}

// main ---
let scraper = new NicoScraper();

liberator.modules.commands.addUserCommand(
    ['matanico'],
    'update Twitter status to current video/search page information and comment',
    function (args) {
        let arg = args.string;
        try {
            // build post string -----
            let postString;
            // domain check
            switch(scraper.pagecheck()) {
                case 'watch':
                    postString = onWatch(scraper, arg);
                    break;
                case 'live':
                    postString = onLive(scraper, arg);
                    break;
                case 'tag':
                    postString = onTagSearch(scraper, arg);
                    break;
                case 'relatedTag':
                    postString = onRelatedTagSearch(scraper, arg);
                    break;
                default:
                    throw new Error('current tab is not nicovideo.jp');
                    break;
            }

            // ':matanico!' display the evaluated format.
            if (args.bang) {
                liberator.modules.util.copyToClipboard(postString, true);
                return;
            }

            // get username/password and set TwitterUpdater
            let t = TwitterUpdaterFactory();
            [t.username, t.password] = getUserAccount({
                hostname:      'http://twitter.com/',
                formSubmitURL: 'https://twitter.com/statuses/update.json',
                httpRealm:     null,
                description:   'Enter e-mail address and password. This information is cached and use from next time.',
            });
            t.update({
                newStatus: postString,
                onSuccess: function () liberator.echo('Posted ' + postString),
            });
        }
        catch (e) {
            liberator.echoerr(e);
            liberator.log(e);
        }
    },
    {
        bang: true,
    },
    true
);

// sub
function onWatch(scraper, comment) {
    let format      = liberator.globalVariables.matanico_watch_format || '$SERVICENAME : $SUBJECT($PLAYTIME) - $URL $COMMENT';
    let serviceName = liberator.globalVariables.matanico_watch_servicename || fromUTF8Octets('またニコニコ動画見てる');

    return format.replace(/\$SERVICENAME/g, serviceName)
                 .replace(/\$SUBJECT/g,     scraper.getSubject())
                 .replace(/\$PLAYTIME/g,    scraper.getPlaytime())
                 .replace(/\$URL/g,         scraper.getURL())
                 .replace(/\$COMMENT/g,     comment);
}

function onLive(scraper, comment) {
    let format      = liberator.globalVariables.matanico_live_format || '$SERVICENAME : $SUBJECT - $URL $COMMENT';
    let serviceName = liberator.globalVariables.matanico_live_servicename || fromUTF8Octets('またニコニコ生放送見てる');

    return format.replace(/\$SERVICENAME/g, serviceName)
                 .replace(/\$SUBJECT/g,     scraper.getSubject())
                 .replace(/\$URL/g,         scraper.getURL())
                 .replace(/\$COMMENT/g,     comment);
}

function onTagSearch(scraper, comment) {
    let format      = liberator.globalVariables.matanico_tag_format || fromUTF8Octets('$SERVICENAME : $TAG($NUMOFVIDEOS件) - $URL $COMMENT');
    let serviceName = liberator.globalVariables.matanico_tag_servicename || fromUTF8Octets('またニコニコタグ検索してる');

    return format.replace(/\$SERVICENAME/g, serviceName)
                 .replace(/\$TAG/g,         scraper.getTagName())
                 .replace(/\$NUMOFVIDEOS/g, scraper.getNumofVideos())
                 .replace(/\$URL/g,         scraper.getURL())
                 .replace(/\$COMMENT/g,     comment);
}

function onRelatedTagSearch(scraper, comment) {
    let format      = liberator.globalVariables.matanico_related_tag_format || fromUTF8Octets('$SERVICENAME : $KEYWORD($NUMOFTAGS件) - $URL $COMMENT');
    let serviceName = liberator.globalVariables.matanico_related_tag_servicename || fromUTF8Octets('またキーワードでニコニコタグ検索してる');

    return format.replace(/\$SERVICENAME/g, serviceName)
                 .replace(/\$KEYWORD/g,     scraper.getKeyword())
                 .replace(/\$NUMOFTAGS/g,   scraper.getNumofTags())
                 .replace(/\$URL/g,         scraper.getURL())
                 .replace(/\$COMMENT/g,     comment);
}

// stuff functions
function $f(query, node) {
    node = node || window.content.document;
    let result = (node.ownerDocument || node).evaluate(
        query,
        node,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );
    return result.singleNodeValue || null;
}

function fromUTF8Octets(octets)
    decodeURIComponent(octets.replace(/[%\x80-\xFF]/g, function (c)
        '%' + c.charCodeAt(0).toString(16)));

function getUserAccount(accountInfo) {
    // refer:
    // https://developer.mozilla.org/ja/Using_nsILoginManager
    let loginManager = Cc['@mozilla.org/login-manager;1'].getService(Ci.nsILoginManager);
    let logins = loginManager.findLogins(
        {},
        accountInfo.hostname,
        accountInfo.formSubmitURL,
        accountInfo.httpRealm
    );

    if (logins.length > 0) {
        // found
        return [logins[0].username, logins[0].password];
    }
    else {
        // not found, so register
        // refer: https://developer.mozilla.org/Ja/Code_snippets/Dialogs_and_Prompts
        let promptSvc = Cc['@mozilla.org/embedcomp/prompt-service;1'].getService(Ci.nsIPromptService);
        let promptUsername = {value: ''};
        let promptPassword = {value: ''};
        let isOK = promptSvc.promptUsernameAndPassword(
            window, accountInfo.hostname, accountInfo.description,
            promptUsername, promptPassword, null, {}
        );

        if (isOK) {
            let nsLoginInfo = new Components.Constructor(
                '@mozilla.org/login-manager/loginInfo;1',
                Ci.nsILoginInfo, 'init'
            );

            // refer: https://developer.mozilla.org/ja/NsILoginInfo
            loginManager.addLogin(new nsLoginInfo(
                accountInfo.hostname,
                accountInfo.formSubmitURL,
                accountInfo.httpRealm,
                promptUsername.value,
                promptPassword.value,
                '', ''
            ));

            return [promptUsername.value, promptPassword.value];
        }
    }

    throw new Error('account is not found: ' + accountInfo.hostname);
}

})();

// vim:sw=4 ts=4 et:
