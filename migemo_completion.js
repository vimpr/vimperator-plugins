/**
 * ==VimperatorPlugin==
 * @name           migemo_completion.js
 * @description    replace completion function with using Migemo
 * @description-ja 補完関数をMigemoを使用したものに取り替える
 * @author         Trapezoid
 * @version        0.3
 * ==/VimperatorPlugin==
 *
 * Support commands:
 *  - :buffer
 *  - :sidebar
 *  - :emenu
 *  - :dialog
 *  - :help
 *  - :macros
 *  - :play
 *  and more
 **/

(function(){
  var XMigemoCore = Components.classes["@piro.sakura.ne.jp/xmigemo/factory;1"]
                              .getService(Components.interfaces.pIXMigemoFactory)
                              .getService("ja");
  var XMigemoTextUtils = Components.classes["@piro.sakura.ne.jp/xmigemo/text-utility;1"]
                                   .getService(Components.interfaces.pIXMigemoTextUtils);


  var oldFilter,migemoPattern;
  modules.CompletionContext.prototype.match = function (str){
      var filter = this.filter;
      if (!filter) return this._match(filter, str);
      if (oldFilter != filter) migemoPattern = new RegExp(XMigemoTextUtils.sanitize(filter) + "|" + XMigemoCore.getRegExp(filter),"i");

      oldFilter = filter;
      return migemoPattern.test(str);
  };
})();
