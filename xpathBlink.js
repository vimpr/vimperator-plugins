/**
 * For vimperator 0.5.3
 * @author teramako teramako@gmail.com
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
vimperator.commands.add(new vimperator.Command(['xpathb[link]','xb'],
	function(expression){
		var result
		try {
			result = vimperator.buffer.evaluateXPath(expression);
		} catch(e) {
			vimperator.echoerr('XPath blink: ' + e);
		}
		if (!result.snapshotLength){
			vimperator.echo('XPath blink: none');
			return;
		}
		for (var i=0; i<result.snapshotLength; i++){
			blink(result.snapshotItem(i));
		}
	},{
		usage: ['xpathb[link] [EXPRESSION]','xb [EXPERSSION]'],
		shortHelp: 'XPath blink nodes',
		help: 'Search nodes with XPath [EXPRESSION] and blink the nodes'
	}
));
})();

// vim: set fdm=marker sw=4 ts=4 et:
