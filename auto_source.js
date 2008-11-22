// ==VimperatorPlugin==
// @name           Auto Source
// @description    Sourcing automatically when the specified file is modified.
// @description-ja 指定のファイルが変更されたら自動で :so する。
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.1
// @author         anekos (anekos@snca.net)
// @minVersion     2.0pre
// @maxVersion     2.0pre
// ==/VimperatorPlugin==
//
// Usage:
//    Start watching
//      :aso taro.js
//      :autoso[urce] taro.js
//    Stop watching
//      :aso! taro.js
//      :autoso[urce]! taro.js
//
// Usage-ja:
//    監視を開始
//      :aso taro.js
//      :autoso[urce] taro.js
//    監視を中止
//      :aso! taro.js
//      :autoso[urce]! taro.js
//
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
    (files = files.filter(function (it) (it.path.indexOf(filepath) !== 0 && (func(it)+'-'))));

  function startWatching (filepath) {
    if (exists(filepath))
      throw 'The file has already been watched: ' + filepath;
    let last = firstTime ? null : getFileModifiedTime(filepath);
    let handle = setInterval(function () {
      let current = getFileModifiedTime(filepath);
      if (last != current) {
        liberator.log('sourcing: ' + filepath);
        last = current;
        io.source(filepath);
      }
    }, interval);
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
      (bang ? killWatcher : startWatching)(io.expandPath(arg.string));
    },
    {
      bang: true,
      argCount: '1',
      completer: function (context, arg, bang) {
        if (bang) {
          context.title = ['Path'];
          context.items = files.map(function (it) ([it.path]));
        } else {
          completion.file(context);
        }
      }
    },
    true
  );

})();
