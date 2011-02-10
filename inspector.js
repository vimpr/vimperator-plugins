let INFO =
<plugin name="Inspector" version="0.3"
        href="http://github.com/vimpr/vimperator-plugins/raw/master/inspector.js"
        summary="run DOM Inspector"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="teramako@gmail.com">teramako</author>
  <license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
    run DOM Inspector.
    Of caorse, needs DOM Inspector.
  </p>
  <item>
    <tags>:inspect</tags>
    <spec>:inspect<oa>!</oa> #<a>id</a></spec>
    <description>
      <p>inspect the element of <a>id</a> in browser content</p>
      <p>if bang (<a>!</a>) is exists, inspect in firefox instead.</p>
    </description>
  </item>
  <item>
    <tags>:inspect</tags>
    <spec>:inpeect <a>expr</a></spec>
    <description>
      <p>inspect the return value of evaluated the <a>expr</a></p>
    </description>
  </item>
</plugin>;


var inspectorID = "inspector@mozilla.org";
if (window.AddonManager) {
  AddonManager.getAddonByID(inspectorID, function(ext){
    if (ext.isActive)
      init();
  });
} else if (Application.extensions.has(inspectorID) && Application.extensions.get(inspectorID).enabled) {
  init();
}

function init(){

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

}

// vim: sw=2 ts=2 et:
