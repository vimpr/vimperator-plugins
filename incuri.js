/**
 * ==VimperatorPlugin==
 * @name           incuri.js
 * @description    increment number in URI
 * @description-ja URIに含まれる数字をインクリメント
 * @author         hogelog
 * @version        0.01
 * ==/VimperatorPlugin==
 *
 * COMMANDS:
 *  :incuri -> Increment number in URI
 *  :decuri -> Decrement number in URI
 *
 */

(function(){
    var numreg = /^(.+[^\d])(\d+)([^\d]*)$/;
    function numstr(num, len) {
        var str = String(num);
        while(str.length<len) {
            str = "0" + str;
        }
        return str;
    }
    function makeinc(f) {
        return function() {
            let uri = window.content.location.href;
            if(numreg.test(uri)) {
                let num = RegExp.$2;
                let nextnum = numstr(f(parseInt(num)), num.length);
                let nexturi = RegExp.$1 + nextnum + RegExp.$3;
                window.content.location.href = nexturi;
            } else {
                liberator.echoerr("Cannot find number in "+uri);
            }
        };
    }
    liberator.commands.add(["incuri"], "Increment number in URI",
        makeinc(function(x) {return x+1}));
    liberator.commands.add(["decuri"], "Decrement number in URI",
        makeinc(function(x) {return x-1}));
})();
// vim: set sw=4 ts=4 et:
