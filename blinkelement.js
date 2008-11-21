/*
 * ==VimperatorPlugin==
 * @name            blinkelement.js
 * @description     blink specified elements.
 * @description-ja  指定した要素を点滅させる。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.11
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
 *  let blink_element_sparecolor='purple'
 *
 *  :bl content.document.getElementsByTagName('A');
 *  :bl buffer.evaluateXPath('//a');
 *  :nobl
 * */

( function () {

let intervalList = [];
const interval = liberator.globalVariables.blink_element_interval || 800;
const color = liberator.globalVariables.blink_element_color || 'red';
const spareColor = liberator.globalVariables.blink_element_sparecolor || 'cyan';

function setBlink(element) {
    let originalColor = element.style.backgroundColor || 'inherit';
    let blinkColor = (originalColor == color) ? spareColor : color;

    element.style.backgroundColor = blinkColor;
    let state = false;
    let intervalId = setInterval( function () {
        element.style.backgroundColor = state ? blinkColor : originalColor;
        state = !state;
    }, interval);

    intervalList.push({
        id:         intervalId,
        element:    element,
        color:      originalColor,
    });
}

function clearBlink(i) {
    i.element.style.backgroundColor = i.color;
    clearInterval(i.id);
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
        while (intervalList.length) clearBlink(intervalList.pop());
    },
    {}
);

})()

// vim: set sw=4 ts=4 et;
