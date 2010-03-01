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
  <name>feedSomeKeys 3</name>
  <name lang="ja">feedSomeKeys 3</name>
  <description>feed some defined key events into the Web content</description>
  <description lang="ja">キーイベントをWebコンテンツ側に送る</description>
  <version>1.0.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/feedSomeKeys_3.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    ----
  ]]></detail>
  <detail lang="ja"><![CDATA[
    ----
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<plugin name="feedSomeKeys" version="1.0.0"
        href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/feedSomeKeys_3.js"
        summary="Feed some defined key events into the Web content"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="anekos@snca.net">anekos</author>
  <license>New BSD License</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
  </p>
  <item>
    <tags>:fmap</tags>
    <spec>:fmap <oa>-e<oa>vents</oa>=<a>event-name-list</a></oa> <a>lhs</a> <a>rhs</a></spec>
    <description>
      <p></p>
    </description>
  </item>
</plugin>;
// }}}

(function () {

  const EVENTS = 'keypress keydown keyup'.split(/\s+/);

  function getFrame (num) {
    function bodyCheck (content)
      (content.document.body.localName.toLowerCase() === 'body');

    function get (content) {
      if (bodyCheck(content) && num-- <= 0)
        return content;
      for each (frame in Array.slice(content.frames)) {
        let result = get(frame);
        if (result)
          return result;
      }
      return void 0;
    }

    return get(content) || content;
  }

  function feed (keys, eventNames, elem) {
    let doc = document.commandDispatcher.focusedWindow.document;
    let _passAllKeys = modes.passAllKeys;
    modes.passAllKeys = true;
    modes.passNextKey = false;

    for (let [, keyEvent] in Iterator(events.fromString(keys))) {
      eventNames.forEach(function (eventName) {
        let evt = events.create(doc, eventName, keyEvent);
        (elem || doc).dispatchEvent(evt);
      });
    }

    modes.passAllKeys = _passAllKeys;
  }

  function regexpValidator (expr) {
    try {
      RegExp(expr);
      return true;
    } catch (e) {}
    return false;
  }

  function makeListValidator (list)
    (function (values)
      (liberator.log(values),
      values && !values.some(
        function (value) !list.some(function (event) event === value)
      ))
    );

  commands.addUserCommand(
    ['fmap'],
    'Feed map a key sequence',
    function (args) {
      let [, lhs, rhs] = args.literalArg.match(/^(\S+)\s+(.*)$/);
      mappings.addUserMap(
        [modes.NORMAL],
        [lhs],
        args['description'] || 'by feedSomeKeys_3.js',
        function () {
          let frame = args['-frame'];
          let elem = document.commandDispatcher.focusedWindow;
          if (typeof frame === 'undefined')
            elem  = getFrame(frame) || elem;
          feed(rhs, args['-events'] || ['keypress'], args['-vkey'], elem);
        },
        {
          urls: args['-urls']
        },
        true
      );
    },
    {
      literal: 0,
      options: [
        [['-urls', '-u'], commands.OPTION_STRING, regexpValidator],
        [['-vkey', '-v'], commands.OPTION_NOARG],
        [
          ['-events', '-e'],
          commands.OPTION_LIST,
          makeListValidator(EVENTS),
          EVENTS.map(function (v) [v, v])
        ]
      ],
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
