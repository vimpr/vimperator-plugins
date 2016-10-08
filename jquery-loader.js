/* NEW BSD LICENSE {{{
Copyright (c) 2010, anekos.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
    3. The names of the authors may not be used to endorse or promote products
       derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
THE POSSIBILITY OF SUCH DAMAGE.


###################################################################################
# http://sourceforge.jp/projects/opensource/wiki/licenses%2Fnew_BSD_license       #
# に参考になる日本語訳がありますが、有効なのは上記英文となります。                #
###################################################################################

}}} */

// PLUGIN_INFO {{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>jQuery Loader</name>
  <name lang="ja">jQuery Loader</name>
  <description>jQuery Loader</description>
  <description lang="ja">jQuery Loader</description>
  <version>1.0.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/jquery-loader.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    Load jQuery for commandline.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    Load jQuery for commandline.
  ]]></detail>
</VimperatorPlugin>`;
// }}}
// INFO {{{
var INFO = xml`
  <plugin name="jQueryLoader" version="1.0.1"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/jquery-loader.js"
          summary="jQuery Loader"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <p>Load jQuery for commandline.</p>
  </plugin>
`;
// }}}

(function () {

  let filepath = liberator.globalVariables.jquery_filepath;
  let moduleName = liberator.globalVariables.jquery_modulename || 'jQuery';
  let coreName = liberator.globalVariables.jquery_corename || 'core';

  let setup = function () {
    let context = {
      get window () content.window.wrappedJSObject,
      get document () content.document.wrappedJSObject,
      get location () content.window.location.wrappedJSObject
    };
    liberator.eval(io.File(filepath).read(), context);
    return context.window.jQuery;
  };

  modules[moduleName] = {};
  modules[moduleName].__defineGetter__(
    coreName,
    function ()
      content.window.wrappedJSObject.jQuery || setup()
  );


  return '以下のコードは無効';

  commands.addUserCommand(
    ['jquery'],
    'jQuery commandline',
    function (args) {
      let context = {};
      context.__defineGetter__(
        moduleName,
        function ()
          modules[moduleName][coreName]
      );
      liberator.eval(args.literalArg, context);
    },
    {
      literal: 0,
      completer: function (context) completion.javascript(context)
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
