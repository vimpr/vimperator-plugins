/**
 * ==VimperatorPlugin==
 * @name              Pukka
 * @description       Add bookmark to Delicious with Pukka
 * @description-ja    Pukkaを使用してDeliciousにブックマークする
 * @author            otsune info@otsune.com
 * @namespace         http://www.otsune.com/
 * @minVersion        0.6pre
 * @version           0.4
 * ==/VimperatorPlugin==
 *
 * see also http://codesorcery.net/pukka/
 *
 * Variable:
 *  g:pukka_normalizelink
 *      Specifies keys that use Pathtraq URL Normalizer
 *      usage: let g:pukka_normalizelink = true
 * Mappings:
 *  '[C-z]':
 * Commands:
 *  'pukka' or 'pu':
 *      Post bookmark to Delicious with Pukka
 *      usage: :pu[kka] [http://example.com/]
 * Options:
 *  not implemented
 */

(function() {
var useNormalizelink = liberator.globalVariables.pukka_normalizelink || true;

liberator.commands
         .addUserCommand(['pukka', 'pu'], 'Post to Pukka bookmark', function(args) {
    if (!liberator.buffer.title || !liberator.buffer.URL || liberator.buffer.URL == 'about:blank') {
        return false;
    }
    var scheme = 'pukka:';
    var title = encodeURIComponent(liberator.buffer.title);
    var url = encodeURIComponent(liberator.buffer.URL);
    var extend = encodeURIComponent(window.content.getSelection().toString() || '');
    if (args) {
        url = encodeURIComponent(args);
    }
    liberator.open(scheme + 'url=' + url + '&title=' + title + '&extended=' + extend);
}, {
    completer: function(filter) {
        var complist = [];

        complist.push([liberator.buffer.URL, 'Raw URL: ' + liberator.buffer.title]);

        if (useNormalizelink) {
            complist.push([getNormalizedPermalink(liberator.buffer.URL), 'Normalized URL: ' + liberator.buffer.title]);
        }

        // detect rel="bookmark"
        var elem;
        var relb = liberator.buffer.evaluateXPath(
            '//*[contains(concat(" ", normalize-space(@rel), " "), " bookmark ")]',
            null, null, true);
        while ((elem = relb.iterateNext()) !== null) {
            complist.push([elem.toString(), '@rel="bookmark" URL: ' + elem]);
        }

        return [0, complist];
    }
});

liberator.mappings
         .addUserMap([liberator.modes.NORMAL], ['<C-z>'], 'Post to Pukka', function() {
    var urlarg = liberator.globalVariables.pukka_normalizelink ?
                 getNormalizedPermalink(liberator.buffer.URL) :
                 liberator.buffer.URL;
    liberator.commandline
             .open(':', 'pukka ' + urlarg, liberator.modes.EX);
}, {});

// copied from Trapezoid's direct_hb.js
function getNormalizedPermalink(url) {
    var xhr = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                        .createInstance(Components.interfaces.nsIXMLHttpRequest);
    xhr.open('GET', 'http://api.pathtraq.com/normalize_url2?api=json;url=' + encodeURIComponent(url), false);
    xhr.send(null);
    if (xhr.status != 200) {
        liberator.echoerr('Pathtraq: FAILED to normalize URL!!');
        return url;
    }
    return window.eval('(' + xhr.responseText + ')');
    //return xhr.responseText.substring(1, xhr.responseText.length - 1);
    //api=xml;return xhr.responseXML.documentElement.getElementsByTagName('url').item(0).childNodes.item(0).nodeValue;
}
})();
