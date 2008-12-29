// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>browser act scenario semi-automatic.</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.0.3</version>
    <minVersion>2.0a2</minVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/scenario-actor.js</updateURL>
    <detail><![CDATA[
== Usage ==
browser act scenario semi-automatic.

== SETTING ==
enable user scenario is liberator.globalVariables.userScenarioList.
.vimperatorrc (or _vimperatorrc) can set
liberator.globalVariables.userScenarioList
using inline javascript.
>||
// hatena sample
javascript <<EOM
liberator.globalVariables.userScenarioList = {
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
- enable to load local scenario file.
- enable to regexp pattern.
- write example.
- fix bug.
- a lot.
     ]]></detail>
</VimperatorPlugin>;
//}}}
(function() {

const debugMode = true;
const VariablesName = 'ScenarioActorVariables';
const VariablesLabelID = 'ScenarioActorVariablesLabelID';

let loadedScenarioList = [];

if(liberator.globalVariables.userScenarioList)
    loadedScenarioList.push(liberator.globalVariables.userScenarioList);

function ScenarioActor () { //{{{
    let variables = storage.newMap('scenarioactor', true);

    function ScenarioContext(event) { //{{{
        config.x = event;
        let triggeredEvent = event;
        let doc = event.target.contentDocument || event.target;
        let win = doc.defaultView;
        return {
            glet: function (name, value) {
                variables.set(this.eval(name), this.eval(value));
                return value;
            },
            gvar: function (name) {
                return variables.get(name);
            },
            begin: function () {
                let lastValue;
                for(let i=0,len=arguments.length;i<len;++i) {
                    lastValue = this.eval(arguments[i]);
                }
                return lastValue;
            },
            and: function () {
                let lastValue;
                for(let i=0,len=arguments.length;i<len;++i) {
                    if(!(lastValue = this.eval(arguments[i]))) break;
                }
                return lastValue;
            },
            or: function () {
                let lastValue;
                for(let i=0,len=arguments.length;i<len;++i) {
                    if(lastValue = this.eval(arguments[i])) break;
                }
                return lastValue;
            },
            xpath: function (xpath) {
                return buffer.evaluateXPath(xpath, doc).snapshotItem(0);
            },
            value: function (dst, src) {
                let edst = this.eval({xpath: this.eval(dst)});
                liberator.log("xpath("+this.eval(dst)+")="+edst);

                if(src==undefined) { // get
                    return edst.value;
                } else { // set
                    let esrc = this.eval(src);
                    if(edst) edst.value = esrc;
                    return esrc;
                }
            },
            click: function (dst) {
                let edst = this.eval({xpath: this.eval(dst)});
                if(edst) edst.click();
                return edst;
            },
            follow: function(dst, where) {
                let edst = this.eval({xpath: this.eval(dst)});
                if(edst) buffer.followLink(edst, where?where:liberator.CURRENT_TAB)
                return edst;
            },
            url: function() {
                return doc ? doc.location.href : doc;
            },
            prompt: function(message, init) {
                return win ? win.prompt(message||'', init||'') : win;
            },
            sleep: function(delay) {
                return liberator.sleep(delay);
            },
            showVariables: function (names) {
                actor.showVariables(doc, names);
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
                        for(sym in exp) {
                            let args = exp[sym];
                            liberator.log("eval: "+sym+"("+args+")");
                            if(args instanceof Array) {
                                return this[sym].apply(this, args);
                            } else {
                                return this[sym](args);
                            }
                        }
                }
            },
        };
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

    return {
        enabled: true,
        loadScenario: function(dir) {
            // TODO: implementation.
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
            let self = this;
            if(!scenarioList || scenarioList.length==0) return scenarioList;

            getBrowser().addEventListener(eventType,
                    function (event) {
                        if (!self.enabled)
                            return;
                        let context = ScenarioContext(event);
                        let url = context.url();
                        if(!url) return url;
                        scenarioList.forEach(function(scenario) {
                            if(url.indexOf(scenario.pattern)>=0)
                                context.eval({begin: scenario.action});
                        });
                    },
                    true);
        },
    };
}; //}}}

let actor = plugins.scenarioActor = ScenarioActor();
let (e = liberator.globalVariables.scenario_actor_enabled) {
    if (e && e.toString().match(/^(false|0)$/i))
        actor.enabled = false;
}
let allScenarioList = plugins.scenarioActor.allScenarioList = {};

io.getRuntimeDirectories('plugin/scenario').forEach(function(dir) {
        actor.loadScenario(dir);
});
loadedScenarioList.forEach(function(list) {
    for(event in list) {
        if(!allScenarioList[event]) allScenarioList[event] = [];
        allScenarioList[event] = allScenarioList[event].concat(list[event]);
    }
});
for(event in allScenarioList) {
    actor.addListener(event, allScenarioList[event]);
}

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
