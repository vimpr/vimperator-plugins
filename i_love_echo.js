/**
 * I LOVE :echo
 * I LOVE :js
 *
 * 説明
 * :echo コマンドが大好きな人用
 * とにかく、ワンラインでタブ補完しつつコードを実行するためのネタ的プラグイン
 *
 * 完成度は低い
 *
 *  設計思想
 *   *  最初に与えた引数を変換に変換を重ねてコネくり回すことが主眼
 *   *  各メソッドやgetterは常にvalue(またはxhr)メンバを持つObject
 *   *  メソッドやgetterはvalue値に相応しいメソッドまたはgetterである
 *
 *
 * Example:
 *        1                                        2      3      4   5        6           7                              8
 *  :echo $x("http://d.hatena.ne.jp/teramako/rss").open().send().xml.toObject.get("item").map(function(item) item.title).value
 *  ブログのRSSをゲットしてオブジェクト化して、各item要素内のtitle文字列を格納した配列をechoする
 *
 *  1. $xにURLを渡し
 *  2. XMLHttpRequest.open()し
 *  3. リクエストを送信し
 *  4. レスポンスをDOMオブジェクトを得て(XMLHttpRequest.responseXML)
 *  5. さらにObject化し(toObjectはXMLのタグ名をキーにツリー構造を模したObject)
 *  6. オブジェクト内の"item"メンバ(配列)を得て
 *  7. map関数で各item内のtitleを得て
 *  8. その値 :echo に渡す(RSSのタイトル一覧の出力となる)
 *
 *  :js $_.url.MD5Hash.copy()
 *  現在開いているURLのMD5ハッシュ値をクリップボードにコピー
 *
 *  :js $x("http://example.com").open().send().xml.stack()
 *   とりあえず、http://exapmle.comのDOMドキュメントをstack
 *  :echo $_.cache.last.inspect()
 *   最後にstackしたものを取り出し、DOM Inspectorが入っている場合はDOM Inspectorに出力
 *
 *  :echo $('//a').evaluate().grep(/^http/).join("\n").copy()
 *  リンクを抽出してクリップボードにコピー
 *
 *  :echo $('//a').evaluate().map(function(v)v.href.replace(/.*\//,'')).copy()
 *  :echo $('//a').evaluate().map($f.href().replace(/.*\//,'')).copy()
 *  リンクのファイル名部分のみをクリップボードにコピー
 *
 */

(function(){
var cache = [];
var cacheXHR = null;

function $(arg){ //{{{
    if (!arg) return new $c();
    if (typeof arg == "string"){
        let s = new $s(arg);
        if (/^https?:\/\/./.test(arg)){
            s.open = function(){ var x = userContext.$x(arg); return x.open(); };
        }
        return s;
    } else if (typeof arg == "xml"){
        return new $e4x(arg);
    } else if (arg instanceof Array){
        return new $a(arg);
    } else if (arg instanceof Element || arg instanceof Document || arg instanceof DocumentFragment){
        return new $xml(arg);
    } else if (typeof arg == "object"){
        return new $o(arg);
    }
} //}}}
userContext.$f = (function(){ //{{{
    const pests = [
        '__defineGetter__', '__defineSetter__', 'hasOwnProperty', 'isPrototypeOf',
        '__lookupGetter__', '__lookupSetter__', '__parent__', 'propertyIsEnumerable',
        '__proto__', 'toSource', 'toString', 'toLocaleString', 'unwatch', 'valueOf', 'watch'
    ];

    function id(value)
        value;

    function memfn(parent)
        function(name,args)
            FFF(function(self)
                    let (s = parent(self))
                        let (f = s[name])
                            (f instanceof Function ? s[name].apply(s, args) : f));

    function mem(parent)
        function(name)
            FFF(function(self)
                    parent(self)[name]);

    function FFF(parent){
        parent.__noSuchMethod__ = memfn(parent);
        parent.m = {__noSuchMethod__: mem(parent)};
        pests.forEach(function(it) (parent[it] = function() parent.__noSuchMethod__(it, arguments)));
        return parent;
    }

    return FFF(id);
})(); //}}}


userContext.$ = $;
userContext.$x = function $x(url, method, user, password){ //{{{
    if (!cacheXHR){
        cacheXHR = new $xhr(url, method, user, password);
    } else if (cacheXHR.success && cacheXHR.url == url){
        return cacheXHR;
    } else {
        cacheXHR = new $xhr(url      || cacheXHR.url,
                            method   || cacheXHR.method,
                            user     || cacheXHR.user,
                            password || cacheXHR.password);
    }
    return cacheXHR;
}; //}}}
userContext.$_ = { //{{{
    cache: {
        get: function(num) $(cache[num]),
        get length() cache.length,
        get first() this.length > 0 ? this.get(0)             : null,
        get last()  this.length > 0 ? this.get(this.length-1) : null,
        get all() $(cache),
        shift: function() $(cache.shift()),
        pop: function() $(cache.pop()),
        get xhr() cacheXHR,
        clear: function(){
            cache = [];
            cacheXHR = null;
        }
    },
    env: {
        maxCacheLength: 20,
        autoCache: false,
        xhr: { user: null, password: null }
    },
    get clipboard() $(util.readFromClipboard()),
    get url() $(buffer.URL),
    get sel() $(content.window.getSelection().toString()),
    get lastInputValue(){
        if (buffer.lastInputField){
            return $(buffer.lastInputField.value);
        }
        return null;
    }
}; // }}}
//const DOMINSPECTOR = Application.extensions.has("inspector@mozilla.org") && Application.extensions.get("inspector@mozilla.org").enabled;
const DOMINSPECTOR = ("inspectObject" in window);

// -----------------------------------------------------------------------------
// Core
// --------------------------------------------------------------------------{{{
function $c(arg){ this.value = arg || null; }
$c.prototype = {
    echo: function(flag){
        liberator.echo(this.value, flag);
        return this;
    },
    log: function(level){
        liberator.log(this.value, level || 0);
        return this;
    },
    copy: function(){
        util.copyToClipboard(this.value);
        return this;
    },
    stack: function(){
        cache.push(this.value);
        return this;
    },
    toString: function(){
        return this.value.toString();
    },
    __noSuchMethod__: function(name, args){
        return $(this.value[name].apply(this.value, args));
    }
};
// }}}

// -----------------------------------------------------------------------------
// String
// --------------------------------------------------------------------------{{{
function $s(arg){ this.value = arg || null; }
$s.prototype = new $c();
createPrototype($s, {
    get htmlEscape() $(this.value.replace("&","&amp;","g").replace("<","&lt;","g").replace(">","&gt;","g")),
    get utf16() $(["\\u"+("0000"+this.value.charCodeAt(i).toString(16).toUpperCase()).slice(-4) for (i in this.value)].join("")),
    get numCharRef() $(["&#" + this.value.charCodeAt(i) + ";" for (i in this.value)].join("")),
    get base64() $(window.btoa(this.value)),
    get encodeURICompoenent() $(encodeURIComponent(this.value)),
    get MD5Hash(){
        var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
        converter.charset = "UTF-8";
        var result = {};
        var data = converter.convertToByteArray(this.value, result);
        var ch = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
        ch.init(ch.MD5);
        ch.update(data, data.length);
        var hash = ch.finish(false);
        function toHexString(charCode){
            return ("0" + charCode.toString(16)).slice(-2);
        }
        var s = [i < hash.length ? toHexString(hash.charCodeAt(i)) : "" for (i in hash)].join("");
        return $(s);
    },
    get escpateRegex() $(util.escapeRegex(this.value)),
    s: function(from, to) $(this.value.replace(from, to)),
    split: function(reg) $(this.value.split(reg)),
    get toJSON(){
        var json;
        try {
            json = Cc["@mozilla.org/dom/json;1"].getService(Ci.nsIJSON);
            return $(json.decode(this.value));
        } catch (e){
            return null;
        }
    },
    evaluate: function(doc, context){
        if (!doc) doc = content.document;
        if (!context) context = doc;
        var result = [];
        var nodes = doc.evaluate(this.value, context, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        var node;
        while (node = nodes.iterateNext()){
            result.push(node);
        }
        return $(result);
    },
    get unescapeHTML() {
        let suh = Cc["@mozilla.org/feed-unescapehtml;1"].getService(Ci.nsIScriptableUnescapeHTML);
        let fragment;
        try {
            fragment = suh.parseFragment(this.value, false, null, document.documentElement)
        } catch(e){
            return null;
        };
        return $(fragment);
    }
});
// }}}

// -----------------------------------------------------------------------------
// Array
// --------------------------------------------------------------------------{{{
function $a(arg){ this.value = arg; }
$a.prototype = new $c();
createPrototype($a, {
    get length() this.value.length,
    item:    function(index) 0 <= index && index < this.length ? $(this.value[index]) : null,
    join:    function(str) $(this.value.join(str)),
    grep:    function(reg) $(this.value.filter(function(v) reg.test(v.toString()))),
    forEach: function(func, thisp) $(this.value.forEach(func, thisp)),
    map:     function(func, thisp) $(this.value.map(func, thisp)),
    some:    function(func, thisp) $(this.value.some(func, thisp)),
    filter:  function(func, thisp) $(this.value.filter(func, thisp)),

    push:    function(arg){
        this.value.push(arg);
        return this;
    },
    unshift: function(arg){
        this.value.unshift(arg);
        return this;
    },
    get first() $(this.value[0]),
    get last() $(this.value[this.length - 1])
});
// }}}

// -----------------------------------------------------------------------------
// Object
// --------------------------------------------------------------------------{{{
function $o(arg){ this.value = arg; }
$o.prototype = new $c();
createPrototype($o, {
    get toArrayName()  $([i             for (i in this.value)]),
    get toArrayValue() $([this.value[i] for (i in this.value)]),
    get: function(prop){
        if (prop in this.value) return $(this.value[prop]);
    },
    getItemsByKeyName: function(itemName){
        var a = [];
        function walk(obj){
            for (let item in obj){
                if (itemName == item) a.push(obj[itemName]);
                if (typeof obj[item] == "object") walk(obj[item]);;
            }
        }
        walk(this.value);
        return $(a);
    },
    map: function(func, thisp){
        if (typeof func != "function") throw new TypeError();
        var obj = {};
        var thisp = arguments[1];
        for (let i in this.value){
            obj[i] = func.call(thisp, this.value[i], i, this);
        }
        return $(obj);
    },
    forEach: function(func, thisp){
        if (typeof func != "function") throw new TypeError();
        var thisp = arguments[1];
        for (let i in this.value){
            func.call(thisp, this.value[i], i, this);
        }
        return this;
    },
    filter: function(func, thisp){
        if (typeof func != "function") throw new TypeError();
        var obj = {};
        var thisp = arguments[1];
        for (let i in this.value){
            if (func.call(thisp, this.value[i], i, this)){
                obj[i] = this.value[i];
            }
        }
        return $(obj);
    },
    get toJSON(){
        var json = Cc["@mozilla.org/dom/json;1"].getService(Ci.nsIJSON);
        return $(json.encode(this.value));
    }
});
if (DOMINSPECTOR){ createPrototype($o, { inspect: function(){ inspectObject(this.value); return ""; } }); }
// }}}

// -----------------------------------------------------------------------------
// XML
// --------------------------------------------------------------------------{{{
function $xml(arg){ this.value = arg; }
$xml.prototype = new $c();
createPrototype($xml, {
    get toObject(){ // {{{2
        function parseElement(node){ //{{{3
            var res = {};
            var isTextOnly = true;
            if (node.attributes && node.attributes.length > 0){
                isTextOnly = false;
                let attrs = node.attributes;
                for (let i=0; i<attrs.length; i++){
                    res["@"+attrs[i].nodeName] = attrs[i].nodeValue;
                }
            }
            if (isTextOnly){
                for (let i=0; i<node.childNodes.length; i++){
                    let type = node.childNodes[i].nodeType;
                    if (type != 3 && type != 4){
                        isTextOnly = false;
                    }
                }
            }
            if (isTextOnly){
                res = "";
                for (let i=0; i<node.childNodes.length; i++){
                    res += node.childNodes[i].nodeValue;
                }
            } else {
                for (let i=0; i<node.childNodes.length; i++){
                    let child = node.childNodes[i];
                    let name = child.nodeName;
                    let value = parse(child);
                    if (!value) continue;
                    if (!res[name]){
                        res[name] = value;
                    } else {
                        if (!(res[name] instanceof Array)){
                            res[name] = [res[name]];
                        }
                        res[name].push(value);
                    }
                }
            }
            return res;
        } //3}}}
        function parse(node){ //{{{3
            switch(node.nodeType){
                case node.ELEMENT_NODE:
                    return parseElement(node);
                case node.TEXT_NODE:
                case node.CDATA_SECTION_NODE:
                    return /[^\x00-\x20]/.test(node.nodeValue) ? node.nodeValue : null;
            }
            return null;
        } //3}}}
        var elm;
        if (this.value instanceof Document){
            elm = this.value.documentElement;
        } else {
            elm = this.value;
        }
        var o = parse(elm);
        return $(o);
    }, // 2}}}
    evaluate: function(expression){ // {{{2
        function nsResolver(prefix){ // {{{3
            var ns = {
                xhtml:   "http://www.w3.org/1999/xhtml",
                rdf:     "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                dc:      "http://purl.org/dc/elements/1.1/",
                content: "http://purl.org/rss/1.0/modules/content/",
                taxo:    "http://purl.org/rss/1.0/modules/taxonomy/",
                rss:     "http://purl.org/rss/1.0/",
                atom:    "http://purl.org/atom/ns#"
            };
            return ns[prefix] || null;
        } // 3}}}
        var xpe = new XPathEvaluator();
        var result, found = [], res;
        try {
            result = xpe.evaluate(expression, this.value, nsResolver, 0, null);
            while (res = result.iterateNext()) found.push(res);
            return $(found);
        } catch (e){ }
    }, // 2}}}
    get serializedString() (new XMLSerializer).serializeToString(this.value),
});
if (DOMINSPECTOR){
    createPrototype($xml, {
        inspect: function(){
            if (this.value instanceof Document)
                inspectDOMDocument(this.value);
            else
                inspectDOMNode(this.value);
        }
    });
}
// }}}

// -----------------------------------------------------------------------------
// XMLHttpRequest
// --------------------------------------------------------------------------{{{
function $xhr(url, method, user, password, xhr){
    this.url = url || null;
    this.method = method || "GET";
    this.user = user || null;
    this.password = password || null;
    this.xhr = xhr || new XMLHttpRequest();
    this.success = null;
}
$xhr.prototype = {
    open: function(url, user, password){
        if (this.xhr.readyState != 0) return this;
        if (url) this.url = url;
        if (user) this.user = user;
        if (password) this.password = password;
        this.xhr.open(this.method, this.url, false, this.user, this.password);
        return this;
    },
    setMIME: function(type, charset){
        this.xhr.overrideMimeType((type || "text/html") +
                                  (charset ? ("; charset=" + charset) : ""));
        return this;
    },
    send: function(){
        if (this.xhr.readyState < 3) this.xhr.send(null);
        if (this.xhr.status == 200){
            this.success = true;
            return new $xhrResult(this.xhr);
        } else {
            this.success = false;
            return this;
        }
    }
};
// }}}

// -----------------------------------------------------------------------------
// XMLHttpRequest Result
// --------------------------------------------------------------------------{{{
function $xhrResult(xhr){
    this.value = xhr;
}
$xhrResult.prototype = new $c();
createPrototype($xhrResult, {
    get allHeaders(){
        return $(this.value.getAllResponseHeaders());
    },
    getHeader: function(header){
        return $(this.value.getResponseHeader(header));
    },
    get text(){
        return $(this.value.responseText);
    },
    get xml(){
        if (this.value.responseXML){
            return $(this.value.responseXML);
        } else if (this.value.getResponseHeader("Content-Type").indexOf("text/html") == 0){
            let str = this.value.responseText.
                                 replace(/^[\s\S]*?<html(?:[ \t\r\n][^>]*)?>|<\/html[ \t\n\t]*>[\S\s]*$/ig, "").
                                 replace(/[\r\n]+/g, " ");
            let htmlFragment = document.implementation.createDocument(null, "html", null);
            //let range = window.content.document.createRange();
            let range = document.getElementById("liberator-multiline-output").contentDocument.createRange();
            range.setStartAfter(window.content.document.body);
            htmlFragment.documentElement.appendChild(htmlFragment.importNode(range.createContextualFragment(str), true));
            return $(htmlFragment);
        } else {
            return this.text;
        }
    }
});
// }}}

// -----------------------------------------------------------------------------
// E4X
// --------------------------------------------------------------------------{{{
function $e4x(arg){ this.value = arg; }
$e4x.prototype = new $c();
createPrototype($e4x, {
    get: function(str) $(window.eval("this.value." + str)),
    item: function(num) $(this.value[num]),
    get length() this.value.length(),
    toXMLString: function() $(this.value.toXMLString()),
    toArray: function(){
        var a = [];
        for (let i=0; i<this.length; i++){
            a.push(this.xml[i]);
        }
        return $(a);
    },
    toDocument: function(rootName){
        var parser = new DOMParser;
        rootName = rootName || "root";
        var str = this.length > 1 ? "<" + rootName +">" + this.value.toXMLString() + "</" + rootName + ">" : this.value.toXMLString();
        var doc = parser.parseFromString(str, "text/xml");
        if (doc.firstChild.tagName == "parsererror"){
            return;
        }
        return $(doc);
    },
    get toHTMLDOM() $(util.xmlToDom(this.value, document))
});
// }}}

function createPrototype(_class, obj){
    var flag;
    for (let i in obj){
        flag = false;
        if (obj.__lookupGetter__(i)){
            _class.prototype.__defineGetter__(i, obj.__lookupGetter__(i));
            flag = true;
        }
        if (obj.__lookupSetter__(i)){
            _class..prototype.__defineSetter__(i, obj.__lookupSetter__(i));
            flag = true;
        }
        if (!flag) _class.prototype[i] = obj[i];
    }
}
})();
// vim:sw=4 ts=4 et si fdm=marker:
