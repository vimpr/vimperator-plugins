
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
  let select_configs = [
    { name: 'google', url: 'https://www.google.co.jp/search.*', element_css_selector: '.r' }
  ];
  // 選択状態表示マーカー
  let SELECT_MARKER_CHAR = '▶';
  // マーカー位置微調整
  let SELECT_MARKER_REPOSITION_LEFT = '0em';
  let SELECT_MARKER_REPOSITION_TOP = '0.3em';

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
        // TODO: select config from page url
        let config = select_configs[0];
        // HACK: 適切でない？
        // document DOM Element
        let $doc = window.content.window.document;
        // 選択対象となる要素
        let $ses = $doc.querySelectorAll(config.element_css_selector);
        let preIndex = -1;

        // 指定した要素がなかったら終了
        if ($ses.length == 0) {
          // TODO: error 出力にしたい
          liberator.echo('no selection element.');
          return;
        }
        // すでに選択している要素があったら index を取得
        $sdes = $doc.getElementsByClassName(SELECTED_CLASS);
        if ($sdes.length > 0) {
          preIndex = Array.prototype.indexOf.call($ses, $sdes[0]);
        }

        // ターゲット表示スタイル
        let $pointer = $doc.createElement('span');
        $pointer.style.color = 'blue';
        $pointer.id = 'google-select-pointer';
        $pointer.style.position = 'absolute';
        $pointer.style.marginTop = SELECT_MARKER_REPOSITION_TOP;
        $pointer.style.left = SELECT_MARKER_REPOSITION_LEFT;
        $pointer.innerHTML = SELECT_MARKER_CHAR;

        if (preIndex != -1) {
          // 現在の選択状態削除
          $ses[preIndex].classList.remove(SELECTED_CLASS)
          $ses[preIndex].childNodes[0].blur();
          let $e = $doc.getElementById('google-select-pointer');
          $e.parentNode.removeChild($e);
        } else if (v == -1) {
          preIndex = $ses.length;
        }
        if ((preIndex == 0 && v == -1) || (preIndex == $ses.length - 1 && v == 1)) {
          return;
        }

        // $ses[preIndex + v].style.borderLeft = "solid 5px blue";
        $ses[preIndex + v].classList.add(SELECTED_CLASS);
        $ses[preIndex + v].childNodes[0].focus();
        $ses[preIndex + v].parentNode.parentNode.insertBefore($pointer, $ses[preIndex + v].parentNode.parentNode.firstChild);
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

