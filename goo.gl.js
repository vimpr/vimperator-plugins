// INFO //
var INFO =
<plugin name="goo.gl.js" version="0.1"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/goo.gl.js"
        summary="Get shorten URL by goo.gl"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <author email="anekos@snca.net">anekos</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
    You can get short URL by goo.gl by this plugin.
  </p>
  <item>
    <tags>'goo.gl'</tags>
    <spec>:googl <oa>Long URL</oa></spec>
    <description>
      <p>You can get short URL by <link topic="http://goo.gl/">goo.gl</link> by this plugin.</p>
    </description>
  </item>
</plugin>;

(function(){
  let short_url=function(long_url){
    let req=new XMLHttpRequest();
    req.addEventListener("load",function(){
      let response=JSON.parse(req.responseText);
      liberator.echo(response.short_url);
      util.copyToClipboard(response.short_url,true);
    },false);
    req.addEventListener("error",function(){
      liberator.echo("Responce errror status from goo.gl. Status Code:" + req.status);
    },false);
    req.open("POST", "http://goo.gl/api/shorten?url="+encodeURIComponent(long_url));
    req.setRequestHeader("X-Auth-Google-Url-Shortener","true");
    req.send();
  };
  commands.addUserCommand(
    ["googl"],
    "Get short URL from Google",
    function(args){
      let long_url;
      if(args.length==0){
        long_url=buffer.URL;
      }else if(args.length==1){
        long_url=args.literalArg;
      }else{
        liberator.echoerr('argument error');
        return;
      }
      short_url(long_url);
    }, {
      literal: 0
    }, true);
})();
