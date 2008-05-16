/**
 * Auto switch Vimperator key navigation
 *
 * @author teramako teramako@gmail.com
 * @author halt feits <halt.feit at gmail.com>
 * @version 0.6pre
 */

(function(){

/**
 * String or RegExp
 * e.g)
 *  * /^https?:\/\/mail\.google\.com\//
 *  * 'http://reader.livedoor.com/reader/'
 *
 * The autoignorekey_pages is a string variable which can set on
 * vimperatorrc as following.
 *
 * let autoignorekey_pages = "['http://example.com/*', 'http://example.org/*']"
 *
 * or your can set it using inline JavaScript.
 *
 * javascript <<EOM
 * liberator.globalVariables.autoignorekey_pages = uneval([
 *   /^https?:\/\/mail\.google\.com\//,
 *   /^https?:\/\/www\.google\.com\/reader\//,
 * ]);
 * EOM
 */
const ignorePagesList = window.eval(liberator.globalVariables.autoignorekey_pages) || [
    /^https?:\/\/mail\.google\.com\//,
    /^http:\/\/(?:reader\.livedoor|fastladder)\.com\/(?:reader|public)\//,
].map(function(i)
    i instanceof RegExp ? i :
    i instanceof Array  ? new RegExp(String(i[0]), String(i[1])) :
    new RegExp("^" + String(i).replace(/\s+/g, "")
                              .replace(/[\\^$.+?|(){}\[\]]/g, "\\$&")
                              .replace(/(?=\*)/g, ".")
                   + "$", "i"));

document.getElementById('appcontent').addEventListener('DOMContentLoaded',passAllKeysIfTarget,false);
getBrowser().mTabBox.addEventListener('TabSelect',passAllKeysIfTarget,false);

function passAllKeysIfTarget() {
    var uri = content.document.documentURI;
    liberator.modes.passAllKeys = isMatch(uri);
    //liberator.log('load page: ' + gBrowser.selectedBrowser.contentDocument.URL);
}

function isMatch(uri) ignorePagesList.some(function(e) e.test(uri))

})();
// vim:sw=4 ts=4 et:
