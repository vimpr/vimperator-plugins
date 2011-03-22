// Vimperator plugin: 'Hint Matching with XUL/Migemo'
// Last Change: 23-Mar-2011.
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
// Require: XUL/Migemo add-on - https://addons.mozilla.org/firefox/addon/5239
//
// extended hint matching with migemo for Vimperator

options.get('hintmatching').set('custom');
liberator.plugins.customHintMatcher = function(inputString){
    var XMigemoCore, XMigemoTextUtils;
    try{
        XMigemoCore = Cc['@piro.sakura.ne.jp/xmigemo/factory;1']
                                .getService(Components.interfaces.pIXMigemoFactory)
                                .getService('ja');
        XMigemoTextUtils = Cc['@piro.sakura.ne.jp/xmigemo/text-utility;1']
                                .getService(Ci.pIXMigemoTextUtils);
    }
    catch(ex if ex instanceof TypeError){}
    var r = new RegExp(XMigemoTextUtils.getANDFindRegExpFromTerms(XMigemoCore.getRegExps(inputString)), 'gi');
    return function(hintString) r.test(hintString);
};
