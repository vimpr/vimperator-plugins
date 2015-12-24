// PLUGIN_INFO {{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
<name>GoogleSelect</name>
<name lang="ja">グーグルセレクト</name>
<description>you can quick select in Google search result page</description>
<description lang="ja">Google検索結果からページ選択を楽にできる</description>
<version>1.0</version>
<author mail="hiro@elzup.com" homepage="blog.elzup.com">elzup</author>
<minVersion>1.0</minVersion>
<maxVersion>2.0pre</maxVersion>
<detail lang="ja"><![CDATA[
]]></detail>
</VimperatorPlugin>`;
// }}}

(function () {
  /* user config */
  // TODO: 外部ファイル化したい
  let select_configs = [
    {
      name: 'google',
      url: 'https?://www\.google\.co\.jp/search',
      element_css_selector: '.r a',
      marker_posfix: {
        top: '0.0em',
        left: '-1.0em'
      }
    }
  ];
/*
独自設定は設定ファイルで変数を定義しておく
liberator.globalVariables.googleSelectConfigs = [
  {
    name: 'github search',
    url: 'https?://github\.com/search',
    element_css_selector: '.codesearch-results .repo-list-item h3 a,.code-list-item p.title a:nth-of-type(2),.issue-list-item p.title a,.user-list-info>a',
    marker_posfix: {
      top: '0.0em',
      left: '-1.0em'
    }
  }, {
      name: 'google', // サービス名
      url: 'https?://www\.google\.co\.jp/search', // 適用したいURLのマッチ正規表現
      element_css_selector: '.r a', // アイテム要素を絞り込む CSSセレクタ
      marker_posfix: { // マーカーの位置を修正
        top: '0.0em',
        left: '-1.0em'
      }
    },
];
*/
  // 選択状態表示マーカー
  let SELECT_MARKER_CHAR = '▶';
  // マーカー位置微調整
  let SELECT_MARKER_ID = 'google-select-pointer';

  /* hard config */
  let SELECTED_CLASS = 'vimpr_googleelect_selected';

  commands.addUserCommand(
      ['googleselect'],
      'move select in google search result',
      function (args) {
        let v = 1;
        if (args.length && args[0] == 'back') {
          v = -1;
        }
        // url から有効化する設定をチェック
        let config = null;
        if (liberator.globalVariables.googleSelectConfigs != 'undefined') {
            select_configs = select_configs.concat(liberator.globalVariables.googleSelectConfigs);
        }
        for (var i = 0; i < select_configs.length; i ++) {
          if (RegExp(select_configs[i].url).test(buffer.URL)) {
            config = select_configs[i];
            break;
          }
        }
        if (config == null) {
          return;
        }
        // HACK: 適切でない？
        // document DOM Element
        let $doc = window.content.window.document;
        // 選択対象となる要素
        let $ses = $doc.querySelectorAll(config.element_css_selector);
        let preIndex = -1;

        // ターゲット表示スタイル
        let $pointer = $doc.createElement('span');
        $pointer.style.color = 'blue';
        $pointer.id = SELECT_MARKER_ID;
        $pointer.style.position = 'absolute';
        $pointer.style.marginTop = config.marker_posfix.top;
        $pointer.style.left = config.marker_posfix.left;
        $pointer.innerHTML = SELECT_MARKER_CHAR;


        // 指定した要素がなかったら終了
        if ($ses.length == 0) {
          // TODO: error 出力にしたい
          liberator.echo('no selection element. [googleselect]');
          return;
        }
        // すでに選択している要素があったら index を取得
        $sdes = $doc.getElementsByClassName(SELECTED_CLASS);
        if ($sdes.length > 0) {
          preIndex = Array.prototype.indexOf.call($ses, $sdes[0]);
        }

        if (preIndex != -1) {
          // 現在の選択状態削除
          $ses[preIndex].classList.remove(SELECTED_CLASS)
          $ses[preIndex].childNodes[0].blur();
          let $e = $doc.getElementById(SELECT_MARKER_ID);
          $e.parentNode.removeChild($e);
        }
        let nextIndex = preIndex + v;
        if (nextIndex == -2) {
          nextIndex = $ses.length - 1;
        }
        if (nextIndex < 0 || $ses.length <= nextIndex) {
          return;
        }

        $ses[nextIndex].classList.add(SELECTED_CLASS);
        $ses[nextIndex].focus();
        $ses[nextIndex].insertBefore($pointer, $ses[nextIndex].firstChild);
      },
      {
        literal: 0,
        bang: true,
        count: true,
        argCount: '?',
        options: [],
        completer: function (context, args) {
          context.title = ['value', 'description'];
          context.completions = [
            ['front', 'move front item'],
            ['back', 'move back item']
          ];
        }
      },
    true // replace
      );


})();

// vim:sw=2 ts=2 et si fdm=marker:

