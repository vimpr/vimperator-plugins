
/*
 * さわるなきけん！
 * DO NOT USE!
 * */



(function(){
  let pluginDirPath = liberator.globalVariables.pmwriter_plugin_dir;
  let outputDir = liberator.globalVariables.pmwriter_output_dir;

  if (!(pluginDirPath && outputDir))
    return;

  let AUTHORS = {
    Trapezoid:        'http://unsigned.g.hatena.ne.jp/Trapezoid/',
    anekos:           'http://d.hatena.ne.jp/nokturnalmortum/',
    "halt feits":     'http://project-p.jp/halt/',
    hogelog:          'http://d.hatena.ne.jp/hogelog/',
    janus_wel:        'http://d.hatena.ne.jp/janus_wel/',
    mattn:            'http://mattn.kaoriya.net',
    pekepeke:         'http://d.hatena.ne.jp/pekepekesamurai/',
    pekepekesamurai:  'http://d.hatena.ne.jp/pekepekesamurai/',
    suVene:           'http://d.zeromemory.info/',
    teramako:         'http://d.hatena.ne.jp/teramako/',
  };


  function action () {

    liberator.plugins.pmwriter = {};
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

      let link = 'http://vimperator.kurinton.net/' + detailFilename;
      let alink = AUTHORS[info.author];
      let data = plugin.filter(function($_) /name|description|author/.test($_[0]));
      xml_index += <tr class="plugin">
        <td class="name"><a href={link} class="link">{plugin.name}</a></td>
        <td class="description">{plugin.info.description}</td>
        <td class="author"><a href={alink}>{info.author}</a></td>
      </tr>
      //xml_index += template.table(plugin.name, data);
    });

    let title = "Vimperator Plugins in CodeRepos";

    xml_index = <html>
      <head>
        <title>{title}</title>
        <style><![CDATA[
          /* (c) VoQn */
          * {
           margin: 0 !important;
           padding: 0 !important;
          }
          h1 {
           background: black !important;
           color: white !important;
           font-family: monospace !important;
           padding: 0.5em 0 0.1em 0.75em !important;
          }
          table {
           margin: 1em !important;
           padding: 0.5em !important;
           border: 1px solid lightgray !important;
          }
          th {
           border-bottom: 1px solid magenta !important;
           color: magenta !important;
           text-align: left !important;
           font-weight: bold !important;
           font-size: 1.5em !important;
          }
          td {
           padding: 0 3em 0.5em 0 !important;
          }
          td.name {
           font-weight: bold !important;
           font-size: 1.2em !important;
          }
          .hatena-star-comment-container {
            display: none;
            padding: 0;
            margin: 0;
          }
        ]]></style>
        <script type="text/javascript" src="http://s.hatena.ne.jp/js/HatenaStar.js"></script>
        <script type="text/javascript">
        Hatena.Star.Token = '48e8f4c633307a76a4dd923111e22a25e80b6e8a';
        </script>
        <script type="text/javascript"><![CDATA[
          Hatena.Star.SiteConfig = {
            entryNodes: {
              'tr': {
                uri: "a.link",
                title: 'td.name',
                container: 'td.name'
              }
            }
          };
        ]]></script>
      </head>
      <body>
        <h1>{title}</h1>
        <table>
          <tr class="header">
            <th class="name">Name</th>
            <th class="description">Description</th>
            <th class="author">Author</th>
          </tr>
          {xml_index}
        </table>
      </body>
    </html>;

    io.writeFile(io.getFile(outputDir + 'index.html'), xml_index.toString());
  }

  commands.addUserCommand(
    ['pmwrite'],
    'PMWriter',
    action,
    {},
    true
  );

})();
// vim: sw=2 ts=2 et fdm=marker:

