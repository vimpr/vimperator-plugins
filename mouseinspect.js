/*
 * ==VimperatorPlugin==
 * @name            mouseinspect.js
 * @description     display informations of the specified element and highlight it by mouse.
 * @description-ja  マウスで指定した要素の情報をコマンドラインに表示＆ハイライトする。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.10
 * @minversion      2.0pre 2008/10/16
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *   New BSD License
 *
 * USAGE
 *  :mouseinspect   start inspect by mouse
 *  :mins
 *
 *  :nomouseinspect stop inspect and clear highlight
 *  :nomins
 * */

( function () {

const color = liberator.globalVariables.mouse_inspect_color || 'red';
const opacity = liberator.globalVariables.mouse_inspect_opacity || 0.5;
let divList = [];

function unhighlight() {
    let divs = buffer.evaluateXPath('//div[contains(concat(" ", @class, " "), " vimp_plugin_mouse ")]');
    while (divList.length) {
        let d = divList.pop();
        d.parentNode.removeChild(d);
    }
}
function highlight(element) {
    let doc = content.document;
    let div = doc.createElement('div');
    div.className = 'vimp_plugin_mouse';

    div.style.position = 'absolute';
    div.style.display = 'block';
    div.style.zIndex = 2147483647;
    div.style.top    = element.offsetTop + 'px';
    div.style.left   = element.offsetLeft + 'px';
    div.style.width  = element.offsetWidth + 'px';
    div.style.height = element.offsetHeight + 'px';
    div.style.backgroundColor = color;
    div.style.opacity    = opacity;
    div.style.MozOpacity = opacity;
    div.ignore = true;

    divList.push(div);
    doc.body.appendChild(div);
}

function elementInfo(event) {
    let element = event.target;
    if (element.ignore) {
        unhighlight();
        return;
    }

    let attributes = [a.name + '="' + a.value + '"' for (a in util.Array.iterator(element.attributes))].join(' ');
    let str = '<' + element.localName.toLowerCase() + (attributes ? ' ' + attributes : '') + '>';
    highlight(element);
    liberator.echo(str, commandline.FORCE_SINGLELINE);
}

commands.addUserCommand(
    ['mouseinspect', 'mins'],
    'mouse',
    function () { window.addEventListener('mousemove', elementInfo, false); },
    {}
);
commands.addUserCommand(
    ['nomouseinspect', 'nomins'],
    'mouse',
    function () {
        window.removeEventListener('mousemove', elementInfo, false);
        unhighlight();
    },
    {}
);
} )()
