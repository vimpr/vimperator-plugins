// {{{ INFO
var INFO =xml`
<plugin name="onclick.js" version="0.2"
        summary="Emulate onClick event."
        href="http://github.com/vimpr/vimperator-plugins/blob/master/onclick.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
    Emulate onClick event.
  </p>
  <item>
    <tags>'onclick'</tags>
    <spec>:onclick <a>target</a></spec>
    <description>
      <p>Emulate onClick event.</p>
      <p>Should add hash table to .vimperatorrc.</p>
      <code><![CDATA[
For Exsample,
  js <<EOM
  liberator.globalVariables.onclickTable={
    'github':'//span[@class="toggle"][1]',
    'pixiv' :'//span[@class="trigger"][1]'
  };
  EOM
      ]]></code>
    </description>
  </item>
</plugin>`;
// }}}

(function(){
  let onclick=function(args){
    if(args.length<1){
      liberator.echoerr('Usage: onclick {xpath_id}');
      return false;
    }
    let strXpath=liberator.globalVariables.onclickTable[args[0]];
    if(undefined==strXpath){
      liberator.echoerr('Not Found XPath');
      return false;
    }
    let contents=gBrowser.selectedBrowser.contentDocument;
    let evaluateXPath=function(aNode,aExpr){
      let xpe=new XPathEvaluator();
      let nsResolver=xpe.createNSResolver(aNode.ownerDocument==null ?
        aNode.documentElement : aNode.ownerDocument.documentElement);
      let result=xpe.evaluate(aExpr,aNode,nsResolver,0,null);
      let found=[];
      let res;
      while(res=result.iterateNext())
        found.push(res);
      return found;
    };
    let elms=evaluateXPath(contents,strXpath);
    if(elms.length==0){
      liberator.echoerr('Not Found Element. Can you check it?');
      return false;
    }
    let evt=contents.createEvent("MouseEvents");
    evt.initMouseEvent(
      'click',
      true, // canBubble
      true, // cancelable
      window, // view
      0, // detail
      0, // screenX
      0, // screenY
      0, // clientX
      0, // clientY
      false, // ctrlKey
      false, // altKey
      false, // shiftKey
      false, // metaKey
      0, // button
      null //relatedTarget
    ); 
    elms[0].dispatchEvent(evt);
  };
  let tblSuggest;
  let comp=function(context, args){
    context.completions=tblSuggest;
  };
  let addSuggestTable=function(){
    if(liberator.globalVariables.onclickTable==undefined){
      liberator.echoerr('Not Found XPath Table');
      return false;
    }
    tblSuggest=new Array();
    let item;
    let i;
    for(i in liberator.globalVariables.onclickTable){
      item=new Array(i,liberator.globalVariables.onclickTable[i]);
      tblSuggest.push(item);
    }
  };
  let initialize=function(){
    addSuggestTable();
    commands.addUserCommand(
      ['onclick'],
      'Emulate onClick event.',
      onclick,
      {
        completer : comp,
        argCount  : 0,
        hereDoc   : false,
        bang      : false,
        count     : false,
        literal   : false
      },
      true
    );
  }
  initialize();
})();
