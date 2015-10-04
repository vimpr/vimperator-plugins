
// PLUGIN_INFO {{{
let PLUGIN_INFO = xml`
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
  let google_url = 'https:\/\/www.google.co.jp\/search.*';
  /* user config */
  // 選択状態表示マーカー
  let SELECT_MARKER_CHAR = '▶';
  // マーカー位置微調整
  let SELECT_MARKER_REPOSITION_LEFT = '0em';
  let SELECT_MARKER_REPOSITION_TOP = '0.3em';

  /* hard config */
  let GOOGLE_SELECTION_CLASS = 'r';
  let GOOGLE_SELECTION_SELECTED_CLASS = 'r-selected';

  commands.addUserCommand(
      ['googleselect'],
      'move select in google search result',
      function (args) {
        let v = 1;
        if (args.length && args[0] == 'back') {
          v = -1;
        }
        let $rs = window.content.window.document.getElementsByClassName(GOOGLE_SELECTION_CLASS);
        let pre = -1;
        for (let i = 0; i < $rs.length; i++) {
          if ($rs[i].className.indexOf(GOOGLE_SELECTION_SELECTED_CLASS) != -1) {
            pre = i;
            break;
          }
        }
        // ターゲット表示スタイル
        let $pointer = window.content.window.document.createElement('span');
        $pointer.style.color = 'blue';
        $pointer.id = 'google-select-pointer';
        $pointer.style.position = 'absolute';
        $pointer.style.marginTop = SELECT_MARKER_REPOSITION_TOP;
        $pointer.style.left = SELECT_MARKER_REPOSITION_LEFT;
        $pointer.innerHTML = SELECT_MARKER_CHAR;

        if (pre != -1) {
          // 現在の選択状態削除
          $rs[pre].className = GOOGLE_SELECTION_CLASS;
//          $rs[pre].style.borderLeft = "none";
          $rs[pre].childNodes[0].blur();
          let $e = window.content.window.document.getElementById('google-select-pointer');
          $e.parentNode.removeChild($e);
        } else if (v == -1) {
          pre = $rs.length;
        }
        if ((pre == 0 && v == -1) || (pre == $rs.length - 1 && v == 1)) {
          return;
        }

//        $rs[pre + v].style.borderLeft = "solid 5px blue";
        $rs[pre + v].className = $rs[pre + v].className + " " + GOOGLE_SELECTION_SELECTED_CLASS;
        $rs[pre + v].childNodes[0].focus();
        $rs[pre + v].parentNode.parentNode.insertBefore($pointer, $rs[pre + v].parentNode.parentNode.firstChild);
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

