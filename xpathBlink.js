let INFO =
<plugin name="xpathBlink" version="1.1"
        href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/xpathBlink.js"
        summary="blink elements by XPath"
        xmlns="http://vimperator.org/namespaces/liberator">
    <author email="teramako@gmail.com">teramako</author>
    <license href="http://www.mozilla.org/MPL/MPL-1.1.txt">MPL 1.1</license>
    <project name="Vimperator" minVersion="2.2"/>
    <p>
        For test XPath.
    </p>
    <p>CAUTION: This plugin needs "DOM Inspector" addon.</p>
    <item>
        <tags>:xpathb :xpathblink</tags>
        <spec>:xpathb<oa>link</oa> <a>expression</a></spec>
        <description>
            <p>
                blink specified elements with XPath <a>expression</a>
            </p>
        </description>
    </item>
</plugin>;

(function(){
let extid = "inspector@mozilla.org";
if (!Application.extensions.has(extid) || !Application.exntensions.get(extid).enabled){
    liberator.ecomsg("DOM Inspector is not installed or enabled", 2);
    return;
}
let flasher = null;
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
	let toggle = true;
	let flasher = getFlasher();
	function setOutline(){
		if (toggle){
			flasher.drawElementOutline(aNode);
		} else {
			flasher.repaintElement(aNode);
		}
		toggle = !toggle;
	}
	for (let i=1; i<7; ++i){
		setTimeout(setOutline, i * 100);
	}
}
commands.addUserCommand(['xpathb[link]','xb'],'XPath blink nodes',
	function(expression){
		let result;
		try {
			result = util.evaluateXPath(expression.string);
		} catch(e) {
			liberator.echoerr('XPath blink: ' + e);
		}
		if (!result.snapshotLength){
			liberator.echo('XPath blink: none');
			return;
		}
		for (let i=0; i<result.snapshotLength; i++){
			blink(result.snapshotItem(i));
		}
	},{}
);
})();

// vim: set fdm=marker sw=4 ts=4 et:
