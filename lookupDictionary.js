/**
 * ==VimperatorPlugin==
 * @name lookup dictionary (Vimperator plugin)
 * @description    Lookup words from Web dictionaries, and show the results in the bottom of the window
 * @description-ja Web上の辞書を引いた結果をコマンドライン・バッファへ出力します
 * @author teramako teramako@gmail.com
 * @version 0.3
 * ==/VimperatorPlugin==
 */
(function(){

const SITE_DEFINITION = [{
    names: ['eiji[ro]'],
    url: 'http://eow.alc.co.jp/%s/UTF-8/',
    shortHelp: 'SPACE ALC (英辞郎 on the Web)',
    xpath: 'id("resultList")',
    dictionary: 'en-US',
},{
    names: ['goo'],
    url: 'http://dictionary.goo.ne.jp/search.php?MT=%s&kind=all&mode=0',
    shortHelp: 'goo 辞書',
    encode: 'EUC-JP',
    xpath: '//div[@id="incontents"]/*[@class="ch04" or @class="fs14" or contains(@class,"diclst")]',
    multi: true,
    dictionary: 'en-US',
},{
    names: ['infokanji'],
    url: 'http://dictionary.www.infoseek.co.jp/?sc=1&se=on&lp=0&gr=kj&sv=KJ&qt=&qty=%s&qtb=&qtk=0',
    shorthelp: 'Infoseek 漢字辞書',
    encode: 'EUC-JP',
    xpath: '//div[@class="NetDicHead"]',
},{
    names: ['answers'],
    url: 'http://www.answers.com/%s',
    shortHelp: 'Answers.com(英英辞書)',
    xpath: 'id("firstDs")',
    dictionary: 'en-US',
}];

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
        var dictionaries = this.getDictionaryList()
        for (var i=0, max=dictionaries.length ; i<max ; ++i) {
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

SITE_DEFINITION.forEach(function(dictionary){
    liberator.commands.addUserCommand(
        dictionary.names,
        dictionary.shortHelp,
        function(arg,special){
            var sel = (window.content.window.getSelection) ?
                window.content.window.getSelection().toString() : null;
            if (special && sel) arg = sel;
            if (!arg) return;
            var url;
            if (dictionary.encode){
                var ttbu = Components.classes['@mozilla.org/intl/texttosuburi;1']
                                     .getService( Components.interfaces.nsITextToSubURI);
                url = dictionary.url.replace(/%s/g, ttbu.ConvertAndEscape(dictionary.encode, arg));
            } else {
                url = dictionary.url.replace(/%s/g,encodeURI(arg));
            }
            //liberator.log('URL: ' +url);
            var result;
            getHTML(url, function(str){
                var doc = createHTMLDocument(str);
                var result = getNodeFromXPath(dictionary.xpath, doc, dictionary.multi);
                if (!result){
                    liberator.echoerr('Nothing to show...');
                }
                var xs = new XMLSerializer();
                liberator.echo('<base href="' + url + '"/>' + xs.serializeToString( result ), true);
            }, dictionary.encode ? dictionary.encode : 'UTF-8');
        },
        {
            completer: function (arg) {
                if (!spellChecker ||
                    !dictionary.dictionary ||
                    !spellChecker.setDictionary(dictionary.dictionary))
                return [0, []];

                var suggestions = spellChecker.suggest(arg);
                var candidates = [];
                for (var i=0, max=suggestions.length ; i<max ; ++i) {
                    candidates.push([suggestions[i], 'suggest']);
                }

                if (!spellChecker.check(arg)) {
                    candidates.unshift(['', 'not exist']);
                }
                return [0, candidates];
            },
        }
    );
});
liberator.commands.addUserCommand(
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
function getHTML(url, callback, charset){
    var xhr= new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){
            if (xhr.status == 200){
                callback.call(this,xhr.responseText);
            } else {
                throw new Error(xhr.statusText);
            }
        }
    };
    xhr.open('GET',url,true);
    xhr.overrideMimeType('text/html; charset=' + charset);
    xhr.send(null);
}
/**
 * @param {String} str
 * @return {DOMDocument}
 */
function createHTMLDocument(str){
    str = str.replace(/^[\s\S]*?<html(?:\s[^>]+?)?>|<\/html\s*>[\S\s]*$/ig,'').replace(/[\r\n]+/g,' ');
    var htmlFragment = document.implementation.createDocument(null,'html',null);
    var range = document.createRange();
    range.setStartAfter(window.content.document.body);
    htmlFragment.documentElement.appendChild(htmlFragment.importNode(range.createContextualFragment(str),true));
    return htmlFragment;
}
/**
 * @param {String} xpath XPath Expression
 * @param {DOMDocument} doc
 * @param {Boolean} isMulti
 * @return {Element}
 */
function getNodeFromXPath(xpath,doc,isMulti){
    if (!xpath || !doc) return;
    var result;
    if (isMulti){
        var nodesSnapshot = doc.evaluate(xpath,doc.documentElement,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
        if (nodesSnapshot.snapshotLength == 0) return;
        result = document.createElementNS(null,'div');
        for (var i=0; i<nodesSnapshot.snapshotLength; result.appendChild(nodesSnapshot.snapshotItem(i++)));
    } else {
        var node = doc.evaluate(xpath,doc.documentElement,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null);
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

    var isBeginningWith = liberator.globalVariables.lookupDictionary_beginningWith
    isBeginningWith = (isBeginningWith === undefined) ? false : !!parseInt(isBeginningWith, 10);
    spellChecker.setBeginningWith(isBeginningWith);

    return spellChecker;
}
})();

// vim: fdm=marker sw=4 ts=4 et:
