/**
 * ==VimperatorPlugin==
 * @name           incuri.js
 * @description    increment the number in the URI
 * @description-ja URIに含まれる数字をインクリメント
 * @author         hogelog
 * @version        0.02
 * ==/VimperatorPlugin==
 *
 * COMMANDS:
 *  :decdomain   -> Increment the number in the domain name
 *  :decfragment -> Increment the number in the fragment ID
 *  :decpath     -> Increment the number in the path name
 *  :decport     -> Increment the number in the port number
 *  :decquery    -> Increment the number in the query string
 *  :decuri      -> Decrement the number in the URI
 *  :incdomain   -> Increment the number in the domain name
 *  :incfragment -> Increment the number in the fragment ID
 *  :incpath     -> Increment the number in the path name
 *  :incport     -> Increment the number in the port number
 *  :incquery    -> Increment the number in the query string
 *  :incuri      -> Increment the number in the URI
 *
 */

(function() {
    var numreg = /^(.*\D|)(\d+)(\D*)$/;
    function numstr(num, len) {
        var str = String(num);
        while(str.length<len) {
            str = "0" + str;
        }
        return str;
    }
    function makeinc(f, p)
        function(arg) {
            var l = window.content.location;
            var part = l[p];
            if(p == "port" && part == "") {
                part = "80";
            }
            if(numreg.test(part)) {
                let num = RegExp.$2;
                let nextnum = numstr(f(parseInt(num)), num.length);
                let newpart = RegExp.$1 + nextnum + RegExp.$3;
                if(p == "href") {
                    window.content.location.href = newpart;
                } else {
                    window.content.location.href = [
                        "protocol", "//", "hostname", ":", "port", "pathname",
                        "search", "hash"
                    ].map(function(part) part.length > 2 ? p == part ? newpart
                                                                     : l[part]
                                                         : part)
                     .join("");
                }
            } else {
                liberator.echoerr("Cannot find a number in the " +
                                  p + " <" + part + ">");
            }
        };
    [
        ["uri",      "href",     "URI"],
        ["path",     "pathname", "path name"],
        ["query",    "search",   "query string"],
        ["fragment", "hash",     "fragment ID"],
        ["port",     "port",     "port number"],
        ["domain",   "hostname", "domain name"]
    ].forEach(function(part) {
        var [suffix, prop, name] = part;
        [
            ["In", 1], ["De", -1]
        ].forEach(function(direction) {
            var [prefix, dir] = direction;
            liberator.commands
                     .add([prefix.toLowerCase() + "c" + suffix],
                          prefix + "crement the number in the " + name + ".",
                          makeinc(function(x) x + dir, prop));
        });
    });
})();
// vim: set sw=4 ts=4 sts=4 et:
