/*
 * ==VimperatorPlugin==
 * @name            mouseinspect.js
 * @description     display informations of the specified element and highlight it by mouse.
 * @description-ja  マウスで指定した要素の情報をコマンドラインに表示＆ハイライトする。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.21
 * @minversion      2.0pre 2008/10/16
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *   New BSD License
 *
 * CONSTRAINT
 *  need highlight.js
 *
 * USAGE
 *  :mouseinspect
 *  :mins
 *      -> start inspect by mouse
 *
 *  :nomouseinspect
 *  :nomins
 *      -> stop inspect and clear highlight
 *
 * SETTING
 *  blink_element_color:    color. default is red.
 *  blink_element_opacity:  opacity value. default is 0.5 .
 *
 * EXAMPLE
 *  let blink_element_color='green'
 *  let blink_element_opacity='0.7'
 * */

// use setTimeout to synchronize ( wait to process highlight.js )
// "liberator.modules.plugins.highlighterFactory" is build by highlight.js .
// it is the factory that build highlight object.
setTimeout( function () {

if (!liberator.plugins.highlighterFactory) {
    liberator.log('mouseinspect.js needs highlight.js', 0);
    return;
}

// default settings
const defaultColor   = 'red';
const defaultOpacity = 0.5;

// main
let elementInfo = function (event) {
    let element = event.target;

    if (element.className === 'vimp_plugin_highlightelement') {
        elementInfo.highlighter.unhighlightAll();
        return;
    }

    let attributes = [a.name + '="' + a.value + '"' for (a in util.Array.iterator(element.attributes))].join(' ');
    let str = '<' + element.localName.toLowerCase() + (attributes ? ' ' + attributes : '') + '>';
    liberator.echo(str, commandline.FORCE_SINGLELINE);

    elementInfo.highlighter.highlight(element);
};

let setupHighlighter = function () {
    elementInfo.highlighter = liberator.plugins.highlighterFactory({
        color:    liberator.globalVariables.mouse_inspect_color   || defaultColor,
        opacity:  liberator.globalVariables.mouse_inspect_opacity || defaultOpacity,
        interval: 0,
    });
}

setupHighlighter();

// register commands
commands.addUserCommand(
    ['mouseinspect', 'mins'],
    'mouse',
    function () {
        setupHighlighter();
        window.addEventListener('mousemove', elementInfo, false);
    },
    {}
);
commands.addUserCommand(
    ['nomouseinspect', 'nomins'],
    'mouse',
    function () {
        window.removeEventListener('mousemove', elementInfo, false);
        elementInfo.highlighter.unhighlightAll();
    },
    {}
);

}, 0); // setTimeout

// vim: set sw=4 ts=4 et;
