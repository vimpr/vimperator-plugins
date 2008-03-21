/**
 * lookup dictionary (vimperator plugin)
 * For vimperator 0.5.3
 * @author teramako teramako@gmail.com
 * @version 0.1
 *
 * Lookup web dictionary
 * And show the result in the bottom of the window
 */
(function(){
const dictionalyList = [
	{
		names: ['eiji[ro]'],
		url: 'http://eow.alc.co.jp/%s/UTF-8/',
		shortHelp: '英辞郎',
		xpath: '//*[@id="resultList"]'
	},{
		names: ['goo'],
		url: 'http://dictionary.goo.ne.jp/search.php?MT=%s&kind=all&mode=0',
		shortHelp: 'goo辞書',
		encode: 'EUC-JP',
		xpath: '//div[@id="incontents"]/*[@class="ch04" or @class="fs14" or contains(@class,"diclst")]',
		multi: true
	}
];
for (var i=0; i<dictionalyList.length; i++){
	let j = i;
	liberator.commands.addUserCommand(
		dictionalyList[j].names,
		dictionalyList[j].shortHelp,
		function(arg,special){
			var sel = window.content.document.getSelection();
			if (special && sel) arg = sel;
			if (!arg) return;
			var url;
			if (dictionalyList[j].encode){
				var ttbu = Components.classes['@mozilla.org/intl/texttosuburi;1']
				                     .getService( Components.interfaces.nsITextToSubURI);
				url = dictionalyList[j].url.replace(/%s/g, ttbu.ConvertAndEscape(dictionalyList[j].encode, arg));
			} else {
				url = dictionalyList[j].url.replace(/%s/g,encodeURI(arg));
			}
			//liberator.log('URL: ' +url);
			var result;
			getHTML(url, function(str){
				var doc = createHTMLDocument(str);
				var result = getNodeFromXPath(dictionalyList[j].xpath, doc, dictionalyList[j].multi);
				if (!result){
					liberator.echoerr('Nothing to show...');
				}
				var xs = new XMLSerializer();
				liberator.echo('<base href="' + url + '"/>' + xs.serializeToString( result ), true);
			});
		},{}
	);
}
/**
 * @param {String} url
 * @param {Function} callback
 */
function getHTML(url, callback){
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
	xhr.send(null);
}
/**
 * @param {String} str
 * @return {DOMDocument}
 */
function createHTMLDocument(str){
	str = str.replace(/^[\s\S]*?<html[^>]*>|[\r\n]+|<\/html\s*>[\s\S]*$/ig, '');
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

// vim: set fdm=marker sw=4 ts=4 et:
