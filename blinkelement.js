/*
 * ==VimperatorPlugin==
 * @name            blinkelement.js
 * @description     blink specified elements.
 * @description-ja  指定した要素を点滅させる。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.20
 * @minversion      2.0pre 2008/10/16
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *   New BSD License
 *
 * USAGE
 *  :blink {element[s] object}
 *  :bl
 *      -> blink specified element[s].
 *
 *  :noblink
 *  :nobl
 *      -> clear blink all elements.
 *
 * SETTING
 *  blink_element_interval:     interval time. default is 800 msec.
 *  blink_element_color:        color for blink. default is red.
 *  blink_element_sparecolor:   use this value when target's background color
 *                              is same as color specified blink_element_color
 *                              or default. default is cyan.
 *
 * EXAMPLE
 *  let blink_element_interval='500'
 *  let blink_element_color='green'
 *  let blink_element_opacity='0.7'
 *
 *  :bl content.document.getElementsByTagName('A');
 *  :bl buffer.evaluateXPath('//a');
 *  :nobl
 * */

( function () {

const interval = liberator.globalVariables.blink_element_interval || 800;
const color = liberator.globalVariables.blink_element_color || 'red';
const opacity = liberator.globalVariables.blink_element_opacity || 0.5;

function setBlink(element) {
    let doc = content.document;
    let div = doc.createElement('div');
    div.className = 'vimp_plugin_blinkelement';

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

    div.intervalId = setInterval(
        function () {
            let d = div.style.display;
            div.style.display = (d === 'block' ? 'none' : 'block');
        },
        interval
    );

    doc.body.appendChild(div);
}

function clearBlink(element) {
    if (element.intervalId) clearInterval(element.intervalId);
    element.parentNode.removeChild(element);
}

commands.addUserCommand(
    ['blink', 'bl'],
    'blink',
    function (args) {
        let arg = args.string;
        let element;
        try {
            element = eval(arg);
        }
        catch (e) {
            liberator.log(e);
            liberator.echoerr(e);
        }

        if (!element) {
            liberator.echoerr('specify element[s]');
            return;
        }

        if (element instanceof HTMLCollection) {
            for (let [, e] in Iterator(element)) setBlink(e);
        }
        else if (element instanceof XPathResult) {
            for (let e in element) setBlink(e);
        }
        else if ('style' in element) {
            setBlink(element);
        }
        else {
            liberator.echoerr('specify element[s]');
        }
    },
    {
        completer: function (filter) completion.javascript(filter),
    }
);

commands.addUserCommand(
    ['noblink', 'nobl'],
    'no blink',
    function () {
        let divs = buffer.evaluateXPath('//div[contains(concat(" ", @class, " "), " vimp_plugin_blinkelement ")]');
        for (let d in divs) clearBlink(d);
    },
    {}
);

})()

// vim: set sw=4 ts=4 et;
