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
  <version>0.2.1</version>
  <license>MIT</license>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0α2</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/resizable_textarea.js</updateURL>
  <detail><![CDATA[
== Usage ==
=== NORMAL MODE or VISUAL MODE or CARET MODE ===
>||
:textareaResize or :tr
||<
you can resize textareas by using a mouse.

=== INSERT MODE or TEXTAREA MODE ===
>||
"<A-r>" or "<M-r>"
||<
you can resize current component by using a keyboad.
=== keymap ===
"k" or "up":
  height more small.
"j" or "down":
  height more large.
"h" or "left":
  width more small.
"l" or "right":
  width more large.
"escape" or "enter":
  end of resize.
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
      stopResize: this._bind(this, this.stopResize),
      currentResize: this._bind(this, this.currentResize)
    };
  },
  resizable: function(focused) {
    if (focused) {
      this.initResize({ target: focused }, focused);
      return;
    }
    this.changeCursor(false);
    this.doc.addEventListener("mousedown", this.handler.initResize, false);
  },
  initResize: function(event, focused) {
    var target = this.target = event.target;
    if (!target ||
        (target.nodeName.toLowerCase() != "textarea" &&
         (target.nodeName.toLowerCase() != "input" || target.type != "text")))
      return;

    if (focused) {
      this.target.startBgColor = this.target.style.backgroundColor;
      this.target.style.backgroundColor = "#F4BC14";
      this.doc.addEventListener("keydown", this.handler.currentResize, false);
      return;
    }

    this.target.startWidth = this.target.clientWidth;
    this.target.startHeight = this.target.clientHeight;
    this.target.startX = event.clientX || event.target.offsetLeft;
    this.target.startY = event.clientY || event.target.offsetTop;

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
  currentResize: function(event) {
    var nodeName = this.target.nodeName.toLowerCase();
    switch (event.keyCode) {
    case KeyEvent.DOM_VK_UP: case KeyEvent.DOM_VK_K:
      if (nodeName == "textarea")
        this.target.style.height = this.target.offsetHeight - 10 + "px";
      break;
    case KeyEvent.DOM_VK_DOWN: case KeyEvent.DOM_VK_J:
      if (nodeName == "textarea")
        this.target.style.height = this.target.offsetHeight + 10 + "px";
      break;
    case KeyEvent.DOM_VK_LEFT: case KeyEvent.DOM_VK_H:
       this.target.style.width = this.target.offsetWidth - 10 + "px";
      break;
    case KeyEvent.DOM_VK_RIGHT: case KeyEvent.DOM_VK_L:
      this.target.style.width = this.target.offsetWidth + 10 + "px";
      break;
    case KeyEvent.DOM_VK_RETURN: case KeyEvent.DOM_VK_ENTER: case KeyEvent.DOM_VK_ESCAPE:
      this.target.style.background = this.target.startBgColor;
      setTimeout(function(self) {
          self.doc.removeEventListener("keydown", self.handler.currentResize, false);
          self.target.focus();
        }, 10, this
      );
      break;
    }
    try{
      event.preventDefault();
    } catch (e) {}
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
  [ "textareaResize", "tr" ], "Allows you to resize textareas.",
  function() {
    var instance = new TextResizer(window.content.document);
    instance.resizable.apply(instance);
  },
  null,
  true
);

mappings.add(
  [ modes.INSERT, modes.TEXTAREA ],
  [ "<M-r>", "<A-r>" ],
  "Allows you to resize current textarea.",
  function() {
    var instance = new TextResizer(window.content.document);
    instance.resizable.apply(instance, [ document.commandDispatcher.focusedElement ]);
  }
);

})();
// vim: set fdm=marker sw=2 ts=2 sts=0 et:

