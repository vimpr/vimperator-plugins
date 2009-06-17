/*** BEGIN LICENSE BLOCK {{{
    Copyright (c) 2009 hogelog<konbu.komuro@gmail.com>

    distributable under the terms of an MIT-style license.
    http://www.opensource.jp/licenses/mit-license.html
}}}  END LICENSE BLOCK ***/
// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>add "get element's XPath" hint mode</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.1.2</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/xpath_hint.js</updateURL>
    <license>MIT</license>
    <detail><![CDATA[

== MAPPING ==
;x:
    copy selected element's XPath

]]></detail>
</VimperatorPlugin>;
//}}}

(function(){
const DEFAULT_MAP = "x";

let xpathHintMap = liberator.globalVariables.xpath_hint_map || DEFAULT_MAP;

let xh = plugins.xpath_hint = {
    getElementXPath: function(elem)
    {
        if (elem.nodeType == 9) { // DOCUMENT_NODE = 9
            return "";
        }
        if (elem.hasAttribute("id")) {
            return 'id("'+elem.getAttribute("id")+'")';
        }
        let name = elem.tagName.toLowerCase();
        let parent = elem.parentNode;
        let path = arguments.callee(parent)+"/"+name;
        let children = Array.filter(parent.childNodes, function(e) e.nodeName == elem.nodeName && e.nodeType == elem.nodeType);
    
        if (children.length != 1 && children[0]!=elem) {
            path += "["+(children.indexOf(elem)+1)+"]";
        }
        return path;
    },
    addMode: function(mode, prompt, action, tags)
    {
        hints.addMode(mode, prompt,
                function(e) action(xh.getElementXPath(e)), tags);
    },
};
xh.addMode(xpathHintMap, "copy xpath",
    function(xpath) util.copyToClipboard(xpath, true),
    function() "//*");

})();
// vim: set fdm=marker sw=4 ts=4 et:
