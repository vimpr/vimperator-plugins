var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Vimperator plugin for Greasemonkey</description>
<author mail="teramako@gmail.com" homepage="http://d.hatena.ne.jp/teramako/">teramako</author>
<version>0.6c</version>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/gmperator.js</updateURL>
<detail><![CDATA[

== Command ==

=== gmlist ===
:gmli[st] {filter}:
    show user scripts matches {filter}
:gmli[st]!:
    show all user scripts
:gmli[st] full:
    same as :gmli[st]!

=== gmload ===
:gmlo[ad] {name|filename}:
    load the user script to the current page
    but, do not dispatch load event
    so maybe you should edit the scripts before load
:gmlo[ad]! {name|filename}:
    force load the user script

=== gmset ===
:gmset!:
    toggle enable/disable Greasemonkey
:gmset! {filename}:
    toggle enable/disable the script
:gmset {filename} {options}:
    change the {filename} script attributes.
    {options}:
        -n[name] {value}:  change name to {value}
        -i[nclude] {expr[,expr,...]}: change includes to expr list ("," demiliter)
        -e[xclude] {expr[,expr,...]}: change excludes to expr list ("," demiliter)
    Caution:
        This change is permanent, not only the session.
        And cannot get back.


==== example ====
    :gmset! {filename} -n fooScriptName -i http://*,https://* -e http://example.com/*:
         - toggle enable or disable,
         - name to "fooScriptName",
         - includes to "http://*" and "https://*",
         - and excludes to "http://example.com/*"


=== gmcommand ===
:gmcommand {command name}:
    run Greasemonkey Command

== AutoCommand ==

Available events

GMInjectedScript:
    when open either foreground or background
GMActiveScript:
    when TabSelect or open foreground
    example:
        autocmd GMActiveScript scriptName\.user\.js$ :echo "scriptName is executing"
        when any URL and scriptName.user.js is executing


== Dialog ==

:dialog userscriptmanager:
    open Greasemonkey UserScript Manager

== for JavaScripter ==
you can access to the sandbox of Greasemonkey !!!

liberator.plugins.gmperator:
    allItem:
        return object of
            key:
                {panalID}
            value:
                {GmContainer}

        {panelID}:
            @see gBrowser.mTags[].linkedPanel

    currentPanel:
        currentContainer  :
            return the current {GmContainer} object
        currentSandbox    :
            return the current sandbox object
        gmScripts         :
             return array of {userScripts}
                              {userScripts} => (:
                                 - filename   : {String}
                                 - name       : {String}
                                 - namespace  : {String}
                                 - description: {String}
                                 - enabled    : {Boolean}
                                 - includes   : {String[]}
                                 - encludes   : {String[]}
                              )

]]></detail>
</VimperatorPlugin>;

(function(){

const Cc = Components.classes;
const Ci = Components.interfaces;
const gmID = '@greasemonkey.mozdev.org/greasemonkey-service;1';
if (!Cc[gmID]){
    liberator.log('Greasemonkey is not installed',0);
    return;
}

liberator.plugins.gmperator = (function(){ //{{{
    // -----------------------
    // PUBLIC section
    // -----------------------
    // {{{
    var manager = {
        register: function (uri,sandbox,script){
            var panelID = getPanelID(sandbox.window);
            if (!panelID) return;
            var gmCon;
            if (containers[panelID] && containers[panelID].uri == uri){
                gmCon = containers[panelID];
            } else {
                gmCon = new GmContainer(uri,sandbox);
                containers[panelID] = gmCon;
                this.__defineGetter__(panelID,function() gmCon);
                //liberator.log('gmpeartor: Registered: ' + panelID + ' - ' + uri,8);
            }
            gmCon.sandbox = sandbox;
            gmCon.addScript(script);
            gmCon.uri = uri;
            triggerGMEvent('GMInjectedScript',uri,script._filename);
            if (panelID == this.currentPanel){
                triggerGMEvent('GMActiveScript',uri,script._filename);
            }
        },
        get gmScripts() GM_getConfig().scripts,
        get allItem() containers,
        get currentPanel() getBrowser().mCurrentTab.linkedPanel,
        get currentContainer() containers[this.currentPanel] || null,
        get currentSandbox(){
            var id = this.currentPanel;
            return containers[id] ? containers[id].sandbox : null;
        },
        getSandboxFromWindow: function(win){
            for each (let c in containers){
                if (c.sandbox.window == win) return sandbox;
            }
            return null;
        },
        getContainersFromURI: function(uri){
            var list = [];
            for each (let c in containers){
                if (c.uri == uri) list.push(c);
            }
            return list.length > 0 ? list : null;
        }
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
    appendCode(gmSvc,'evalInSandbox',function(code,uri,sandbox,script){
        liberator.plugins.gmperator.register(uri,sandbox,script);
    });
    function getPanelID(win){
        var tabs = getBrowser().mTabs;
        for (let i=0,l=tabs.length; i<l; i++){
            let tab = tabs.item(i);
            if (tab.linkedBrowser.contentWindow == win){
                return tab.linkedPanel;
            }
        }
    }
    function updateGmContainerList(event){
        var t = event.target;
        if (t && t.localName == 'tab' && t.linkedPanel){
            delete containers[t.linkedPanel];
            delete liberator.plugins.gmperator[t.linkedPanel];
        }
    }
    function dispatchGMTabSelect(event){
        var panelID = event.originalTarget.linkedPanel;
        var container;
        if (container = containers[panelID]){
            liberator.log(panelID + '\n' + container.uri +'\n'+ container.scripts.length,8);
            container.scripts.forEach(function(script){
                triggerGMEvent('GMActiveScript',container.uri,script._filename);
            });
        }
    }
    /**
     * trigger autocommand
     * @param {String} name Event name
     * @param {String} uri
     * @param {String} filename script filename
     */
    function triggerGMEvent(name,uri,filename){
        autocommands.trigger(name, {url: uri+'\n'+filename });
        liberator.log('gmpeartor: '+ name + ' ' + uri+'\n'+filename,8);
    }
    getBrowser().mTabContainer.addEventListener('TabClose',updateGmContainerList,false);
    getBrowser().mTabBox.addEventListener('TabSelect',dispatchGMTabSelect,false);

    config.autocommands.push(['GMInjectedScript','Triggered when UserScript is injected']);
    config.autocommands.push(['GMActiveScript','Triggered when location is changed and injected UserScripts are exist']);
    config.dialogs.push(['userscriptmanager','Greasemonkey Manager',function(){GM_openUserScriptManager();}]);
    // }}}
    return manager;
})(); //}}}

// ---------------------------
// User Command
// ---------------------------
commands.addUserCommand(['gmli[st]','lsgm'],'list Greasemonkey scripts', //{{{
    function(args){
        var xml = <></>;
        var scripts = GM_getConfig().scripts;
        var reg;
        if (args.bang || args.string == 'full'){
            reg = new RegExp();
        } else if (args.string){
            reg = new RegExp(args.string,'i');
        }
        if (reg){
            for each (let s in scripts){
                if (reg.test(s.name) || reg.test(s._filename)){
                    xml += scriptToString(s);
                }
            }
        } else {
            let table = <table/>;
            let tr;
            for each (let script in scripts){
                tr = <tr/>;
                if (script.enabled){
                    tr.* += <td style="font-weight:bold;">{script.name}</td>;
                } else {
                    tr.* += <td>{script.name}</td>;
                }
                tr.* += <td>({script._filename})</td>;
                table.* += tr;
            }
            xml += table;
        }
        liberator.echo(xml,true);
        function scriptToString(script){
            var table = <table>
                <caption class="hl-Title" style="text-align:left">{script.name}</caption>
            </table>;
            [['FileName','_filename'],['NameSpace','namespace'],['Description','description'],
             ['Includes','includes'],['Excludes','excludes'],['Enabled','enabled']].forEach(function(prop){
                let tr = <tr>
                    <th style="font-weight:bold;text-align:left;vertical-align:top">{prop[0]}</th>
                </tr>;
                let contents = script[prop[1]];
                if (typeof contents == 'string' || typeof contents == 'boolean'){
                    tr.* += <td>{contents}</td>;
                } else {
                    let td = <td/>;
                    for (let i=0,l=contents.length; i<l; i++){
                        td.* += contents[i];
                        if (contents[i+1]) td.* += <br/>;
                    }
                    tr.* += td;
                }
                table.* += tr;
            });
            return table;
        }
    },{
        bang:true
    }
); //}}}
commands.addUserCommand(['gmlo[ad]'],'load Greasemonkey scripts', //{{{
    function(args){
        if (!args.string){
            liberator.echoerr('Usage: :gmlo[ad][!] {name|filename}');
            return;
        }
        var scripts = GM_getConfig().scripts;
        var script;
        for (let i=0,l=scripts.length; i<l; i++){
            if (scripts[i]._filename == args.string || scripts[i].name == args.string){
                script = scripts[i];
                break;
            }
        }
        if (!script){
            liberator.echoerr('no such a user script');
            return;
        } else if (liberator.plugins.gmperator.currentContainer.hasScript(script._filename) && !args.bang){
            liberator.echoerr(script._filename + ' is already loaded!');
            return;
        } else {
            liberator.echo('loading: ' +script._filename);
        }
        var href,unsafewin;
        try {
            href = buffer.URL;
            unsafewin = window.content.document.defaultView.wrappedJSObject;
            GM_BrowserUI.gmSvc.wrappedJSObject.injectScripts([script],href,unsafewin,window);
        } catch (e){
            liberator.log(e);
            liberator.echoerr(e);
        }
        /*
        // do you have idea how to dispatch load event to only the script ?
        window.setTimeout(function(){
            var loadEvent = document.createEvent('Event');
            loadEvent.initEvent('load',true,true,window.content.document,1);
            window.content.document.dispatchEvent(loadEvent);
        },100);
        */
    },{
        completer: function(context) scriptsCompleter(context.filter,true)
    }
); //}}}
commands.addUserCommand(['gmset'],'change settings for Greasemonkey scripts', //{{{
    function(args){
        if (args.length == 0){
            if (args.bang) GM_setEnabled(!GM_getEnabled()); // toggle enable/disable Greasemonkey
            return;
        }
        var filename = args[0];
        var config = GM_getConfig();
        var script;
        for (let i=0,l=config.scripts.length; i<l; i++){
            if (config.scripts[i]._filename == filename){
                script = config.scripts[i];
                break;
            }
        }
        if (!script) return;
        if (args.bang){ // toggle enable/disable the script if {filename} is exist
            script.enabled = !script.enabled;
        }
        if (args['-name']) script.name = args['-name'];
        if (args['-include']) script.include = args['-include'];
        if (args['-exclude']) script.exclude = args['-exclude'];
        config._save();
    },{
        completer: function(context) scriptsCompleter(context.filter,false),
        options: [
            [['-name','-n'],    commands.OPTION_STRING],
            [['-include','-i'], commands.OPTION_LIST],
            [['-exclude','-e'], commands.OPTION_LIST]
        ],
        bang:true
    }
); //}}}
commands.addUserCommand(['gmcommand','gmcmd'],'run Greasemonkey Command', //{{{
    function(args){
        var commander = GM_BrowserUI.getCommander(content);
        var commandName = args[0];
        for (let i=0,l=commander.menuItems.length; i<l; i++){
            let menuItem = commander.menuItems[i];
            if (menuItem.getAttribute('label') == commandName){
                menuItem._commandFunc();
                return;
            }
        }
        liberator.echoerr(commandName + ' is not defined userscript command.');
    },
    {
        completer: function(context){
            var items = GM_BrowserUI.getCommander(content).menuItems;
            var completions = [];
            var exp = new RegExp(context.filter,'i');
            context.title = ["UserScript's Commands"];
            context.completions = [[items[i].getAttribute('label'),'-'] for (i in items)].filter(function(item){
                return this.test(item[0]);
            },exp);
        },
        argCount: "1"
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
    addScript : function(script){
        if (!this.hasScript(script)){
            return this.scripts.push(script);
        }
        return false;
    },
    hasScript : function(script){
        var filename;
        switch (typeof script){
            case 'object': filename = script._filename; break;
            case 'string': filename = script; break;
            default: return null;
        }
        return this.scripts.some(function(s) s._filename == filename);
    }
}; // }}}
function scriptsCompleter(filter,flag){ //{{{
    var candidates = [];
    var scripts = GM_getConfig().scripts;
    var isAll = false;
    if (!filter) isAll=true;
    if (flag){
        for each (let s in scripts){
            if (isAll || s.name.toLowerCase().indexOf(filter) == 0 ||
                s._filename.indexOf(filter) == 0)
            {
                candidates.push([s.name,s.description]);
                candidates.push([s._filename,s.description]);
            }
        }
    } else {
        for each (let s in scripts){
            if (isAll || s._filename.indexOf(filter) == 0)
            {
                candidates.push([s._filename,s.description]);
            }
        }
    }
    return [0,candidates];
} //}}}

})();

// vim: fdm=marker sw=4 ts=4 et:
