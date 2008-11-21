// ==VimperatorPlugin==
// @name           Auto Source
// @description    Sourcing automatically when the specified file is modified.
// @description-ja 指定のファイルが変更されたら自動で :so する。
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// @author         anekos (anekos@snca.net)
// @minVersion     1.2
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

  let files = {};
  let firstTime = window.eval(liberator.globalVariables.auto_source_first_time || 'false');
  let interval = window.eval(liberator.globalVariables.auto_source_interval || '500');

  function getFileModifiedTime (filepath) {
    let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    file.initWithPath(filepath);
    return file.lastModifiedTime;
  }

  function startWatching (filepath) {
    if (files[filepath] !== undefined)
      throw "The file has already been watched: " + filepath;
    let last = firstTime ? null : getFileModifiedTime(filepath);
    files[filepath] = setInterval(function () {
      let current = getFileModifiedTime(filepath);
      if (last != current) {
        liberator.log('sourcing: ' + filepath);
        last = current;
        io.source(filepath);
      }
    }, interval);
  }

  function killWatcher (filepath) {
    if (files[filepath] === undefined)
      throw "The file is not watched: " + filepath;
    clearInterval(files[filepath]);
    delete files[filepath];
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
      completer: function (arg, bang) {
        return bang ? [0, [[filepath, ''] for (filepath in files)]]
                    : completion.file(arg);
      }
    },
    true
  );

})();
