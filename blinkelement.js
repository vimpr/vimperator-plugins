/*
 * ==VimperatorPlugin==
 * @name            blinkelement.js
 * @description     blink specified elements.
 * @description-ja  指定した要素を点滅させる。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.32
 * @minversion      2.3pre 2009/11/02
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *  New BSD License
 *
 * CONSTRAINT
 *  need highlight.js
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
 *  blink_element_interval: interval time. default is 800 msec.
 *  blink_element_color:    color for blink. default is red.
 *  blink_element_opacity:  opacity value. defualt is 0.5 .
 *
 * EXAMPLE
 *  let blink_element_interval='500'
 *  let blink_element_color='green'
 *  let blink_element_opacity='0.7'
 *
 *  :bl content.document.getElementsByTagName('A');
 *  :bl util.evaluateXPath('//a');
 *  :nobl
 * */

// use setTimeout to synchronize ( wait to process highlight.js )
// "liberator.modules.plugins.highlighterFactory" is build by highlight.js .
// it is the factory that build highlight object.
setTimeout( function () {

if (!liberator.plugins.highlighterFactory) {
    liberator.log('blinkelement.js needs highlight.js', 0);
    return;
}

// default settings
const defaultColor    = 'red';
const defaultOpacity  = 0.5;
const defaultInterval = 800;

let highlighter = liberator.modules.plugins.highlighterFactory({
    color:    liberator.globalVariables.blink_element_color    || defaultColor,
    opacity:  liberator.globalVariables.blink_element_opacity  || defaultOpacity,
    interval: liberator.globalVariables.blink_element_interval || defaultInterval,
});

// register commands
commands.addUserCommand(
    ['blink', 'bl'],
    'blink',
    function (args) {
        let arg = args.string;
        let element = liberator.eval(arg);

        if (!element) {
            liberator.echoerr('specify element[s]');
            return;
        }

        liberator.log(highlighter, 0);

        // reflect settings ( follow dynamic change of settings )
        highlighter.set({
            color:    liberator.globalVariables.blink_element_color    || defaultColor,
            opacity:  liberator.globalVariables.blink_element_opacity  || defaultOpacity,
            interval: liberator.globalVariables.blink_element_interval || defaultInterval,
        });

        // for getElement[s]By...
        if (element instanceof HTMLCollection) {
            for (let [, e] in Iterator(element)) highlighter.highlight(e);
        }
        // for evaluate
        else if (element instanceof XPathResult) {
            for (let e in element) highlighter.highlight(e);
        }
        // single element
        else if (element) {
            highlighter.highlight(element);
        }
        else {
            liberator.echoerr('specify element[s]');
        }
    },
    {
        literal: 0,
        completer: function (filter) completion.javascript(filter),
    },
    true
);

commands.addUserCommand(
    ['noblink', 'nobl'],
    'no blink',
    function () highlighter.unhighlightAll(),
    {}
);

}, 0); // setTimeout

// vim: set sw=4 ts=4 et;
