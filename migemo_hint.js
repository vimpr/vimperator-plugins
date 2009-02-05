// Vimperator plugin: 'Hint Matching with XUL/Migemo'
// Last Change: 05-Feb-2009. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
// Require: XUL/Migemo extension - https://addons.mozilla.org/ja/firefox/addon/5239
//
// extended hint matching with migemo for vimperator1.2pre(16-Jun-2008)
//
// Usage:
//  :set hintmatching = custom
lberator.plugins.customHintMatcher = function(inputString){
    var XMigemoCore;
    try{
        XMigemoCore = Cc['@piro.sakura.ne.jp/xmigemo/factory;1']
                                .getService(Components.interfaces.pIXMigemoFactory)
                                .getService("ja");
        XMigemoTextUtils = Cc['@piro.sakura.ne.jp/xmigemo/text-utility;1']
                                .getService(Ci.pIXMigemoTextUtils);
    }
    catch(ex if ex instanceof TypeError){}
    var r = new RegExp(XMigemoTextUtils.getANDFindRegExpFromTerms(XMigemoCore.getRegExps(inputString)), 'gi');
    return function(hintString) r.test(hintString);
}
