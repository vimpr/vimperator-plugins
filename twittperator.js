/*
 * Twittperator
 * Vimperator用Twitterクライアント
 *
 * 最初にPINコードを取得し設定する必要があります。
 * :tw -getPIN
 * 実行すると新規タブに本アプリケーションを許可するかを問うページが開かれます
 * 許可をすると、PINコード(数値)が表示されるのでコピーしてください。
 *
 * :tw -setPIN コピーしたPINコード
 * で初期設定完了です。
 *
 * コマンド
 * :tw[ittperator] ～
 *
 * :tw -getPIN
 * :tw -setPIN {PINcode}
 *   初期設定時のみのコマンド
 *
 * :tw[!]
 *  タイムライン表示。!が付くと強制的に取得
 *  !が付いていない場合はキャッシュから表示（賞味期限が切れている場合は再取得）
 *
 * :tw ～
 *  ポスト
 *
 * @see http://twitter.com/oauth_clients/details/197565
 */

(function() {
  // TwitterOauth for Greasemonkey
  function TwitterOauth() {
      this.initialize.apply(this, arguments);
  }

  // OAuth {{{
  TwitterOauth.prototype = (function() {

    // {{{2 oauth.js
    /*
      OAuth.js
      SHA-1.js
      TwitterOauth for Greasemonkey
    */

    /*
     * Copyright 2008 Netflix, Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */

    /* Here's some JavaScript software for implementing OAuth.

       This isn't as useful as you might hope.  OAuth is based around
       allowing tools and websites to talk to each other.  However,
       JavaScript running in web browsers is hampered by security
       restrictions that prevent code running on one website from
       accessing data stored or served on another.

       Before you start hacking, make sure you understand the limitations
       posed by cross-domain XMLHttpRequest.

       On the bright side, some platforms use JavaScript as their
       language, but enable the programmer to access other web sites.
       Examples include Google Gadgets, and Microsoft Vista Sidebar.
       For those platforms, this library should come in handy.
    */

    // The HMAC-SHA1 signature method calls b64_hmac_sha1, defined by
    // http://pajhome.org.uk/crypt/md5/sha1.js

    /* An OAuth message is represented as an object like this:
       {method: "GET", action: "http://server.com/path", parameters: ...}

       The parameters may be either a map {name: value, name2: value2}
       or an Array of name-value pairs [[name, value], [name2, value2]].
       The latter representation is more powerful: it supports parameters
       in a specific sequence, or several parameters with the same name;
       for example [["a", 1], ["b", 2], ["a", 3]].

       Parameter names and values are NOT percent-encoded in an object.
       They must be encoded before transmission and decoded after reception.
       For example, this message object:
       {method: "GET", action: "http://server/path", parameters: {p: "x y"}}
       ... can be transmitted as an HTTP request that begins:
       GET /path?p=x%20y HTTP/1.0
       (This isn't a valid OAuth request, since it lacks a signature etc.)
       Note that the object "x y" is transmitted as x%20y.  To encode
       parameters, you can call OAuth.addToURL, OAuth.formEncode or
       OAuth.getAuthorization.

       This message object model harmonizes with the browser object model for
       input elements of an form, whose value property isn't percent encoded.
       The browser encodes each value before transmitting it. For example,
       see consumer.setInputs in example/consumer.js.
     */

    /* This script needs to know what time it is. By default, it uses the local
       clock (new Date), which is apt to be inaccurate in browsers. To do
       better, you can load this script from a URL whose query string contains
       an oauth_timestamp parameter, whose value is a current Unix timestamp.
       For example, when generating the enclosing document using PHP:

       <script src="oauth.js?oauth_timestamp=<?=time()?>" ...

       Another option is to call OAuth.correctTimestamp with a Unix timestamp.
     */


    var OAuth; if (OAuth == null) OAuth = {};
    OAuth.setProperties = function setProperties(into, from) {
        if (into != null && from != null) {
            for (var key in from) {
                into[key] = from[key];
            }
        }
        return into;
    }

    OAuth.setProperties(OAuth, // utility functions
    {
        percentEncode: function percentEncode(s) {
            if (s == null) {
                return "";
            }
            if (s instanceof Array) {
                var e = "";
                for (var i = 0; i < s.length; ++s) {
                    if (e != "") e += "&";
                    e += OAuth.percentEncode(s[i]);
                }
                return e;
            }
            s = encodeURIComponent(s);
            // Now replace the values which encodeURIComponent doesn't do
            // encodeURIComponent ignores: - _ . ! ~ * ' ( )
            // OAuth dictates the only ones you can ignore are: - _ . ~
            // Source: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Functions:encodeURIComponent
            s = s.replace(/!/g, "%21");
            s = s.replace(/\*/g, "%2A");
            s = s.replace(/'/g, "%27");
            s = s.replace(/\(/g, "%28");
            s = s.replace(/\)/g, "%29");
            return s;
        }
    ,
        decodePercent: function decodePercent(s) {
            if (s != null) {
                // Handle application/x-www-form-urlencoded, which is defined by
                // http://www.w3.org/TR/html4/interact/forms.html#h-17.13.4.1
                s = s.replace(/\+/g, " ");
            }
            return decodeURIComponent(s);
        }
    ,
        /** Convert the given parameters to an Array of name-value pairs. */
        getParameterList: function getParameterList(parameters) {
            if (parameters == null) {
                return [];
            }
            if (typeof parameters != "object") {
                return OAuth.decodeForm(parameters + "");
            }
            if (parameters instanceof Array) {
                return parameters;
            }
            var list = [];
            for (var p in parameters) {
                list.push([p, parameters[p]]);
            }
            return list;
        }
    ,
        /** Convert the given parameters to a map from name to value. */
        getParameterMap: function getParameterMap(parameters) {
            if (parameters == null) {
                return {};
            }
            if (typeof parameters != "object") {
                return OAuth.getParameterMap(OAuth.decodeForm(parameters + ""));
            }
            if (parameters instanceof Array) {
                var map = {};
                for (var p = 0; p < parameters.length; ++p) {
                    var key = parameters[p][0];
                    if (map[key] === undefined) { // first value wins
                        map[key] = parameters[p][1];
                    }
                }
                return map;
            }
            return parameters;
        }
    ,
        getParameter: function getParameter(parameters, name) {
            if (parameters instanceof Array) {
                for (var p = 0; p < parameters.length; ++p) {
                    if (parameters[p][0] == name) {
                        return parameters[p][1]; // first value wins
                    }
                }
            } else {
                return OAuth.getParameterMap(parameters)[name];
            }
            return null;
        }
    ,
        formEncode: function formEncode(parameters) {
            var form = "";
            var list = OAuth.getParameterList(parameters);
            for (var p = 0; p < list.length; ++p) {
                var value = list[p][1];
                if (value == null) value = "";
                if (form != "") form += "&";
                form += OAuth.percentEncode(list[p][0])
                  +"="+ OAuth.percentEncode(value);
            }
            return form;
        }
    ,
        decodeForm: function decodeForm(form) {
            var list = [];
            var nvps = form.split("&");
            for (var n = 0; n < nvps.length; ++n) {
                var nvp = nvps[n];
                if (nvp == "") {
                    continue;
                }
                var equals = nvp.indexOf("=");
                var name;
                var value;
                if (equals < 0) {
                    name = OAuth.decodePercent(nvp);
                    value = null;
                } else {
                    name = OAuth.decodePercent(nvp.substring(0, equals));
                    value = OAuth.decodePercent(nvp.substring(equals + 1));
                }
                list.push([name, value]);
            }
            return list;
        }
    ,
        setParameter: function setParameter(message, name, value) {
            var parameters = message.parameters;
            if (parameters instanceof Array) {
                for (var p = 0; p < parameters.length; ++p) {
                    if (parameters[p][0] == name) {
                        if (value === undefined) {
                            parameters.splice(p, 1);
                        } else {
                            parameters[p][1] = value;
                            value = undefined;
                        }
                    }
                }
                if (value !== undefined) {
                    parameters.push([name, value]);
                }
            } else {
                parameters = OAuth.getParameterMap(parameters);
                parameters[name] = value;
                message.parameters = parameters;
            }
        }
    ,
        setParameters: function setParameters(message, parameters) {
            var list = OAuth.getParameterList(parameters);
            for (var i = 0; i < list.length; ++i) {
                OAuth.setParameter(message, list[i][0], list[i][1]);
            }
        }
    ,
        /** Fill in parameters to help construct a request message.
            This function doesn't fill in every parameter.
            The accessor object should be like:
            {consumerKey:"foo", consumerSecret:"bar", accessorSecret:"nurn", token:"krelm", tokenSecret:"blah"}
            The accessorSecret property is optional.
         */
        completeRequest: function completeRequest(message, accessor) {
            if (message.method == null) {
                message.method = "GET";
            }
            var map = OAuth.getParameterMap(message.parameters);
            if (map.oauth_consumer_key == null) {
                OAuth.setParameter(message, "oauth_consumer_key", accessor.consumerKey || "");
            }
            if (map.oauth_token == null && accessor.token != null) {
                OAuth.setParameter(message, "oauth_token", accessor.token);
            }
            if (map.oauth_version == null) {
                OAuth.setParameter(message, "oauth_version", "1.0");
            }
            if (map.oauth_timestamp == null) {
                OAuth.setParameter(message, "oauth_timestamp", OAuth.timestamp());
            }
            if (map.oauth_nonce == null) {
                OAuth.setParameter(message, "oauth_nonce", OAuth.nonce(6));
            }
            OAuth.SignatureMethod.sign(message, accessor);
        }
    ,
        setTimestampAndNonce: function setTimestampAndNonce(message) {
            OAuth.setParameter(message, "oauth_timestamp", OAuth.timestamp());
            OAuth.setParameter(message, "oauth_nonce", OAuth.nonce(6));
        }
    ,
        addToURL: function addToURL(url, parameters) {
            newURL = url;
            if (parameters != null) {
                var toAdd = OAuth.formEncode(parameters);
                if (toAdd.length > 0) {
                    var q = url.indexOf("?");
                    if (q < 0) newURL += "?";
                    else       newURL += "&";
                    newURL += toAdd;
                }
            }
            return newURL;
        }
    ,
        /** Construct the value of the Authorization header for an HTTP request. */
        getAuthorizationHeader: function getAuthorizationHeader(realm, parameters) {
            var header = 'OAuth realm="' + OAuth.percentEncode(realm) + '"';
            var list = OAuth.getParameterList(parameters);
            for (var p = 0; p < list.length; ++p) {
                var parameter = list[p];
                var name = parameter[0];
                if (name.indexOf("oauth_") == 0) {
                    header += "," + OAuth.percentEncode(name) + '="' + OAuth.percentEncode(parameter[1]) + '"';
                }
            }
            return header;
        }
    ,
        /** Correct the time using a parameter from the URL from which the last script was loaded. */
        correctTimestampFromSrc: function correctTimestampFromSrc(parameterName) {
            parameterName = parameterName || "oauth_timestamp";
            var scripts = document.getElementsByTagName("script");
            if (scripts == null || !scripts.length) return;
            var src = scripts[scripts.length-1].src;
            if (!src) return;
            var q = src.indexOf("?");
            if (q < 0) return;
            parameters = OAuth.getParameterMap(OAuth.decodeForm(src.substring(q+1)));
            var t = parameters[parameterName];
            if (t == null) return;
            OAuth.correctTimestamp(t);
        }
    ,
        /** Generate timestamps starting with the given value. */
        correctTimestamp: function correctTimestamp(timestamp) {
            OAuth.timeCorrectionMsec = (timestamp * 1000) - (new Date()).getTime();
        }
    ,
        /** The difference between the correct time and my clock. */
        timeCorrectionMsec: 0
    ,
        timestamp: function timestamp() {
            var t = (new Date()).getTime() + OAuth.timeCorrectionMsec;
            return Math.floor(t / 1000);
        }
    ,
        nonce: function nonce(length) {
            var chars = OAuth.nonce.CHARS;
            var result = "";
            for (var i = 0; i < length; ++i) {
                var rnum = Math.floor(Math.random() * chars.length);
                result += chars.substring(rnum, rnum+1);
            }
            return result;
        }
    });

    OAuth.nonce.CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";

    /** Define a constructor function,
        without causing trouble to anyone who was using it as a namespace.
        That is, if parent[name] already existed and had properties,
        copy those properties into the new constructor.
     */
    OAuth.declareClass = function declareClass(parent, name, newConstructor) {
        var previous = parent[name];
        parent[name] = newConstructor;
        if (newConstructor != null && previous != null) {
            for (var key in previous) {
                if (key != "prototype") {
                    newConstructor[key] = previous[key];
                }
            }
        }
        return newConstructor;
    }

    /** An abstract algorithm for signing messages. */
    OAuth.declareClass(OAuth, "SignatureMethod", function OAuthSignatureMethod() {});

    OAuth.setProperties(OAuth.SignatureMethod.prototype, // instance members
    {
        /** Add a signature to the message. */
        sign: function sign(message) {
            var baseString = OAuth.SignatureMethod.getBaseString(message);
            var signature = this.getSignature(baseString);
            OAuth.setParameter(message, "oauth_signature", signature);
            return signature; // just in case someone's interested
        }
    ,
        /** Set the key string for signing. */
        initialize: function initialize(name, accessor) {
            var consumerSecret;
            if (accessor.accessorSecret != null
                && name.length > 9
                && name.substring(name.length-9) == "-Accessor")
            {
                consumerSecret = accessor.accessorSecret;
            } else {
                consumerSecret = accessor.consumerSecret;
            }
            this.key = OAuth.percentEncode(consumerSecret)
                 +"&"+ OAuth.percentEncode(accessor.tokenSecret);
        }
    });

    /* SignatureMethod expects an accessor object to be like this:
       {tokenSecret: "lakjsdflkj...", consumerSecret: "QOUEWRI..", accessorSecret: "xcmvzc..."}
       The accessorSecret property is optional.
     */
    // Class members:
    OAuth.setProperties(OAuth.SignatureMethod, // class members
    {
        sign: function sign(message, accessor) {
            var name = OAuth.getParameterMap(message.parameters).oauth_signature_method;
            if (name == null || name == "") {
                name = "HMAC-SHA1";
                OAuth.setParameter(message, "oauth_signature_method", name);
            }
            OAuth.SignatureMethod.newMethod(name, accessor).sign(message);
        }
    ,
        /** Instantiate a SignatureMethod for the given method name. */
        newMethod: function newMethod(name, accessor) {
            var impl = OAuth.SignatureMethod.REGISTERED[name];
            if (impl != null) {
                var method = new impl();
                method.initialize(name, accessor);
                return method;
            }
            var err = new Error("signature_method_rejected");
            var acceptable = "";
            for (var r in OAuth.SignatureMethod.REGISTERED) {
                if (acceptable != "") acceptable += "&";
                acceptable += OAuth.percentEncode(r);
            }
            err.oauth_acceptable_signature_methods = acceptable;
            throw err;
        }
    ,
        /** A map from signature method name to constructor. */
        REGISTERED : {}
    ,
        /** Subsequently, the given constructor will be used for the named methods.
            The constructor will be called with no parameters.
            The resulting object should usually implement getSignature(baseString).
            You can easily define such a constructor by calling makeSubclass, below.
         */
        registerMethodClass: function registerMethodClass(names, classConstructor) {
            for (var n = 0; n < names.length; ++n) {
                OAuth.SignatureMethod.REGISTERED[names[n]] = classConstructor;
            }
        }
    ,
        /** Create a subclass of OAuth.SignatureMethod, with the given getSignature function. */
        makeSubclass: function makeSubclass(getSignatureFunction) {
            var superClass = OAuth.SignatureMethod;
            var subClass = function() {
                superClass.call(this);
            }
            subClass.prototype = new superClass();
            // Delete instance variables from prototype:
            // delete subclass.prototype... There aren't any.
            subClass.prototype.getSignature = getSignatureFunction;
            subClass.prototype.constructor = subClass;
            return subClass;
        }
    ,
        getBaseString: function getBaseString(message) {
            var URL = message.action;
            var q = URL.indexOf("?");
            var parameters;
            if (q < 0) {
                parameters = message.parameters;
            } else {
                // Combine the URL query string with the other parameters:
                parameters = OAuth.decodeForm(URL.substring(q + 1));
                var toAdd = OAuth.getParameterList(message.parameters);
                for (var a = 0; a < toAdd.length; ++a) {
                    parameters.push(toAdd[a]);
                }
            }
            return OAuth.percentEncode(message.method.toUpperCase())
             +"&"+ OAuth.percentEncode(OAuth.SignatureMethod.normalizeUrl(URL))
             +"&"+ OAuth.percentEncode(OAuth.SignatureMethod.normalizeParameters(parameters));
        }
    ,
        normalizeUrl: function normalizeUrl(url) {
            var uri = OAuth.SignatureMethod.parseUri(url);
            var scheme = uri.protocol.toLowerCase();
            var authority = uri.authority.toLowerCase();
            var dropPort = (scheme == "http" && uri.port == 80)
                        || (scheme == "https" && uri.port == 443);
            if (dropPort) {
                // find the last : in the authority
                var index = authority.lastIndexOf(":");
                if (index >= 0) {
                    authority = authority.substring(0, index);
                }
            }
            var path = uri.path;
            if (!path) {
                path = "/"; // conforms to RFC 2616 section 3.2.2
            }
            // we know that there is no query and no fragment here.
            return scheme + "://" + authority + path;
        }
    ,
        parseUri: function parseUri(str) {
            /* This function was adapted from parseUri 1.2.1
               http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
             */
            var o = {key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
                     parser: {strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/ }};
            var m = o.parser.strict.exec(str);
            var uri = {};
            var i = 14;
            while (i--) uri[o.key[i]] = m[i] || "";
            return uri;
        }
    ,
        normalizeParameters: function normalizeParameters(parameters) {
            if (parameters == null) {
                return "";
            }
            var list = OAuth.getParameterList(parameters);
            var sortable = [];
            for (var p = 0; p < list.length; ++p) {
                var nvp = list[p];
                if (nvp[0] != "oauth_signature") {
                    sortable.push([ OAuth.percentEncode(nvp[0])
                                  + " " // because it comes before any character that can appear in a percentEncoded string.
                                  + OAuth.percentEncode(nvp[1])
                                  , nvp]);
                }
            }
            sortable.sort(function(a,b) {
                              if (a[0] < b[0]) return -1;
                              if (a[0] > b[0]) return 1;
                              return 0;
                          });
            var sorted = [];
            for (var s = 0; s < sortable.length; ++s) {
                sorted.push(sortable[s][1]);
            }
            return OAuth.formEncode(sorted);
        }
    });

    OAuth.SignatureMethod.registerMethodClass(["PLAINTEXT", "PLAINTEXT-Accessor"],
        OAuth.SignatureMethod.makeSubclass(
            function getSignature(baseString) {
                return this.key;
            }
        ));

    OAuth.SignatureMethod.registerMethodClass(["HMAC-SHA1", "HMAC-SHA1-Accessor"],
        OAuth.SignatureMethod.makeSubclass(
            function getSignature(baseString) {
                b64pad = "=";
                var signature = b64_hmac_sha1(this.key, baseString);
                return signature;
            }
        ));

    // oauth.js 2}}}
    // {{{2 sha1.js
    /*
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
     * in FIPS PUB 180-1
     * Version 2.1a Copyright Paul Johnston 2000 - 2002.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * Distributed under the BSD License
     * See http://pajhome.org.uk/crypt/md5 for details.
     */

    /*
     * Configurable variables. You may need to tweak these to be compatible with
     * the server-side, but the defaults work in most cases.
     */
    var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
    var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
    var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

    /*
     * These are the functions you'll usually want to call
     * They take string arguments and return either hex or base-64 encoded strings
     */
    function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
    function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
    function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
    function hex_hmac_sha1(key, data){return binb2hex(core_hmac_sha1(key, data));}
    function b64_hmac_sha1(key, data){return binb2b64(core_hmac_sha1(key, data));}
    function str_hmac_sha1(key, data){return binb2str(core_hmac_sha1(key, data));}

    /*
     * Perform a simple self-test to see if the VM is working
     */
    function sha1_vm_test()
    {
      return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
    }

    /*
     * Calculate the SHA-1 of an array of big-endian words, and a bit length
     */
    function core_sha1(x, len)
    {
      /* append padding */
      x[len >> 5] |= 0x80 << (24 - len % 32);
      x[((len + 64 >> 9) << 4) + 15] = len;

      var w = Array(80);
      var a =  1732584193;
      var b = -271733879;
      var c = -1732584194;
      var d =  271733878;
      var e = -1009589776;

      for (var i = 0; i < x.length; i += 16)
      {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        var olde = e;

        for (var j = 0; j < 80; j++)
        {
          if (j < 16) w[j] = x[i + j];
          else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
          var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                           safe_add(safe_add(e, w[j]), sha1_kt(j)));
          e = d;
          d = c;
          c = rol(b, 30);
          b = a;
          a = t;
        }

        a = safe_add(a, olda);
        b = safe_add(b, oldb);
        c = safe_add(c, oldc);
        d = safe_add(d, oldd);
        e = safe_add(e, olde);
      }
      return Array(a, b, c, d, e);

    }

    /*
     * Perform the appropriate triplet combination function for the current
     * iteration
     */
    function sha1_ft(t, b, c, d)
    {
      if (t < 20) return (b & c) | ((~b) & d);
      if (t < 40) return b ^ c ^ d;
      if (t < 60) return (b & c) | (b & d) | (c & d);
      return b ^ c ^ d;
    }

    /*
     * Determine the appropriate additive constant for the current iteration
     */
    function sha1_kt(t)
    {
      return (t < 20) ?  1518500249 : (t < 40) ? 1859775393 :
             (t < 60) ? -1894007588 : -899497514;
    }

    /*
     * Calculate the HMAC-SHA1 of a key and some data
     */
    function core_hmac_sha1(key, data)
    {
      var bkey = str2binb(key);
      if (bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

      var ipad = Array(16), opad = Array(16);
      for (var i = 0; i < 16; i++)
      {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
      }

      var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
      return core_sha1(opad.concat(hash), 512 + 160);
    }

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function safe_add(x, y)
    {
      var lsw = (x & 0xFFFF) + (y & 0xFFFF);
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    function rol(num, cnt)
    {
      return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
     * Convert an 8-bit or 16-bit string to an array of big-endian words
     * In 8-bit function, characters >255 have their hi-byte silently ignored.
     */
    function str2binb(str)
    {
      var bin = Array();
      var mask = (1 << chrsz) - 1;
      for (var i = 0; i < str.length * chrsz; i += chrsz)
        bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
      return bin;
    }

    /*
     * Convert an array of big-endian words to a string
     */
    function binb2str(bin)
    {
      var str = "";
      var mask = (1 << chrsz) - 1;
      for (var i = 0; i < bin.length * 32; i += chrsz)
        str += String.fromCharCode((bin[i>>5] >>> (32 - chrsz - i%32)) & mask);
      return str;
    }

    /*
     * Convert an array of big-endian words to a hex string.
     */
    function binb2hex(binarray)
    {
      var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
      var str = "";
      for (var i = 0; i < binarray.length * 4; i++)
      {
        str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
               hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
      }
      return str;
    }

    /*
     * Convert an array of big-endian words to a base-64 string
     */
    function binb2b64(binarray)
    {
      var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var str = "";
      for (var i = 0; i < binarray.length * 4; i += 3)
      {
        var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                    | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                    |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
        for (var j = 0; j < 4; j++)
        {
          if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
          else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
        }
      }
      return str;
    }
    // sha1.js 2}}}

    let p = {
      initialize: function(accessor) {
        if (accessor)
          this.accessor = accessor;
        if (this.isAuthorize()) {
          setup();
        } else {
          preSetup();
        }
      },
      // temp for request
      request : {
        token :"",// response oauth_token
        tokenSecret: ""// response oauth_token_secret
      },
      // トークンが取得済みかの真偽値を返す
      isAuthorize : function() {
        let accessor = this.getAccessor();
        if (accessor.consumerKey && accessor.consumerSecret &&
            accessor.token && accessor.tokenSecret) {
          return true;
        }else{
          return false;
        }
      },
      getAccessor: function() {
        return {
          consumerKey: this.accessor.get("consumerKey",""),
          consumerSecret: this.accessor.get("consumerSecret",""),
          token: this.accessor.get("token",""),
          tokenSecret: this.accessor.get("tokenSecret","")
        };
      },
      deleteAccessor : function() {
        var clientInfo = {
          clientName: this.accessor.get("clientName", ""),
          consumerKey: this.accessor.get("consumerKey",""),
          consumerSecret: this.accessor.get("consumerSecret",""),
        };
        this.accessor.clear();
        this.accessor.set("clientName", clientInfo.clientName);
        this.accessor.set("consumerKey", clientInfo.consumerKey);
        this.accessor.set("consumerSecret", clientInfo.consumerSecret);
      },
      // 認証ページのURLを取得
      getRequestToken : function(callback) {
        let message = {
          method: "GET",
          action: "https://twitter.com/oauth/request_token",
          parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.accessor.get("consumerKey","")
          }
        };
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, this.getAccessor());
        var target = OAuth.addToURL(message.action, message.parameters);
        var self = this;
        var options = {
          method: message.method,
          url: target,
          onload: function(d) {
            if (d.status == 200) {
              var res = d.responseText;
              var parameter = self.getParameter(res);
              self.request.token = parameter["oauth_token"];
              self.request.tokenSecret = parameter["oauth_token_secret"];
              // requestURLを引数にcallback
              if (callback) {
                callback("https://twitter.com/oauth/authorize?oauth_token="+self.request.token);
              }
            }else{
              alert(d.statusText);
            }
          },
        };
        xmlhttpRequest(options);

      },
      setPin: function(pin) {
        let self = this;
        this.getAccessToken(pin, function() {
          liberator.echo("Twittperator: getting access token is success.", true);
          self.initialize();
        });
      },
      // pinを元にAccess Tokenを取得して保存、callbackにはaccessorオブジェクトを渡す
      getAccessToken: function(pin, callback) {
        var message = {
          method: "GET",
          action: "https://twitter.com/oauth/access_token",
          parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.accessor.get("consumerKey",""),
            oauth_token: this.request.token, // Request Token
            oauth_verifier: pin
          }
        };
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, this.request);
        var target = OAuth.addToURL(message.action, message.parameters);
        var self = this;
        var options = {
          method: message.method,
          url: target,
          onload: function(d) {
            if (d.status == 200) {
              /* 返り値からAccess Token/Access Token Secretを取り出す */
              var res = d.responseText;
              var parameter = self.getParameter(res);
              self.accessor.set("token", parameter["oauth_token"]);
              self.accessor.set("tokenSecret", parameter["oauth_token_secret"]);
              // Accessorの保存
              //self.saveAccessor();
              if (callback) {
                callback(self.accessor);
              }
            }else{
              alert(d.statusText);
            }
          },
        };

        xmlhttpRequest(options); // 送信
      },
      // api+?+query にアクセスした結果をcallbackに渡す
      get: function(api, query, callback) {
        var btquery = (query)? "?"+this.buildQuery(query) : "";
        var message = {
          method: "GET",
          action: api + btquery,
          parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.accessor.get("consumerKey",""),// queryの構築
            oauth_token: this.accessor.get("token","") // Access Token
          }
        };
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, this.getAccessor());
        var target = OAuth.addToURL(message.action, message.parameters);
        var options = {
          method: message.method,
          url: target,
          onload: function(d) {
            if (d.status == 200) {
              if (callback) {
                  callback(d.responseText);
              }
            }else{
              callback(d.statusText);
            }
          },
        };
        xmlhttpRequest(options); // 送信
      },
      post: function(api, content, callback) {
        var message = {
          method: "POST",
          action: api,
          parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.accessor.get("consumerKey",""),
            oauth_token: this.accessor.get("token","") // Access Token
          }
        };
        // 送信するデータをパラメータに追加する
        for ( var key in content ) {
          message.parameters[key] = content[key];
        }
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, this.getAccessor());
        var target = OAuth.addToURL(message.action, message.parameters);
        var options = {
          method: message.method,
          url: target,
          onload: function(d) {
            if (d.status == 200) {
              if (callback) {
                  callback(d.responseText);
              }
            } else {
              // typeof d == object
              callback(d);
            }
          }
        };
        xmlhttpRequest(options); // 送信
      },
      getAuthorizationHeader: function(api) {
        var message = {
          method: "GET",
          action: api,
          parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.accessor.get("consumerKey",""),// queryの構築
            oauth_token: this.accessor.get("token",""), // Access Token
            oauth_version: "1.0"
          }
        };
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, this.getAccessor());
        return OAuth.getAuthorizationHeader("Twitter", message.parameters);
      },
      // utility関数
      // http://kevin.vanzonneveld.net
      urlEncode : function(str) {
        str = (str+"").toString();
        return encodeURIComponent(str).replace(/!/g, "%21").replace(/"/g, "%27").replace(/\(/g, "%28")
                                      .replace(/\)/g, "%29").replace(/\*/g, "%2A").replace(/%20/g, "+");
      },
      // オブジェクトからクエリを生成
      buildQuery : function(formdata, numeric_prefix, arg_separator) {
        // * example 1: http_build_query({foo: "bar", php: "hypertext processor", baz: "boom", cow: "milk"}, "", "&amp;");
        // * returns 1: "foo=bar&amp;php=hypertext+processor&amp;baz=boom&amp;cow=milk"
        // * example 2: http_build_query({"php": "hypertext processor", 0: "foo", 1: "bar", 2: "baz", 3: "boom", "cow": "milk"}, "myvar_");
        // * returns 2: "php=hypertext+processor&myvar_0=foo&myvar_1=bar&myvar_2=baz&myvar_3=boom&cow=milk"
        var value, key, tmp = [];
        var self = this;
        var _http_build_query_helper = function(key, val, arg_separator) {
          var k, tmp = [];
          if (val === true) {
            val = "1";
          } else if (val === false) {
            val = "0";
          }
          if (val !== null && typeof val === "object") {
            for (k in val) {
              if (val[k] !== null) {
                tmp.push(_http_build_query_helper(key + "[" + k + "]", val[k], arg_separator));
              }
            }
            return tmp.join(arg_separator);
          } else if (typeof val !== "function") {
            return self.urlEncode(key) + "=" + self.urlEncode(val);
          } else {
            throw new Error("There was an error processing for http_build_query().");
          }
        }

        if (!arg_separator) {
          arg_separator = "&";
        }
        for (key in formdata) {
          value = formdata[key];
          if (numeric_prefix && !isNaN(key)) {
            key = String(numeric_prefix) + key;
          }
          tmp.push(_http_build_query_helper(key, value, arg_separator));
        }

        return tmp.join(arg_separator);
      },
      // Query String から 連想配列を返す
      getParameter: function(str) {
        var dec = decodeURIComponent;
        var par = {}, itm;
        if (typeof str == "undefined") return par;
        if (str.indexOf("?", 0) > -1) str = str.split("?")[1];
        str = str.split("&");
        for (var i = 0; str.length > i; i++){
          itm = str[i].split("=");
          if (itm[0] != "") {
            par[itm[0]] = typeof itm[1] == "undefined" ? true : dec(itm[1]);
          }
        }
        return par;
     }
   };
   return p;
  })();
  // }}}

  // Twittperator
  // ChirpUserStream // {{{
  // XXX if (0) の部分は認証に対するテストコード
  let ChirpUserStream = (function() {
    function extractURL(s)
      let (m = s.match(/https?:\/\/[\S]+/))
        (m && m[0]);

    function stop() {
      let prev = debugVars.prev;

      if (!prev)
        return;

      clearInterval(prev.interval);
      prev.sos.close();
      prev.sis.close();

      delete debugVars.prev;
    }

    function start() {
      liberator.log("Twittperator: start chirp user stream");

      stop();

      let host = "chirpstream.twitter.com";
      let path = "/2b/user.json";

      let get = [
        "GET " + path + " HTTP/1.1",
        "Host: " + host,
        "Authorization: " + tw.getAuthorizationHeader("http://" + host + path),
        "",
        ""
      ].join("\n");

      let socketService =
        let (stsvc = Cc["@mozilla.org/network/socket-transport-service;1"])
          let (svc = stsvc.getService())
            svc.QueryInterface(Ci["nsISocketTransportService"]);

      let transport = socketService.createTransport(null, 0, host, 80, null);
      let os = transport.openOutputStream(0, 0, 0);
      let is = transport.openInputStream(0, 0, 0);
      let sis = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
      let sos = Cc["@mozilla.org/binaryoutputstream;1"].createInstance(Ci.nsIBinaryOutputStream);

      sis.init(is);
      sos.setOutputStream(os);

      sos.write(get, get.length);

      let buf = "";
      let interval = setInterval(function() {
        try {
          let len = sis.available();
          if (len <= 0)
            return;
          let data = sis.read(len);
          let lines = data.split(/\n/);
          if (lines.length > 2) {
            lines[0] = buf + lines[0];
            for (let [, line] in Iterator(lines.slice(0, -1))) {
              try {
                onMsg(JSON.parse(line), line);
              } catch (e) {}
            }
            buf = lines.slice(-1)[0];
          } else {
            buf += data;
          }
        } catch (e) {
          stop();
        }
      }, 500);

      debugVars.prev = {
        sos: sos,
        sis: sis,
        interval: interval,
      };
    }

    function onMsg(msg, raw) {
      listeners.forEach(function(listener) liberator.trapErrors(function() listener(msg, raw)));

      if (msg.text) {
        history.unshift(msg);
        if (history.length > setting.historyLimit)
          history.splice(setting.historyLimit);
      }
    }

    let listeners = [];

    return {
      start: start,
      stop: stop,
      addListener: function(func) listeners.push(func)
    };
  })(); // }}}
  function xmlhttpRequest(options) { // {{{
    let xhr = new XMLHttpRequest();
    xhr.open(options.method, options.url, true);
    if (typeof options.onload == "function") {
      xhr.onload = function() {
        options.onload(xhr);
      }
    }
    xhr.send(null);
  } // }}}
  function unescapeBrakets(str) // {{{
    str.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  // }}}
  function showTL(s) { // {{{
    let html = <style type="text/css"><![CDATA[
        .twitter.user { vertical-align: top; }
        .twitter.entry-content { white-space: normal !important; }
        .twitter.entry-content a { text-decoration: none; }
        .twitter.entry-content.rt:before { content: "RT "; color: silver; }
        img.twitter.photo { border; 0px; width: 16px; height: 16px; vertical-align: baseline; margin: 1px; }
    ]]></style>.toSource()
               .replace(/(?:\r\n|[\r\n])[ \t]*/g, " ") +
        s.reduce(function(table, status) {
          return table.appendChild(
            ("retweeted_status" in status) ?
            let (rt = status.retweeted_status)
            <tr>
              <td class="twitter user">
                <img src={rt.user.profile_image_url} alt={rt.user.screen_name} class="twitter photo"/>
                <strong>{rt.user.screen_name}&#x202C;</strong>
                <img src={status.user.profile_image_url} alt={status.user.screen_name} class="twitter photo"/>
              </td><td class="twitter entry-content rt">
                {detectLink(unescapeBrakets(rt.text))}
              </td>
            </tr> :
            <tr>
              <td class="twitter user">
                <img src={status.user.profile_image_url} alt={status.user.screen_name} class="twitter photo"/>
                <strong title={status.user.name}>{status.user.screen_name}&#x202C;</strong>
              </td><td class="twitter entry-content">
                {detectLink(unescapeBrakets(status.text))}
              </td>
            </tr>
            );

        }, <table/>)
          .toSource().replace(/(?:\r\n|[\r\n])[ \t]*/g, " ");

    //liberator.log(html);
    liberator.echo(html, true);
  } // }}}
  function detectLink (str) { // {{{
    let m = str.match(/https?:\/\/\S+/);
    if (m) {
      let left = str.substr(0, m.index);
      let url = m[0];
      let right = str.substring(m.index + m[0].length);
      return <>{detectLink(left)}<a highlight="URL" href={url}> {url} </a>{detectLink(right)}</>;
    }
    return str;
  } // }}}
  function showTwitterSearchResult(word) { // {{{
    // フォーマットが違うの変換
    function konbuArt(obj) {
      return {
        __proto__: obj,
        user: {
          __proto__: obj,
          screen_name: obj.from_user,
          id: obj.from_id
        }
      };
    }

    tw.get("http://search.twitter.com/search.json", { q: word }, function(text) {
      showTL(JSON.parse(text).results.map(konbuArt));
    });
  } // }}}
  function getFollowersStatus(target, force, onload) { // {{{
    function setRefresher(){
      expiredStatus = false;
      if (statusRefreshTimer)
        clearTimeout(statusRefreshTimer);
      statusRefreshTimer = setTimeout(function() expiredStatus = true, setting.statusValidDuration * 1000);
    }

    if (!force && !expiredStatus && history.length > 0) {
      onload(history);
    } else {
      let api = "http://api.twitter.com/1/statuses/home_timeline.json", query = {};

      if (target) {
        api = "http://api.twitter.com/1/statuses/user_timeline.json";
        query.screen_name = target;
      } else {
        query = null;
        if (setting.useChirp) {
          onload(history);
          return;
        }
      }

      tw.get(api, query, function(text) {
        setRefresher();
        // TODO 履歴をちゃんと "追記" するようにするようにするべき
        let result = JSON.parse(text);
        if (!target)
          history = result;
        onload(result);
      });
    }
  } // }}}
  function showFollowersStatus(arg, force) { // {{{
    getFollowersStatus(arg, force, function(statuses) {
      showTL(statuses);
    });
  } // }}}
  function showTwitterMentions(arg) { // {{{
    tw.get("http://api.twitter.com/1/statuses/mentions.json", null, function(text) {
      showTL(JSON.parse(text));
    });
  } // }}}
  function favTwitter(id) { // {{{
    tw.post("http://api.twitter.com/1/favorites/create/" + id + ".json", null, function(text) {
      liberator.log(text.responseText);
      let res = JSON.parse(text);
      liberator.echo("[Twittperator] fav: " + res.user.name + " " + res.text, true);
    });
  } // }}}
  function unfavTwitter(id) { // {{{
    tw.post("http://api.twitter.com/1/favorites/destroy/" + id + ".json", null, function(text) {
      let res = JSON.parse(text);
      liberator.echo("[Twittperator] unfav: " + res.user.name + " " + res.text, true);
    });
  } // }}}
  function sayTwitter(stat) { // {{{
    let sendData = {};
    if (stat.match(/^(.*)@([^\s#]+)(?:#(\d+))(.*)$/)) {
      let [prefix, replyUser, replyID, postfix] = [RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$4];
      if (stat.indexOf("RT @" + replyUser + "#" + replyID) == 0) {
        ReTweet(replyID);
        return;
      }
      stat = prefix + "@" + replyUser + postfix;
      if (replyID && !prefix)
        sendData.in_reply_to_status_id = replyID;
    }
    sendData.status = stat;
    sendData.source = "Twittperator";
    tw.post("http://api.twitter.com/1/statuses/update.json", sendData, function(text) {
      let result = JSON.parse(text || "{}");
      let t = result.text;
      liberator.echo("[Twittperator] Your post " + '"' + t + '" (' + t.length + " characters) was sent.", true);
    });
  } // }}}
  function openLink(text) { // {{{
    // TODO 複数のリンクに対応
    let links = [];
    text.replace(/https?:\/\/\S+/g, function(m) links.push(m));
    if (links.length <= 0)
      return;

    if (links.length == 1)
      return liberator.open(links[0], liberator.NEW_TAB);

    commandline.input(
      "Select URL: ",
      function(arg) liberator.open(arg, liberator.NEW_TAB),
      {
        completer: function(context) {
          context.completions = [[link, link] for ([, link] in Iterator(links))];
        }
      }
    );
  } // }}}
  function ReTweet(id) { // {{{
    let url = "http://api.twitter.com/1/statuses/retweet/" + id + ".json";
    tw.post(url, null, function(text) {
      let res = JSON.parse(text);
      liberator.log(res.toSource(), 0);
      liberator.echo("[Twittperator] ReTweet: " + res.retweeted_status.text, true);
    });
  } // }}}
function sourceScriptFile(file) { // {{{
  // XXX 悪い子向けのハックです。すみません。 *.tw ファイルを *.js のように読み込みます。
  function getScriptName(file)
    file.leafName.replace(/\..*/, "").replace(/-([a-z])/g, function(m, n1) n1.toUpperCase());

  file = file.clone();
  let toString = file.toString;
  let scriptName = getScriptName(file);
  let script = liberator.plugins[scriptName];
  file.toString = function() this.path.replace(/\.tw$/, ".js");
  try {
    io.source(file, false);
  } finally {
    liberator.plugins[scriptName] = script;
    file.toString = toString;
  }
} // }}}
function loadPlugins() { // {{{
  function isEnabled(file)
    let (name = file.leafName.replace(/\..*/, "").replace(/-/g, "_"))
      liberator.globalVariables["twittperator_plugin_" + name];

  function loadPluginFromDir(checkGV) {
    return function(dir) {
      dir.readDirectory().forEach(function(file) {
        if (/\.tw$/(file.path) && (!checkGV || isEnabled(file)))
          sourceScriptFile(file);
      });
    }
  }

  io.getRuntimeDirectories("plugin/twittperator").forEach(loadPluginFromDir(true));
  io.getRuntimeDirectories("twittperator").forEach(loadPluginFromDir(false));
} // }}}
  function setup() { // {{{
    function rt(func)
      function(status)
        let (s = ("retweeted_status" in status) ? status.retweeted_status : status)
          func(s);

    let ub = unescapeBrakets;

    const Completers = {
      name: function(context, args) {
        context.completions =
          history.map(rt(function(s) ["@" + s.user.screen_name, s]));
      },
      link: function(context, args) {
        context.completions =
          history.filter(function(s) /https?:\/\//(s.text)).map(rt(function(s) [ub(s.text), s]));
      },
      text: function(context, args) {
        context.completions =
          history.map(rt(function(s) [ub(s.text), s]));
      },
      name_id: function(context, args) {
        context.completions =
          history.map(rt(function(s) ["@" + s.user.screen_name + "#" + s.id, s]));
      },
      name_id_text: function(context, args) {
        context.completions =
          history.map(rt(function(s) ["@" + s.user.screen_name + "#" + s.id + ": " + ub(s.text), s]));
      }
    };

    const SubCommands = [
      {
        match: function(s) s.match(/^\+/),
        command: ["+"],
        description: "Fav a tweet",
        action: function(args) {
          let m = args.literalArg.match(/^\+.*#(\d+)/);
          if (m)
            favTwitter(m[1]);
        },
        completer: Completers.name_id_text
      },
      {
        match: function(s) s.match(/^\-/),
        command: ["-"],
        description: "Unfav a tweet",
        action: function(args) {
          let m = args.literalArg.match(/^\-.*#(\d+)/);
          if (m)
            unfavTwitter(m[1]);
        },
        completer: Completers.name_id_text
      },
      {
        match: function(s) s.match(/^@/),
        command: ["@"],
        description: "Show mentions or follower tweets",
        action: function(args) {
          if (args.literalArg.match(/^@.+/)) {
            showFollowersStatus(args.literalArg, true);
          } else {
            showTwitterMentions();
          }
        },
        completer: Completers.name
      },
      {
        match: function(s) s.match(/^\?/),
        command: ["?"],
        description: "Twitter search",
        action: function(args) showTwitterSearchResult(args.literalArg),
        completer: Completers.text
      },
      {
        match: function(s) s.match(/^(open\s|\/)/),
        command: ["/"],
        description: "Open link",
        action: function(args) openLink(args.literalArg),
        completer: Completers.link
      }
    ];

    function findSubCommand(s) {
      for (let [, cmd] in Iterator(SubCommands)) {
        let m = cmd.match(s);
        if (m)
          return [cmd, m];
      }
    }

    function tailMatch(re, str) {
      let result, m;
      let head = 0;
      let len = 0;
      while (str && (m = str.match(re))) {
        head += len;
        len = m.index + m[0].length;
        str = str.slice(len);
        result = m;
      }
      if (result)
        result.index += head;
      return result;
    }

    function commandCompelter(context, args) {
      function statusObjectFilter(item)
        let (desc = item.description)
          (this.match(desc.user.screen_name) || this.match(desc.text));

      context.createRow = function(item, highlightGroup) {
        let desc = item[1] || this.process[1].call(this, item, item.description);

        if (desc && desc.user) {
          return <div highlight={highlightGroup || "CompItem"} style="white-space: nowrap">
              <li highlight="CompDesc">
                <img src={desc.user.profile_image_url} style="max-width: 24px; max-height: 24px"/>
                &#160;{desc.user.screen_name}: {unescapeBrakets(desc.text)}
              </li>
          </div>;
        }

        return <div highlight={highlightGroup || "CompItem"} style="white-space: nowrap">
            <li highlight="CompDesc">{desc}&#160;</li>
        </div>;
      };

      let len = 0;

      if (args.bang) {
        let [subCmd, m] = findSubCommand(args.literalArg);
        if (subCmd) {
          context.title = ["Hidden", "Entry"];
          subCmd.completer(context, args);
          len = m[0] === "@" ? 0 : m[0].length;
        }
      } else {
        let m;
        if (m = args.literalArg.match(/(RT\s+)@.*$/)) {
          Completers.name_id_text(context, args);
        } else if (m = tailMatch(/(^|\b)@[^@]*/, args.literalArg)) {
          Completers.name_id(context, args);
        }

        if (m)
          len = m.index + m[1].length;
      }

      context.title = ["Name#ID", "Entry"];
      context.offset += len;
      context.filters = [statusObjectFilter];
      // XXX 本文でも検索できるように、@ はなかったことにする
      context.filter = context.filter.replace(/^@/, "");

      context.incomplete = false;
    }

    function subCommandCompleter(context, args) {
      if (!args.bang || context.filter.length > 0)
        return;
      context.title = ["Sub command", "Description"];
      context.completions = SubCommands.map(function({command, description}) [command[0], description]);
    }

    commands.addUserCommand(["tw[ittperator]"], "Twittperator command",
      function(args) {
        let bang = args.bang;
        let arg = args.literalArg;

        if (!arg)
          return showFollowersStatus(null, args.bang);

        if (args.bang) {
          let [subCmd] = findSubCommand(arg);
          subCmd.action(args);
        } else {
          if (arg.length === 0)
            showFollowersStatus();
          else
            sayTwitter(arg);
        }
      }, {
        bang: true,
        literal: 0,
        hereDoc: true,
        completer: let (getting) function(context, args) {
          context.fork("File", 0, context, function(context) subCommandCompleter(context, args));

          let doGet = (expiredStatus || !(history && history.length)) && setting.autoStatusUpdate;

          let matches = args.bang ? args.literalArg.match(/^(\s*[-+?])/)
                                  : args.literalArg.match(/(RT\s|)@/);
          if (!args.bang && !matches)
            return;

          context.incomplete = doGet;
          context.hasitems = !doGet;

          if (doGet) {
            if (!getting) {
              getting = true;
              getFollowersStatus(null, function() {
                getting = false;
                context.fork("Twittperator", 0, context, function(context) commandCompelter(context, args));
              });
            }
          } else {
            context.fork("Twittperator", 0, context, function(context) commandCompelter(context, args));
          }
        }
      }, true);
  } // }}}
  // PIN code を取得して AccessToken を得る前 {{{
  function preSetup() {
    commands.addUserCommand(["tw[ittperator]"], "Twittperator setup command",
      function(args) {
        if (args["-getPIN"]) {
          tw.getRequestToken(function(url) {
            liberator.open(url, { where: liberator.NEW_TAB });
          });
          liberator.echo("Twittperator", "Please get PIN code and execute\n :tw -setPIN {PINcode}");
        } else if (args["-setPIN"]) {
          tw.setPin(args["-setPIN"]);
        }
      }, {
        options: [
          [["-getPIN"], commands.OPTION_NOARG],
          [["-setPIN"], commands.OPTION_STRING, null, null]
        ],
      }, true);
  } // }}}

  // Initialization {{{
  let setting =
    let (gv = liberator.globalVariables) ({
      useChirp: !!gv.twittperator_use_chirp,
      autoStatusUpdate: !!parseInt(gv.twittperator_auto_status_update || 0),
      statusValidDuration: parseInt(gv.twitperator_status_valid_duration || 90),
      historyLimit: let (v = gv.twittperator_history_limit) (v === 0 ? 0 : (v || 1000)),
    });

  let statusRefreshTimer;
  let expiredStatus = true;

  let accessor = storage.newMap("twittperator", { store: true });
  accessor.set("clientName", "Twittperator");
  accessor.set("consumerKey", "GQWob4E5tCHVQnEVPvmorQ");
  accessor.set("consumerSecret", "gVwj45GaW6Sp7gdua6UFyiF910ffIety0sD1dv36Cz8");

  if (!__context__.hasOwnProperty("__debugVars__"))
    __context__.__debugVars__ = {};
  let debugVars = __context__.__debugVars__;

  let history;
  if (__context__.Tweets) {
    history = __context__.Tweets;
  } else {
    history = __context__.Tweets = accessor.get("history", []);
    liberator.registerObserver("exit", function() accessor.set("history", history));
  }

  let tw = new TwitterOauth(accessor);

  __context__.OAuth = tw;
  __context__.ChirpUserStream = ChirpUserStream;

  loadPlugins();

  if (setting.useChirp)
    ChirpUserStream.start();
  // }}}

})();

// vim: sw=2 ts=2 et fdm=marker:
