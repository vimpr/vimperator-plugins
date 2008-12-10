let PLUGIN_INFO =
<VimperatorPlugin>
  <name>Maine Coon</name>
  <name lang="ja">メインクーン</name>
  <description>Makes more large screen</description>
  <description lang="ja">なるべくでかい画面で使えるように</description>
  <version>1.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <license document="http://creativecommons.org/licenses/by-sa/3.0/">
    Creative Commons Attribution-Share Alike 3.0 Unported
  </license>
  <detail><![CDATA[
    == Commands ==
      :fullscreen:
        toggle fullscreen <-> normal
    == Global Variables ==
      :maine_coon_targets:
        other elements ids that you want to kill.
        let g:maine_coon_targets = "sidebar-2 sidebar-2-splitter"
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Commands ==
      :fullscreen:
        切り替え fullscreen <-> normal
    == Global Variables ==
      :maine_coon_targets:
        他の非表示にしたい要素のIDを空白区切りで指定します。
        let g:maine_coon_targets = "sidebar-2 sidebar-2-splitter"
  ]]></detail>
</VimperatorPlugin>;

let tagetIDs = (liberator.globalVariables.maine_coon_targets || '').split(/\s+/);

(function () {

  function around (obj, name, func) {
    let next = obj[name];
    obj[name] = function ()
      let (self = this, args = arguments)
        func.call(self,
                  function () next.apply(self, args),
                  args);
  }

  function s2b (s, d) (!/^(\d+|false)$/i.test(s)|parseInt(s)|!!d*2)&1<<!s;

  let mainWindow = document.getElementById('main-window');
  let messageBox = document.getElementById('liberator-message');
  messageBox.collapsed = true;

  around(commandline, 'open', function (next, args) {
    messageBox.collapsed = false;
    return next();
  });

  around(commandline, 'close', function (next, args) {
    messageBox.collapsed = true;
    return next();
  });

  function hideTargets (hide) {
    tagetIDs.forEach(
      function (id)
        let (elem = document.getElementById(id))
          (elem && (elem.collapsed = hide))
    );
  }

  function hideChrome (hide)
    mainWindow.setAttribute('hidechrome', hide);

  commands.addUserCommand(
    ['fullscreen', 'fs'],
    'Toggle fullscreen mode',
    function () {
      let hide = !window.fullScreen;
      window.fullScreen = hide;
      setTimeout(function () {
        hideTargets(hide);
        document.getElementById('status-bar').setAttribute('moz-collapsed', false);
        document.getElementById('navigator-toolbox').collapsed = hide;
        if (!hide)
          window.maximize();
      }, 400);
    },
    {},
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
