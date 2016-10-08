// PLUGIN_INFO {{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
<name>CheckBoxAll</name>
<name lang="ja">チェックボックスオール</name>
<description>you can controll all checkbox at a time</description>
<description lang="ja">チェックボックスを一括でコントロールする</description>
<version>1.0</version>
<author mail="guild0105@gmail.com" homepage="elzup.com">elzup</author>
<minVersion>1.0</minVersion>
<maxVersion>2.0pre</maxVersion>
<detail lang="ja"><![CDATA[
]]></detail>
</VimperatorPlugin>`;
// }}}

(function () {
  /* user config */
  // デフォルト(引数なしの場合)の変更値
  // true: チェックする
  // false: チェックを外す
  var DEFAULT_CHECK_VALUE = true;

  commands.addUserCommand(
      ['checkboxall'],
      'controll all checkbox',
      function (args) {
        var inputs = window.content.window.document.getElementsByTagName('input');
        var v = DEFAULT_CHECK_VALUE;
        if (args.length) {
          // args[0]のバリデートは必要？
          v = args[0] == 'true';
        }
        for (var i = 0, l = inputs.length; i < l; i++) {
          if (inputs[i].type == "checkbox") {
            inputs[i].checked = v;
          }
        }
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
            ['true', 'check all'],
            ['false', 'uncheck all']
          ];
        }
      },
    true // replace
      );


})();

// vim:sw=2 ts=2 et si fdm=marker:
