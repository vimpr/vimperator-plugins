/* NEW BSD LICENSE {{{
Copyright (c) 2011, anekos.
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

// INFO {{{
let INFO =
<>
  <plugin name="PropertyPanel" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="Show a object in Property Panel."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:pp</tags>
      <tags>:properypanel</tags>
      <spec>:pp <a>JavaScriptExpression.</a></spec>
      <description><p>
        Eval <a>JavaScriptExpression</a> and show the result in Property Panel.
      </p></description>
    </item>
  </plugin>
</>;
// }}}


(function () {

  let M = {};
  Cu.import('resource:///modules/PropertyPanel.jsm', M);
  Cu.import('resource://gre/modules/Services.jsm', M);

  let API = {
    last: {panel: null, width: 400, height: 400},

    show: function ({object, title, recycle, panel}) {
      function make () {
        let doc = M.Services.wm.getMostRecentWindow("navigator:browser").document;
        let popupSet = doc.getElementById('mainPopupSet');
        let output = {};

        let pp = new M.PropertyPanel(popupSet, doc, title, output, null);

        pp.panel.setAttribute("class", "scratchpad_propertyPanel");


        pp.panel.setAttribute('noautofocus', 'false');
        pp.panel.setAttribute('noautohide', 'false');

        pp.panel.openPopup(null, 'overlap', 0, 0, false, false);

        pp.panel.sizeTo(API.last.width, API.last.height);

        pp.panel.addEventListener(
          'popuphiding',
          function () {
            API.last.height = pp.panel.height;
            API.last.width = pp.panel.width;
          },
          true
        );

        return pp;
      }

      let pp = panel || make();
      pp.treeView.data = object;
      API.last = pp;

      return pp;
    }
  };

  commands.addUserCommand(
    ['properypanel', 'pp'],
    'Show property panel',
    function (args) {
      let expr = args.literalArg;
      let result = liberator.eval(expr);
      API.show({object: result, title: expr, panel: args.bang && API.last});
    },
    {
      literal: 0,
      //bang: true,
      completer: function (context, args) {
        completion.javascript(context, args);
      }
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
