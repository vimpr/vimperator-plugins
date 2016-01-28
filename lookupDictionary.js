/**
 * ==VimperatorPlugin==
 * @name lookup dictionary (Vimperator plugin)
 * @description    Lookup words from Web dictionaries, and show the results in the bottom of the window
 * @description-ja Web上の辞書を引いた結果をコマンドライン・バッファへ出力します
 * @author teramako teramako@gmail.com
 * @version 0.3
 * ==/VimperatorPlugin==
 */
(function () {

const SITE_DEFINITION = [{
    names: ['eiji[ro]'],
    url: 'http://eow.alc.co.jp/%s/UTF-8/',
    shortHelp: 'SPACE ALC (\u82F1\u8F9E\u6717 on the Web)',
    xpath: 'id("resultsList")',
    dictionary: 'en-US'
},{
    names: ['goo[dictionary]'],
    url: 'http://dictionary.goo.ne.jp/search.php?MT=%s&kind=all&mode=0&IE=UTF-8',
    shortHelp: 'goo \u8F9E\u66F8',
    xpath: 'id("incontents")/*[@class="ch04" or @class="fs14" or contains(@class,"diclst")]',
    multi: true,
    dictionary: 'en-US',
    srcEncode: 'EUC-jp',
    urlEncode: 'UTF-8'
},{
    names: ['answers'],
    url: 'http://www.answers.com/%s',
    shortHelp: 'Answers.com(\u82F1\u82F1\u8F9E\u66F8)',
    xpath: 'id("firstDs")',
    dictionary: 'en-US'
},{
    names: ['wikipe[diaja]'],
    url: 'http://ja.wikipedia.org/wiki/%s',
    shortHelp: 'Wikipedia lite(ja)',
    xpath: 'id("mw-content-text")/p[1]',
    dictionary: 'ja'
},{
    names: ['wikipe[diaen]'],
    url: 'http://en.wikipedia.org/wiki/%s',
    shortHelp: 'Wikipedia lite(en)',
    xpath: 'id("mw-content-text")/p[1]',
    dictionary: 'en-US'
}];

let siteDef = liberator.globalVariables.lookupDictionary_site_definition;
if (siteDef) {
    if (siteDef instanceof String)
        siteDef = eval(siteDef);
    if (siteDef.forEach instanceof Function)
        siteDef.forEach(function (obj) { SITE_DEFINITION.push(obj); });
    else
        SITE_DEFINITION.push(siteDef);
}

// class definition
function SpellChecker() {
    this.initialize.apply(this, arguments);
}
SpellChecker.prototype = {
    initialize: function () {
        const MYSPELL  = "@mozilla.org/spellchecker/myspell;1";
        const HUNSPELL = "@mozilla.org/spellchecker/hunspell;1";
        const ENGINE   = "@mozilla.org/spellchecker/engine;1";

        var spellclass = MYSPELL;
        if (HUNSPELL in Components.classes)
            spellclass = HUNSPELL;
        if (ENGINE in Components.classes)
            spellclass = ENGINE;

        this.engine = Components.classes[spellclass]
                      .createInstance(Components.interfaces.mozISpellCheckingEngine);
    },

    /**
     * @return {Array}
     */
    getDictionaryList: function () {
        var dictionaries = {};
        this.engine.getDictionaryList(dictionaries, {});
        return dictionaries.value;
    },

    /**
     * @return {String}
     */
    dictionary: function () {
        var dict;
        try { dict = this.engine.dictionary; }
        catch (e) {}
        return dict ? dict : null;
    },

    /**
     * @param {String} dict
     */
    setDictionary: function (dict) {
        var dictionaries = this.getDictionaryList();
        for (let i=0, max=dictionaries.length ; i<max ; ++i) {
            if (dictionaries[i] === dict) {
                this.engine.dictionary = dict;
                return dict;
            }
        }
        return null;
    },

    /**
     * @param {Boolean} isBeginningWith
     */
    setBeginningWith: function (isBeginningWith) {
        this.isBeginningWith = isBeginningWith;
    },

    /**
     * @param {String} spell
     * @return {Boolean}
     */
    check: function (spell) {
        return this.engine.check(spell);
    },

    /**
     * @param {String} spell
     * @return {Array}
     */
    suggest: function (spell) {
        var suggestions = {};
        this.engine.suggest(spell, suggestions, {});
        suggestions = suggestions.value;

        if (this.isBeginningWith) {
            suggestions = suggestions.filter( function (cand) {
                return (cand.toLowerCase().indexOf(spell) === 0);
            });
        }

        return suggestions;
    },
};

var spellChecker = buildSpellChecker();

SITE_DEFINITION.forEach(function (dictionary) {
    commands.addUserCommand(
        dictionary.names,
        dictionary.shortHelp,
        function (args) {
            var arg = args.string;

            var sel = (window.content.window.getSelection) ?
                window.content.window.getSelection().toString() : null;
            if (args.bang && sel) arg = sel;
            if (!arg) return;
            var url;
            if (dictionary.urlEncode) {
                let ttbu = Components.classes['@mozilla.org/intl/texttosuburi;1']
                                     .getService( Components.interfaces.nsITextToSubURI);
                url = dictionary.url.replace(/%s/g, ttbu.ConvertAndEscape(dictionary.urlEncode, arg));
            } else {
                url = dictionary.url.replace(/%s/g,encodeURIComponent(arg));
            }
            //liberator.log('URL: ' +url);
            getHTML(url, function (doc) {
                var result = getNodeFromXPath(dictionary.xpath, doc, dictionary.multi);
                if (!result) {
                    liberator.echoerr('Nothing to show...');
                    return;
                }
                result = sanitizeScript(result);
                var xs = new XMLSerializer();
                liberator.echo(xml`<div style="white-space:normal;">
                    <base href=${util.escapeHTML(url)}/>
                    ${template.maybeXML(xs.serializeToString( result ))}
                </div>`);
            }, dictionary.srcEncode ? dictionary.srcEncode : null);
        },
        {
            completer: function (context, args) {
                if (!spellChecker ||
                    !dictionary.dictionary ||
                    !spellChecker.setDictionary(dictionary.dictionary))
                return;

                var filter = context.filter;
                var suggestions = spellChecker.suggest(filter);
                var candidates = [];
                for (let i=0, max=suggestions.length ; i<max ; ++i) {
                    candidates.push([suggestions[i], 'suggest']);
                }

                if (!spellChecker.check(filter)) {
                    candidates.unshift(['', 'not exist']);
                }
                context.completions = candidates;
            },
            bang: true
        }
    );
});
commands.addUserCommand(
    ['availabledictionaries'],
    'display available dictionaries',
    function () { liberator.echo('available dictionaries: ' + spellChecker.getDictionaryList()); },
    {}
);
/**
 * @param {String} url
 * @param {Function} callback
 * @param {String} charset
 */
function getHTML(url, callback, charset) {
    var xhr= new XMLHttpRequest();
    xhr.open('GET',url,true);
    xhr.responseType = "document";
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                callback.call(this,xhr.response);
            } else {
                throw new Error(xhr.statusText);
            }
        }
    };
    if (charset) xhr.overrideMimeType('text/html; charset=' + charset);
    xhr.send(null);
}
/**
 * sanitize script element
 * @param {Element} element
 * @return {Element}
 */
function sanitizeScript (element) {
    for (let node of element.querySelectorAll("script")){
        node.parentNode.removeChild(node);
    }
    return element;
}
/**
 * @param {String} xpath XPath Expression
 * @param {DOMDocument} doc
 * @param {Boolean} isMulti
 * @return {Element}
 */
function getNodeFromXPath(xpath,doc,isMulti) {
    if (!xpath || !doc) return;
    var result;
    if (isMulti) {
        let nodesSnapshot = doc.evaluate(xpath,doc.documentElement,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
        if (nodesSnapshot.snapshotLength == 0) return;
        result = doc.createElementNS(XHTML.uri,'div');
        for (let i=0, len = nodesSnapshot.snapshotLength; i<len; i++) {
            result.appendChild(nodesSnapshot.snapshotItem(i));
        }
    } else {
        let node = doc.evaluate(xpath,doc.documentElement,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null);
        if (!node.singleNodeValue) return;
        result = node.singleNodeValue;
    }
    return result;
}

/**
 * @return {Object}
 */
function buildSpellChecker() {
    var enable = liberator.globalVariables.lookupDictionary_enableSuggestion;
    enable = (enable === undefined) ? true : !!parseInt(enable, 10);
    if (!enable) return;

    var spellChecker = new SpellChecker();

    var isBeginningWith = liberator.globalVariables.lookupDictionary_beginningWith;
    isBeginningWith = (isBeginningWith === undefined) ? false : !!parseInt(isBeginningWith, 10);
    spellChecker.setBeginningWith(isBeginningWith);

    return spellChecker;
}
})();

// vim: fdm=marker sw=4 ts=4 et:
