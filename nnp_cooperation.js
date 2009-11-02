/*
 * ==VimperatorPlugin==
 * @name            nnp_cooperation.js
 * @description     this script give you keyboard opration for NicoNicoPlaylist.
 * @description-ja  NicoNicoPlaylist をキーボードで操作できるようにする。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.33
 * @minversion      2.0pre
 * @maxversion      2.0pre
 * ==/VimperatorPlugin==
 *
 * CONSTRAINT
 *   need NicoNicoPlaylist version 1.12 or above
 *
 * LICENSE
 *   New BSD License
 *
 * USAGE
 *   :nnppushallvideos
 *     現在のページ内のすべての動画を再生リストに送る。
 *     ランキングやマイリストのほか、動画ページではオススメ動画が追加される。
 *   :nnppushthisvideo
 *     現在見ている動画を再生リストに送る。
 *   :nnpplaynext [next]
 *     再生リストの次の動画を再生する。
 *   :nnpremove [index]
 *     index 番目の動画を再生リストから取り除く。 index は 0 から数える。
 *     指定しない場合は一番上が取り除かれる。
 *   :nnpclear
 *     再生リストをすべてクリアする。
 *   :nnpgetlist [numof]
 *     再生リストの上から numof 個を表示する。指定しない場合は g:nnp_coop_numoflist が使われる。
 *   :nnprandom
 *     ランダムモードの on / off
 *   :nnploop
 *     ループモードの on / off
 *   :nnpfullscreen
 *     全画面モードの on / off
 *
 * VARIABLES
 *   g:nnp_coop_numoflist
 *     :nnpgetlist で表示するリストの個数を指定する。デフォルトは 10 。
 *
 * HISTORY
 *   2008/07/11 ver. 0.10   - initial written.
 *   2008/07/15 ver. 0.20   - refactoring.
 *   2008/09/26 ver. 0.30   - change XPath expression.
 *                          - correspond mode toggling (fullscreen, random, loop).
 *                          - change caption: display now-playing title and mode's statuses.
 *                          - mode's statuses are displayed with the following word.
 *                              R: random mode is on
 *                              L: loop mode is on
 *                              F: fullscreen mode is on
 *   2008/09/28 ver. 0.31   - bugfix :nnpgetlist in ranking page.
 *
 * */
/*
以下のコードを _vimperatorrc に貼り付けると幸せになれるかも。
コマンド ( [',nn'] や [',nr'] の部分 ) は適宜変えてね。

javascript <<EOM

// [N],nn
// N 番目の動画を再生する。
// 指定なしの場合次の動画が再生される。
liberator.modules.mappings.addUserMap(
    [liberator.modules.modes.NORMAL],
    [',nn'],
    'play next item in NicoNicoPlaylist',
    function(count) {
        if(count === -1) count = 1;
        liberator.execute(':nnpplaynext ' + count);
    },
    { flags: liberator.modules.Mappings.flags.COUNT }
);

// [N],nr
// 上から N 個の動画を削除する。
// 指定なしの場合一番上の動画が削除される。
liberator.modules.mappings.addUserMap(
    [liberator.modules.modes.NORMAL],
    [',nr'],
    'remove item in NicoNicoPlaylist',
    function(count) {
        if(count === -1) count = 1;
        for(let i=0 ; i<count ; ++i) liberator.execute(':nnpremove');
        liberator.execute(':nnpgetlist');
    },
    { flags: liberator.modules.Mappings.flags.COUNT }
);

EOM

*/

(function(){

// scrape from div element that inserted by NicoNicoPlaylist
liberator.modules.commands.addUserCommand(
    ['nnpgetlist'],
    'get NicoNicoPlaylist',
    function (args) {
        // check existence of NicoNicoPlaylist
        let playlistNode = $f('//div[starts-with(@id, "playlistcontroller_")]');
        if(!playlistNode) {
            liberator.echoerr('NicoNicoPlaylist is not found.');
            return;
        }

        // check existence of items in NicoNicoPlaylist
        let nodes = util.evaluateXPath(
            'id("' + playlistNode.id + '")/div[contains(concat(" ", @class, " "), " playlist-list-outer ")]/ul/li/a'
        );
        let nodesLength = nodes.snapshotLength;
        if(!nodesLength) {
            liberator.echoerr('no items in NicoNicoPlaylist.');
            return;
        }

        // get number of displayed items
        let numofList = liberator.globalVariables.nnp_coop_numoflist || 10;
        let arg = args[0];
        if (arg && /^\d+$/.test(arg)) numofList = arg;

        // generate data
        let items = [], length = 0;
        for(let node in nodes) {
            if (length >= numofList) break;

            // get video id
            let id = node.href.match(/\d+$/);

            // evaluate variables and push to list
            items.push({
                index:        ++length,
                thumbnailURL: thumbnailURL(id),
                title:        node.textContent,
                url:          node.href,
            });
        }

        // evaluate variables
        let xml = <>
            {style()}
            {table({
                numofDisplay: (nodesLength < numofList) ? nodesLength : numofList,
                numofTotal:   nodesLength,
                playTitle:    getPlayTitle(),
                statuses:     getStatusText(playlistNode.id),
                items:        items,
            })}
        </>

        liberator.echo(xml, liberator.modules.commandline.FORCE_MULTILINE);
    },
    {}
);

// define other commands
// only send CommandEvent to NicoNicoPlaylist script
[
    [['nnppushallvideos'], 'push all videos to NicoNicoPlaylist',        'GMNNPPushAllVideos'],
    [['nnppushthisvideo'], 'push current video to NicoNicoPlaylist',     'GMNNPPushThisVideo'],
    [['nnpplaynext'],      'play next in NicoNicoPlaylist',              'GMNNPPlayNext'],
    [['nnpremove'],        'remove item in NicoNicoPlaylist',            'GMNNPRemove'],
    [['nnpclear'],         'clear all items in NicoNicoPlaylist',        'GMNNPClear'],
    [['nnprandom'],        'toggle random mode of NicoNicoPlaylist',     'GMNNPRandom'],
    [['nnploop'],          'toggle loop mode of NicoNicoPlaylist',       'GMNNPLoop'],
    [['nnpfullscreen'],    'toggle fullscreen mode of NicoNicoPlaylist', 'GMNNPFullScreen'],
].forEach( function ([command, description, eventname]){
    liberator.modules.commands.addUserCommand(
        command,
        description,
        function (arg) {
            let r = document.createEvent('CommandEvent');
            r.initCommandEvent(eventname, true, true, arg[0]);
            window.content.dispatchEvent(r);
        },
        {}
    );
});


// stuff functions ---
// return first node
function $f(query, node) {
    node = node || window.content.document;
    let result = (node.ownerDocument || node).evaluate(
        query,
        node,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );
    return result.singleNodeValue ? result.singleNodeValue : null;
}

function getPlayTitle() {
    let titleNode = $f('//h1') || $f('//title');
    return titleNode.textContent;
}

function getStatusText(idPrefix) {
    let statuses = [];
    [
        ['//input[starts-with(@id, "playlist") and contains(@id, "-checkbox-random")]', 'R'],
        ['//input[starts-with(@id, "playlist") and contains(@id, "-checkbox-loop")]',   'L'],
        ['//input[starts-with(@id, "playlist") and contains(@id, "-checkbox-full")]',   'F'],
    ].forEach(function ([query, text]) {
        if ($f(query).checked) statuses.push(text);
    });
    return (statuses.length) ? ' ' + statuses.join('') : '';
}

// thumbnail URL
// refer: http://d.hatena.ne.jp/ZIGOROu/20081014/1223991205
function thumbnailURL(videoId) {
    return [
        'http://tn-skr',
        (videoId % 2 + 1),
        '.smilevideo.jp/smile?i=',
        videoId
    ].join('');
}

// E4X hell ---
// style
function style(css) {
    return <style type="text/css">{[
        'table.nnp_coop .index     { text-align:right; width:2em; }',
        'table.nnp_coop .thumbnail { text-align:center; }',
        'table.nnp_coop caption    { color:green; }',
        'table.nnp_coop thead      { text-align:center; }',
    ].join('')}</style>
}

// table
function table(data) {
    return <table class="nnp_coop">
        {caption(data)}
        {thead()}
        <tbody>{liberator.modules.template.map(data.items, item)}</tbody>
    </table>
}

// table caption
function caption(data) {
    return <caption>now playing: {data.playTitle} (display {data.numofDisplay} / {data.numofTotal}{data.statuses})</caption>
}

// table head
function thead() {
    return <thead>
        <tr>
            <td> </td>
            <td>thumbnail</td>
            <td>title</td>
            <td>url</td>
        </tr>
    </thead>
}

// item
function item(datum) {
    return <tr>
        <td class="index">{datum.index}:</td>
        <td class="thumbnail"><img src={datum.thumbnailURL} width="33" height="25" /></td>
        <td>{datum.title}</td>
        <td>{datum.url}</td>
    </tr>
}

})();

// vim:sw=4 ts=4 et:
