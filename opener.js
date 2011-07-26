// PLUGIN_INFO {{{
let PLUGIN_INFO =
<VimperatorPlugin>
  <name>opener</name>
  <name lang="ja">opener</name>
  <description> --- </description>
  <description lang="ja">URL 移動時にそのURLが既に開かれていたら、そのタブに移動する</description>
  <version>1.0.0</version>
  <author homepage="http://vimperator.g.hatena.ne.jp/voidy21/">voidy21</author>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/opener.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    URL 移動時にそのURLが既に開かれていたら、そのタブに移動する
  ]]></detail>
  <detail lang="ja"><![CDATA[
    URL 移動時にそのURLが既に開かれていたら、そのタブに移動する
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="opener" version="1.0.0"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/opener.js"
          summary="URL 移動時にそのURLが既に開かれていたら、そのタブに移動する"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author>voidy21</author>
    <author email="anekos@snca.net">anekos</author>
    <project name="Vimperator" minVersion="2.3"/>
    <p>URL 移動時にそのURLが既に開かれていたら、そのタブに移動する</p>
  </plugin>
</>;
// }}}

/*
 * Original version by voidy21:
 *  http://vimperator.g.hatena.ne.jp/voidy21/20100119/1263907211
 *  http://vimperator.g.hatena.ne.jp/voidy21/20100127/1264542669
 */

(function () {
  let U = liberator.plugins.libly.$U;

  function jump (url) {
    let index = 0;
    let url = util.stringToURLArray(url).toString();
    if (url == buffer.URL){
      return false;
    }
    for each ( [,tab] in tabs.browsers ) {
      if (url == tab.currentURI.spec){
        tabs.select(index);
        return true;
      }
      ++index;
    }
    return false;
  }

  "open tabopen edit".split(/\s/).forEach(
    function (name) {
      let command = commands.get(name);
      if (!command)
        return;
      U.around(
        command,
        "action",
        function (next, args) {
          let url = args[0].string;
          if (!(url && jump(url)))
            return next();
        }
      );
    }
  );

  //buffer.followLink()を変更
  //hint-a-hint時[f,F]に対象のタブが既に開いてあったらjump
  let (ignore = false) {
    let ignoreBlock = function (block) {
      ignore = true;
      let result = block();
      ignore = false;
      return result;
    };

    U.around(
      buffer,
      "followLink",
      function (next, args) {
        return ignoreBlock(function () {
          let [elem,] = args;
          let url = elem.href;
          if (!(url && jump(url))){
            liberator.echo("Now Loading... " + url);
            return next();
          }
        });
      }
    );

    document.addEventListener(
      'click',
      function (event) {
        if (ignore)
          return;
        let e = event.target;
        if (e && e.tagName.match(/^a$/i) && e.href && jump(e.href)) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      true
    );
  }

})();
