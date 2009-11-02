let PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>DOM Inspector command</description>
<require type="extension" id="inspector@mozilla.org">DOM Inspector</require>
<author mail="teramako@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/teramako/">teramako</author>
<version>0.3</version>
<minVersion>2.3pre</minVersion>
<maxVersion>2.3pre</maxVersion>
<detail><![CDATA[
== Usage ==
:inspect #{id}:
  inspect the element of the {id} in browser content
:inspect! #{id}:
  inspect the element of the {id} in firefox
:inspect[!] -f[rame] #{id}:
  inspect the document in the frame element of the {id}
:inspect {str}:
  inspect the return value of evaluated the {str}
]]></detail>
</VimperatorPlugin>;

(function(){

const inspectorID = "inspector@mozilla.org";
if (!Application.extensions.has(inspectorID) || !Application.extensions.get(inspectorID).enabled) return;

/* これやるとFirefox終了時に実行されるんだけど...なぜ？ -> Ubiquityが悪さしているみたい
Object.prototype.inspect = function(){
	runInspector(this);
};
*/

function runInspector(node){
	if (node instanceof Document){
		inspectDOMDocument(node);
	} else if (node instanceof Node){
		inspectDOMNode(node);
	} else if (node !== null && typeof node != "undefined"){
		inspectObject(node);
	}
}

function getIDList(filter, isChrome){
	var doc = isChrome ? document : content.document;
	var iter = util.evaluateXPath('//*[@id and contains(@id,"' + filter + '")]',doc);
	return [["#" + e.id, "TagName: "+ e.tagName] for (e in iter)];
}

var options = [
	[["-frame","-f"], commands.OPTION_NOARG]
];
commands.addUserCommand(["inspect","dominspect"],"run DOM Inspector",
	function(args){
		var arg = args[0];
		var doc = args.bang ? document : content.document;
		var node;
		if (!arg){
			node = doc;
		} else if (arg.charAt(0) == "#"){
			let id = arg.substr(1);
			node = doc.getElementById(id);
			if (!node){
				liberator.echoerr("No such id: " + id );
				return;
			}
		} else {
			try {
				node = liberator.eval(args.string);
			} catch (e){
				liberator.echoerr(e);
			}
		}
		if (args["-frame"] && node.contentDocument) node = node.contentDocument;
		runInspector(node);
	},{
		bang: true,
		argCount: "*",
		options: options,
		completer: function(context, args){
			if (args[0] && args[0].charAt(0) == "#"){
				var arg = args[0];
				var list = getIDList(arg.substr(1), args.bang);
				context.completions = list.filter(function(elem) elem[0].indexOf(arg) == 0);
			} else {
				completion.javascript(context);
			}
		}
	}
);

})();

