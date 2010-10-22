/* The MIT License {{{

Copyright (c) 2010, mitsugu oyama
Copyright (c) 2010, anekos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
}}} */

// INFO //
var INFO = 
<plugin name="goo.gl.js" version="0.1"
        href="http://gist.github.com/630237"
        summary="goo.gl.js"
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

// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>googl</name>
    <description>Get short URL from Google</description>
    <author mail="mitsugu.oyama@gmail.com" homepage="http://myscript.zouri.jp/">mitsugu oyama</author>
    <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
    <version>0.0.1</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.4pre</maxVersion>
    <detail><![CDATA[

        == Commands ==
            googl:
                :googl [long-URL]

        == Note ==

    ]]></detail>
</VimperatorPlugin>;
//}}}

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