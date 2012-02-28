/**
* ==VimperatorPlugin==
* @name google-results.js
* @description helps to select google results
* @author john bower (whiskeytangobravo@gmail.com, http://www.whatsthebeef.org)
* @version 0.1
* @minversion 2.0pre
* ==/VimperatorPlugin==
*
* LICENSE
* Creative Commons
*
* USAGE
*
* EXAMPLE
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
