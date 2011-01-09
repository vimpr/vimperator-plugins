/* NEW BSD LICENSE {{{
Copyright (c) 2010-2011, anekos.
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
  <plugin name="跳.jp" version="1.0.1"
          href="http://vimpr.github.com/"
          summary="跳ねます"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:in-nantoka</tags>
      <spec>:in-nantoka <oa>URL</oa></spec>
      <description><p>
        Copy to clipboard.
      </p></description>
    </item>
  </plugin>
</>;
// }}}


(function () {
  function getc (url, callback) {
    function toResult (html) {
      return [html, html.match('http://(.+).\u8DF3.jp')[1]];
    }

    let req = new plugins.libly.Request(
      'http://xn--vt3a.jp/api?url=' + encodeURIComponent(url),
      {
        'X-Requested-With': 'XMLHttpRequest',
        Referer : 'http://xn--vt3a.jp/'
      },
      {
        asynchronous: !!callback
      }
    );
    req.addEventListener(
      'onSuccess',
      function (res)
        callback.apply(null, toResult(res.req.transport.responseText))
    );
    req.addEventListener(
      'onFailure',
      function (res) {
        liberator.echoerr('fail:  ' + res.req.transport.responseText);
      }
    );
    req.post();
    return toResult(req.transport.responseText);
  }

  let innantoka = atob('aW5zdWxpbixpbmJhZ3MsaW5wYXJhenpvLGlucHVtb25pbixpbnRlbCxpbmNhdGVpa29rdSxpbmZyYXN0cnVjdHVyZSxpbmZsdWVuemEsaW5kb2NoaW5lLGltcHJlc3MsaW5kcmEsaW52ZXJ0ZXIsaW5kaWFuYXBvbGlzLGltcGhhbCxpbnRlcnByZXRlcixpbmRvc2hpbmFoYW5udG91LHlpbmxpbmdvZmpveXRveSxpbXBlZGFuY2UsaW5nZW5tYW1lLGludGVycGhvbmUsaW5kb2xlLGludGVybixpbXBhbGE=').split(',')

  commands.addUserCommand(
    ['biribiri', innantoka[parseInt(Math.random() * innantoka.length)]],
    'Tundere',
    function (args) {
      let arg = args.literalArg.trim();
      getc(arg.length ? arg : buffer.URL, function (url, c) {
        liberator.echo('Copied: ' + url);
        util.copyToClipboard(url);
      });
    },
    {
      completer: function (context, args) {
        context.completions = [
          [buffer.URL, 'Current URL']
        ];
        context.fork(
          'URL',
          0,
          context,
          function (context, args) completion.url(context, options['complete'])
        );
      }
    },
    true
  );

  plugins.haneru = {getc: getc};

})();

// vim:sw=2 ts=2 et si fdm=marker:
