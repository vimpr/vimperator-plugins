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
  <plugin name="GMailCommando" version="1.4.10"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/gmail-commando.js"
          summary="The handy commands for GMail"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p>Search with good completer.</p>
    <item>
      <tags>:gmail</tags>
      <spec>:gmail<oa>!</oa> <a>gmail-search-words</a></spec>
      <description>
        <p>
          Start to search with <a>gmail-search-words</a>.
          If <oa>!</oa> is given,  open the new tab.
        </p>
      </description>
    </item>
    <item>
      <tags>g:gmail_commando_map_</tags>
      <spec>g:gmail_commando_map_<a>function-name</a> = <a>key-sequence</a></spec>
      <description>
        <p>
          Set the mappings for Gmail page.
        </p>
        <p>
          Available values for <a>function-name</a>:
          <dl>
            <dt>translate</dt><dd>メール翻訳</dd>
            <dt>fold</dt><dd>折りたたみ</dd>
            <dt>unfold</dt><dd>折りたたみ解除</dd>
          </dl>
        </p>
      </description>
    </item>
  </plugin>
  <plugin name="GMailコマンドー" version="1.4.10"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/gmail-commando.js"
          summary="便利なGMail用コマンドー"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p>ステキ補完で検索</p>
    <item>
      <tags>:gmail</tags>
      <spec>:gmail<oa>!</oa> <a>gmail-search-words</a></spec>
      <description>
        <p>
          <a>gmail-search-words</a> で検索をします。
          <oa>!</oa> 付きの場合は、新しいタブで Gmail を開きます。
        </p>
      </description>
    </item>
    <item>
      <tags>g:gmail_commando_map_</tags>
      <spec>g:gmail_commando_map_<a>function-name</a> = <a>key-sequence</a></spec>
      <description>
        <p>
          Gmail のページ内でのみ有効なマッピングを設定します。
        </p>
        <p>
          <a>function-name</a> は以下の値が有効です。
          <dl>
            <dt>translate</dt><dd>メール翻訳</dd>
            <dt>fold</dt><dd>折りたたみ</dd>
            <dt>unfold</dt><dd>折りたたみ解除</dd>
          </dl>
        </p>
      </description>
    </item>
  </plugin>
</>;
// }}}


(function () {

  function A (list)
    Array.slice(list);

  function click (elem)
    buffer.followLink(elem, liberator.CURRENT_TAB);

  const Conf = (function () {
    let gv = liberator.globalVariables;
    let conf = {};
    'label_shortcut'.split(/\s/).forEach(function (n) {
      conf.__defineGetter__(
        n.replace(/_./g, function (m) m.slice(1).toUpperCase()),
        function () gv['gmail_commando_' + n]
      );
    });
    return conf;
  })();

  const Languages = [
    ['af', 'Afrikaans'],
    ['sq', 'Albanian'],
    ['am', 'Amharic'],
    ['ar', 'Arabic'],
    ['hy', 'Armenian'],
    ['az', 'Azerbaijani'],
    ['eu', 'Basque'],
    ['be', 'Belarusian'],
    ['bn', 'Bengali'],
    ['bh', 'Bihari'],
    ['bg', 'Bulgarian'],
    ['my', 'Burmese'],
    ['ca', 'Catalan'],
    ['chr', 'Cherokee'],
    ['zh', 'Chinese'],
    ['zh-CN', 'Chinese_simplified'],
    ['zh-TW', 'Chinese_traditional'],
    ['hr', 'Croatian'],
    ['cs', 'Czech'],
    ['da', 'Danish'],
    ['dv', 'Dhivehi'],
    ['nl', 'Dutch'],
    ['en', 'English'],
    ['eo', 'Esperanto'],
    ['et', 'Estonian'],
    ['tl', 'Filipino'],
    ['fi', 'Finnish'],
    ['fr', 'French'],
    ['gl', 'Galician'],
    ['ka', 'Georgian'],
    ['de', 'German'],
    ['el', 'Greek'],
    ['gn', 'Guarani'],
    ['gu', 'Gujarati'],
    ['iw', 'Hebrew'],
    ['hi', 'Hindi'],
    ['hu', 'Hungarian'],
    ['is', 'Icelandic'],
    ['id', 'Indonesian'],
    ['iu', 'Inuktitut'],
    ['ga', 'Irish'],
    ['it', 'Italian'],
    ['ja', 'Japanese'],
    ['kn', 'Kannada'],
    ['kk', 'Kazakh'],
    ['km', 'Khmer'],
    ['ko', 'Korean'],
    ['ku', 'Kurdish'],
    ['ky', 'Kyrgyz'],
    ['lo', 'Laothian'],
    ['lv', 'Latvian'],
    ['lt', 'Lithuanian'],
    ['mk', 'Macedonian'],
    ['ms', 'Malay'],
    ['ml', 'Malayalam'],
    ['mt', 'Maltese'],
    ['mr', 'Marathi'],
    ['mn', 'Mongolian'],
    ['ne', 'Nepali'],
    ['no', 'Norwegian'],
    ['or', 'Oriya'],
    ['ps', 'Pashto'],
    ['fa', 'Persian'],
    ['pl', 'Polish'],
    ['pt-PT', 'Portuguese'],
    ['pa', 'Punjabi'],
    ['ro', 'Romanian'],
    ['ru', 'Russian'],
    ['sa', 'Sanskrit'],
    ['sr', 'Serbian'],
    ['sd', 'Sindhi'],
    ['si', 'Sinhalese'],
    ['sk', 'Slovak'],
    ['sl', 'Slovenian'],
    ['es', 'Spanish'],
    ['sw', 'Swahili'],
    ['sv', 'Swedish'],
    ['tg', 'Tajik'],
    ['ta', 'Tamil'],
    ['tl', 'Tagalog'],
    ['te', 'Telugu'],
    ['th', 'Thai'],
    ['bo', 'Tibetan'],
    ['tr', 'Turkish'],
    ['uk', 'Ukrainian'],
    ['ur', 'Urdu'],
    ['uz', 'Uzbek'],
    ['ug', 'Uighur'],
    ['vi', 'Vietnamese'],
    ['cy', 'Welsh'],
    ['yi', 'Yiddish'],
    ['', 'Unknown']
  ];


  const Elements = {
    get doc() content.frames[3].document,

    get labels() A(this.doc.querySelectorAll('a.n0')).filter(function (it) (/#label/.test(it.href))),

    // 入力欄 と 検索ボタンは Buzz の有効無効によって ID が変わる
    get input() this.doc.querySelector('input.GcwpPb-hsoKDf.nr'),

    get searchButton() this.doc.querySelector('div.J-Zh-I.J-J5-Ji.L3.J-Zh-I-Js-Zq'),

    get translateButton () (this.mail && this.mail.querySelector('tr > td.SA > .iL.B9')),
    get translateButtons () A(this.doc.querySelectorAll('tr > td.SA > .iL.B9')),

    get mail ()
      let (es = this.mails.filter(function (it) !it.querySelector('.hF.hH > img.hG')))
        (es.length && es[0]),
    get mails () A(this.doc.querySelectorAll('.h7')),

    get threadButtons () this.doc.querySelectorAll('div.hk > span > u'),

    get translateThreadButton () this.threadButtons[5],

    // XXX 毎度 ID が変わるっぽいので、u から選択
    get foldButton () this.threadButtons[3],
    get unfoldButton () this.threadButtons[2],

    get labelButtons () {
      function labels ()
        Elements.doc.querySelectorAll('.J-LC-Jz');
      function show ()
        Elements.doc.getElementById(':ps');

      let result = labels();
      if (result)
        return A(result);

      click(show());
      result = labels();
      click(show());

      return A(result);
    },

    get importantButton ()
      Elements.doc.querySelectorAll('.NRYPqe > .J-Zh-I.J-J5-Ji.J-Zh-I.J-Zh-I-Js-Zj.J-Zh-I-KE')[2],
    get unimportantButton ()
      Elements.doc.querySelectorAll('.NRYPqe > .J-Zh-I.J-J5-Ji.J-Zh-I.J-Zh-I-Js-Zq')[2]
  };

  const Commando = {
    get inGmail () {
      try {
        var result = /^mail\.google\.com$/.test(Elements.doc.location.hostname)
      } catch (e) {}
      return result;
    },

    search: function (args, newtab) {
      const URL = 'https://mail.google.com/mail/#search/';

      if (this.inGmail && !newtab) {
        Elements.input.value = args;
        click(Elements.searchButton);
      } else {
        liberator.open(URL + encodeURIComponent(args), liberator.NEW_TAB);
      }
    },

    storage: storage.newMap('gmail-commando', {store: true})
  };

  const Commands = {
    translate: function () {
      let button = Elements.translateButton || Elements.translateButtons[0];
      click(button);
    },
    translateThread: function () click(Elements.translateThreadButton),
    fold: function () click(Elements.foldButton),
    unfold: function () click(Elements.unfoldButton),
    label: function (names) {
      Elements.labelButtons.forEach(function (e) {
        if (names.some(function (v) (v == e.textContent)))
          click(e);
          liberator.log('pressed: ' + e.textContent);
      });
    },
    important: function () click(Elements.importantButton),
    unimportant: function () click(Elements.unimportantButton)
  };


  // sort はなんで破壊的なの！？
  const GMailSearchKeyword = 'label subject from to cc bcc has is in lang filename before after'.split(/\s/).sort();

  function simpleValueCompleter (values) {
    return function (context) {
      context.completions = [
        [v, v] for ([, v] in Iterator(values))
      ];
    };
  }

  const KeywordValueCompleter = {
    __noSuchMethod__: function () void 0,

    // XXX storage はちょっと重いっぽいので、ちょっと工夫する
    label: let (last = []) function (context) {
      if (Commando.inGmail) {
        var labels = Elements.labels.map(function (it) it.textContent);
        if (last.toString() != labels)
          Commando.storage.set('labels', labels);
      } else {
        var labels = last.length ? last : Commando.storage.get('labels', []);
      }
      context.completions = [
        [label.replace(/\s*\(\d+\+?\)$/, ''), label]
        for ([, label] in Iterator(labels))
      ];
    },

    labelAndValue: function (context) {
      KeywordValueCompleter.label(context);
      context.completions.forEach(function (it) {
        it[0] = 'label:' + it[0];
      });
    },

    has: simpleValueCompleter('attachment'.split(/\s/).sort()),

    is: simpleValueCompleter('read unread starred chat voicemail muted sent'.split(/\s/).sort()),

    in: simpleValueCompleter('anywhere inbox drafts spam trash'.split(/\s/).sort()),

    lang: function (context) {
      context.completions = [
        [v, v] for ([, v] in Iterator(Languages))
      ];
    }
  };


  commands.addUserCommand(
    ['gmail'],
    'GMail Commando',
    function (args) {
      Commando.search(args.literalArg, args.bang);
    },
    {
      bang: true,
      literal: 0,
      completer: function (context, args) {
        function currentInputCompleter (context) {
          context.title = ['Current'];
          context.completions = [[Elements.input.value, 'Current']];
        }

        function normalCompleter (context) {
          let input = args.string.slice(0, context.caret);
          let m;

          if (m = /([a-z]+):(?:([^\s\(\)\{\}]*)|[\(\{]([^\(\)\{\}]*))$/.exec(input)) {
            if (m[2]) {
              context.advance(input.length - m[2].length);
            } else {
              let tail = /[^\s]*$/.exec(m[3]);
              context.advance(input.length - tail[0].length);
            }
            let key = m[1];
            KeywordValueCompleter[key](context, args);
          } else if (m = /[-\s]*([^-\s:\(\)\{\}]*)$/.exec(input)) {
            context.advance(input.length - m[1].length);
            context.completions = [
              [v + ':', v] for ([, v] in Iterator(GMailSearchKeyword))
            ];
            if (Conf.labelShortcut)
              context.fork('Label+', 0, context, KeywordValueCompleter.labelAndValue);
          }
        }

        if (Commando.inGmail && Elements.input.value)
          context.fork('Current', 0, context, currentInputCompleter);
        context.fork('Search', 0, context, normalCompleter);
      }
    },
    true
  );


  'translate translateThread fold unfold important unimportant'.split(/\s/).forEach(function (cmd) {
    let gv =
      liberator.globalVariables[
        'gmail_commando_map_' +
        cmd.replace(/[A-Z]/g, function (m) ('_' + m.toLowerCase()))
      ];
    if (!gv)
      return;
    mappings.addUserMap(
      [modes.NORMAL],
      gv.split(/\s+/),
      cmd + ' - Gmail Commando',
      function () {
        Commands[cmd]();
      },
      {
        matchingUrls: RegExp('https://mail\\.google\\.com/mail/*')
      }
    );
  });

  __context__.command  = Commands;
  __context__.element  = Elements;

})();

// vim:sw=2 ts=2 et si fdm=marker:
