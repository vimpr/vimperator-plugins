// {{{ INFO
var INFO =
<plugin name="goo.gl.js" version="0.2"
        summary="google url shortener"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/goo.gl.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="3.3"/>
  <p>Shorten URL by used of google</p>
  <item>
    <tags>'googlUrlShortener'</tags>
    <spec>:googlUrlShortener</spec>
    <description>
      <p>Shorten URL by used of google</p>
    </description>
  </item>
</plugin>;
// }}}

commands.addUserCommand(
  ['googleUrlShortener'],
  'google url shortener',
  function(){
// {{{ environment
    let contents=gBrowser.selectedBrowser.contentDocument;
    const endPoint='https://www.googleapis.com/urlshortener/v1/url';
    const contentType='application/json';
    let xhr;
// }}}

// {{{ edit to json from long URL
    let tmp={};
    tmp.longUrl=contents.URL;
    let jsonString=JSON.stringify(tmp);
//}}}

// {{{ convert success
    function getData(){
      let ret=JSON.parse(xhr.responseText);
      liberator.echo('Shorten URL to \"'+ret.id+'\"');
      util.copyToClipboard(ret.id);
    }
// }}}

// {{{ false convert
    function requestError(){
      liberator.echoerr('cannot convert by used google url shortener');
      return false;
    }
// }}}

// {{{ XMLHttpRequest
    xhr=new XMLHttpRequest();
    xhr.addEventListener("load",getData,false);
    xhr.addEventListener("error",requestError,false);
    xhr.open("POST",endPoint);
    xhr.setRequestHeader('Content-Type',contentType);
    xhr.send(jsonString);
//  }}}
  },
  {},
  true
);
