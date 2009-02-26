var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>blink elements by XPath</description>
<author mail="teramako@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/teramako/">teramako</author>
<require type="extension" id="inspector@mozilla.org">DOM Inspector</require>
<license>MPL 1.1</license>
<version>1.0</version>
<minVersion>1.2</minVersion>
<maxVersion>2.0</maxVersion>
<updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/xpathBlink.js</updateURL>
<detail><![CDATA[
for test xpath

== Usage==
:xpathb[link] {expression}:
:xb {expression}
    blink specified elements with XPath {expression} 

== Caution ==
It's need "DOM Inspector" addon
]]></detail>
</VimperatorPlugin>;

(function(){
const Cc = Components.classes;
const Ci = Components.interfaces;
var flasher = null;
function getFlasher(){
	if (!flasher){
		flasher = Cc['@mozilla.org/inspector/flasher;1'].createInstance(Ci.inIFlasher);
		flasher.color = '#FF0000';
		flasher.thickness = 2;
	}
	return flasher;
}
/**
 * @param {Node} aNode
 */
function blink(aNode){
	if (aNode.nodeType == 3) aNode = aNode.parentNode;
	var toggle = true;
	var flasher = getFlasher();
	function setOutline(){
		if(toggle){
			flasher.drawElementOutline(aNode);
		}else {
			flasher.repaintElement(aNode);
		}
		toggle = !toggle;
	}
	for (var i=1; i<7; ++i){
		setTimeout(setOutline, i * 100);
	}
}
commands.addUserCommand(['xpathb[link]','xb'],'XPath blink nodes',
	function(expression){
		var result
		try {
			result = buffer.evaluateXPath(expression.string);
		} catch(e) {
			liberator.echoerr('XPath blink: ' + e);
		}
		if (!result.snapshotLength){
			liberator.echo('XPath blink: none');
			return;
		}
		for (var i=0; i<result.snapshotLength; i++){
			blink(result.snapshotItem(i));
		}
	},{}
);
})();

// vim: set fdm=marker sw=4 ts=4 et:
