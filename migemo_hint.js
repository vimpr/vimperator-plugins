// Vimperator plugin: 'Hint Matching with XUL/Migemo'
// Last Change: 29-Oct-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
// Require: XUL/Migemo extension - https://addons.mozilla.org/ja/firefox/addon/5239
//
// extended hint matching with migemo for vimperator1.2pre(16-Jun-2008)
//
// Usage:
//  :set hintmatching = custom
liberator.plugins.customHintMatcher = function(inputString){
    var XMigemoCore;
    try{
        XMigemoCore = Components.classes['@piro.sakura.ne.jp/xmigemo/factory;1']
                                .getService(Components.interfaces.pIXMigemoFactory)
                                .getService("ja");
    }
    catch(ex if ex instanceof TypeError){}
    var r = new RegExp(XMigemoCore.getRegExp(inputString));
    return function(hintString) r.test(hintString);
}
