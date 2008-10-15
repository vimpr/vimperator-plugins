/**
 * For vimperator 0.6pre
 * @author teramako teramako@gmail.com
 *
 * Usage:
 *
 * xpath blink nodes
 * :xpathb[link] [EXPRESSION]
 * :xb [EXPERSSION]
 */
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
			result = buffer.evaluateXPath(expression);
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
