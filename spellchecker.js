/*
 * ==VimperatorPlugin==
 * @name            spellchecker.js
 * @description     provide the object for spell check.
 * @description-ja  スペルチェック用のオブジェクトを提供する。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.10
 * @minversion      2.0pre 2008/10/16
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *   New BSD License
 *
 * USAGE
 *   the object is available in liberator.modules.plugins.spellchecker.
 *   set the dictionary and call check or suggest method.
 *   you can use :availabledictionaries and :adict commands
 *   to know available dictionaries.
 *   all 'set' method is return the reference of spellchecker object itself,
 *   so you can connect methods.
 *
 * METHOD
 *  setDictionary(dict)     set dictionary to check the spell
 *  setBeginningWith(bool)  set 
 *  getDictionaryList()     get available dictionaries
 *  getDictionary()         return dictionary name to use for spell checking
 *  check(word)             if word exists in dictionary, return true, not exists, return false
 *  suggest(word)           word suggestion. return generator of iterator
 *
 * EXAMPLE
 *  1. plugins.spellchecker.setDictionary('en-US').suggest('liberater');
 *      -> liberate
 *         liberate r
 *         liberated
 *         liberates
 *         liberator
 *
 *  2. plugins.spellchecker.check('liberater');
 *      -> false
 * */

( function () {

// SpellChecker
function SpellChecker() {
    this._initialize.apply(this, arguments);
}

SpellChecker.prototype = {
    _initialize: function (dict) {
        // refer: https://developer.mozilla.org/En/Using_spell_checking_in_XUL
        const MOZILLA  = '@mozilla.org/spellchecker/';
        const MYSPELL  = MOZILLA + 'myspell;1';
        const HUNSPELL = MOZILLA + 'hunspell;1';
        const ENGINE   = MOZILLA + 'engine;1';
        const Cc = Components.classes;
        const Ci = Components.interfaces;

        let spellclass = MYSPELL;
        if (HUNSPELL in Cc) spellclass = HUNSPELL;
        if (ENGINE in Cc)   spellclass = ENGINE;
        this._engine = Cc[spellclass].createInstance(Ci.mozISpellCheckingEngine);

        // if dictionary is assigned, set it.
        if (dict) this.setDictionary(dict);
    },

    // list of available dictionaries
    getDictionaryList: function () {
        let dictionaries = {};
        this._engine.getDictionaryList(dictionaries, {});
        for (let [, v] in Iterator(dictionaries.value)) yield v;
    },

    setDictionary: function (dict) {
        for (let d in this.getDictionaryList()) {
            if (d === dict) {
                this._engine.dictionary = dict;
                return this;
            }
        }
        throw new Error('the assigned dictionary is unavailable.');
    },

    getDictionary: function () {
        let dict;
        try { dict = this._engine.dictionary; }
        catch (e) {}
        return dict || null;
    },

    setBeginningWith: function (isBeginningWith) {
        this.isBeginningWith = isBeginningWith;
        return this;
    },

    check: function (spell) this._engine.check(spell),

    suggest: function (spell) {
        let suggestions = {};
        this._engine.suggest(spell, suggestions, {});
        suggestions = suggestions.value;

        if (this.isBeginningWith) {
            suggestions = suggestions.filter( function (cand) {
                return (cand.toLowerCase().indexOf(spell) === 0);
            });
        }

        for (let [, v] in Iterator(suggestions)) yield v;
    },
};

plugins.spellchecker = new SpellChecker();
commands.addUserCommand(
    ['availabledictionaries', 'adict'],
    'display available dictionaries',
    function () liberator.echo('available dictionaries: ' + [a for (a in plugins.spellchecker.getDictionaryList())].join(', ')),
    {}
);

})();

// vim: sw=4 sts=4 ts=4 et
