
/*
 * さわるなきけん！
 * DO NOT USE!
 * このコードを読むと失明する場合があります。
 *
 * for 2.2
 * */



(function(){
  const U = liberator.plugins.libly.$U;

  let pluginDirPath = liberator.globalVariables.pmwriter_plugin_dir;
  let pluginRootDirPath = io.File(pluginDirPath).parent.path;
  let outputDir = liberator.globalVariables.pmwriter_output_dir;
  const VERSIONS = '2.2 2.1 2.0 1.2'.split(/\s+/);


  if (!(pluginDirPath && outputDir))
    return;

  if (!liberator.plugins.pmwriter)
    liberator.plugins.pmwriter = {};

  // make を改造
  {
    let makeLink = liberator.eval('makeLink', liberator.plugins.pluginManager.list);
    if (!liberator.plugins.pmwriter.makeLink) {
      liberator.plugins.pmwriter.makeLink = function (str) makeLink(str, true);
      liberator.eval('makeLink = liberator.plugins.pmwriter.makeLink ', liberator.plugins.pluginManager.list);
    }
    //let WikiParser = liberator.eval('WikiParser', liberator.plugins.pluginManager.list);
    //WikiParser.prototype.inlineParse = function (str) {
    //  function replacer(_, s)
    //    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[s] ||
    //    '<a href="' + s + '" highlight="URL">' + s + '</a>';
    //  try {
    //    return XMLList(str.replace(/(>|<|&|(?:https?:\/\/|mailto:)\S+)/g, replacer));
    //  } catch (e) {
    //    return XMLList(str);
    //  }
    //};
  }

  let langselector =
    <div>
      <style><![CDATA[
        .lang-hide { display: none }
      ]]></style>
      <script language="javascript"><![CDATA[
        var element = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(element);
        var lang = 'default';
        if (/^ja/.test(window.navigator.language))
          lang = 'ja';
        element.sheet.insertRule('.lang-' + lang + ' { display: block !important }', 0);
        document.write(sheet);
      ]]></script>
    </div>;

      //'<style><![CDATA[ .lang-ja { display: none } ]]></style>');
  function action () {

    const IOService = services.get('io');
    const DOCUMENT_TITLE = 'Vimperator Plugins in CodeRepos';
    const CodeRepos = 'http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/trunk/';
    const CodeReposBranch = 'http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/branches/';
    const CodeReposFile = 'http://github.com/vimpr/vimperator-plugins/blob/master/';

    function Context (file) {
      this.NAME = file.leafName.replace(/\..*/, '')
                      .replace(/-([a-z])/g, function (m, n1) n1.toUpperCase());
    };

    function fromUTF8Octets(octets){
        return decodeURIComponent(octets.replace(/[%\x80-\xFF]/g, function(c){
            return '%' + c.charCodeAt(0).toString(16);
        }));
    }

    function concatXML (xmls) {
      let result = <></>;
      xmls.forEach(function (xml) result += xml);
      return result;
    }

    function langList (info, name) {
      let result = <></>;
      let i = info.length();
      while (i-- > 0) {
        if (info[i].@lang.toString()) {
          result += <{name} lang={info[i].@lang.toString()}>{fromUTF8Octets(info[i].toString())}</{name}>;
        } else {
          result += <{name}>{fromUTF8Octets(info[i].toString())}</{name}>;
        }
      }
      return result;
    }

    function chooseByLang(info, lang) {
      let result;
      let i = info.length();
      while (i-- > 0) {
        let it = info[i];
        if (!it.@lang)
          result = it;
        if (it.@lang.toString() == lang) {
          result = it;
          break;
        }
      }
      return result;
    }

    function allLang (tag, info, utf, f) {
      if (!f)
        f = function (v) v;

      let ff = utf ? function (v) fromUTF8Octets(f(v).toString())
                   : f

      if (!tag)
        tag = 'div';

      let result = <></>;

      for (let i = 0, l = info.length(); i < l; i++) {
        let it = info[i];
        result += <{tag} class={'lang-hide '+(i==0?"lang-default ":'')+(i==l-1?'lang-ja ':'')+"lang-"+(it.@lang.toString()||'default')}>{ff(it)}</{tag}>;
      }

      return result;
    }

    let myname = __context__.NAME;

    let otags = liberator.eval('tags', liberator.plugins.pluginManager.list);
    let template = liberator.eval('template', liberator.plugins.pluginManager.list);

    let linkTo;
    let tags = {
      __proto__: otags,
      name: function () <a href={linkTo}>{otags.name.apply(otags, arguments)}</a>
    };

    let files = io.File(pluginDirPath).readDirectory();
    let indexHtml = <></>;
    let allHtml = <></>;
    let pminfos = [];

    files.forEach(function (file) {
      if (!/\.js$/.test(file.path))
        return;

      if (!/PLUGIN_INFO/.test(io.File(file.path).read()))
        return;

      try {
        let context = new Context(file);
        let pluginName = file.leafName.replace(/\..*$/, '');
        let pluginFilename = file.leafName;

        if (context.NAME == myname)
          return;

        let pluginInfo;
        let htmlFilename = pluginName + '.html';

        context.watch('PLUGIN_INFO', function (n, O, N) { pluginInfo = N; throw 'STOP';});

        try {
          services.get("subscriptLoader").loadSubScript(IOService.newFileURI(file).spec, context);
        } catch (e) {
          /* DO NOTHING */
        }

        tags.name = function () <a href={linkTo}>{otags.name.apply(otags, arguments)}</a>;

        let plugin = [];
        let (info = pluginInfo) {
          plugin['name'] = pluginName;
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
        }

        let authors;
        {
          for each (let a in pluginInfo.author) {
            let hp = a.@homepage.toString();
            let xml = hp ? <a href={hp}>{a.toString()}</a>
                         : <span>{a.toString()}</span>
            if (authors)
              authors += <span>, </span> + xml;
            else
              authors = xml;
          }
        }

        // infoXML
        {
          pminfos.push(
            <plugin>
              {langList(pluginInfo.name, 'name')}
              {langList(pluginInfo.description, 'description')}
              {langList(pluginInfo.version, 'version')}
              <updateURL>{CodeReposFile + pluginFilename}</updateURL>
            </plugin>
          );
        }

        // プラグイン毎のドキュメント
        {
          //let src = pluginInfo.detail.toString();
          let detailBody = allLang('div',
                                   pluginInfo.detail,
                                   false,
                                   function (v) liberator.plugins.PMWikiParser.parse(fromUTF8Octets(v.toString())));
          //let detailBody = plugin.info.detail
          let title = allLang('span',
                               pluginInfo.name,
                               true,
                               function (it) (it.toString() || '---'))
          let description = allLang('span',
                                   pluginInfo.description,
                                   true,
                                   function (it) (it.toString()) || '---')

          let versionsBody = <></>;

          VERSIONS.forEach(function (ver) {
            let url = CodeReposBranch + ver + '/' + pluginFilename;
            let file = io.File(pluginRootDirPath);
            file.append('branches');
            file.append(ver);
            file.append(pluginFilename);
            versionsBody +=
              <>
                <dt>{'for ' + ver}</dt>
                {file.exists() ?  <a href={url} class="coderepos" target="_blank">{url}</a> : <>not supported</>}
              </>;
          });

          versionsBody +=
            <>
              <dt>{'for Nightly'}</dt>
              <a href={CodeRepos + pluginFilename} class="coderepos" target="_blank">{CodeRepos + pluginFilename}</a>
            </>;


//                      <dt>Vimperator version</dt>
//                      <dd>{(plugin.info.minVersion || '?') + ' - ' + (plugin.info.maxVersion || '?')}</dd>
//                       <dt>URL</dt>
//                       <dd><a href={CodeRepos + pluginFilename} class="coderepos" target="_blank">{CodeRepos + pluginFilename}</a></dd>
//                       <dt>File URL</dt>
//                       <dd><a id="file-link" href={CodeReposFile + pluginFilename} class="coderepos" target="_blank">{CodeReposFile + pluginFilename}</a></dd>

          let body = <div>
                <div>{langselector}</div>
                <div class="information" id="information">
                  <h1>{title}</h1>
                  <div>
                    <dl>
                      <dt>Description</dt>
                      <dd>{description}</dd>
                      <dt>Latest version</dt>
                      <dd>{plugin.info.version || '???'}</dd>
                      <dt>Author</dt>
                      <dd>{authors}</dd>
                      <dt>License</dt>
                      <dd>{allLang('span',
                                   pluginInfo.license,
                                   true,
                                   function (v) (v || '--'))}</dd>
                    </dl>
                    <hr />
                    <dl>{versionsBody}</dl>
                  </div>
                </div>
                <div class="detail" id="detail">{detailBody}</div>
                </div>;

          io.File(outputDir + htmlFilename).write(
            <html>
              <head>
                <title>{pluginFilename}</title>
                <link rel="stylesheet" href="plugin.css" type="text/css" />
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
              </head>
              <body>
                {body}
                <a href="./" class="back-to-index">back to index</a>
              </body>
            </html>.toString()
          );
          allHtml += body;

          // index.html
          indexHtml += <tr class="plugin">
            <td class="name">
              <a href={CodeRepos + pluginFilename} class="coderepos" target="_blank">{"\u2606"}</a>
              <a href={htmlFilename} class="link">{plugin.name}</a>
            </td>
            <td class="description">
              {description}
            </td>
            <td class="author">
              {authors}
            </td>
          </tr>
        }
      } catch (e) {
        liberator.log({filename: file.path})
        liberator.log(e.stack)
        liberator.log(e)
      }
    });

    indexHtml = <html>
      <head>
        <title>{DOCUMENT_TITLE}</title>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <link rel="stylesheet" href="voqn.css" type="text/css" />
        <script type="text/javascript" src="http://s.hatena.ne.jp/js/HatenaStar.js" />
        <script type="text/javascript">
          Hatena.Star.Token = '48e8f4c633307a76a4dd923111e22a25e80b6e8a';
        </script>
        {langselector}
        <style><![CDATA[
          .hatena-star-comment-container {
            display: none;
            padding: 0;
            margin: 0;
          }
        ]]></style>
        <script type="text/javascript"><![CDATA[
          Hatena.Star.SiteConfig = {
            entryNodes: {
              'tr': {
                uri: 'a.coderepos',
                title: 'td.name',
                container: 'td.name'
              }
            }
          };
        ]]></script>
      </head>
      <body>
        <h1>{DOCUMENT_TITLE}</h1>
        <table>
          <tr class="header">
            <th class="name">Name</th>
            <th class="description">Description</th>
            <th class="author">Author</th>
          </tr>
          {indexHtml}
        </table>
        <div class="last-updated">Last updated {new Date().toLocaleFormat('%Y/%m/%d %H:%M:%S')}</div>
      </body>
    </html>;

    allHtml = <html>
            <head>
              <title>All Plugins</title>
              <link rel="stylesheet" href="plugin.css" type="text/css" />
              <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            </head>
            <body>
              {allHtml}
            </body>
          </html>.toString();

    io.File(outputDir + 'index.html').write(indexHtml.toString());
    io.File(outputDir + 'all.html').write(allHtml.toString());

    let infoXML = <plugins>{concatXML(pminfos)}</plugins>;
    io.File(outputDir + 'info.xml').write(infoXML.toString());
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

