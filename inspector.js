/**
 * ==VimperatorPlugin==
 * @name          inspector
 * @description   DOM Inspector commands
 * @depend        "DOM Inspector" inspector@mozilla.org
 * @author        teramako teramako@gmail.com
 * @minVersion    2.0pre
 * @version       1.1
 * ==/VimperatorPlugin==
 *
 * Usage:
 * 
 * :inspect #{id}             -> inspect the element of the {id} in browser content
 * :inspect! #{id}            -> inspect the element of the {id} in firefox
 * :inspect[!] -f[rame] #{id} -> inspect the document in the frame element of the {id}
 * :inspect {str}             -> inspect the return value of evaluated the {str}
 */

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
	var iter = buffer.evaluateXPath('//*[@id and contains(@id,"' + filter + '")]',doc);
	return [["#" + e.id, "TagName: "+ e.tagName] for (e in iter)];
}

var options = [
	[["-frame","-f"], commands.OPTION_NOARG]
];
commands.addUserCommand(["inspect","dominspect"],"run DOM Inspector",
	function(args, bang){
		var arg = args.arguments[0];
		var doc = bang ? document : content.document;
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
				node = __eval(args.string);
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
		completer: function(filter, bang){
			var arg = commands.parseArgs(filter, options, "*").arguments[0];
			if (arg.charAt(0) == "#"){
				return [filter.indexOf(arg), completion.filter(getIDList(arg.substr(1),bang),arg,true)];
			}
			return completion.javascript(filter);
		}
	}
);

})();

