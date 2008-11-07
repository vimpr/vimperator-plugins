// ==VimperatorPlugin==
// @name           Plugin Loader
// @description    to load plugins from specified directory at starting up Vimperator.
// @description-ja 指定(ディレクトリ|プラグイン)を起動時にロードする
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        2.3
// @minVersion     1.2
// @maxVersion     2.0Pre
// @author         anekos
// ==/VimperatorPlugin==
//
// Usage:
//    let g:plugin_loader_roots = "<PLUGIN_DIRECTORIES>"
//    let g:plugin_loader_plugins = "<PLUGIN_NAMES>"
//
// Example:
//    let g:plugin_loader_roots = "/home/anekos/coderepos/vimp-plugins/ /home/anekos/my-vimp-plugins/"
//    let g:plugin_loader_plugins = "lo,migemized_find,nico_related_videos"
//
// Link:
//    http://d.hatena.ne.jp/nokturnalmortum/20081008#1223397705

{
  function toArray (obj) {
    return obj instanceof Array ? obj
                                : obj.toString().split(/[,| \t\r\n]+/);
  }

  let roots = toArray(liberator.globalVariables.plugin_loader_roots);
  let plugins = toArray(liberator.globalVariables.plugin_loader_plugins);
  let filter = new RegExp('[\\\\/](?:' +
                          plugins.map(function (plugin) plugin.replace(/(?=[\\^$.+*?|(){}\[\]])/g, '\\'))
                                 .join('|') +
                          ')\\.(?:js|vimp)$');

  liberator.log('plugin_loader: loading');

  roots.forEach(function (root) {
    let files = io.readDirectory(io.getFile(root), true);
    files.forEach(function (file) {
      if (filter.test(file.path)) {
        liberator.log("Sourcing: " + file.path);
        io.source(file.path, false);
      }
    });
  });

  liberator.log('plugin_loader: loaded');
}
