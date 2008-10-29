/**
 * ==VimperatorPlugin==
 * @name inspector
 * @description   DOM Inspector commands
 * @depend        "DOM Inspector" inspector@mozilla.org
 * @version       1.0
 * ==/VimperatorPlugin==
 */

(function(){

const inspectorID = 'inspector@mozilla.org';
if (!Application.extensions.get(inspectorID).enabled) return;

/* これやるとFirefox終了時に実行されるんだけど...なぜ？
Object.prototype.inspect = function(){
	runInspector(this);
}
*/

function runInspector(node){
	if (node instanceof Document){
		inspectDOMDocument(node);
	} else if (node instanceof Node){
		inspectDOMNode(node);
	} else if (node !== null && typeof(node) != "undefined"){
		inspectObject(node);
	}
}

function getFrameList(){
	var list = [];
	var iframeList = document.getElementsByTagName("iframe");
	for (var i=0, max=iframeList.length ; i<max ; ++i){
		if (iframeList[i].hasAttribute("id"))
			list.push([iframeList[i].id,'iframe id']);
	}
	return list;
}
commands.addUserCommand(['inspect','dominspect'],'run DOM Inspector',
	function(arg, bang){
		if (!arg.string){
			bang ? inspectDOMDocument(document) : inspectDOMDocument(content.document);
			return;
		}
		var list = getFrameList();
		var index = list.map(function($_) $_[0]).indexOf(arg.string);
		var node;
		if (index != -1) node = document.getElementById(list[index][0]).contentDocument;
		if (!node){
			try {
				node = window.eval("with(liberator){" + arg.string + "}");
			} catch(e) {
				liberator.echoerr(e);
				return;
			}
		}
		runInspector(node);
	},{
		bang: true,
		completer: function(filter){
			var list = completion.filter(getFrameList(), filter, true);
			if (list.length > 0) return [0, list];
			return completion.javascript(filter);
		},
	}
);

})();

