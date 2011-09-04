/* NEW BSD LICENSE {{{
Copyright (c) 2009-2010, anekos.
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
  <name>Google Translator</name>
  <name lang="ja">Google Translator</name>
  <description>Translate with Google AJAX Language API</description>
  <version>1.0.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/google-translator.js</updateURL>
  <require>_libly.js</require>
  <minVersion>2.3</minVersion>
  <maxVersion>2.4</maxVersion>
</VimperatorPlugin>;
// }}}

// INFO {{{
let INFO =
<plugin name="Google Translator" version="1.0.0"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/google-translator.js"
        summary="Translate with Google AJAX Language API"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="anekos@snca.net">anekos</author>
  <license>New BSD License</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
    Translate with Google AJAX Language API.
  </p>
  <item>
    <tags>:gtrans</tags>
    <spec>:gtrans <oa>-a<oa>ction</oa>=<a>actionName</a></oa> text</spec>
    <description>
      <p>
        Translate!!!!!!!!!!!
      </p>
      <p>The following options are interpreted.</p>
      <dl>
        <dt>-a<oa>ction</oa></dt>
        <dd>
          以下の<oa>actionName</oa>が設定可能
          <ul>
            <li>echo</li>
            <li>replace(not implemented)</li>
            <li>copy</li>
          </ul>
        </dd>
      </dl>
    </description>
  </item>
</plugin>;
// }}}

(function () {

  const refererURL = 'http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/trunk/google-translator.js';

  const languages = [
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

  const settings = {
    get pair ()
      (liberator.globalVariables.google_translator_pair || 'ja en').split(' '),
    get actions ()
      (liberator.globalVariables.google_translator_actions || 'echo').split(' ')
  };

  function getTexts ()
    util.Array.uniq(
      [it.textContent.trim().replace(/\n|\s+/g, ' ') for (it in Iterator(util.evaluateXPath('//text()')))],
      true
    );

  function textCompleter (context, args) {
    if (!liberator.globalVariables.google_translator_text_completer)
      return;
    let i = 0, cs = [];
    for (let [, it] in Iterator(getTexts())) {
      if (++i > 100)
        break;
      if (it.length > 3 && !/^\s*</.test(it))
        cs.push([it, '']);
    }
    context.completions = cs;
  }

  function guessRequest (text, done) {
    let url =
      'http://ajax.googleapis.com/ajax/services/language/detect?v=1.0' +
      '&q=' + encodeURIComponent(text);
    let req =
      new plugins.libly.Request(
        url,
        {
            Referrer: refererURL,
        }
      );
    req.addEventListener(
      'onSuccess',
      function (res) {
        var result = plugins.libly.$U.evalJson(res.responseText);
        done(result.responseData.language);
      }
    );
    req.get();
  }

  function translateRequest (text, opts /* from, to, done */) {
    opts || (opts = {});
    let url =
      'http://ajax.googleapis.com/ajax/services/language/translate?v=1.0' +
      '&q=' + encodeURIComponent(text) +
      '&langpair=' + (opts.from || 'en') + encodeURIComponent('|') + (opts.to || 'ja');
    let req =
      new plugins.libly.Request(
        url,
        {
            Referrer: refererURL,
        }
      );
    req.addEventListener(
      'onSuccess',
      function (res) {
        let result = plugins.libly.$U.evalJson(res.responseText);
        let translated = result.responseData.translatedText;
        liberator.log('translated: ' + translated);
        opts.done(translated);
      }
    );
    req.get();
  }

  // 何語か妄想する
  // XXX 使ってないよ！
  function guess (text) {
    const codePatterns = {
      ja:
        /[\u3041-\u3093\u30A1-\u30F6\u30FC\u3005\u3007\u303B\u3400-\u9FFF\uF900-\uFAFF\u20000-\u2FFFF]/g,
      en:
        /[a-zA-Z]/g
    };

    function matchCount (s, re) {
      let r = 0;
      s.replace(re, function (m) (r += m.toString().length));
      return r;
    }

    let max = {lang: null, length: 0};
    for (let lang in codePatterns) {
      let len = matchCount(test, codePatterns[lang]);
      if (len > max.length)
        max = {lang: lang, length: len};
    }

    return max.lang || 'en';
  }


  let actions = {
    echo:
      function (text) liberator.echo('<div style="white-space:normal">' + text + '</div>', commandline.FORCE_MULTILINE),
    insert:
      // FIXME 見えない要素相手だとうまくいかない
      function (text) {
        let div = content.document.createElement('div');
        div.setAttribute('style', 'border: dotted 2px blue; padding: 5px;');
        div.textContent = text;
        let selection = content.window.getSelection();
        if (selection.rangeCount > 0) {
          let range = selection.getRangeAt(0);
          range.insertNode(div);
        }
      },
    copy:
      function (text) util.copyToClipboard(text, true)
  };

  function makeListValidator (list)
    function (vs) (!vs || !vs.some(function (v) !list.some(function (at) (v == at))));

  commands.addUserCommand(
    ['gtrans'],
    'Google Translator',
    function (args) {
      let text = args.literalArg;
      let actionNames = args['-action'] || settings.actions;
      let [from, to] = [args['-from'], args['-to']];

      if (!text)
        text = buffer.getCurrentWord();

      if (args['-guess']) {
        guessRequest(
          text,
          function (lang) [liberator.echo(v) for ([, [k, v]] in Iterator(languages)) if (k == lang)]
        );
        return;
      }

      if (args.bang)
        actionNames.push('insert');

      if (!actionNames.length)
        actionNames.push('echo');

      function setPair () {
        if ((!from ^ !to) && settings.pair.length >= 2)
          let (v = settings.pair[(settings.pair[0] == (from || to)) - 0])
            (from ? (to = v) : (from = v));
      }

      function req () {
        translateRequest(
          text,
          {
            done: function (text) actionNames.forEach(function (name) actions[name](text)),
            from: from,
            to: to
          }
        );
      }

      if (from) {
        setPair();
        req();
      } else {
        guessRequest(
          text,
          function (fromLang) {
            from = fromLang;
            liberator.log('lang: ' + fromLang);
            setPair();
            req();
          }
        );
      }
    },
    {
      literal: 0,
      bang: true,
      options:
        let (actionTypes = [n for (n in actions)])
          [
            [
              ['-action', '-a'],
              commands.OPTION_LIST,
              makeListValidator(actionTypes),
              actionTypes.map(function (v) [v, v]),
              true
            ],
            [['-from', '-f'], commands.OPTION_STRING, null, languages],
            [['-to', '-t'], commands.OPTION_STRING, null, languages],
            [['-guess', '-g'], commands.OPTION_NOARG]
          ],
      completer: textCompleter
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
