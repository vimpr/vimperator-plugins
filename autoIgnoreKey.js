/**
 * Auto switch vimperator key navigation
 *
 * @author teramako teramako@gmail.com
 * @author halt feits <halt.feit at gmail.com>
 * @version 0.6.0
 */

(function(){

/*
 * String or RegExp
 * e.g)
 *  * /^https?:\/\/mail\.google\.com\//
 *  * 'http://reader.livedoor.com/reader/'
 */
var ignorePageList = [
    /^https?:\/\/mail\.google\.com\//,
    'http://reader.livedoor.com/reader/'
];

document.getElementById('appcontent').addEventListener('DOMContentLoaded',function(event){
    if ( isMatch(event.target.documentURI) ){
        liberator.modes.passAllKeys = true;
    } else {
        liberator.modes.passAllKeys = false;
    }
    //liberator.log('load page: ' + gBrowser.selectedBrowser.contentDocument.URL);
},false);

getBrowser().mTabBox.addEventListener('TabSelect',function(event){
    var uri = this.parentNode.currentURI.spec;
    if ( isMatch(uri) ){
        liberator.modes.passAllKeys = true;
    } else {
        liberator.modes.passAllKeys = false;
    }
    //liberator.log('select page: ' + gBrowser.selectedBrowser.contentDocument.URL);
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

