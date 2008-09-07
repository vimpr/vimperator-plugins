/**
 * ==VimperatorPlugin==
 * @name lookup dictionary (Vimperator plugin)
 * @description    Lookup words from Web dictionaries, and show the results in the bottom of the window
 * @description-ja Web上の辞書を引いた結果をコマンドライン・バッファへ出力します
 * @author teramako teramako@gmail.com
 * @version 0.2
 * ==/VimperatorPlugin==
 */
(function(){
[{
    names: ['eiji[ro]'],
    url: 'http://eow.alc.co.jp/%s/UTF-8/',
    shortHelp: 'SPACE ALC (英辞郎 on the Web)',
    xpath: '//*[@id="resultList"]'
},{
    names: ['goo'],
    url: 'http://dictionary.goo.ne.jp/search.php?MT=%s&kind=all&mode=0',
    shortHelp: 'goo 辞書',
    encode: 'EUC-JP',
    xpath: '//div[@id="incontents"]/*[@class="ch04" or @class="fs14" or contains(@class,"diclst")]',
    multi: true
}].forEach(function(dictionary){
    liberator.commands.addUserCommand(
        dictionary.names,
        dictionary.shortHelp,
        function(arg,special){
            var sel = (window.content.window.getSelection) ?
                window.content.window.getSelection().toString() : null;
            if (special && sel) arg = sel;
            if (!arg) return;
            var url;
            if (dictionary.encode){
                var ttbu = Components.classes['@mozilla.org/intl/texttosuburi;1']
                                     .getService( Components.interfaces.nsITextToSubURI);
                url = dictionary.url.replace(/%s/g, ttbu.ConvertAndEscape(dictionary.encode, arg));
            } else {
                url = dictionary.url.replace(/%s/g,encodeURI(arg));
            }
            //liberator.log('URL: ' +url);
            var result;
            getHTML(url, function(str){
                var doc = createHTMLDocument(str);
                var result = getNodeFromXPath(dictionary.xpath, doc, dictionary.multi);
                if (!result){
                    liberator.echoerr('Nothing to show...');
                }
                var xs = new XMLSerializer();
                liberator.echo('<base href="' + url + '"/>' + xs.serializeToString( result ), true);
            }, dictionary.encode ? dictionary.encode : 'UTF-8');
        },{}
    );
});
/**
 * @param {String} url
 * @param {Function} callback
 * @param {String} charset
 */
function getHTML(url, callback, charset){
    var xhr= new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){
            if (xhr.status == 200){
                callback.call(this,xhr.responseText);
            } else {
                throw new Error(xhr.statusText);
            }
        }
    };
    xhr.open('GET',url,true);
    xhr.overrideMimeType('text/html; charset=' + charset);
    xhr.send(null);
}
/**
 * @param {String} str
 * @return {DOMDocument}
 */
function createHTMLDocument(str){
    str = str.replace(/^[\s\S]*?<html(?:\s[^>]+?)?>|<\/html\s*>[\S\s]*$/ig,'').replace(/[\r\n]+/g,' ');
    var htmlFragment = document.implementation.createDocument(null,'html',null);
    var range = document.createRange();
    range.setStartAfter(window.content.document.body);
    htmlFragment.documentElement.appendChild(htmlFragment.importNode(range.createContextualFragment(str),true));
    return htmlFragment;
}
/**
 * @param {String} xpath XPath Expression
 * @param {DOMDocument} doc
 * @param {Boolean} isMulti
 * @return {Element}
 */
function getNodeFromXPath(xpath,doc,isMulti){
    if (!xpath || !doc) return;
    var result;
    if (isMulti){
        var nodesSnapshot = doc.evaluate(xpath,doc.documentElement,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
        if (nodesSnapshot.snapshotLength == 0) return;
        result = document.createElementNS(null,'div');
        for (var i=0; i<nodesSnapshot.snapshotLength; result.appendChild(nodesSnapshot.snapshotItem(i++)));
    } else {
        var node = doc.evaluate(xpath,doc.documentElement,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null);
        if (!node.singleNodeValue) return;
        result = node.singleNodeValue;
    }
    return result;
}
})();

// vim: fdm=marker sw=4 ts=4 et:
