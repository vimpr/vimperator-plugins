/*** BEGIN LICENSE BLOCK {{{
  Copyright (c) 2008 suVene<suvene@zeromemory.info>

  distributable under the terms of an MIT-style license.
  http://www.opensource.jp/licenses/mit-license.html
}}}  END LICENSE BLOCK ***/
// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
  <name>{NAME}</name>
  <description>request, and the result is displayed to the buffer.</description>
  <description lang="ja">リクエストの結果をバッファに出力する。</description>
  <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
  <version>0.4.15</version>
  <license>MIT</license>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.1pre</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/multi_requester.js</updateURL>
  <detail><![CDATA[
== Needs Library ==
- _libly.js(ver.0.1.19)
  @see http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/trunk/_libly.js

== Usage ==
>||
command[!] subcommand [ANY_TEXT]
||<
- !        create new tab.
- ANY_TEXT     your input text

e.g.)
>||
:mr  alc[,goo,any1,any2…] ANY_TEXT       -> request by the input text, and display to the buffer.
:mr! goo[,any1,any2,…]  {window.selection} -> request by the selected text, and display to the new tab.
||<

== Custumize .vimperatorrc ==
=== Command(default [ mr ]) ===
>||
let g:multi_requester_command = "ANY1, ANY2, ……"
or
liberator.globalVariables.multi_requester_command = [ ANY1, ANY2, …… ];
||<

=== Default Sites (default undefined) ===
>||
liberator.globalVariables.multi_requester_default_sites = "alc,goo"
||<
These sites(subcommands) will be used, if this variable has been defined and you do not specify subcommands.

=== SITEINFO ===
e.g.)
>||
javascript <<EOM
liberator.globalVariables.multi_requester_siteinfo = [
  {
    map:            ",me",              // optional: keymap for this siteinfo call
    bang:           true,               // optional:
    args:           "any"               // optional:
    name:           "ex",               // required: subcommand name
    description:    "example",          // required: commandline short help
    url:            "http://example.com/?%s",     // required: %s <-- replace string
    xpath:          "//*",              // optional: default all
    srcEncode:      "SHIFT_JIS",        // optional: default UTF-8
    urlEncode:      "SHIFT_JIS",        // optional: default srcEncode
    ignoreTags:     "img",              // optional: default script, syntax "tag1,tag2,……"
    extractLink:    "//xpath"           // optional: extract permalink
  },
];
EOM
||<

=== other siteinfo by wedata. ===
  @see http://wedata.net/databases/Multi%20Requester/items

=== Mappings ===
e.g.)
>||
javascript <<EOM
liberator.globalVariables.multi_requester_mappings = [
  [ ",ml", "ex" ],              // == :mr  ex
  [ ",mg", "goo", "!" ],        // == :mr! goo
  [ ",ma", "alc",  , "args" ],  // == :mr  alc args
];
EOM
||<

=== Other Options ===
>||
let g:multi_requester_use_wedata = "false"       // true by default
||<
wedata を利用しない場合は false を設定してください。
>||
let g:multi_requester_default_sites = 'alc';
||<
subcommand を省略した場合に利用されるサイトを設定します。
>||
let g:multi_requester_order = 'count'; // date by default
||<
補完の順番を設定します。(大きい順に並びます)
"count" または "date" を設定してください。

   ]]></detail>
</VimperatorPlugin>;
//}}}
(function() {
if (!liberator.plugins.libly) {
  liberator.log("multi_requester: needs _libly.js");
  return;
}

// global variables {{{
var DEFAULT_COMMAND = [ "mr" ];
var SITEINFO = [
  {
    name: "alc",
    description: "SPACE ALC (\u82F1\u8F9E\u6717 on the Web)",
    url: "http://eow.alc.co.jp/%s/UTF-8/",
    xpath: 'id("resultList")'
  }
];
var libly = liberator.plugins.libly;
var $U = libly.$U;
var logger = $U.getLogger("multi_requester");
var mergedSiteinfo = {};
var store = storage.newMap('plugins-multi_requester', true);
//}}}

// Vimperator plugin command register {{{
var CommandRegister = {
  register: function(cmdClass, siteinfo) {
    cmdClass.siteinfo = siteinfo;

    commands.addUserCommand(
      cmdClass.name,
      cmdClass.description,
      $U.bind(cmdClass, cmdClass.cmdAction),
      {
        completer: cmdClass.cmdCompleter || function(context, arg) {
          if (arg.length > 1)
            return;
          context.title = [ "Name", "Descprition" ];
          var sorted = siteinfo.sort(function(a, b)
                         typeof liberator.globalVariables.multi_requester_order == "undefined" ||
                         liberator.globalVariables.multi_requester_order == "date" ? store.get(b.name).lastPostTime - store.get(a.name).lastPostTime :
                         liberator.globalVariables.multi_requester_order == "count" ? store.get(b.name).count - store.get(a.name).count :
                         store.get(b.name).lastPostTime - store.get(a.name).lastPostTime);
          var filters = context.filter.split(",");
          var prefilters = filters.slice(0, filters.length - 1);
          var prefilter = !prefilters.length ? "" : prefilters.join(",") + ",";
          var subfilters = sorted.filter(function(s) prefilters.every(function(p) s.name != p));
          var allSuggestions = subfilters.map(function(s) [prefilter + s.name, s.description]);
          context.completions = context.filter
            ? allSuggestions.filter(function(s) s[0].indexOf(context.filter) == 0)
            : allSuggestions;
        },
        options: cmdClass.cmdOptions,
        argCount: cmdClass.argCount || undefined,
        bang: cmdClass.bang || true,
        count: cmdClass.count || false
      },
      true // replace
    );

  },
  addUserMaps: function(prefix, mapdef) {
    mapdef.forEach(function([ key, command, bang, args ]) {
      var cmd = prefix + (bang ? "! " : " ") + command + " ";
      mappings.addUserMap(
        [ modes.NORMAL, modes.VISUAL ],
        [ key ],
        "user defined mapping",
        function() {
          if (args) {
            liberator.execute(cmd + args);
          } else {
            let sel = $U.getSelectedString();
            if (sel.length) {
              liberator.execute(cmd + sel);
            } else {
              commandline.open(":", cmd, modes.EX);
            }
          }
        },
        {
          rhs: ":" + cmd,
          norremap: true
        }
      );
    });
  }
};
//}}}

// initial data access class {{{
var DataAccess = {
  getCommand: function() {
    var c = liberator.globalVariables.multi_requester_command;
    var ret;
    if (typeof c == "string") {
      ret = [ c ];
    } else if (typeof c == "Array") {
      ret = check;
    } else {
      ret = DEFAULT_COMMAND;
    }
    return ret;
  },
  getSiteInfo: function() {

    var self = this;
    var useWedata = typeof liberator.globalVariables.multi_requester_use_wedata == "undefined" ?
                    true : $U.eval(liberator.globalVariables.multi_requester_use_wedata);

    if (liberator.globalVariables.multi_requester_siteinfo) {
      liberator.globalVariables.multi_requester_siteinfo.forEach(function(site) {
        if (!mergedSiteinfo[site.name]) mergedSiteinfo[site.name] = {};
        $U.extend(mergedSiteinfo[site.name], site);
        if (!store.get(site.name)) {
            store.set(site.name, { count: 0, lastPostTime: (new Date()).getTime() });
            store.save();
        }
        if (site.map) {
          CommandRegister.addUserMaps(MultiRequester.name[0],
            [[ site.map, site.name, site.bang, site.args ]]);
        }
      });
    }

    SITEINFO.forEach(function(site) {
      if (!mergedSiteinfo[site.name]) mergedSiteinfo[site.name] = {};
      $U.extend(mergedSiteinfo[site.name], site);
      if (!store.get(site.name)) {
        store.set(site.name, { count: 0, lastPostTime: (new Date()).getTime() });
        store.save();
      }
      if (site.map) {
        CommandRegister.addUserMaps(MultiRequester.name[0],
          [[ site.map, site.name, site.bang, site.args ]]);
      }
    });

    if (useWedata) {
      logger.log("use wedata");
      var wedata = new libly.Wedata("Multi%20Requester");
      wedata.getItems(24 * 60 * 60 * 1000,
        function(item) {
          var site = item.data;
          if (mergedSiteinfo[site.name]) return;
          mergedSiteinfo[site.name] = {};
          $U.extend(mergedSiteinfo[site.name], site);
          if (!store.get(site.name)) {
            store.set(site.name, { count: 0, lastPostTime: (new Date()).getTime() });
            store.save();
          }
        },
        function(isSuccess, data) {
          if (!isSuccess) return;
          CommandRegister.register(MultiRequester, $U.A(mergedSiteinfo));
        }
      );
    }

    return $U.A(mergedSiteinfo);
  }
};
//}}}

// main controller {{{
var MultiRequester = {
  name: DataAccess.getCommand(),
  description: "request, and display to the buffer",
  defaultSites: liberator.globalVariables.multi_requester_default_sites,
  doProcess: false,
  requestNames: "",
  requestCount: 0,
  echoHash: {},
  cmdAction: function(args) { //{{{

    if (MultiRequester.doProcess) return;

    var bang = args.bang;
    var count = args.count;

    var parsedArgs = this.parseArgs(args);
    if (parsedArgs.count == 0) { return; } // do nothing

    MultiRequester.doProcess = true;
    MultiRequester.requestNames = parsedArgs.names;
    MultiRequester.requestCount = 0;
    MultiRequester.echoHash = {};
    var siteinfo = parsedArgs.siteinfo;
    for (let i = 0, len = parsedArgs.count; i < len; i++) {

      let info = siteinfo[i];
      let name = info.name;

      let history = store.get(name);
      history.count++;
      history.lastPostTime = (new Date()).getTime();
      store.set(name, history);
      store.save();

      let url = info.url;
      // see: http://fifnel.com/2008/11/14/1980/
      let srcEncode = info.srcEncode || "UTF-8";
      let urlEncode = info.urlEncode || srcEncode;

      let repStrCount = let (m = url.match(/%s/g)) (m && m.length);
      if (repStrCount && !parsedArgs.strs.length) continue;

      // via. lookupDictionary.js
      let ttbu = Components.classes["@mozilla.org/intl/texttosuburi;1"]
                 .getService(Components.interfaces.nsITextToSubURI);

      let cnt = 0;
      url = url.replace(/%s/g, function(m, i) ttbu.ConvertAndEscape(urlEncode,
            (cnt >= parsedArgs.strs.length ? parsedArgs.strs[cnt - 1] :
             cnt >= (repStrCount - 1) ? parsedArgs.strs.splice(cnt).join(' ') :
             parsedArgs.strs[cnt++])));
      logger.log(url + "[" + srcEncode + "][" + urlEncode + "]::" + info.xpath);

      if (bang) {
        liberator.open(url, liberator.NEW_TAB);
      } else {
        let req = new libly.Request(url, null, {
          encoding: srcEncode,
          siteinfo: info,
          args: {
            args: args,
            bang: bang,
            count: count
          }
        });
        req.addEventListener("onException", $U.bind(this, this.onException));
        req.addEventListener("onSuccess", $U.bind(this, this.onSuccess));
        req.addEventListener("onFailure", $U.bind(this, this.onFailure));
        req.get();
        MultiRequester.requestCount++;
      }
    }

    if (MultiRequester.requestCount) {
      logger.echo("Loading " + parsedArgs.names + " ...", commandline.FORCE_SINGLELINE);
    } else {
      MultiRequester.doProcess = false;
    }
  },
  // return {names: "", strs: [""], count: 0, siteinfo: [{}]}
  parseArgs: function(args) {

    var self = this;
    var ret = {};
    ret.names = "";
    ret.strs = [];
    ret.count = 0;
    var sel = $U.getSelectedString();

    if (args.length < 1 && !sel.length) return ret;

    function parse(args, names) {
      args = Array.concat(args);
      ret.siteinfo = [];
      ret.names = names || args.shift() || "";
      ret.strs = (args.length < 1 ? [ sel.replace(/[\n\r]+/g, "") ] : args);

      ret.names.split(",").forEach(function(name) {
        var site = self.getSite(name);
        if (site) {
          ret.count++;
          ret.siteinfo.push(site);
        }
      });
    }

    parse(args);

    if (!ret.siteinfo.length && this.defaultSites)
      parse(args, this.defaultSites);

    return ret;
  },
  getSite: function(name) {
    if (!name) this.siteinfo[0];
    var ret = null;
    this.siteinfo.forEach(function(s) {
      if (s.name == name) ret = s;
    });
    return ret;
  },//}}}
  extractLink: function(res, extractLink) { //{{{

    var el = res.getHTMLDocument(extractLink);
    if (!el) throw "extract link failed.: extractLink -> " + extractLink;
    var url = $U.pathToURL(el[0], res.req.url);
    var req = new libly.Request(url, null, $U.extend(res.req.options, { extractLink: true }));
    req.addEventListener("onException", $U.bind(this, this.onException));
    req.addEventListener("onSuccess", $U.bind(this, this.onSuccess));
    req.addEventListener("onFailure", $U.bind(this, this.onFailure));
    req.get();
    MultiRequester.requestCount++;
    MultiRequester.doProcess = true;

  },//}}}
  onSuccess: function(res) { //{{{

    if (!MultiRequester.doProcess) {
      MultiRequester.requestCount = 0;
      return;
    }

    logger.log("success!!: " + res.req.url);
    MultiRequester.requestCount--;
    if (MultiRequester.requestCount == 0) {
      MultiRequester.doProcess = false;
    }

    var url, escapedUrl, xpath, doc, html, extractLink, ignoreTags;

    try {

      if (!res.isSuccess() || res.responseText == "") throw "response is fail or null";

      url = res.req.url;
      escapedUrl = util.escapeHTML(url);
      xpath = res.req.options.siteinfo.xpath;
      extractLink = res.req.options.siteinfo.extractLink;

      if (extractLink && !res.req.options.extractLink) {
        this.extractLink(res, extractLink);
        return;
      }
      ignoreTags = [ "script" ].concat(libly.$U.A(res.req.options.siteinfo.ignoreTags));
      doc = document.createElementNS(null, "div");
      res.getHTMLDocument(xpath, null, ignoreTags, function(node, i) {
        if (node.tagName.toLowerCase() != "html")
          doc.appendChild(node);
      });
      if (!doc || !doc.childNodes.length) throw "XPath result is undefined or null.: XPath -> " + xpath;

      $U.getNodesFromXPath("descendant-or-self::a | descendant-or-self::img", doc, function(node) {
        var tagName = node.tagName.toLowerCase();
        if (tagName == "a") {
          node.href = $U.pathToURL(node, url, res.doc);
        } else if (tagName == "img") {
          node.src = $U.pathToURL(node, url, res.doc);
        }
      });

      html = '<a href="' + escapedUrl + '" class="hl-Title" target="_self">' + escapedUrl + '</a>' +
           $U.xmlSerialize(doc);

      MultiRequester.echoHash[res.req.options.siteinfo.name] = html;

    } catch (e) {
      logger.log("error!!: " + e);
      MultiRequester.echoHash[res.req.options.siteinfo.name] =
              '<span style="color: red;">error!!: ' + e + '</span>';
    }

    if (MultiRequester.requestCount == 0) {
      let echoList = [];
      MultiRequester.requestNames.split(",").forEach(function(name) {
        echoList.push(MultiRequester.echoHash[name]);
      });
      html = '<div style="white-space:normal;"><base href="' + escapedUrl + '"/>' +
             echoList.join("") +
             '</div>';
      try { logger.echo(new XMLList(html)); } catch (e) { logger.log(e); logger.echo(html); }
    }

  },
  onFailure: function(res) {
    MultiRequester.doProcess = false;
    logger.echoerr("request failure!!: " + res.statusText);
  },
  onException: function(e) {
    MultiRequester.doProcess = false;
    logger.echoerr("exception!!: " + e);
  }//}}}
};
//}}}

// boot strap {{{
CommandRegister.register(MultiRequester, DataAccess.getSiteInfo());
if (liberator.globalVariables.multi_requester_mappings) {
  CommandRegister.addUserMaps(MultiRequester.name[0], liberator.globalVariables.multi_requester_mappings);
}
//}}}

return MultiRequester;

})();
// vim: set fdm=marker sw=2 ts=2 sts=0 et:

