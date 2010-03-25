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
let PLUGIN_INFO =
<VimperatorPlugin>
  <name>Hints For Embedded Objects</name>
  <description>Add the hints mode for Embedded objects.</description>
  <description lang="ja">埋め込み(embed)オブジェクト用ヒントモード</description>
  <version>1.0.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/hints-for-embedded.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    :embhint:
      Show hints for embedded objects.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    :embhint:
      埋め込みオブジェクト用ヒントを表示
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="HintsForEmbeded" version="1.0.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/hints-for-embedded.js"
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
  </plugin>
  <plugin name="HintsForEmbeded" version="1.0.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/hints-for-embedded.js"
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
  </plugin>
</>;
// }}}

(function () {

  const DESC = 'Hint for embedded object';

  let modeName = liberator.globalVariables.hint_for_embedded_mode || 'hint-for-embedded';
  let where = liberator.globalVariables.hint_for_embedded_where;

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
      value: /youtube\.com\/v\/([a-zA-Z0-9]+)/,
      url: function (id) ('http://www.youtube.com/watch?v=' + id)
    }
  };

  function getAttrs (elem)
    Array.map(elem.attributes, function(n) [n.nodeName, n.nodeValue]);

  function getInfo (elem)
    Array.concat.apply(
      getAttrs(elem),
      (Array.slice(elem.querySelectorAll('object,embed,param')) || []).map(getInfo));

  function elemToURL (elem) {
    let info = getInfo(elem.wrappedJSObject);

    if (elem.tagName === 'IMG' && elem.src)
      return liberator.open(elem.src, liberator.NEW_TAB);

    let site =
      (function () {
        for (let [,site] in Iterator(sites))
          if (info.some(function (nv) nv.some(function (v) site.site.test(v))))
            return site;})();

    for each (let [n, v] in info) {
      let m = n.match(site.value) || v.match(site.value);
      liberator.log(v);
      if (m)
        return site.url(Array.slice(m, 1));
    }
  }

  hints.addMode(
    modeName,
    DESC,
    function (elem) {
      liberator.open(elemToURL(elem), where);
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
