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
        if(args.length >= 1) {
            var num = parseInt(args.literalArg, 10);
            var results = doc.querySelectorAll("div > ol > li > div > h3 > a");
            if(num <= results.length) {
                results[num - 1].click(); 
            }
            else {
                console.error("Not that many results");
            }
        }
        else {
            (doc.querySelector("div > p > a.spell") || doc.querySelector("div > button")).click();
        }
    }, {
      literal: 0,
      completer: function (context, args) {
        var doc = window.content.document;
        var es = doc.querySelectorAll("div > ol > li > div > h3 > a");
        context.compare = false;
        context.title = ['Title', 'URL'];
        context.completions = [
          [(n + 1) + ': ' + e.textContent, e.href]
          for ([n, e] in Iterator(Array.slice(es)))
        ];
      }
    }, true);
})();
