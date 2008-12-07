/**
 * ==VimperatorPlugin==
 * @name             multi_requester.js
 * @description      request, and the result is displayed to the buffer.
 * @description-ja   リクエストの結果をバッファに出力する。
 * @author           suVene suvene@zeromemory.info
 * @version          0.4.3
 * @minVersion       1.2
 * @maxVersion       1.2
 * Last Change:      08-Dec-2008.
 * ==/VimperatorPlugin==
 *
 * HEAD COMMENT {{{
 * Usage:
 *   command[!] subcommand [ANY_TEXT]
 *
 *     !                create new tab.
 *     ANY_TEXT         your input text
 *
 *   :mr  alc[,goo,any1,any2…] ANY_TEXT           -> request by the input text, and display to the buffer.
 *   :mr! goo[,any1,any2,…]    {window.selection} -> request by the selected text, and display to the new tab.
 *
 *   other siteinfo by wedata.
 *     @see http://wedata.net/databases/Multi%20Requester/items
 *
 * CUSTOMIZE .vimperatorrc:
 *
 * [COMMAND](default [mr])
 *   let g:multi_requester_command = "ANY1, ANY2, ……"
 *     or
 *   liberator.globalVariables.multi_requester_command = [ANY1, ANY2, ……];
 *
 * [SITEINFO]
 *   ex.)
 *   javascript <<EOM
 *   liberator.globalVariables.multi_requester_siteinfo = [
 *       {
 *           map:           ',me',                          // optional: keymap for this siteinfo call
 *           bang:          true,                           // optional:
 *           args:          'any'                           // optional:
 *           name:          'ex',                           // required: subcommand name
 *           description:   'example',                      // required: commandline short help
 *           url:           'http://example.com/?%s',       // required: %s <-- replace string
 *           xpath:         '//*',                          // optional: default all
 *           srcEncode:     'SHIFT_JIS',                    // optional: default UTF-8
 *           urlEncode:     'SHIFT_JIS',                    // optional: default srcEncode
 *           ignoreTags:    'img',                          // optional: default script, syntax 'tag1,tag2,……'
 *           extractLink:   '//xpath'                       // optional: extract permalink
 *       },
 *   ];
 *   EOM
 *
 * [MAPPINGS]
 *   ex.)
 *   javascript <<EOM
 *   liberator.globalVariables.multi_requester_mappings = [
 *       [',ml', 'ex'],                  // == :mr  ex
 *       [',mg', 'goo', '!'],            // == :mr! goo
 *       [',ma', 'alc',    , 'args'],    // == :mr  alc args
 *   ];
 *   EOM
 *
 * [OTHER OPTIONS]
 *   let g:multi_requester_use_wedata = "false"             // true by default
 *
 *
 * TODO:
 *    - wedata local cache.
 *  }}}
 */
(function() {
io.source(io.expandPath('~/vimperator/plugin/libly.js'));
if (!liberator.plugins.libly) {
    liberator.log('multi_requester: needs ibly.js');
    return;
}

// global variables {{{
var DEFAULT_COMMAND = ['mr'];
var SITEINFO = [
    {
        name:        'alc',
        description: 'SPACE ALC (\u82F1\u8F9E\u6717 on the Web)',
        url:         'http://eow.alc.co.jp/%s/UTF-8/',
        xpath:       'id("resultList")'
    },
    {
        name:        'goo',
        description: 'goo \u8F9E\u66F8',
        url:         'http://dictionary.goo.ne.jp/search.php?MT=%s&kind=all&mode=0&IE=UTF-8',
        xpath:       'id("incontents")/*[@class="ch04" or @class="fs14" or contains(@class, "diclst")]',
        srcEncode:   'EUC-JP',
        urlEncode:   'UTF-8'
    },
];
var lib = liberator.plugins.libly;
var $U = lib.$U;
var logger = $U.getLogger('multi_requester');
var mergedSiteinfo = {};
//}}}

// Vimperator plugin command register {{{
var CommandRegister = {
    register: function(cmdClass, siteinfo) {
        cmdClass.siteinfo = siteinfo;

        liberator.commands.addUserCommand(
            cmdClass.name,
            cmdClass.description,
            $U.bind(cmdClass, cmdClass.cmdAction),
            {
                completer: cmdClass.cmdCompleter || function(filter, bang) {

                    var filters = filter.split(',');
                    var prefilters = filters.slice(0, filters.length - 1);
                    var prefilter = !prefilters.length ? '' : prefilters.join(',') + ',';
                    var subfilters = siteinfo.filter(function(s) prefilters.every(function(p) s.name != p));
                    var allSuggestions = subfilters.map(function(s) [prefilter + s.name, s.description]);
                    if (!filter) return [0, allSuggestions];
                    return [0, allSuggestions.filter(function(s) s[0].indexOf(filter) == 0)]
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
        mapdef.forEach(function([key, command, bang, args]) {
            var cmd = prefix + (bang ? '! ' : ' ') + command + ' ';
            mappings.addUserMap(
                [modes.NORMAL, modes.VISUAL],
                [key],
                'user defined mapping',
                function() {
                    if (args) {
                        liberator.execute(cmd + args);
                    } else {
                        let sel = $U.getSelectedString();
                        if (sel.length) {
                            liberator.execute(cmd + sel);
                        } else {
                            liberator.commandline.open(':', cmd, liberator.modes.EX);
                        }
                    }
                },
                {
                    rhs: ':' + cmd,
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
        if (typeof c == 'string') {
            ret = [c];
        } else if (typeof c == 'Array') {
            ret = check;
        } else {
            ret = DEFAULT_COMMAND;
        }
        return ret;
    },
    getSiteInfo: function() {

        var self = this;
        var useWedata = typeof liberator.globalVariables.multi_requester_use_wedata == 'undefined' ?
                        true : $U.eval(liberator.globalVariables.multi_requester_use_wedata);

        if (liberator.globalVariables.multi_requester_siteinfo) {
            liberator.globalVariables.multi_requester_siteinfo.forEach(function(site) {
                if (!mergedSiteinfo[site.name]) mergedSiteinfo[site.name] = {};
                $U.extend(mergedSiteinfo[site.name], site);
                if (site.map) {
                    CommandRegister.addUserMaps(MultiRequester.name[0],
                        [[site.map, site.name, site.bang, site.args]]);
                }
            });
        }

        SITEINFO.forEach(function(site) {
            if (!mergedSiteinfo[site.name]) mergedSiteinfo[site.name] = {};
            $U.extend(mergedSiteinfo[site.name], site);
            if (site.map) {
                CommandRegister.addUserMaps(MultiRequester.name[0],
                    [[site.map, site.name, site.bang, site.args]]);
            }
        });

        if (useWedata) {
            logger.log('use Wedata');
            this.getWedata(function(site) {
                if (mergedSiteinfo[site.name]) return;
                mergedSiteinfo[site.name] = {};
                $U.extend(mergedSiteinfo[site.name], site);
            });
        }

        return $U.A(mergedSiteinfo);
    },
    getWedata: function(func) {
        var req = new lib.Request(
            'http://wedata.net/databases/Multi%20Requester/items.json'
        );
        req.addEventListener('onSuccess', function(res) {
            var text = res.responseText;
            if (!text) return;
            var json = $U.evalJson(text);
            if (!json) return;

            json.forEach(function(item) func(item.data));
            CommandRegister.register(MultiRequester, $U.A(mergedSiteinfo));

        });
        req.get();
    }
};
//}}}

// main controller {{{
var MultiRequester = {
    name: DataAccess.getCommand(),
    description: 'request, and display to the buffer',
    doProcess: false,
    requestNames: '',
    requestCount: 0,
    echoHash: {},
    cmdAction: function(args, bang, count) { // {{{

        if (MultiRequester.doProcess) return;

        var parsedArgs = this.parseArgs(args);
        if (parsedArgs.count == 0) { return; } // do nothing

        MultiRequester.doProcess = true;
        MultiRequester.requestNames = parsedArgs.names;
        MultiRequester.requestCount = 0;
        MultiRequester.echoHash = {};
        var siteinfo = parsedArgs.siteinfo;
        for (let i = 0, len = parsedArgs.count; i < len; i++) {

            let info = siteinfo[i];
            let url = info.url;
            // see: http://fifnel.com/2008/11/14/1980/
            let srcEncode = info.srcEncode || 'UTF-8';
            let urlEncode = info.urlEncode || srcEncode;

            let idxRepStr = url.indexOf('%s');
            if (idxRepStr > -1 && !parsedArgs.str) continue;

            // via. lookupDictionary.js
            let ttbu = Components.classes['@mozilla.org/intl/texttosuburi;1']
                                 .getService(Components.interfaces.nsITextToSubURI);
            url = url.replace(/%s/g, ttbu.ConvertAndEscape(urlEncode, parsedArgs.str));
            logger.log(url + '[' + srcEncode + '][' + urlEncode + ']::' + info.xpath);

            if (bang) {
                liberator.open(url, liberator.NEW_TAB);
            } else {
                let req = new lib.Request(url, null, {
                    encoding: srcEncode,
                    siteinfo: info,
                    args: {
                        args: args,
                        bang: bang,
                        count: count
                    }
                });
                req.addEventListener('onException', $U.bind(this, this.onException));
                req.addEventListener('onSuccess', $U.bind(this, this.onSuccess));
                req.addEventListener('onFailure', $U.bind(this, this.onFailure));
                req.get();
                MultiRequester.requestCount++;
            }
        }

        if (MultiRequester.requestCount) {
            logger.echo('Loading ' + parsedArgs.names + ' ...', commandline.FORCE_SINGLELINE);
        } else {
            MultiRequester.doProcess = false;
        }
    },
    // return {names: '', str: '', count: 0, siteinfo: [{}]}
    parseArgs: function(args) {

        var self = this;
        var ret = {};
        ret.names = '';
        ret.str = '';
        ret.count = 0;
        ret.siteinfo = [];

        if (!args) return ret;

        var arguments = args.split(/ +/);
        var sel = $U.getSelectedString();

        if (arguments.length < 1) return ret;

        ret.names = arguments.shift();
        ret.str = (arguments.length < 1 ? sel : arguments.join()).replace(/[\n\r]+/g, '');

        ret.names.split(',').forEach(function(name) {
            var site = self.getSite(name);
            if (site) {
                ret.count++;
                ret.siteinfo.push(site);
            }
        });

        return ret;
    },
    getSite: function(name) {
        if (!name) this.siteinfo[0];
        var ret = null;
        this.siteinfo.forEach(function(s) {
            if (s.name == name) ret = s;
        });
        return ret;
    }, // }}}
    extractLink: function(res, extractLink) { //{{{

        var el = res.getHTMLDocument(extractLink);
        if (!el) throw 'extract link failed.: extractLink -> ' + extractLink;
        var a = el.firstChild;
        var url = $U.pathToURL((a.href || a.action || a.value));
        var req = new Request(url, null, $U.extend(res.req.options, {extractLink: true}));
        req.addEventListener('onException', $U.bind(this, this.onException));
        req.addEventListener('onSuccess', $U.bind(this, this.onSuccess));
        req.addEventListener('onFailure', $U.bind(this, this.onFailure));
        req.get();
        MultiRequester.requestCount++;
        MultiRequester.doProcess = true;

    }, //}}}
    onSuccess: function(res) { //{{{

        if (!MultiRequester.doProcess) {
            MultiRequester.requestCount = 0;
            return;
        }

        logger.log('success!!: ' + res.req.url);
        MultiRequester.requestCount--;
        if (MultiRequester.requestCount == 0) {
            MultiRequester.doProcess = false;
        }

        var url, escapedUrl, xpath, doc, html, extractLink;

        try {

            if (!res.isSuccess() || res.responseText == '') throw 'response is fail or null';

            url = res.req.url;
            escapedUrl = liberator.util.escapeHTML(url);
            xpath = res.req.options.siteinfo.xpath;
            extractLink = res.req.options.siteinfo.extractLink;

            if (extractLink && !res.req.options.extractLink) {
                this.extractLink(res, extractLink);
                return;
            }

            doc = res.getHTMLDocument(xpath, null, res.req.options.siteinfo.ignoreTags);
            if (!doc) throw 'XPath result is undefined or null.: XPath -> ' + xpath;

            html = '<a href="' + escapedUrl + '" class="hl-Title" target="_self">' + escapedUrl + '</a>' +
                   (new XMLSerializer()).serializeToString(doc)
                            .replace(/<[^>]+>/g, function(all) all.toLowerCase())
                            .replace(/<!--(?:[^-]|-(?!->))*-->/g, ''); // actually
                            //.replace(/<!--(?:[^-]|-(?!-))*-->/g, ''); // strictly

            MultiRequester.echoHash[res.req.options.siteinfo.name] = html;

        } catch (e) {
            logger.log('error!!: ' + e);
            MultiRequester.echoHash[res.req.options.siteinfo.name] =
                            '<span style="color: red;">error!!: ' + e + '</span>';
        }

        if (MultiRequester.requestCount == 0) {
            let echoList = [];
            MultiRequester.requestNames.split(',').forEach(function(name) {
                echoList.push(MultiRequester.echoHash[name])
            });
            html = '<div style="white-space:normal;"><base href="' + escapedUrl + '"/>' +
                   echoList.join('') +
                   '</div>';
            try { logger.echo(new XMLList(html)); } catch (e) { logger.log(e); logger.echo(html); }
        }

    },
    onFailure: function(res) {
        MultiRequester.doProcess = false;
        logger.echoerr('request failure!!: ' + res.statusText);
    },
    onException: function(e) {
        MultiRequester.doProcess = false;
        logger.echoerr('exception!!: ' + e);
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
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

