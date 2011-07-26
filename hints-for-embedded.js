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
  <plugin name="HintsForEmbeded" version="1.4.1"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/hints-for-embedded.js"
          summary="Add the hints mode for embedded objects."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <item>
      <tags>:embhint</tags>
      <spec>:embhint</spec>
      <description>
        <p>
          Show hints for embedded objects.
        </p>
      </description>
    </item>
    <item>
      <tags>g:hints_for_embedded_mode </tags>
      <spec>let g:hints_for_embedded_mode=<a>hints-mode-character</a></spec>
      <description>
        <p>
          Hints mode characters.
          Default is not available.
        </p>
      </description>
    </item>
    <item>
      <tags>g:hints_for_embedded_where </tags>
      <spec>let g:hints_for_embedded_where=<a>where</a></spec>
      <description>
        <p>
          Where to open.
          <a>where</a> values.
          <ul>
            <li>new_tab</li>
            <li>current_tab</li>
            <li>new_background_tab</li>
            <li>new_window</li>
          </ul>
        </p>
      </description>
    </item>
  </plugin>
  <plugin name="HintsForEmbeded" version="1.4.1"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/hints-for-embedded.js"
          summary="埋め込み(embed)オブジェクト用ヒントモード"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <item>
      <tags>:embhint</tags>
      <spec>:embhint</spec>
      <description>
        <p>
          埋め込みオブジェクト用ヒントを表示
        </p>
      </description>
    </item>
    <item>
      <tags>g:hints_for_embedded_mode </tags>
      <spec>let g:hints_for_embedded_mode=<a>hints-mode-character</a></spec>
      <description>
        <p>
          ヒントモード文字。
          デフォルト無効。
        </p>
      </description>
    </item>
    <item>
      <tags>g:hints_for_embedded_where </tags>
      <spec>let g:hints_for_embedded_where=<a>where</a></spec>
      <description>
        <p>
          どこに開くか？
          <a>where</a> 値
          <ul>
            <li>new_tab</li>
            <li>current_tab</li>
            <li>new_background_tab</li>
            <li>new_window</li>
          </ul>
        </p>
      </description>
    </item>
  </plugin>
</>;
// }}}

(function () {

  const DESC = 'Hint for embedded object';

  let modeName = liberator.globalVariables.hints_for_embedded_mode || 'hints-for-embedded';
  let where = liberator.globalVariables.hints_for_embedded_where;
  let openParent = liberator.globalVariables.hints_for_embedded_open_parent_link || 0;

  if (typeof where === 'undefined')
    where = liberator.NEW_TAB;
  if (typeof where === 'string')
    where = liberator[where.replace(/[-\s]/g, '_').toUpperCase()];


  let sites = {
    nico: {
      site: /(nico|smile)video/,
      name: /.*/,
      value: /(?:v|wv_id)=([a-z]{2}\d{1,10})/,
      url: function (id) ('http://www.nicovideo.jp/watch/' + id)
    },
    youtube: {
      site: /youtube/,
      name: /.*/,
      value: /youtube\.com\/v\/([-a-zA-Z0-9_]+)/,
      url: function (id) ('http://www.youtube.com/watch?v=' + id)
    },
    youtube_image: {
      site: /ytimg\.com/,
      name: /^flashvars$/,
      value: /video_id=([-a-zA-Z0-9_]+)/,
      url: function (id) ('http://www.youtube.com/watch?v=' + id)
    },
    vimeo: {
      site: /vimeo/,
      name: /.*/,
      value: /clip_id=(\d+)/,
      url: function (id) ('http://vimeo.com/' + id)
    },
    collegehumor: {
      site: /collegehumor/,
      name: /.*/,
      value: /clip_id=(\d+)/,
      url: function (id) ('http://www.collegehumor.com/video:' + id)
    }
  };

  function getAttrs (elem)
    Array.map(elem.attributes, function(n) [n.nodeName, n.nodeValue]);

  function getInfo (elem)
    getAttrs(elem).concat((Array.slice(elem.querySelectorAll('object,embed,param')) || []).map(getInfo));

  function open (elem) {
    let info = getInfo(elem.wrappedJSObject);

    if (elem.tagName === 'IMG' && elem.src) {
      if (openParent) {
        let p = elem.parentNode;
        if (p.tagName === 'A' && /(gif|png|jpe?g)$/i.test(p.href))
          return liberator.open(p.href, liberator.NEW_TAB);
      }
      return liberator.open(elem.src, liberator.NEW_TAB);
    }

    let site =
      (function () {
        for (let [,site] in Iterator(sites))
          if (info.some(function (nv) nv.some(function (v) site.site.test(v))))
            return site;
      })();

    if (site) {
      for each (let [n, v] in info) {
        [n, v] = [String(n), String(v)];
        if (site.name && !site.name.test(n))
          continue;
        let m = n.match(site.value) || v.match(site.value);
        if (m)
          return site.url(Array.slice(m, 1));
      }
    }

    let urls = info.filter(function ([n, v]) /^https?:\/\//.test(v));
    if (!urls.length)
      return liberator.echoerr('Could not found URL');

    commandline.input(
      'Select the link you wish to open: ',
      function (url) {
        liberator.open(url, where);
      },
      {
        default: urls[0][1],
        completer: function (context) {
          context.completions = [[v, n] for each ([n, v] in urls)];
        }
      }
    );
  }

  hints.addMode(
    modeName,
    DESC,
    function (elem) {
      liberator.open(open(elem), where);
    },
    function () '//embed | //object | //img'
  );

  commands.addUserCommand(
    ['embhint'],
    DESC,
    function (args) {
      hints.show(modeName);
    },
    {},
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
