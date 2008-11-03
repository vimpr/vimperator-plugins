/**
 * ==VimperatorPlugin==
 * @name              Pukka
 * @description       Add bookmark to Delicious with Pukka
 * @description-ja    Pukkaを使用してDeliciousにブックマークする
 * @author            otsune info@otsune.com
 * @namespace         http://www.otsune.com/
 * @minVersion        2.0pre
 * @version           0.4
 * ==/VimperatorPlugin==
 *
 * see also http://codesorcery.net/pukka/
 *
 * Variables:
 *  g:pukka_normalizelink
 *      Specifies keys that use Pathtraq URL Normalizer
 *      usage: let g:pukka_normalizelink = true
 * Mappings:
 *  '[C-p]':
 * Commands:
 *  'pukka' or 'pu':
 *      Post bookmark to Delicious with Pukka
 *      usage: :pu[kka] [http://example.com/]
 * Options:
 *  not implemented
 */

(function() {
var useNormalizelink = liberator.globalVariables.pukka_normalizelink || true;
var buf = liberator.modules.buffer;

liberator.modules.commands
         .addUserCommand(['pukka', 'pu'], 'Post to Pukka bookmark', function(args) {
    if (!buf.title || !buf.URL || buf.URL == 'about:blank') {
        return false;
    }
    var scheme = 'pukka:';
    var title = encodeURIComponent(buf.title);
    var url = encodeURIComponent(buf.URL.toString());
    var extend = encodeURIComponent(window.content.getSelection().toString() || '');
    if (args.string) {
        url = encodeURIComponent(args.string);
    }
    liberator.open(scheme + 'url=' + url + '&title=' + title + '&extended=' + extend);
}, {
    bang: false,
    completer: function(filter) {
        var complist = [];

        complist.push([buf.URL, 'Raw URL: ' + buf.title]);

        if (useNormalizelink) {
            complist.push([getNormalizedPermalink(buf.URL), 'Normalized URL: ' + buf.title]);
        }

        // detect rel="bookmark"
        var elem;
        var relb = buf.evaluateXPath(
            '//*[contains(concat(" ", normalize-space(@rel), " "), " bookmark ")]',
            null, null, true);
        while ((elem = relb.iterateNext()) !== null) {
            complist.push([elem.toString(), '@rel="bookmark" URL: ' + elem]);
        }

        return [0, complist];
    }
});

liberator.modules.mappings
         .addUserMap([liberator.modules.modes.NORMAL], ['<C-p>'], 'Post to Pukka', function() {
    var urlarg = liberator.globalVariables.pukka_normalizelink ?
                 getNormalizedPermalink(buf.URL) :
                 buf.URL;
    liberator.modules.commandline
             .open(':', 'pukka ' + urlarg, modes.EX);
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
