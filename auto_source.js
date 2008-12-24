var PLUGIN_INFO =
<VimperatorPlugin>
  <name> Auto Source </name>
  <description>Sourcing automatically when the specified file is modified.</description>
  <description lang="ja">指定のファイルが変更されたら自動で :so する。</description>
  <version>1.4</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/auto_source.js</updateURL>
  <license document="http://creativecommons.org/licenses/by-sa/3.0/">
    Creative Commons Attribution-Share Alike 3.0 Unported
  </license>
  <detail><![CDATA[
    == Commands ==
    Start watching:
      :aso taro.js
      :autoso[urce] taro.js
    Stop watching:
      :aso! taro.js
      :autoso[urce]! taro.js
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Commands ==
   監視を開始:
     :aso taro.js
     :autoso[urce] taro.js
   監視を中止:
     :aso! taro.js
     :autoso[urce]! taro.js
  ]]></detail>
</VimperatorPlugin>;

// Links:
//    http://d.hatena.ne.jp/nokturnalmortum/20081114#1226652163
//    http://p-pit.net/rozen/

(function () {

  let files = [];
  let firstTime = window.eval(liberator.globalVariables.auto_source_first_time || 'false');
  let interval = window.eval(liberator.globalVariables.auto_source_interval || '500');

  function getFileModifiedTime (filepath) {
    let file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
    file.initWithPath(filepath);
    return file.lastModifiedTime;
  }

  function exists (filepath)
    files.some(function (it) (it.path.indexOf(filepath) === 0))

  function remove (filepath, func)
    (files = files.filter(function (it) (!(it.path.indexOf(filepath) === 0 && func(it)+'-'))));

  function expandPath (filepath) {
    filepath = io.expandPath(filepath);
    if (filepath.match(/\/|\w:[\\\/]/))
      return filepath;
    let cur = io.getCurrentDirectory();
    cur.appendRelativePath(filepath);
    return cur.path;
  }

  function startWatching (filepath) {
    if (exists(filepath))
      throw 'The file has already been watched: ' + filepath;
    let last = firstTime ? null : getFileModifiedTime(filepath);
    let handle = setInterval(function () {
      try {
        let current = getFileModifiedTime(filepath);
        if (last != current) {
          liberator.log('sourcing: ' + filepath);
          last = current;
          io.source(filepath);
        }
      } catch (e) {
        liberator.echoerr('Error! ' + filepath);
        killWatcher(filepath);
      }
    }, interval);
    liberator.log('filepath: ' + filepath)
    files.push({handle: handle, path: filepath});
  }

  function killWatcher (filepath) {
    if (!exists(filepath))
      throw 'The file is not watched: ' + filepath;
    remove(filepath, function (it) clearInterval(it.handle));
    liberator.echo('stopped the watching for the file');
  }

  commands.addUserCommand(
    ['autoso[urce]', 'aso'],
    'Sourcing automatically when the specified file is modified.',
    function (arg, bang) {
      (bang ? killWatcher : startWatching)(expandPath(arg[0]));
    },
    {
      bang: true,
      argCount: '1',
      completer: function (context, args) {
        if (args.bang) {
          context.title = ['Path'];
          context.completions = files.map(function (it) ([it.path, '']));
        } else {
          completion.file(context);
        }
      }
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
