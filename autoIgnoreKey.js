/**
 * Auto switch vimperator key navigation
 * For vimperator 0.5.3
 * @author teramako teramako@gmail.com
 * @version 0.3
 */

(function(){
/*
 * String or RegExp
 * e.g)
 *  * /^https?:\/\/mail\.google\.com\//
 *  * 'http://reader.livedoor.com/reader/'
 */
const ignorePageList = [
	/^https?:\/\/mail\.google\.com\//,
	/^http:\/\/reader\.livedoor\.com\/(?:reader|public)\//
];
document.getElementById('appcontent').addEventListener('DOMContentLoaded',function(event){
	if (event.target.documentURI != gBrowser.currentURI.spec) return;
	if ( isMatch(event.target.documentURI) ){
		vimperator.addMode(null, vimperator.modes.ESCAPE_ALL_KEYS);
	} else {
		vimperator.setMode(vimperator.modes.NORMAL);
	}
	//vimperator.log('load page: ' + gBrowser.selectedBrowser.contentDocument.URL);
},false);
getBrowser().mTabBox.addEventListener('TabSelect',function(event){
	var uri = this.parentNode.currentURI.spec;
	if ( isMatch(uri) ){
		vimperator.addMode(null, vimperator.modes.ESCAPE_ALL_KEYS);
	} else {
		vimperator.setMode(vimperator.modes.NORMAL);
	}
	//vimperator.log('select page: ' + gBrowser.selectedBrowser.contentDocument.URL);
},false);
function isMatch(uri){
	return ignorePageList.some(function(e,i,a){
		if (typeof e == 'string'){
			return uri.indexOf(e) != -1;
		} else if (e instanceof RegExp){
			return e.test(uri);
		}
	});
}
})();

// vim: set fdm=marker sw=4 ts=4 et:
