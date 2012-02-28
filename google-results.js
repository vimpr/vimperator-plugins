/**
* ==VimperatorPlugin==
* @name google-results.js
* @description provides quick access to google results
* @author whatsthebeef (whiskeytangobravo@gmail.com, http://www.whatsthebeef.org)
* @version 0.1
* @minversion 2.0pre
* ==/VimperatorPlugin==
*
* LICENSE
* Creative Commons
*
* USAGE
* :gr [index]
* index - the index of the result you would like to access
* 
* EXAMPLE
* keys can be mapped like so
* nmap ,1 :gr<Space>0<CR> 
* nmap ,2 :gr<Space>1<CR> 
* etc...
* the you only need to press ,1 to access first result...
*
* HISTORY
* 2012/02/27 ver. 0.1 - initial written.
*
*/

(function() {

commands.addUserCommand(["gr"],
    "Google Results",
    function (args) {
        window.content.document.querySelectorAll("div > ol > li > div > h3 > a")[args].click();
    });
})();
