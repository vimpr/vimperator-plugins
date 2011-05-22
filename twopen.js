/* NEW BSD LICENSE {{{
Copyright (c) 2011, Jagua.
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
# http://sourceforge.jp/projects/opensource/wiki/licenses%2Fnew_BSD_license #
# に参考になる日本語訳がありますが、有効なのは上記英文となります。 #
###################################################################################

}}} */

// PLUGIN_INFO {{{
let PLUGIN_INFO =
<VimperatorPlugin>
  <name>twopen</name>
  <description>open pages relative to the twitter id</description>
  <version>1.0.0</version>
  <author homepage="https://github.com/Jagua">Jagua</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/twopen.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>3.1</maxVersion>
  <detail><![CDATA[
    == Command ==
    :twopen service[!] @twitterId


    == Setting ==
    add the following setting to your ".vimperatorrc".
    you type ':twopen favstar @twitterId' and enter,
    then open 'http://favstar.fm/users/twitterId'.

    javascript <<EOM
    liberator.globalVariables.twopen_site_definition = [{
      name: ['favstar'],
      url: 'http://favstar.fm/users/%ID%',
    }];
    EOM


  ]]></detail>
  <detail lang="ja"><![CDATA[
    twitter ID に紐付けされた関連サイトを開く．
    関連サイトは予め .vimperatorrc に登録しておくこと．
    (twitpic のみ予め登録せずとも使える)

    (1) twitter ID が @twitterId の twitpic をカレントタブに開きたい場合
    :twopen twitpic @twitterId

    (2) 同じく新規タブに開きたい場合
    :twopen twitpic! @twitterId


    == Command ==
    :twopen service[!] @twitterId


    == Setting ==
    .vimperatorrc に設定書いて任意のサイトをどんどん追加できます．

    javascript <<EOM
    liberator.globalVariables.twopen_site_definition = [{
      name: ['twilog'],
      url: 'http://twilog.org/%ID%',
    }];
    EOM

    として twilog を登録すると，
    :twopen twilog @twitterId
    でカレントタブに @twitterId の twilog ページをオープンする．
    :twopen twilog! @twitterId
    で新規タブにオープンする．
    ちなみに twilog の部分は全部打たなくても Vimperator の補完で表れるようになっている．

    さらに .vimperatorrc に
    cabbr -j .id  if(content.document.querySelector('.tweet-user-block-screen-name')){content.document.querySelector('.tweet-user-block-screen-name').textContent.trim()}else{content.document.querySelector('.screen-name').textContent.trim()}
    と書いておくと，@twitterId の ホーム or ステータス表示時に
    :twopen twitpic .id<space>
    で勝手に .id の部分を twitter ID に置換入力してくれて便利．<space> は C-] でも代用可．


    == Todo ==
    Twittperator と連携できたら素敵でしょうか．


    ]]></detail>
</VimperatorPlugin>;
// }}}

(function () {

  const SITE_DEFINITION = [{
    name: ['twitpic'],
    url: 'http://twitpic.com/photos/%ID%',
    /*
    },{
    name: ['twilog'],
    url: 'http://twilog.org/%ID%',
    },{
    name: ['twaudio'],
    url: 'http://twaud.io/users/%ID%',
    },{
    name: ['twitvideojp'],
    url: 'http://twitvideo.jp/contents/lists/%ID%',
    },{
    name: ['twipla'],
    url: 'http://twipla.jp/users/%ID%',
    },{
    name: ['favotter'],
    url: 'http://favotter.net/user/%ID%',
    },{
    name: ['favstar'],
    url: 'http://favstar.fm/users/%ID%',
    },{
    name: ['togetter'],
    url: 'http://togetter.com/id/%ID%',
    },{
    name: [''],
    url: '',
    */
  }];

  let (siteDef = liberator.globalVariables.twopen_site_definition) {
    if (siteDef) {
      if (siteDef instanceof String)
        siteDef = eval(siteDef);
      if (siteDef.forEach instanceof Function)
        siteDef.forEach(function (obj) SITE_DEFINITION.push(obj));
      else
        SITE_DEFINITION.push(siteDef);
    }
  }

  MainSubCommands = [];
  SITE_DEFINITION.forEach(function (def) {
    MainSubCommands.push(new Command(
        def.name,
        def.name[0],
        function (args) {
          if (args.literalArg.trim().match(/^@([_0-9a-zA-Z]+)$/)) {
            liberator.open(def.url.replace(/%ID%/, RegExp.$1),
                           (args.bang ? liberator.NEW_TAB : liberator.CURRENT_TAB));
          } else {
            throw new Error('illegal twitter id error : ' + args.literalArg);
          }
        },{
          literal: 0,
          bang: true
        }
      ));
  });

  commands.addUserCommand(
    ['two[pen]'],
    'open pages relative to the twitter id',
    function () {
      liberator.echo('(Help) :twopen service[!] @twitterId');
    },
    {
      subCommands: MainSubCommands,
    },
    true
  );
})();

// vim:sw=2 ts=2 et si fdm=marker:
