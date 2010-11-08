// INFO //
var INFO = 
<plugin name="tohex.js" version="0.1"
        summary="Get hex value from string"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/tohex.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>Convert to hex code from string by this plugin.</p>
  <item>
    <tags>'tohex'</tags>
    <spec>:tohex</spec>
    <description>
      <p>Convert to hex code from string by this plugin.</p>
      <p>If you use <link topic="http://github.com/vimpr/vimperator-plugins/blob/master/i_love_echo.js">i_love_echo.js</link>, you should not use tohex plugin.</p>
    </description>
  </item>
</plugin>;

commands.addUserCommand(
  ['tohex'],
  'convert to hex code from charactor',
  function(args){
    if(1!=args.length){
      liberator.echoerr('argument error');
      return false;
    }
    let str='';
    let max=args[0].length;
    for(let i=0;i<max;i++)
      str+=('\\u'+args[0].charCodeAt(i).toString(16));
    liberator.echo(str);
    util.copyToClipboard(str,true);
  },
  {
    literal: false
  },
  true
);
