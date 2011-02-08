let INFO = //{{{
<plugin name="statusbar panel" version="0.1"
        href="https://github.com/vimpr/vimperator-plugins/raw/master/statusbar_panel.js"
        summary="Click statusbar panel"
        lang="ja"
        xmlns="http://vimperator.org/namespaces/liberator">
    <author href="http://d.hatena.ne.jp/wlt/" email="wltlain@gmail.com">wlt</author>
    <license href="http://www.opensource.org/licenses/mit-license.php">MIT License</license>
    <project name="vimperator" minVersion="2.3.1"/>
    <p>
        ステータスバー（アドオンバー）にあるパネル（アイコン）をクリックするコマンドを提供します。
    </p>
    <item>
        <tags>:statusbarpanel</tags>
        <spec>:statusbarpanel <oa>-button=<a>l | m | r</a></oa> <oa>-double-click</oa> <a>panel-id</a></spec>
        <description>
            <p>
                <a>panel-id</a>で指定するID属性を持つステータスバーパネル（アイコン）をクリックします。
                クリックするボタンは<oa>-button=</oa>で指定できます:
            </p>
            <dl>
                <dt>l</dt>
                <dd>左ボタン（デフォルト）</dd>
                <dt>m</dt>
                <dd>中ボタン（スクロールボタン）</dd>
                <dt>r</dt>
                <dd>右ボタン</dd>
            </dl>
            <p><oa>-double-click</oa>を指定するとダブルクリックになります。</p>
        </description>
  </item>
</plugin>;
//}}}

let MOUSE_BUTTON_LEFT = 0;
let MOUSE_BUTTON_MIDDLE = 1;
let MOUSE_BUTTON_RIGHT = 2;

function getImages(panel) {
    var images = [];
    // 普通の子孫要素のimage要素探索
    for (let [k, node] in Iterator(panel.getElementsByTagName('image'))) images.push(node);
    // 匿名コンテントの子孫要素のimage要素探索
    var anonymousNodes = document.getAnonymousNodes(panel);
    for (let [k, anonymousNode] in Iterator(anonymousNodes)) {
        let node;
        let result = document.evaluate('descendant-or-self::xul:image', anonymousNode, function() XUL.uri, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        while ((node = result.iterateNext())) images.push(node);
    }

    return images;
}

function makeIcon(panel) {
    var icon = <image xmlns={XUL.uri}/>;
    var image = getImages(panel)[0];

    if (image) {
        let style = window.getComputedStyle(image, null);
        let src = image.src || style.listStyleImage.replace(/^url\("(.+)"\)$/, '$1');
        if (src != '') {
            icon.@style = 'list-style-image: url("' + src + '");' +
                          '-moz-image-region: ' + style.MozImageRegion;
        }
    }
    return icon;
}

function generateStatusbarpaneIDlList(filter) {
    var panels = document.getElementsByTagNameNS(XUL.uri, 'statusbarpanel');
    for ([k, p] in Iterator(panels)) {
        if (p.hidden != true) {
            yield {
                text: p.id,
                desc: 'statusbarpanel',
                icon: makeIcon(p)
            };
        }
    }
}

function createAndDispatchEvent(target, type, detail, screenX, screenY, button) {
    var ev = document.createEvent('MouseEvents');
    ev.initMouseEvent(type, true, true, window, detail, screenX, screenY, 0, 0, false, false, false, false, button, null);
    target.dispatchEvent(ev);
}

function clickStatusIcon(panel, button, doubleClick) {
    var target = getImages(panel)[0] || panel;
    if (!target) return;
    var x = target.boxObject.screenX;
    var y = target.boxObject.screenY;
    x += target.clientWidth / 2;
    y += target.clientHeight / 2;

    // イベントの発生順序 http://www.quirksmode.org/dom/events/click.html
    createAndDispatchEvent(target, 'mousedown', 0, x, y, button);
    createAndDispatchEvent(target, 'mouseup', 0, x, y, button);
    createAndDispatchEvent(target, 'click', 1, x, y, button);

    if (doubleClick) {
        createAndDispatchEvent(target, 'mousedown', 0, x, y, button);
        createAndDispatchEvent(target, 'mouseup', 0, x, y, button);
        createAndDispatchEvent(target, 'click', 1, x, y, button);
        createAndDispatchEvent(target, 'dblclick', 2, x, y, button);
    } else if (button == MOUSE_BUTTON_RIGHT) {
        createAndDispatchEvent(target, 'contextmenu', 1, x, y, button);
    }
}

commands.addUserCommand(['statusbarpanel'],'click statusbar panel',
    function(args) {
        var id = args[0];
        var panel = document.getElementById(id);
        if (!panel) {
            liberator.echoerr('No such statusbar panel: ' + id);
            return;
        }
        var button = MOUSE_BUTTON_LEFT;
        switch (args['-button']) {
        case 'm': button = MOUSE_BUTTON_MIDDLE; break;
        case 'r': button = MOUSE_BUTTON_RIGHT; break;
        case 'l': default: button = MOUSE_BUTTON_LEFT; break;
        }
        clickStatusIcon(panel, button, args['-double-click']);
    }, {
        argCount: '1',
        options: [
            [['-button', '-b'], commands.OPTION_STRING,
             function(arg) /^[lmr]$/.test(arg),
             [['l', 'Left click (default)'],
              ['m', 'Middle click'],
              ['r', 'Right click']]],
            [['-double-click', '-d'], commands.OPTION_NOARG]
        ],
        completer: function(context, args) {
            var arg = args[0];
            context.anchored = false;
            context.title = ['Panel ID'];
            context.keys = { text: 'text', description: 'desc', icon: 'icon' };
            context.compare = CompletionContext.Sort.unsorted;
            context.process = [function (item, text) {
                return <><span highlight="CompIcon">{item.icon ? item.icon : <></>}</span><span class="td-strut"/>{text}</>
            }];

            var list = generateStatusbarpaneIDlList(arg);
            context.completions = list;
        }
    }, true);

// vim: set sw=4 ts=4 et fdm=marker :
