/**
 * ==VimperatorPlugin==
 * @name           gmperator
 * @description    Vimperator plugin for Greasemonkey
 * @author         teramako teramako@gmail.com
 * @namespace      http://d.hatena.ne.jp/teramako/
 * @version        0.3a
 * ==/VimperatorPlugin==
 *
 * ---------------------------
 * Usage:
 * ---------------------------
 * {{{
 *
 * :gmli[st] {filter}                -> show user scripts matches {filter}
 * :gmli[st]!                        -> show all user scripts
 * :gmli[st] full                    -> same as :gmli[st]!
 *
 * :gmlo[ad] {name|filename}         -> load the user script to the current page
 *                                      but, don't dispatch load event
 *                                      so maybe you should edit the scripts before load
 * :gmlo[ad]! {name|filename}        -> force load the user script
 *
 * :gmset!                           -> toggle enable/disable Greasemonkey
 * :gmset! {filename}                -> toogle enable/disable the script
 * :gmset {filename} {options}
 *   {options}:
 *       -n[ame] {value}              -> change name to {value}
 *       -i[nclude] {expr[,expr,...]} -> change includes to expr list ("," demiliter)
 *       -e[xclude] {expr[,expr,...]} -> change excludes to expr list ("," demiliter)
 *
 * Caution:
 * The change is permanent, not only the session.
 * And cannot get back.
 *
 * e.g.)
 * :gmset! {filename} -n fooScriptName -i http://*,https://* -e http://example.com/*
 *   toggle enable or disable,
 *   name to "fooScriptName",
 *   includes to "http://*" and "https://*",
 *   and excludes to "http://example.com/*"
 *
 * }}}
 * ---------------------------
 * For plugin developer:
 * ---------------------------
 * {{{
 *
 * 1). you can access to the sandbox of Greasemonkey !!!
 * 2). you can register commands to execute
 *     when the user script is executed on the URI
 *     @see liberator.plugins.gmperator.addAutoCommand
 *
 * liberator.plugins.gmperator => (
 *   allItem           :  return object of key   : {panalID},
 *                                         value : {GmContainer}
 *                              {panelID}   => @see gBrowser.mTags[].linkedPanel
 *   currentPanel
 *   currentContainer  :  return the current {GmContainer} object
 *   currentSandbox    :  return the current sandbox object
 *   gmScripts         :  return array of {userScripts}
 *                              {userScripts} => (
 *                                  filename   : {String}
 *                                  name       : {String}
 *                                  namespace  : {String}
 *                                  description: {String}
 *                                  enabled    : {Boolean}
 *                                  includes   : {String[]}
 *                                  encludes   : {String[]}
 *                              )
 *  addAutoCommand    : function( uri, script, cmd )
 *                      If both of uri and script are matched
 *
 * )
 * }}}
 */
(function(){

const Cc = Components.classes;
const Ci = Components.interfaces;
const gmID = '@greasemonkey.mozdev.org/greasemonkey-service;1';
if (!Cc[gmID]) {
    log('Greasemonkey is not installed');
    return;
}
if(!liberator.plugins) liberator.plugins = {};


liberator.plugins.gmperator = (function(){ //{{{
    // -----------------------
    // PUBLIC section
    // -----------------------
    // {{{
    var manager = {
        register: function (uri,sandbox,script){
            var panelID = getPanelID(sandbox.window);
            var gmCon;
            if (containers[panelID]){
                gmCon = containers[panelID];
            } else {
                gmCon = new GmContainer(uri,sandbox);
                containers[panelID] = gmCon;
                this.__defineGetter__(panelID,function() gmCon);
                //log('gmpeartor: Registered: ' + panelID + ' - ' + uri);
            }
            gmCon.sandbox = sandbox;
            gmCon.addScript(script);
            gmCon.uri = uri;
            autocommands.trigger('GMInjectedScript',uri+'\n'+script.filename);
        },
        get gmScripts() getScripts(),
        get allItem() containers,
        get currentPanel() getBrowser().mCurrentTab.linkedPanel,
        get currentContainer() containers[this.currentPanel] || null,
        get currentSandbox(){
            var id = this.currentPanel;
            return containers[id] ? containers[id].sandbox : null;
        },
        getSandboxFromWindow: function(win){
            for each(var c in containers){
                if(c.sandbox.window == win) return sandbox;
            }
            return null;
        },
        getContainersFromURI: function(uri){
            var list = [];
            for each(var c in containers){
                if (c.uri == uri) list.push(c);
            }
            return list.length > 0 ? list : null;
        },
        addAutoCommand: function(uri, script, cmd){
            var reg = uri+'.*\n'+script+'\.user\.js';
            autocommands.add('GMInjectedScript', reg, cmd);
        },
        removeAutoCommand: function(uri, script){
            var reg = uri+'.*\n'+script+'\.user\.js';
            autocommands.remove('GMInjectedScript', reg);
        },
    };
    // }}}
    // -----------------------
    // PRIVATE section
    // -----------------------
    // {{{
    var containers = {};
    var gmSvc = Cc[gmID].getService().wrappedJSObject;

    function appendCode(target,name,func){
        var original = target[name];
        target[name] = function(){
            var tmp = original.apply(target,arguments);
            func.apply(this,arguments);
            return tmp;
        };
    }
    appendCode(gmSvc, 'evalInSandbox', function(code,uri,sandbox,script){
        liberator.plugins.gmperator.register(uri,sandbox,script);
    });
    function getPanelID(win){
        var tabs = getBrowser().mTabs;
        for (var i=0; tabs.length; i++){
            var tab = tabs.item(i);
            if (tab.linkedBrowser.contentWindow == win){
                return tab.linkedPanel;
            }
        }
        //liberator.log(win + 'is not found');
    }
    function updateGmContainerList(e){
        var t = e.target;
        if (t && t.localName == 'tab' && t.linkedPanel){
            delete containers[t.linkedPanel];
            delete plugins.gmperator[t.linkedPanel];
        }
    }
    getBrowser().mTabContainer.addEventListener('TabClose',updateGmContainerList,false);
    // }}}
    return manager;
})(); //}}}

// ---------------------------
// User Command
// ---------------------------
commands.addUserCommand(['gmli[st]','lsgm'], 'list Greasemonkey scripts', //{{{
    function(arg,special){
        var str = '';
        var scripts = getScripts();
        var reg;
        if (special || arg == 'full'){
            reg = new RegExp('.*');
        } else if( arg ){
            reg = new RegExp(arg,'i');
        }
        if (reg){
            scripts.forEach(function(s){
                if ( reg.test(s.name) || reg.test(s.filename) ) {
                    str += scriptToString(s) + '\n\n';
                }
            });
        } else {
            var table = <table/>;
            var tr;
            scripts.forEach(function(script){
                tr = <tr/>;
                if (script.enabled){
                    tr.* += <td><span style="font-weight:bold;">{script.name}</span></td>;
                } else {
                    tr.* += <td>{script.name}</td>;
                }
                tr.* += <td>({script.filename})</td>;
                table.* += tr;
            });
            str += table.toXMLString();
        }
        echo(str,true);
        function scriptToString(script){
            var table = <table>
                <caption class="hl-Title" style="text-align:left">{script.name}</caption>
            </table>;
            ['FileName', 'NameSpace', 'Description',
             'Includes', 'Excludes', 'Enabled'].forEach(function(prop){
                var tr = <tr>
                    <th style="font-weight:bold;text-align:left;vertical-align:top">{prop}</th>
                </tr>;
                var contents = script[prop.toLowerCase()];
                if (typeof contents == "string"){
                    tr.* += <td>{contents}</td>;
                } else {
                    var td = <td/>;
                    contents.forEach(function(c,i,a){
                        td.* += c;
                        if (a[i+1]) td.* += <br/>;
                    });
                    tr.* += td;
                }
                table.* += tr;
            });
            return table.toXMLString();
        }
    }
); //}}}
commands.addUserCommand(['gmlo[ad]'], 'load Greasemonkey scripts', //{{{
    function(arg, special){
        if (!arg) {
            echoerr('Usage: :gmlo[ad][!] {name|filename}');
            return;
        }
        var scripts = getScripts();
        var script;
        for (var i=0; i<scripts.length; i++){
            if (scripts[i].filename == arg || scripts[i].name == arg){
                script = scripts[i];
                break;
            }
        }
        if (!script) {
            echoerr('no such a user script');
            return;
        } else if (plugins.gmperator.currentContainer.hasScript(script.filename) && !special){
            echoerr(script.filename + ' is already loaded!');
            return;
        } else {
            echo('loading: ' +script.filename);
        }
        try {
            var href = buffer.URL;
            var unsafewin = window.content.document.defaultView.wrappedJSObject;
            GM_BrowserUI.gmSvc.wrappedJSObject.injectScripts([script],href,unsafewin,window);
        } catch(e){
            log(e);
            echoerr(e);
        }
        /*
        // do you have idea how to dispatch load event to only the script ?
        window.setTimeout(function(){
            var loadEvent = document.createEvent('Event');
            loadEvent.initEvent('load',true,true, window.content.document,1);
            window.content.document.dispatchEvent(loadEvent);
        },100);
        */
    },{
        completer: function(filter) scriptsCompleter(filter,true)
    }
); //}}}
commands.addUserCommand(['gmset'], 'change settings for Greasemonkey scripts', //{{{
    function(arg, special){
        var res = commands.parseArgs(arg, this.args);
        if (!res) {
            if (special) GM_setEnabled(!GM_getEnabled()); // toggle enable/disable Greasemonkey
            return;
        }
        var filename = res.args[0];
        var config = new Config();
        config.load();
        var script;
        for (var i=0; i<config.scripts.length; i++){
            if (config.scripts[i].filename == filename){
                script = config.scripts[i];
                break;
            }
        }
        if (!script) return;
        if (special){ // toggle enable/disable the script if {filename} is exist
            script.enabled = !script.enabled;
        }
        if (res.opts.length > 0){
            script.name     = commands.getOption(res.opts, '-name',    script.name);
            script.includes = commands.getOption(res.opts, '-include', script.includes);
            script.excludes = commands.getOption(res.opts, '-exclude', script.excludes);
        }
        config.save();
    },{
        args: [
            [['-name','-n'],    commands.OPTION_STRING],
            [['-include','-i'], commands.OPTION_LIST],
            [['-exclude','-e'], commands.OPTION_LIST]
        ],
        shortHelp: 'change settings for Greasemonkey scripts',
        help: [
            'toggle enable/disable with "!", if <code>{filename}</code> is exist, if not toggle Greasemonkey',
            '<dl><dt><code>-n</code><br/><code>-name</code></dt><dd>change the name</dd>',
            '<dt><code>-i</code><br/><code>-include</code></dt><dd>change the includes list ("," delimiter)</dd>',
            '<dt><code>-e</code><br/><code>-exclude</code></dt><dd>change the excludes list ("," delimiter)</dd></dl>',
            'Caution: the change is permanent, not the only session.<br/>And cannot get back.'
        ].join(''),
        completer: function(filter)
            scriptsCompleter(filter, false)
    }
); //}}}

// ---------------------------
// Utils
// ---------------------------
/** Grasemonkey sandbox container {{{
 * @param {String} uri
 * @param {Sandbox} sandbox
 * @param {Array} scripts
 */
function GmContainer(uri,sandbox){
    this.uri = uri;
    this.sandbox = sandbox;
    this.scripts = [];
}
GmContainer.prototype = {
    addScript : function(script) !this.hasScript(script) && this.scripts.push(script) || false,
    hasScript : function(script){
        var filename;
        switch( typeof(script) ){
            case 'object': filename = script.filename; break;
            case 'string': filename = script; break;
            default: return null;
        }
        return this.scripts.some(function(s) s.filename == filename);
    }
}; // }}}
function getScripts(){ //{{{
    var config = new Config();
    config.load();
    return config.scripts;
} //}}}
function scriptsCompleter(filter,flag){ //{{{
    var candidates = [];
    var scripts = getScripts();
    var isAll = false;
    if (!filter) isAll=true;
    if (flag){
        scripts.forEach(function(s){
            if (isAll || s.name.toLowerCase().indexOf(filter) == 0 ||
                s.filename.indexOf(filter) == 0)
            {
                candidates.push([s.name, s.description]);
                candidates.push([s.filename, s.description]);
            }
        });
    } else {
        scripts.forEach(function(s){
            if (isAll || s.filename.indexOf(filter) == 0)
            {
                candidates.push([s.filename, s.description]);
            }
        });
    }
    return [0,candidates];
} //}}}

})();

// vim: fdm=marker sw=4 ts=4 et:
