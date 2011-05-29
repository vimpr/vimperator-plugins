// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>browser act scenario semi-automatic.</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.0.7</version>
    <minVersion>2.3pre</minVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/scenario-actor.js</updateURL>
    <detail><![CDATA[
== Usage ==
browser act scenario semi-automatic.

== Needs Library ==
- _libly.js(ver.0.1.17)
  @see http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/trunk/_libly.js

== SETTING ==
Scenario list is loaded by script under RUNTIME_PATH/plugin/scenario,
and liberator.globalVariables.userScenario.
liberator.globalVariables.userScenario can be set
by .vimperatorrc (or _vimperatorrc) using inline JavaScript.
>||
// hatena sample
javascript <<EOM
liberator.globalVariables.userScenario = {
    DOMContentLoaded: [
    { // good by hatena keyword
        pattern: 'http://d.hatena.ne.jp/keyword/',
        action: [
            {sleep: 1000},
            {follow: '//a[contains(@href,"http://ja.wikipedia.org/wiki")]'},
        ],
    },
    { // auto paging hatena in 5 seconds
        pattern: 'hatena.ne.jp',
        action: {and: [
            {sleep: 5000},
            {follow: '//a[@rel="prev"]'},
        ]}
    },
    { // recent vector site is confusing
        pattern: 'http://www.vector.co.jp/soft/',
        action: {or: [
            {follow: ['//a[not(starts-with(@href,"http")) and contains(@href,"/soft/dl/")]', liberator.NEW_TAB]},
            {follow: '//a[not(starts-with(@href,"http")) and contains(@href,"/download/file/")]'},
        ]}
    },
    ],
    load: [
    { // auto hatena star
        pattern: 'hatena.ne.jp/',
        action:
            {follow: '//img[@class="hatena-star-add-button"]'},
    },
    ],
};
EOM
||<
Action expressions like
>||
action: {and: [
    {sleep: 5000},
    {follow: '//a[@rel="prev"]'},
]}
||<
is syntax-sugar of
>||
action: [{and: [
    {sleep: [5000]},
    {follow: ['//a[@rel="prev"]']},
]}]
||<
and action expressions are quoted by {begin: ...}.
== TODO ==
- write more examples.
- add more functions.
- fix bugs.
- a lot.
     ]]></detail>
</VimperatorPlugin>;
//}}}
(function() {

const debugMode = true;
const VariablesName = 'ScenarioActorVariables';
const VariablesLabelID = 'ScenarioActorVariablesLabelID';

let SCENARIO_DIR = liberator.globalVariables.scenarioDir || 'scenario';

var libly = liberator.plugins.libly;
var $U = libly.$U;
var logger = $U.getLogger('scenario-actor');

function ScenarioActor () { //{{{
    let variables = storage.newMap('scenarioactor', {store: true});

    function ScenarioContext(event) { //{{{
        let triggeredEvent = event;
        let win = (event.target.contentDocument||event.target).defaultView;
        let self = {
            glet: function (name, value) {
                if((typeof name)!='string') throw [name, value];
                variables.set(name, self.eval(value));
                return value;
            },
            gvar: function (name) {
                if((typeof name)!='string') throw [name, value];
                return variables.get(name);
            },
            begin: function () {
                let lastValue;
                for(let i=0,len=arguments.length;i<len;++i) {
                    lastValue = self.eval(arguments[i]);
                }
                return lastValue;
            },
            and: function () {
                let lastValue;
                for(let i=0,len=arguments.length;i<len;++i) {
                    if(!(lastValue = self.eval(arguments[i]))) break;
                }
                return lastValue;
            },
            or: function () {
                let lastValue;
                for(let i=0,len=arguments.length;i<len;++i) {
                    if(lastValue = self.eval(arguments[i])) break;
                }
                return lastValue;
            },
            loop: function (cond, exp) {
                let mainThread = services.get('threadManager').mainThread;
                let f = function() {
                    if(!self.eval(cond)) return;
                    self.eval(exp);
                    mainThread.processNextEvent(true);
                    f();
                };
                setTimeout(f, 1);
            },
            get: function (dst, prop) {
                let edst = self.eval({xpath: self.eval(dst)});
                if(!edst) throw [dst, prop];

                return edst[prop];
            },
            set: function (dst, src, prop) {
                let edst = self.eval({xpath: self.eval(dst)});
                if(!edst) throw [dst, src, prop];

                edst[prop] = self.eval(src);
                return edst[prop];
            },
            xpath: function (xpath) {
                if((typeof xpath)!='string'||!win.document) throw [name, value];
                return util.evaluateXPath(xpath, win.document).snapshotItem(0);
            },
            value: function (dst, src) {
                let edst = self.eval({xpath: self.eval(dst)});
                if(!edst) throw [dst, src];

                if(src!=undefined) { // set
                    edst.value = self.eval(src);
                }
                return edst.value;
            },
            click: function (dst) {
                let edst = self.eval({xpath: self.eval(dst)});
                if(!edst) throw [dst];
                edst.click();
                return edst;
            },
            follow: function(dst, where) {
                let edst = self.eval({xpath: self.eval(dst)});
                if(!edst) throw [dst, where];
                buffer.followLink(edst, where?where:liberator.CURRENT_TAB)
                return edst;
            },
            remove: function (dst) {
                let edst = self.eval({xpath: self.eval(dst)});
                if(!edst) throw [dst];
                edst.parentNode.removeChild(edst);
                return edst;
            },
            saveLink: function (dst, skipPrompt) {
                let edst = self.eval({xpath: self.eval(dst)});
                if(!edst) throw [dst, skipPrompt];
                buffer.saveLink(edst, skipPrompt);
                return edst;
            },
            innerText: function (dst, src) {
                let edst = self.eval({xpath: self.eval(dst)});
                if(!edst) throw [dst, src];

                if(src==undefined) { // get
                    return edst.innerText;
                }
                let esrc = self.eval(src);
                edst.innerText = esrc;
                return esrc;
            },
            innerHTML: function (dst, src) {
                let edst = self.eval({xpath: self.eval(dst)});
                if(!edst) throw [dst, src];

                if(src==undefined) { // get
                    return edst.innerHTML;
                }
                let esrc = self.eval(src);
                edst.innerHTML = esrc;
                return esrc;
            },
            url: function() {
                if(!win.document) throw [];
                return win.document.location.href;
            },
            prompt: function(message, init) {
                if(!win) throw [message, init];
                return win.prompt(message||'', init||'');
            },
            sleep: function(delay) {
                return liberator.sleep(delay);
            },
            close: function() {
                if(!win) throw [];
                return win.close();
            },
            jseval: function() {
                let f = arguments[0];
                let args = Array.prototype.slice.call(arguments);
                args.shift();
                if(typeof f!='function') throw [f].concat(args);
                return f.apply(this, args);
            },
            showVariables: function (names) {
                if(!win.document) throw [names];
                actor.showVariables(win.document, names);
            },
            eval: function(exp) {
                switch(typeof exp) {
                    default:
                    case 'bolean':
                    case 'number':
                    case 'string':
                    case 'function':
                        return exp;
                    case 'object':
                        for(let sym in exp) {
                            let args = exp[sym];
                            if(debugMode) logger.log('{'+sym+': '+args+'}');
                            try {
                                if(args instanceof Array) {
                                    return self[sym].apply(this, args);
                                }
                                return self[sym](args);
                            } catch(args if args instanceof Array) {
                                let msg = '{'+sym+': ['+args.join(',')+']}';
                                liberator.reportError(msg);
                                return false;
                            }
                        }
                }
            },
        };
        return self;
    } //}}}

    function createLabel(doc, labelID) {
        let label;
        if(!(label = doc.getElementById(labelID))) {
            label = doc.createElement('pre');
            label.id = VariablesLabelID;
            label.style.position = 'absolute';
            label.style.top = '0px';
            label.style.left = '0px';
            label.style.margin = '0px';
            label.style.padding = '0px';
            label.style.fontSize = '80%';
            label.style.border = '1px solid #ccc';
            label.style.backgroundColor = '#fff';
            label.style.textAlign = 'left';
            label.style.zIndex = '100';
            doc.body.appendChild(label);
        }
        return label;
    }
    function urlmatcher(url) {
        return function(scenario) {
            if(scenario.pattern) {
                let pattern = scenario.pattern;
                switch(typeof pattern) {
                    case 'string':
                        if(url.indexOf(pattern)==-1) return false;
                        break;
                    case 'object':
                        if(!pattern.test(url)) return false;
                        break;
                }
            }
            if(scenario.ignore) {
                let ignore = scenario.ignore;
                switch(typeof ignore) {
                    case 'string':
                        if(url.indexOf(ignore)!=-1) return false;
                        break;
                    case 'object':
                        if(ignore.test(url)) return false;
                        break;
                }
            }
            return true;
        }
    }

    let self = {
        enabled: true,
        readScenarioDirectory: function(name, fun) {
            io.getRuntimeDirectories(SCENARIO_DIR).forEach(function(dir) {
                $U.readDirectory(dir.path, name, fun);
            });
        },
        loadLocalScenario: function(name) {
            if(!name) name = '\.js$';

            if(liberator.globalVariables.userScenario)
                loadedScenarioList.push(liberator.globalVariables.userScenario);
            self.readScenarioDirectory(name, function(file) {
                logger.log('load scenario '+file.path);
                io.source(file.path);
            });
            loadedScenarioList.forEach(function(list) {
                for(let event in list) {
                    self.addListener(event, list[event]);
                }
            });
        },
        showVariables: function(doc, names) {
            if(!doc)
                doc = window.content.document;
            if(!names) {
                names = [name for([name, value] in variables)];
            }

            let label = createLabel(doc, VariablesLabelID);
            label.innerHTML = [arg+': '+variables.get(arg) for each(arg in names)].join("\n");
        },
        clear: function () {
            variables.clear();
        },
        addListener: function (eventType, scenarioList) {
            if(!scenarioList || scenarioList.length==0) return scenarioList;

            getBrowser().addEventListener(eventType,
                    function (event) {
                        if (!self.enabled)
                            return;
                        let context = ScenarioContext(event);
                        let url = context.url();
                        if(!url) return false;
                        let matchfun = urlmatcher(url);
                        scenarioList.forEach(function(scenario) {
                            if(matchfun(scenario)) {
                                context.eval({begin: scenario.action});
                            }
                        });
                    },
                    true);
        },
    };
    return self;
}; //}}}

let actor = plugins.scenarioActor = ScenarioActor();

let loadedScenarioList = plugins.scenarioActor.loadedScenarioList = [];

actor.enabled = !/^(?:false|0)$/i.test(liberator.globalVariables.scenario_actor_enabled);

actor.loadLocalScenario();

commands.addUserCommand(['scenarioclear'], 'clear scenario-actor variables',
        actor.clear,
        {
            argCount: '0',
        });
commands.addUserCommand(['scenariovars'], 'show scenario-actor variables',
        function(args) {
            actor.showVariables(window.content.document);
        },
        {
            argCount: '0',
        });
commands.addUserCommand(['scenarioload'], 'load local scenario',
        function(args) {
            if(args.length) {
                args.forEach(actor.loadLocalScenario);
            } else {
                actor.loadLocalScenario();
            }
        },
        {
            argCount: '*',
            completer: function (context, args) {
                let completions = [];
                actor.readScenarioDirectory(name, function(file) {
                    completions.push([file.leafName, '']);
                });
                context.completions = completions;
            }
        });
commands.addUserCommand(['scenario'], 'turn on/off scenario-actor',
        function(args) {
            if (args.length) {
                switch (args[0].toLowerCase()) {
                    case 'on':
                        actor.enabled = true;
                        break;
                    case 'off':
                        actor.enabled = false;
                        break;
                    default:
                        liberator.echoerr('Invalid argument: ' + args[0]);
                        return;
                }
            } else {
                actor.enabled = !actor.enabled;
            }
            liberator.echo('scenario-actor was ' + (actor.enabled ? 'enabled' : 'disabled'));
        },
        {
            argCount: '*',
            completer: function (context, args) {
                context.completions = [['on', 'enable scenario-actor'], ['off', 'disable scenario-actor']];
            }
        });
})();
// vim: set fdm=marker sw=4 ts=4 et:
