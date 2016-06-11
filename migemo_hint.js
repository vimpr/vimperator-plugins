// Vimperator plugin: 'Hint Matching with XUL/Migemo'
// Last Change: 23-Mar-2011.
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
// Require: XUL/Migemo add-on - https://addons.mozilla.org/firefox/addon/5239
//
// extended hint matching with migemo for Vimperator

options.get('hintmatching').set('custom');
liberator.plugins.customHintMatcher = function(inputString){
    try{
        var {XMigemoCore, MigemoTextUtils} = Components.utils.import('resource://xulmigemo-modules/service.jsm', {});
    }
    catch(ex if ex instanceof TypeError){}
    var r = new RegExp(MigemoTextUtils.getANDFindRegExpFromTerms(XMigemoCore.getRegExps(inputString)), 'gi');
    return function(hintString) r.test(hintString);
};
