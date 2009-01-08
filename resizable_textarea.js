/*** BEGIN LICENSE BLOCK {{{
  Copyright (c) 2009 suVene<suvene@zeromemory.info>

  distributable under the terms of an MIT-style license.
  http://www.opensource.jp/licenses/mit-license.html
}}}  END LICENSE BLOCK ***/
// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
  <name>{NAME}</name>
  <description>Allows you to resize textareas.</description>
  <description lang="ja">テキストエリアをリサイズ可能にする。</description>
  <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
  <version>0.1.0</version>
  <license>MIT</license>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0α2</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/resizeble_textarea.js</updateURL>
  <detail><![CDATA[
== Usage ==
>||
:textareaResize
  or
:tr
||<
  ]]></detail>
</VimperatorPlugin>;
//}}}
(function() {

var TextResizer = function() {
  this.initialize.apply(this, arguments);
};
TextResizer.prototype = {
  initialize: function(doc) {
    this.doc = doc;
    this.handler = {
      initResize: this._bind(this, this.initResize),
      resize: this._bind(this, this.resize),
      stopResize: this._bind(this, this.stopResize)
    };
  },
  resizable: function(args) {
    this.changeCursor(false);
    this.doc.addEventListener("mousedown", this.handler.initResize, false);
  },
  initResize: function(event) {
    var target = this.target = event.target;
    if (!target ||
        (target.nodeName.toLowerCase() != "textarea" &&
         (target.nodeName.toLowerCase() != "input" || target.type != "text")))
      return;

    this.target.startWidth = this.target.clientWidth;
    this.target.startHeight = this.target.clientHeight;
    this.target.startX = event.clientX;
    this.target.startY = event.clientY;

    this.doc.addEventListener("mousemove", this.handler.resize, false);
    this.doc.addEventListener("mouseup", this.handler.stopResize, false);

    try{
      event.preventDefault();
    } catch (e) {}
  },
  resize: function(event) {
    try{
      this.target.style.width = event.clientX - this.target.startX + this.target.startWidth + "px";
    } catch (e) {}

    if (this.target.nodeName.toLowerCase() == "textarea")
      this.target.style.height = event.clientY - this.target.startY + this.target.startHeight + "px";
  },
  stopResize:function(event) {
    this.doc.removeEventListener("mousedown", this.handler.initResize, false);
    this.doc.removeEventListener("mousemove", this.handler.resize, false);
    setTimeout(function(self) self.doc.removeEventListener("mouseup", self.handler.stopResize, false), 10, this);
    this.changeCursor(true);
  },
  changeCursor: function(normal) {
    for (let [,elem] in Iterator(this.doc.getElementsByTagName("textarea")))
      elem.style.cursor = normal ? "text" : "se-resize";

    for (let [,elem] in Iterator(this.doc.getElementsByTagName("input"))) {
      if (elem.type == "text")
        elem.style.cursor = normal ? "text" : "e-resize";
    }
  },
  _bind: function() {
      var obj = Array.prototype.shift.apply(arguments);
      var func = Array.prototype.shift.apply(arguments);
      var args = [];
      for (let i = 0, len = arguments.length; i < len; args.push(arguments[i++]));
      return function(event) {
        return func.apply(obj, [ event ].concat(args));
      };
  }
};

commands.addUserCommand(
  [ "textareaResize", "tr" ], "resizable textarea.",
  function() {
    var instance = new TextResizer(window.content.document);
    instance.resizable.apply(instance, arguments);
  },
  null,
  true
);

})();
// vim: set fdm=marker sw=2 ts=2 sts=0 et:

