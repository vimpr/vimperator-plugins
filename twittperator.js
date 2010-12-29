/*
 * The MIT License
 *
 * Copyright (c) 2010 teramako
 * Copyright (c) 2010 anekos
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

let PLUGIN_INFO =
<VimperatorPlugin>
  <name>Twittperator</name>
  <description>Twitter Client using OAuth and Streaming API</description>
  <description lang="ja">OAuth/StreamingAPI対応Twitterクライアント</description>
  <version>1.13.1</version>
  <minVersion>2.3</minVersion>
  <maxVersion>3.0</maxVersion>
  <author mail="teramako@gmail.com" homepage="http://d.hatena.ne.jp/teramako/">teramako</author>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>MIT License</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/twittperator.js</updateURL>
  <detail><![CDATA[
    This is the Twitter client plugin with OAuth authentication.
    == Command ==
    - Use completion for comfort.
    :tw[ittperator] -getPIN
        Opens the page to authorize Twittperator and get your PIN from Twitter.
    :tw[ittperator] -setPIN {PINcode}
        Allows Twittperator to access Twitter by signifying your PIN.

    :tw[ittperator]
        Shows recent your timeline. (The timeline will be cashed and expired 90 seconds after Twittperator get from Twitter.)
    :tw[ittperator]!
        Gets recent your timeline from Twitter and shows it.
    :tw[ittperator]!@
        Shows mentions to you.
    :tw[ittperator]!@user
        Show @user's tweets.
    :tw[ittperator] {TweetText}
        Tweets {TweetText}.
    :tw[ittperator] RT @user#id: {refTweet}
        Does official retweet.
    :tw[ittperator] {TweetText} RT @user#id: {refTweet}
        Does classic retweet.
    :tw[ittperator]!+status_id
        Adds the tweet to your favorites.
    :tw[ittperator]!-status_id
        Delete the tweet from your favorites.
    :tw[ittperator]!?{SearchText}
        Shows the result of searching {SearchText}.
    :tw[ittperator]!/{URI}
        Opens {URI}.
    :tw[ittperator]!delete {StatusID}
        Deletes the {StatusID} tweet.
    == Authentication Setting ==
    First of all, you have to get your PIN from Twitter and signify it to Twittperator. Type a following command:
    >||
        :tw -getPIN
    ||<
    and you will get the page to authorize Twittperator to access Twitter in a new tab.
    If you allow and you will get the PIN (7 digit numbers), then yank it.

    Secondarily, authorize Twittperator with your PIN.
    >||
        :tw -setPIN yanked_PIN
    ||<
    == FAQ ==
    - What is this ?
        The plugin that just tweet with Vimperator.
    - My timeline is hard to see...?
        We are making an effort, and welcoming patches.
    - By the way, is it possible to show timeline automatically?
        Use chirpstream. Write the below line into rc file.
        let g:twittperator_use_chirp = 1
    - It's too much of the bother to show my timeline manually!!
        We think implementing a wider display method and a mean of word wrapping will solve this issue.
        Any ideas?
    - Is there a plan to work together Growl GNTP?
        Write the plugin.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    これはOAuth認証を用いたTwitterクライアントプラグインです。
    == Command ==
    - 適当に補完しましょう。
    :tw[ittperator] -getPIN
        PINコード取得ページを開きます。
    :tw[ittperator] -setPIN {PINcode}
        PINcodeを設定します。

    :tw[ittperator]
        前回取得したタイムラインを表示します。 (キャッシュが90秒以上古い場合は再取得。)
    :tw[ittperator]!
        強制的に取得したタイムラインを表示します。
    :tw[ittperator]!@
      あなたへの言及(mentions)表示します。
    :tw[ittperator]!@user
        @user のタイムラインを表示します。
    :tw[ittperator] {TweetText}
        {TweetText}をポストします。
    :tw[ittperator] RT @user#id: {refTweet}
        公式RTになるはずです。
    :tw[ittperator] {TweetText} RT @user#id: {refTweet}
        非公式RTになるはずです。
    :tw[ittperator]!+status_id
        tweetをfavoriteします。
    :tw[ittperator]!-status_id
        tweetをunfavoriteします。
    :tw[ittperator]!?{SearchText}
        {SearchText}の検索結果を表示します。
    :tw[ittperator]!/{URI}
        {URI}を開きます。
    :tw[ittperator]!delete {StatusID}
        {StatusID}のツイートを削除します。
    == Authentication Setting ==
    最初にPINコードを取得し設定する必要があります。
    >||
        :tw -getPIN
    ||<
    を実行すると新規タブに本アプリケーションを許可するかを問うページが開かれます。
    許可をすると、PINコード(数値)が表示されるのでコピーしてください。

    >||
        :tw -setPIN コピーしたPINコード
    ||<
    で初期設定完了です。
    == FAQ ==
    - なんて読むんだ
        知らん。トゥイットゥペレータと自分は勝手に読んでいる。
    - 何のためのクライアント？
        Vimperatorを使っていて、さくっと呟きたいとき用です（ぉ
    - TL表示をもっと工夫しろ
        ごめんなさい。改良してコミットしてくれると嬉しいです。
    - つーか、TLくらい自動取得しろ
        はい、がんばりました。
        let g:twittperator_use_chirp = 1
        として、chirpstream を利用してください。
    - ぶっちゃけTL表示とか面倒だよね？
        はい、がんばります・・・
        でかい表示領域と行の折り返し方法が確立できれば、もっと頑張れる気がします。
    - Growl GNTP との連携しないの？
        プラグイン書きましょう。
  ]]></detail>
</VimperatorPlugin>;

(function() {

  // TwitterOauth for Greasemonkey {{{

  /*
   * http://efcl.info/2010/0610/res1721/
   *
   * The MIT License
   *
   * Copyright (c) 2010 azu
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   */

  function TwitterOauth() {
      this.initialize.apply(this, arguments);
  }

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
    };

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
        },
        decodePercent: function decodePercent(s) {
            if (s != null) {
                // Handle application/x-www-form-urlencoded, which is defined by
                // http://www.w3.org/TR/html4/interact/forms.html#h-17.13.4.1
                s = s.replace(/\+/g, " ");
            }
            return decodeURIComponent(s);
        },
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
        },
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
        },
        getParameter: function getParameter(parameters, name) {
            if (!parameters instanceof Array) {
                return OAuth.getParameterMap(parameters)[name];
            }
            for (var p = 0; p < parameters.length; ++p) {
                if (parameters[p][0] == name) {
                    return parameters[p][1]; // first value wins
                }
            }
            return null;
        },
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
        },
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
        },
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
        },
        setParameters: function setParameters(message, parameters) {
            var list = OAuth.getParameterList(parameters);
            for (var i = 0; i < list.length; ++i) {
                OAuth.setParameter(message, list[i][0], list[i][1]);
            }
        },
        /** Fill in parameters to help construct a request message.
            This function doesn't fill in every parameter.
            The accessor object should be like:
            { consumerKey: "foo", consumerSecret: "bar", accessorSecret: "nurn",
              token: "krelm", tokenSecret: "blah" }
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
        },
        setTimestampAndNonce: function setTimestampAndNonce(message) {
            OAuth.setParameter(message, "oauth_timestamp", OAuth.timestamp());
            OAuth.setParameter(message, "oauth_nonce", OAuth.nonce(6));
        },
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
        },
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
        },
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
        },
        /** Generate timestamps starting with the given value. */
        correctTimestamp: function correctTimestamp(timestamp) {
            OAuth.timeCorrectionMsec = (timestamp * 1000) - (new Date()).getTime();
        },
        /** The difference between the correct time and my clock. */
        timeCorrectionMsec: 0,
        timestamp: function timestamp() {
            var t = (new Date()).getTime() + OAuth.timeCorrectionMsec;
            return Math.floor(t / 1000);
        },
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
        },
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
         { tokenSecret: "lakjsdflkj...", consumerSecret: "QOUEWRI..",
           accessorSecret: "xcmvzc..." }
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
        },
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
        },
        /** A map from signature method name to constructor. */
        REGISTERED: {},
        /** Subsequently, the given constructor will be used for the named methods.
            The constructor will be called with no parameters.
            The resulting object should usually implement getSignature(baseString).
            You can easily define such a constructor by calling makeSubclass, below.
         */
        registerMethodClass: function registerMethodClass(names, classConstructor) {
            for (var n = 0; n < names.length; ++n) {
                OAuth.SignatureMethod.REGISTERED[names[n]] = classConstructor;
            }
        },
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
        },
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
        },
        normalizeUrl: function normalizeUrl(url) {
            var uri = OAuth.SignatureMethod.parseUri(url);
            var scheme = uri.protocol.toLowerCase();
            var authority = uri.authority.toLowerCase();
            var dropPort = (scheme == "http" && uri.port == 80)
                        || (scheme == "https" && uri.port == 443);
            if (dropPort) {
                // find the last ":" in the authority
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
        },
        parseUri: function parseUri(str) {
            /* This function was adapted from parseUri 1.2.1
               http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
             */
            var o = {
              key: ["source", "protocol", "authority", "userInfo", "user",
                    "password", "host", "port", "relative", "path", "directory",
                    "file", "query", "anchor"],
              parser: { strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/ }
            };
            var m = o.parser.strict.exec(str);
            var uri = {};
            var i = 14;
            while (i--) uri[o.key[i]] = m[i] || "";
            return uri;
        },
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
                                  + OAuth.percentEncode(nvp[1]),
                                  nvp]);
                }
            }
            sortable.sort(function(a, b) {
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
        OAuth.SignatureMethod.makeSubclass(function getSignature(baseString) this.key));

    OAuth.SignatureMethod.registerMethodClass(["HMAC-SHA1", "HMAC-SHA1-Accessor"],
        OAuth.SignatureMethod.makeSubclass(function getSignature(baseString) {
            b64pad = "=";
            var signature = b64_hmac_sha1(this.key, baseString);
            return signature;
        }));

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
      request: {
        token :"", // response oauth_token
        tokenSecret: ""// response oauth_token_secret
      },
      // トークンが取得済みかの真偽値を返す
      isAuthorize: function() {
        let accessor = this.getAccessor();
        if (accessor.consumerKey && accessor.consumerSecret &&
            accessor.token && accessor.tokenSecret) {
          return true;
        }
        return false;
      },
      getAccessor: function() {
        return {
          consumerKey: this.accessor.get("consumerKey", ""),
          consumerSecret: this.accessor.get("consumerSecret", ""),
          token: this.accessor.get("token", ""),
          tokenSecret: this.accessor.get("tokenSecret", "")
        };
      },
      deleteAccessor: function() {
        var clientInfo = {
          clientName: this.accessor.get("clientName", ""),
          consumerKey: this.accessor.get("consumerKey", ""),
          consumerSecret: this.accessor.get("consumerSecret", ""),
        };
        this.accessor.clear();
        this.accessor.set("clientName", clientInfo.clientName);
        this.accessor.set("consumerKey", clientInfo.consumerKey);
        this.accessor.set("consumerSecret", clientInfo.consumerSecret);
      },
      // 認証ページのURLを取得
      getRequestToken: function(callback) {
        let message = {
          method: "GET",
          action: "https://twitter.com/oauth/request_token",
          parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.accessor.get("consumerKey", "")
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
        Utils.xmlhttpRequest(options);

      },
      setPin: function(pin) {
        let self = this;
        this.getAccessToken(pin, function() {
          Twittperator.echo("getting access token is success.");
          self.initialize();
        });
      },
      // PINを元にaccess tokenを取得して保存、callbackにはaccessorオブジェクトを渡す
      getAccessToken: function(pin, callback) {
        var message = {
          method: "GET",
          action: "https://twitter.com/oauth/access_token",
          parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.accessor.get("consumerKey", ""),
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
              /* 返り値からaccess token/access token secretを取り出す */
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

        Utils.xmlhttpRequest(options); // 送信
      },
      // api+?+query にアクセスした結果をcallbackに渡す
      get: function(api, query, callback) {
        var btquery =  query ? "?" + this.buildQuery(query) : "";
        var message = {
          method: "GET",
          action: setting.apiURLBase + api + btquery,
          parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.accessor.get("consumerKey", ""), // Queryの構築
            oauth_token: this.accessor.get("token", "") // Access token
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
        Utils.xmlhttpRequest(options); // 送信
      },
      post: function(api, content, callback) {
        var message = {
          method: "POST",
          action: setting.apiURLBase + api,
          parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.accessor.get("consumerKey", ""),
            oauth_token: this.accessor.get("token", "") // Access token
          }
        };
        // 送信するデータをパラメータに追加する
        for (var key in content) {
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
        Utils.xmlhttpRequest(options); // 送信
      },
      delete: function(api, query, callback) {
        var btquery =  query ? "?" + this.buildQuery(query) : "";
        var message = {
          method: "DELETE",
          action: setting.apiURLBase + api + btquery,
          parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.accessor.get("consumerKey", ""), // Queryの構築
            oauth_token: this.accessor.get("token", "") // Access token
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
        Utils.xmlhttpRequest(options); // 送信
      },
      getAuthorizationHeader: function(api) {
        var message = {
          method: "GET",
          action: api,
          parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.accessor.get("consumerKey", ""), // Queryの構築
            oauth_token: this.accessor.get("token", ""), // Access token
            oauth_version: "1.0"
          }
        };
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, this.getAccessor());
        return OAuth.getAuthorizationHeader("Twitter", message.parameters);
      },
      // Utility関数
      // http://kevin.vanzonneveld.net
      urlEncode: function(str) {
        str = (str+"").toString();
        return encodeURIComponent(str).replace(/!/g, "%21").replace(/"/g, "%27").replace(/\(/g, "%28")
                                      .replace(/\)/g, "%29").replace(/\*/g, "%2A").replace(/%20/g, "+");
      },
      // オブジェクトからクエリを生成
      buildQuery: function(formdata, numeric_prefix, arg_separator) {
        // * example 1: http_build_query({ foo: "bar", php: "Hypertext Processor", baz: "boom", cow: "milk" }, "", "&amp;");
        // * returns 1: "foo=bar&amp;php=Hypertext+Processor&amp;baz=boom&amp;cow=milk"
        // * example 2: http_build_query({ "PHP": "Hypertext Processor", 0: "foo", 1: "bar", 2: "baz", 3: "boom", "cow": "milk" }, "myvar_");
        // * returns 2: "PHP=Hypertext+Processor&myvar_0=foo&myvar_1=bar&myvar_2=baz&myvar_3=boom&cow=milk"
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
          }
          if (typeof val !== "function") {
            return self.urlEncode(key) + "=" + self.urlEncode(val);
          }
          throw new Error("There was an error processing for http_build_query().");
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
      // Query string から 連想配列を返す
      getParameter: function(str) {
        if (typeof str == "undefined") return {};
        var itm;
        if (str.indexOf("?", 0) > -1) str = str.split("?", 2)[1];
        return str.split("&").reduce(function(r, it) {
          var [key, value] = it.split("=", 2);
          if (key)
            r[key] = typeof value == "undefined" || decodeURIComponent(value);
          return r;
        }, {});
      }
    };
    return p;
  })();
  {
    'get post delete'.split(' ').forEach(function (name) {
      let newName =
        'json' + name.replace(/^(.)(.*)/ , function(_, a, b) (a.toUpperCase() + b));
      TwitterOauth.prototype[newName] =
        function (url, query, callback, onError) {
          return TwitterOauth.prototype[name].call(
            this,
            url + '.json',
            query,
            function (text) {
              try {
                return callback(JSON.parse(text));
              } catch (e) {
                (onError
                 ||
                 function(e) {
                   liberator.echoerr('Twitter API Error: ' + url);
                   liberator.log(text);
                   throw e;
                 })(e);
              }
            }
          );
        };
    });
  }
  // }}}

  // Twittperator
  function HTTPConnection(url, options) { // {{{
    const ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);

    this.canceled = false;
    this.events = {};

    this.channel =
      ioService.newChannelFromURI(ioService.newURI(url, null, null)).QueryInterface(Ci.nsIHttpChannel);
    this.channel.notificationCallbacks = this;

    if (options) {
      if ("headers" in options) {
        for (let [n, v] in Iterator(options.headers))
          this.channel.setRequestHeader(n, v, true);
      }

      for (let [n, v] in Iterator(options)) {
        if (/^on[A-Z]/(n) && (v instanceof Function))
          this.events[n.toLowerCase()] = v;
      }

      this.onRecv = options.onReceive;
    }

    this.channel.asyncOpen(this, null);
  }
  HTTPConnection.prototype = {
    callEvent: function(name) {
      name = name.toLowerCase();
      if (name in this.events)
        return this.events[name].apply(this, Array.slice(arguments, 1));
    },

    cancel: function() {
      if (this.channel){
        this.canceled = true;
        return this.channel.cancel(Cr.NS_ERROR_NOT_AVAILABLE);
      }
    },

    // 実装しないと例外になるメソッドとか
    onStartRequest: function(request, context) {},
    onProgress : function(request, context, progress, progressMax) {},
    onStatus : function(request, context, status, statusArg) {},
    onRedirect : function(oldChannel, newChannel) {},

    onDataAvailable: function(request, context, stream, sourceOffset, length) {
      let inputStream =
        Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
      inputStream.init(stream);
      let data = inputStream.read(length);
      this.callEvent("onReceive", data);
    },

    onStopRequest: function(request, context, status) {
      if (Components.isSuccessCode(status)) {
        this.callEvent("onComplete");
      } else {
        if (!this.canceled)
          this.callEvent("onError");
      }
      delete this.channel;
    },

    onChannelRedirect: function(oldChannel, newChannel, flags) {
      this.channel = newChannel;
    },

    // nsIInterfaceRequestor
    getInterface: function(IID) {
      try {
        return this.QueryInterface(IID);
      } catch (e) {
        throw Components.results.NS_NOINTERFACE;
      }
    },

    // XPCOM インターフェイスに見せかけているので、QI を実装する必要がある
    QueryInterface : function(IID) {
      if (IID.equals(Ci.nsISupports) ||
          IID.equals(Ci.nsIInterfaceRequestor) ||
          IID.equals(Ci.nsIChannelEventSink) ||
          IID.equals(Ci.nsIProgressEventSink) ||
          IID.equals(Ci.nsIHttpEventSink) ||
          IID.equals(Ci.nsIStreamListener))
        return this;

      throw Components.results.NS_NOINTERFACE;
    }
  }; // }}}
  function Stream({ name, url }) { // {{{
    let connection;
    let restartCount = 0;
    let lastParams;
    let listeners = [];
    let retryTimer;

    function clearRetryTimer() {
      if (retryTimer)
        clearTimeout(retryTimer);
      retryTimer = null;
    }

    function updateRetryTimer(restartFunc) {
      clearRetryTimer();
      retryTimer = setTimeout(restartFunc, 60 * 1000);
    }

    function restart() {
      stop();
      if (restartCount > 13)
        return liberator.echoerr("Twittperator: Gave up to connect to " + name + "...");
      liberator.echoerr("Twittperator: " + name + " will be restared...");
      // 試行済み回数^2 秒後にリトライ
      setTimeout(function() start(lastParams), Math.pow(2, restartCount) * 1000);
      restartCount++;
    }

    function stop() {
      clearRetryTimer();
      if (!connection)
        return;
      connection.cancel();
      liberator.log("Twittperator: stop " + name);
    }

    function start(params) {
      stop();

      liberator.log("Twittperator: start " + name);

      lastParams = params;

      let useProxy = !!setting.proxyHost;
      let requestUrl = url;

      if (params) {
        // XXX Twitter がなぜか + を許容しない気がする(401 を返す)ので、再変換する
        let query = tw.buildQuery(params).replace(/\+/g, "%20");
        requestUrl += '?' + query;
      }

      let authHeader = tw.getAuthorizationHeader(requestUrl);
      let buf = "";

      let onReceive = function(data) {
        try {
          updateRetryTimer(restart);
          let lines = data.split(/\r\n|[\r\n]/);
          if (lines.length >= 2) {
            lines[0] = buf + lines[0];
            for (let [, line] in Iterator(lines.slice(0, -1))) {
              try {
                if (/^\s*\{/(line))
                  onMsg(Utils.fixStatusObject(JSON.parse(line)), line);
              } catch (e) { liberator.log(e); }
            }
            buf = lines.slice(-1)[0];
          } else {
            buf += data;
          }
        } catch (e) {
          liberator.echoerr("Twittperator: Unknown error on " + name + " connection: " + e.name);
        }
      };

      connection = new HTTPConnection(
        requestUrl,
        {
          headers: {
            Authorization: authHeader,
          },
          onReceive: onReceive,
          onError: restart
        }
      );
    }

    function onMsg(msg, raw) {
      listeners.forEach(function(listener) liberator.trapErrors(function() listener(msg, raw)));

      if (msg.text)
        Twittperator.onMessage(msg);
    }

    function clearPluginData() {
      listeners = [];
    }

    return {
      start: start,
      stop: stop,
      addListener: function(func) listeners.push(func),
      removeListener: function(func) (listeners = listeners.filter(function(l) (l != func))),
      clearPluginData: clearPluginData
    };
  }; // }}}
  let Twitter = { // {{{
    destroy: function(id) { // {{{
      tw.jsonDelete("statuses/destroy/" + id, null, function(res) {
        res = Utils.fixStatusObject(res);
        Twittperator.echo("delete: " + res.user.name + " " + res.text)
      });
    }, // }}}
    favorite: function(id) { // {{{
      tw.jsonPost("favorites/create/" + id, null, function(res) {
        res = Utils.fixStatusObject(res);
        Twittperator.echo("fav: " + res.user.name + " " + res.text)
      });
    }, // }}}
    getUserTimeline: function(target, onload) { // {{{
      let [api, query] = target ? ["statuses/user_timeline", {screen_name: target}]
                                : ["statuses/home_timeline", {}];

      tw.jsonGet(
        api,
        query,
        function(res) {
          let result = res.map(Utils.fixStatusObject);
          let lastHistory = history[0];
          if (lastHistory) {
            let lastDate = Date.parse(lastHistory.created_at);
            for (let [,msg] in Iterator(result.reverse())) {
              if (Date.parse(msg.created_at) > lastDate)
                history.unshift(msg);
            }
          } else {
            result.forEach(function(msg) history.push(msg));
          }
          onload(result);
        }
      );
    }, // }}}
    say: function(status, inReplyToStatusId) { // {{{
      let sendData = {status: status, source: "Twittperator"};
      if (inReplyToStatusId)
        sendData.in_reply_to_status_id = inReplyToStatusId;
      tw.jsonPost("statuses/update", sendData, function(res) {
        let t = Utils.fixStatusObject(res).text;
        Twittperator.echo("Your post " + '"' + t + '" (' + t.length + " characters) was sent.");
      });
    }, // }}}
    retweet: function(id) { // {{{
      let url = "statuses/retweet/" + id;
      tw.jsonPost(url, null, function(res) {
        res = Utils.fixStatusObject(res);
        Twittperator.echo("Retweet: " + res.retweeted_status.text);
      });
    }, // }}}
    unfavorite: function(id) { // {{{
      tw.jsonDelete("favorites/destroy/" + id, null, function(res) {
        res = Utils.fixStatusObject(res);
        Twittperator.echo("unfav: " + res.user.name + " " + res.text, true);
      });
    }, // }}}
    searchUsers: function(word, callback) { // {{{
      tw.jsonGet("users/search", { q: word }, callback);
    } // }}}
  }; // }}}
  let Utils = { // {{{
    anchorLink: function(str) { // {{{
      let m = str.match(/https?:\/\/\S+|@\S+/);
      if (m) {
        let left = str.substr(0, m.index);
        let center = m[0];
        let [head, tail] = [center[0], center.slice(1)];
        let right = str.substring(m.index + m[0].length);
        let content = head === "@" ? <a highlight="URL" href={setting.showTLURLScheme + "://twitter.com/" + tail}> {center} </a>
                                   : <a highlight="URL" href={center}> {center} </a>;
        return <>{Utils.anchorLink(left)}{content}{Utils.anchorLink(right)}</>;
      }
      return str;
    }, // }}}
    fixStatusObject: function(st) { // {{{
      const ENTITIY_PAIRS = {
        lt: "<",
        gt: ">",
        quot: '"',
        hellip: "\u2026"
      };

      function unescapeSpecificEntities(str)
        str.replace(/&([a-z\d]+);/g, function(m, n) ENTITIY_PAIRS[n] || m);

      function unescapeBrakets(str)
        str.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

      let result = {};
      for (let [n, v] in Iterator(st)) {
        result[n] = v && typeof v === "object" ? Utils.fixStatusObject(v) :
                    n === "text"               ? unescapeBrakets(v) :
                    v;
      }

      if (result.hasOwnProperty("id") && result.hasOwnProperty("id_str") && typeof result.id === "number")
        result.__defineGetter__("id", function () this.id_str);

      return result;
    }, // }}}
    parseSayArg: function(arg) { // {{{
      let m = arg.match(/^(.*)@(\w{1,15})#(\d+)(.*)$/);
      return m ? {
        isReply: true,
        prefix: m[1],
        replyUser: m[2],
        replyID: m[3],
        postfix: m[4],
        text:  m[1] + '@' + m[2] + m[4]
      } : {
        isReply: false,
        text: arg
      };
    }, // }}}
    xmlhttpRequest: function(options) { // {{{
      let xhr = new XMLHttpRequest();
      xhr.open(options.method, options.url, true);
      if (typeof options.onload == "function") {
        xhr.onload = function() {
          options.onload(xhr);
        }
      }
      xhr.send(null);
    }, // }}}
  }; // }}}
  let Twittperator = { // {{{
    confirm: function(msg, onYes, onNo, onCancel) { // {{{
      if (!onNo)
        onNo = function () Twittperator.echo('canceled.');

      commandline.input(
        msg + " (input 'yes/no'): ",
        function(s) (s === "yes" ? onYes : onNo)(),
        {
          onCancel: onCancel || onNo
        }
      );
    }, // }}}
    echo: function(msg) { // {{{
      liberator.echo("[Twittperator] " + msg);
    }, // }}}
    isProtected: function({ statusId, userId, screenName }) { // {{{
      if (screenName && isp(function(st) st.user && st.user.screen_name == screenName))
        return true;

      if (statusId && isp(function(st) st.user && st.id == statusId))
        return true;

      if (userId && find(function(st) st.user && st.user.id == userId))
        return true;

      return false;

      function isp(f) {
        let r;
        history.some(function(st) f(st) && (r = st));
        return (r && r.user.protected && r.user.screen_name) ? true : false;
      }
    }, // }}}
    jsonGet: function(api, query, callback) { // {{{
      tw.jsonGet(api, query, callback);
    }, // }}}
    loadPlugins: function() { // {{{
      function isEnabled(file)
        let (name = file.leafName.replace(/\..*/, "").replace(/-/g, "_"))
          liberator.globalVariables["twittperator_plugin_" + name];

      function loadPluginFromDir(checkGV) {
        return function(dir) {
          dir.readDirectory().forEach(function(file) {
            if (/\.tw$/(file.path) && (!checkGV || isEnabled(file)))
              Twittperator.sourceScriptFile(file);
          });
        }
      }

      ChirpUserStream.clearPluginData();
      TrackingStream.clearPluginData();

      io.getRuntimeDirectories("plugin/twittperator").forEach(loadPluginFromDir(true));
      io.getRuntimeDirectories("twittperator").forEach(loadPluginFromDir(false));
    }, // }}}
    onMessage: function(msg) { // {{{
      history.unshift(msg);
      if (history.length > setting.historyLimit)
        history.splice(setting.historyLimit);
    }, // }}}
    openLink: function(text) { // {{{
      let m = text.match(/.*?(https?:\/\/\S+)/g);
      if (!m)
        return;

      let links =
        m.map(function(s) s.match(/^(.*?)(https?:\/\/\S+)/).slice(1)) .
          map(function(ss) (ss.reverse(), ss.map(String.trim)))
      Twittperator.selectAndOpenLink(links);
    }, // }}}
    say: function(stat) { // {{{
      let sendData = {};
      let arg = Utils.parseSayArg(stat);
      if (arg.isReply) {
        if (stat.indexOf("RT @" + arg.replyUser + "#" + arg.replyID) == 0) {
          Twittperator.withProtectedUserConfirmation(
            { screenName: arg.replyUser, statusId: arg.replyID },
            "retweet",
            function() Twitter.retweet(arg.replyID)
          );
          return;
        }
        stat = arg.text;
        if (arg.replyID && !arg.prefix)
          sendData.in_reply_to_status_id = arg.replyID;
      }
      Twittperator.withProtectedUserConfirmation(
        { screenName: arg.replyUser, statusId: arg.replyID },
        "reply",
        function() Twitter.say(stat, arg.replyID)
      );
    }, // }}}
    selectAndOpenLink: function(links) { // {{{
      if (!links || !links.length)
        return;

      if (links.length === 1)
        return liberator.open(links[0][0], liberator.NEW_TAB);

      commandline.input(
        "Select URL: ",
        function(arg) liberator.open(arg, liberator.NEW_TAB),
        {
          completer: function(context) {
            context.completions = links;
          }
        }
      );
    }, // }}}
    showUserTimeline: function(arg) { // {{{
      Twitter.getUserTimeline(arg, function(statuses) {
        Twittperator.showTL(Array.slice(statuses).reverse());
      });
    }, // }}}
    showStatusMenu: function(status) { // {{{
    }, // }}}
    showTL: function(s) { // {{{
      function userURL(screen_name)
        (setting.showTLURLScheme + "://twitter.com/" + screen_name);

      function menuEvent(st)
        ("window.parent.liberator.modules.plugins.twittperator.Twittperator.showStatusMenu(" + parseInt(st.id) + ")");

      let html = <style type="text/css"><![CDATA[
          .twitter.user { vertical-align: top; }
          .twitter.entry-content { white-space: normal !important; }
          .twitter.entry-content a { text-decoration: none; }
          .twitter.entry-content.rt:before { content: "RT "; color: silver; }
          img.twitter.photo { border: 0px; width: 16px; height: 16px; vertical-align: baseline; margin: 1px; }
      ]]></style>.toSource()
                 .replace(/(?:\r\n|[\r\n])[ \t]*/g, " ") +
          s.reduce(function(table, status) {
            return table.appendChild(
              ("retweeted_status" in status) ?
              let (rt = status.retweeted_status)
              <tr>
                <td class="twitter user">
                  <a href={userURL(rt.user.screen_name)}>
                    <img src={rt.user.profile_image_url} alt={rt.user.screen_name} class="twitter photo"/>
                    <strong>{rt.user.screen_name}&#x202C;</strong>
                  </a>
                  <a href={userURL(status.user.screen_name)}>
                    <img src={status.user.profile_image_url} alt={status.user.screen_name} class="twitter photo"/>
                  </a>
                </td>
                <td class="twitter entry-content rt">
                  {Utils.anchorLink(rt.text)}
                </td>
                <td class="twitter menu">
                  <a href="javascript: void 0" onclick={menuEvent(status)}>
                   &#1758;
                  </a>
                </td>
              </tr> :
              <tr>
                <td class="twitter user">
                  <a href={userURL(status.user.screen_name)}>
                    <img src={status.user.profile_image_url} alt={status.user.screen_name} class="twitter photo"/>
                    <strong title={status.user.name}>{status.user.screen_name}&#x202C;</strong>
                  </a>
                </td>
                <td class="twitter entry-content">
                  {Utils.anchorLink(status.text)}
                </td>
                <td class="twitter menu">
                  <a href="javascript: void 0" onclick={menuEvent(status)}>
                   &#1758;
                  </a>
                </td>
              </tr>
              );

          }, <table/>)
            .toSource().replace(/(?:\r\n|[\r\n])[ \t]*/g, " ");

      liberator.echo(html, true);
    }, // }}}
    showTwitterMentions: function(arg) { // {{{
      tw.jsonGet("statuses/mentions", null, function(res) {
        Twittperator.showTL(res.map(Utils.fixStatusObject));
      });
    }, // }}}
    showTwitterSearchResult: function(word) { // {{{
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

      Utils.xmlhttpRequest({
        method: 'GET',
        url: "http://search.twitter.com/search.json?" + tw.buildQuery({ q: word }),
        onload: function(xhr) {
          let res = JSON.parse(xhr.responseText);
          if (res.results.length > 0) {
            Twittperator.showTL(res.results.map(Utils.fixStatusObject).map(konbuArt));
          } else {
            Twittperator.echo("No results found.")
          }
        }
      });
    }, // }}}
    showUsersSeachResult: function(word) { // {{{
      Twitter.searchUsers(word, function(res){
        // フォーマットが違うので変換
        function konbuArt(obj) {
          return {
            __proto__: obj.status,
            user: {
              __proto__: obj,
            }
          };
        }

        // TODO ユーザのリストが返ってきますが、タイムラインとして表示します。
        if (res.length > 0) {
          Twittperator.showTL(res.map(Utils.fixStatusObject).map(konbuArt));
        } else {
          Twittperator.echo("No results found.")
        }
      });
    }, // }}}
    sourceScriptFile: function(file) { // {{{
      // XXX 悪い子向けのハックです。すみません。 *.tw ファイルを *.js のように読み込みます。
      let script = liberator.plugins.contexts[file.path];

      let originalPath = file.path;
      let hackedPath = originalPath.replace(/\.tw$/, ".js");

      let ugly = {
        __noSuchMethod__: function (name, args) originalPath[name].apply(originalPath, args),
        toString:
          function()
            (parseInt(Error().stack.match(/io.js:(\d+)/)[1], 10) < 100 ? originalPath : hackedPath)
      };

      try {
        io.source(ugly, false);
      } finally {
        if (script)
          liberator.plugins[script.NAME] = script;
      }
    }, // }}}
    withProtectedUserConfirmation: function(check, actionName, action) { // {{{
      let protectedUserName = Twittperator.isProtected(check);
      if (protectedUserName) {
        Twittperator.confirm(
          protectedUserName + " is protected user! Do you really want to " + actionName + '?',
          action
        );
      } else {
        action();
      }
    }, // }}}
  }; // }}}
  let Store = storage.newMap("twittperator", { store: true }); // {{{
  Store.set("clientName", "Twittperator");
  Store.set("consumerKey", "GQWob4E5tCHVQnEVPvmorQ");
  Store.set("consumerSecret", "gVwj45GaW6Sp7gdua6UFyiF910ffIety0sD1dv36Cz8");
  // }}}

  // アクセストークン取得前 {{{
  function preSetup() {
    commands.addUserCommand(["tw[ittperator]"], "Twittperator setup command",
      function(args) {
        if (args["-getPIN"]) {
          tw.getRequestToken(function(url) {
            liberator.open(url, { where: liberator.NEW_TAB });
          });
          Twittperator.echo("Please get PIN code and execute\n :tw -setPIN {PINcode}");
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
  // アクセストークン取得後 {{{
  function setup() {
    function rejectMine(st)
      let (n = setting.screenName)
        (n ? (!st.user || st.user.screen_name !== n) : st);

    function seleceMine(st)
      (!rejectMine(st));

    function setTimelineCompleter(context) { // {{{
      function statusObjectFilter(item)
        let (desc = item.description)
          (this.match(desc.user.screen_name) || this.match(desc.text));

      context.compare = void 0;
      context.createRow = function(item, highlightGroup) {
        let desc = item[1] || this.process[1].call(this, item, item.description);

        if (desc && desc.user) {
          return <div highlight={highlightGroup || "CompItem"} style="white-space: nowrap">
              <li highlight="CompDesc">
                <img src={desc.user.profile_image_url} style="max-width: 24px; max-height: 24px"/>
                &#160;{desc.user.screen_name}: {desc.text}
              </li>
          </div>;
        }

        return <div highlight={highlightGroup || "CompItem"} style="white-space: nowrap">
            <li highlight="CompDesc">{desc}&#160;</li>
        </div>;
      };

      context.filters = [statusObjectFilter];
      context.title = ["Hidden", "Entry"];
    } // }}}

    function makeTimelineCompleter(completer) { // {{{
      return function (context, args) {
        setTimelineCompleter(context);
        return completer(context, args);
      }
    } // }}}

    const Completers = (function() { // {{{
      function rt(st)
        ("retweeted_status" in st ? st.retweeted_status : st);

      function removeNewLine (text)
        text.replace(/\r\n|[\r\n]/g, ' ');

      function completer(generator)
        function(filter)
          makeTimelineCompleter(
            filter ? function(context, args) context.completions = history.map(rt).filter(filter).map(generator)
                   : function(context, args) context.completions = history.map(rt).map(generator));

      return {
        name:
          completer(function(s) [s.user.screen_name, s]),
        atname:
          completer(function(s) ['@' + s.user.screen_name, s]),
        text:
          completer(function(s) [removeNewLine(s.text), s]),
        id:
          completer(function(s) [s.id, s]),
        name_id:
          completer(function(s) ["@" + s.user.screen_name + "#" + s.id, s]),
        name_id_text:
          completer(function(s) ["@" + s.user.screen_name + "#" + s.id + ": " + removeNewLine(s.text), s]),
        screenName:
          completer(function(s) [s.user.screen_name, s]),
        hashtag:
          function(filter) {
            return makeTimelineCompleter(function(context, args){
              context.completions = [
                [
                  ['#' + h.text for ([, h] in Iterator(s.entities.hashtags))].join(' '),
                  s
                ]
                for ([, s] in Iterator(history))
                if (s.entities && s.entities.hashtags && s.entities.hashtags[0])
              ]
            });
          }
      };
    })(); // }}}

    const SubCommand = function(init) { // {{{
      if (!(init.completer instanceof Array))
        init.completer = [init.completer];

      return {
        __proto__: init,
        get expr() {
          return RegExp(
            "^" +
            this.command.map(function(c)
              let (r = util.escapeRegex(c))
                (/^\W$/(c) ? r : r + "( |$)")
            ).join("|")
          );
        },
        match: function(s) s.match(this.expr),
        action: function(args) init.action(args.literalArg.replace(this.expr, "").trim())
      };
    }; // }}}

    const SubCommands = [ // {{{
      SubCommand({
        command: ["+"],
        description: "Fav a tweet",
        action: function(arg) {
          let m = arg.match(/^\d+/);
          if (m)
            Twitter.favorite(m[0]);
        },
        timelineCompleter: true,
        completer: Completers.id(rejectMine)
      }),
      SubCommand({
        command: ["-"],
        description: "Unfav a tweet",
        action: function(arg) {
          let m = arg.match(/^\d+/);
          if (m)
            Twitter.favorite(m[0]);
        },
        timelineCompleter: true,
        completer: Completers.id(rejectMine)
      }),
      SubCommand({
        command: ["@"],
        description: "Show mentions or follower tweets",
        action: function(arg) {
          if (arg.length > 0) {
            Twittperator.showUserTimeline(arg);
          } else {
            Twittperator.showTwitterMentions();
          }
        },
        timelineCompleter: true,
        completer: Completers.name()
      }),
      SubCommand({
        command: ["?"],
        description: "Twitter search",
        action: function(arg) Twittperator.showTwitterSearchResult(arg),
        completer: [
          function (context, args) {
            let lst = [[buffer.URL, 'Current Tab']];
            let w = buffer.getCurrentWord();
            if (w && w.length)
              lst.push([w, 'Current word']);
            context.completions = lst;
          },
          Completers.text()
        ]
      }),
      SubCommand({
        command: ["/"],
        description: "Open link",
        action: function(arg) Twittperator.openLink(arg),
        timelineCompleter: true,
        completer: Completers.text(function(s) /https?:\/\//(s.text))
      }),
      SubCommand({
        command: ["delete"],
        description: "Delete status",
        action: function(arg) {
          let m = arg.match(/^\d+/);
          if (m)
            Twitter.destroy(m[0]);
        },
        timelineCompleter: true,
        completer: Completers.id(seleceMine)
      }),
      SubCommand({
        command: ["info"],
        description: "Display status information",
        action: function(arg) {
          function dtdd(obj) {
            let items = <></>;
            for (let [n, v] in Iterator(obj)) {
              let cont = (v && typeof v === "object") ? dtdd(v) : v;
              items += <><dt>{n}</dt><dd>{cont}</dd></>;
            }

            return <dl>{items}</dl>;
          }

          let m = arg.match(/^\d+/);
          if (!m)
            return;
          let id = m[0];
          history.filter(function(st) st.id === id).map(dtdd).forEach(liberator.echo);
        },
        timelineCompleter: true,
        completer: Completers.id()
      }),
      SubCommand({
        command: ["track"],
        description: "Track the specified words.",
        action: function(arg) {
          if (arg.trim().length > 0) {
            Store.set("trackWords", arg);
            TrackingStream.start({track: arg});
          } else {
            TrackingStream.stop();
          }
        },
        completer: function(context, args) {
          let cs = [];
          if (setting.trackWords)
            cs.push([setting.trackWords, "Global variable"]);
          if (Store.get("trackWords"))
            cs.push([Store.get("trackWords"), "Current tracking words"]);
          context.completions = cs;
        }
      }),
      SubCommand({
        command: ["home"],
        description: "Open user home.",
        action: function(arg) liberator.open("http://twitter.com/" + arg, liberator.NEW_TAB),
        timelineCompleter: true,
        completer: Completers.screenName(rejectMine)
      }),
      SubCommand({
        command: ["thread"],
        description: "Show tweets thread.",
        action: function(arg) {
          function getStatus(id, next) {
            let result;
            if (history.some(function (it) (it.id == id && (result = it))))
              return next(result);
            tw.jsonGet("statuses/show/" + id, null, function(res) next(res))
          }
          function trace(st) {
            thread.push(st);
            if (st.in_reply_to_status_id) {
              getStatus(st.in_reply_to_status_id, trace);
            } else {
              Twittperator.showTL(thread);
            }
          }

          Twittperator.echo("Start thread tracing..");
          let thread = [];
          getStatus(parseInt(arg), trace);
        },
        timelineCompleter: true,
        completer: Completers.id(function (it) it.in_reply_to_status_id)
      }),
      SubCommand({
        command: ["resetoauth"],
        description: "Reset OAuth Information",
        action: function(arg) {
          Twittperator.confirm(
            'Do you want to reset OAuth information?',
            function () {
              Store.remove("consumerKey");
              Store.remove("consumerSecret");
              Store.remove("token");
              Store.remove("tokenSecret");
              Store.save();
              Twittperator.echo("OAuth information were reset.");
            }
          );
        },
        timelineCompleter: false,
        completer: Completers.id(function (it) it.in_reply_to_status_id)
      }),
      SubCommand({
        command: ["findpeople"],
        description: "Find people with the words.",
        action: function(arg) Twittperator.showUsersSeachResult(arg),
      }),
    ]; // }}}

    function findSubCommand(s) { // {{{
      for (let [, cmd] in Iterator(SubCommands)) {
        let m = cmd.match(s);
        if (m)
          return [cmd, m];
      }
    } // }}}

    function tailMatch(re, str) { // {{{
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
    } // }}}

    function subCommandCompleter(context, args) { // {{{
      if (!args.literalArg.match(/^(\W|\S+\s)/)) {
        context.title = ["Sub command", "Description"];
        context.completions = SubCommands.map(function({ command, description }) [command[0], description]);
        return;
      }

      let [subCmd, m] = findSubCommand(args.literalArg) || [];
      if (!subCmd)
        return;

      context.offset += m[0].length;
      let offset = context.offset;

      subCmd.completer.forEach(function (completer, index) {
        context.fork(
          "TwittperatorSubCommand" + index, 0, context,
          function (context) {
            context.offset = offset;
            return completer(context, args);
          }
        );
      });
    } // }}}

    function commandCompelter(context, args) { // {{{
      let len = 0;

      let arg = args.literalArg.slice(0, context.caret);
      let m;
      if (m = arg.match(/(RT\s+)@.*$/)) {
        (m.index === 0 ? Completers.name_id
                       : Completers.name_id_text)(m.index === 0 && rejectMine)(context, args);
      } else if (m = tailMatch(/(^|\b|\s)#[^#\s]*$/, arg)) {
        Completers.hashtag()(context, args);
      } else if (m = tailMatch(/(^|\b|\s)@[^@\s]*$/, arg)) {
        (m.index === 0 ? Completers.name_id(rejectMine) : Completers.atname(rejectMine))(context, args);
      }

      if (m)
        len = m.index + m[1].length;

      context.title = ["Name#ID", "Entry"];
      context.offset += len;
      // XXX 本文でも検索できるように、@ はなかったことにする
      context.filter = context.filter.replace(/^[@#]/, "");

      context.incomplete = false;
    } // }}}

    commands.addUserCommand(["tw[ittperator]"], "Twittperator command", // {{{
      function(args) {
        let bang = args.bang;
        let arg = args.literalArg;

        if (!arg)
          return Twittperator.showUserTimeline();

        if (args.bang) {
          let [subCmd] = findSubCommand(arg) || [];
          if (subCmd)
            subCmd.action(args);
        } else {
          if (arg.length === 0)
            Twittperator.showUserTimeline();
          else
            Twittperator.say(arg);
        }
      }, {
        bang: true,
        literal: 0,
        hereDoc: true,
        completer: let (getting, lastTime) function(context, args) {
          let now = new Date().getTime();
          let doGet =
            setting.autoStatusUpdate &&
            !getting &&
            (!lastTime || ((lastTime + setting.statusValidDuration * 1000) < now));

          let completer = args.bang ? subCommandCompleter : commandCompelter;
          let matches = args.bang || args.literalArg.match(/(RT\s+|)@|#/);

          if (!matches)
            return;

          context.fork(
            "TwittperatorCommand", 0, context,
            function(context) {
              context.incomplete = doGet;
              context.hasitems = !doGet;

              if (doGet) {
                getting = true;
                lastTime = now;
                Twitter.getUserTimeline(null, function() {
                  getting = false;
                  completer(context, args);
                  context.incomplete = false;
                });
                return;
              }
              completer(context, args);
            }
          );
        }
      }, true); // }}}
  } // }}}

  // Initialization {{{
  let setting =
    let (gv = liberator.globalVariables) ({
      useChirp: !!gv.twittperator_use_chirp,
      autoStatusUpdate: !!parseInt(gv.twittperator_auto_status_update || 0),
      statusValidDuration: parseInt(gv.twitperator_status_valid_duration || 90),
      historyLimit: let (v = gv.twittperator_history_limit) (v === 0 ? 0 : (v || 1000)),
      showTLURLScheme: let (v = gv.twittperator_show_tl_with_https_url) ("http" + (v === false ? "" : "s")),
      proxyHost: gv.twittperator_proxy_host,
      proxyPort: gv.twittperator_proxy_port,
      screenName: gv.twittperator_screen_name,
      apiURLBase: "http" + (!!gv.twittperator_use_ssl_connection_for_api_ep ? "s" : "") +
                  "://api.twitter.com/" + (gv.twittperator_twitter_api_version || 1)  + "/",
      trackWords: gv.twittperator_track_words,
    });

  let statusRefreshTimer;

  let history = __context__.Tweets;
  if (!history)
    history = __context__.Tweets = Store.get("history", []);

  let tw = new TwitterOauth(Store);

  // ストリーム
  let ChirpUserStream = Stream({ name: 'chirp stream', url: "https://userstream.twitter.com/2/user.json" });
  let TrackingStream = Stream({ name: 'tracking stream', url: "http://stream.twitter.com/1/statuses/filter.json" });

  // 公開オブジェクト
  __context__.OAuth = tw;
  __context__.ChirpUserStream = ChirpUserStream;
  __context__.TrackingStream = TrackingStream;
  __context__.Twittperator = Twittperator;
  __context__.Twitter = Twitter;
  __context__.Utils = Utils;
  __context__.Store = Store;

  Twittperator.loadPlugins();

  if (setting.useChirp)
    ChirpUserStream.start();

  let trackWords = setting.trackWords || Store.get("trackWords");
  if (trackWords)
    TrackingStream.start({track: trackWords});

  __context__.onUnload = function() {
    Store.set("history", history);
    ChirpUserStream.stop();
    TrackingStream.stop();
  };
  // }}}

})();

// vim: sw=2 ts=2 et fdm=marker:
