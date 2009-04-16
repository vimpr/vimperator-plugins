/**
 * ==VimperatorPlugin==
 * @name            exShowElementInfo.js
 * @description     extend feature that show element's information when extended-hints mode ";?"
 * @description-ja  extended-hints mode の ";?" でみられる要素の情報を拡張する。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.11
 * @minversion      2.0pre
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *   New BSD License
 *
 * USAGE
 *   on extended-hints mode ";?", select element and enter
 *
 * HISTORY
 *   2008/11/05 ver. 0.10   - initial written.
 *   2009/04/17 ver. 0.11   - follow the util.js changes
 *
 * */

(function () {

addFeatureToMethodAfter(
    liberator.modules.buffer,
    'showElementInfo',
    function (element) {
        let str = [
            a.name + ': ' + a.value for (a in liberator.modules.util.Array.itervalues(element.attributes))
        ].join("\n");
        liberator.echo("\nextra information\n" + str, liberator.modules.commandline.APPEND_TO_MESSAGES);
    }
);

function addFeatureToMethodAfter(object, method, feature) {
    var original = object[method];
    object[method] = function () {
        var tmp = original.apply(object, arguments);
        feature.apply(object, arguments);
        return tmp;
    };
}
})();

// vim: set sw=4 ts=4 et;
