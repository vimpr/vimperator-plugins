
/*
 * さわるなきけん！
 * DO NOT USE!
 * */

liberator.plugins.pmwriter = {};
let pluginDirPath = liberator.globalVariables.pmwriter_plugin_dir;
let outputDir = liberator.globalVariables.pmwriter_output_dir;

(function(){
  if (!(pluginDirPath && outputDir))
    return;

  let U = liberator.plugins.libly.$U;

  let myname = __context__.NAME;

  let otags = liberator.eval('tags', liberator.plugins.pluginManager.list);
  let template = liberator.eval('template', liberator.plugins.pluginManager.list);

  // makeLink を無理矢理修正
  let makeLink = liberator.eval('makeLink', liberator.plugins.pluginManager.list);
  liberator.plugins.pmwriter.makeLink = function (str) makeLink(str, true);
  liberator.log(makeLink)
  liberator.eval('makeLink = liberator.plugins.pmwriter.makeLink ', liberator.plugins.pluginManager.list);

  let linkTo;
  let tags = {
    __proto__: otags,
    name: function () <a href={linkTo}>{otags.name.apply(otags, arguments)}</a>
  };

  let ioService = services.get("io");
  let files = io.readDirectory(pluginDirPath);
  let i = 0;
  let xml = <></>;
  let xml_index = <></>;

  files.forEach(function (file) {
    if (!/\.js$/.test(file.path))
      return;
    let src = io.readFile(file.path);
    if (!/PLUGIN_INFO/.test(src))
      return;
    //if (i++ > 0) return;

    let uri = ioService.newFileURI(file);

    function Context (file) {
      this.NAME = file.leafName.replace(/\..*/, "").replace(/-([a-z])/g, function (m, n1) n1.toUpperCase());
    };
    let context = new Context(file);
    let PLUGIN_INFO;
    let detailFilename = context.NAME + '.html';
    linkTo = detailFilename;

    if (context.NAME == myname)
      return;

    context.watch('PLUGIN_INFO', function (n,N,O) { PLUGIN_INFO = O; throw 'STOP';});

    try { services.get("subscriptLoader").loadSubScript(uri.spec, context); } catch (e) {}

    let info = PLUGIN_INFO;
    tags.name = function () <a href={linkTo}>{otags.name.apply(otags, arguments)}</a>;

    let plugin = [ ];
    plugin['name'] = context.NAME;
    plugin['info'] = {};
    plugin['orgInfo'] = {};

    for (let tag in tags){
      plugin.orgInfo[tag] = info[tag];
      let value = tags[tag](info);
      if (value && value.toString().length > 0){
        plugin.push([tag, value]);
        plugin.info[tag] = value;
      }
    }

    xml = template.table(plugin.name, plugin);
    io.writeFile(io.getFile(outputDir + detailFilename), xml.toString());

    let data = plugin.filter(function($_) /name|description|author/.test($_[0]));
    xml_index += template.table(plugin.name, data);
  });

  io.writeFile(io.getFile(outputDir + 'index.html'), xml_index.toString());

})();
// vim: sw=2 ts=2 et fdm=marker:

