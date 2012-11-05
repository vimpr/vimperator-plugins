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
* :gr [position]
* position - the position of the result you would like to access
* if position = 0 it will use the suggestion or if there isn't one with will
* search same string again
* 
* EXAMPLE
* keys can be mapped like so
* nmap ,0 :gr<Space>0<CR> 
* nmap ,1 :gr<Space>1<CR> 
* nmap ,2 :gr<Space>2<CR> 
* etc...
* the you only need to press ,1 to access first result...
*
* HISTORY
* 2012/02/29 ver. 0.2 - initial written.
*
*/

(function() {

commands.addUserCommand(["gr"],
    "Google Results",
    function (args) {
        var doc = window.content.document;
        if(args >= 1) {
            var results = doc.querySelectorAll("div > ol > li > div > h3 > a");
            if(args <= results.length) {
                results[args - 1].click(); 
            }
            else {
                console.error("Not that many results");
            }
        }
        else {
            (doc.querySelector("div > p > a.spell") || doc.querySelector("div > button")).click();
        }
    });
})();
