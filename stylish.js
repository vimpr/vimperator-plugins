// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>stylish</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.0.1</version>
    <minVersion>2.2pre</minVersion>
    <maxVersion>2.2pre</maxVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/stylish.js</updateURL>
    <license>public domain</license>
    <detail><![CDATA[
]]></detail>
</VimperatorPlugin>;
//}}}

(function(){
let stylishService = stylishOverlay.service;
let control = plugins.stylish = {
    COMMAND_DESCRIPTION: 0,
    COMMAND_FUNCTION: 1,
    COMMAND_COMPLETER: 2,
    commands: {
        edit: {
            description: "Edit style",
            fun: function(args){
                let [cmd, name] = args;
                return control.editStyle(name);
            },
            completer: function(args){
                let title = ["style"];
                let completions = [[s.name,""] for each(s in control.listStyle())];
                return [title, completions];
            },
        },
        new: {
            description: "Write new style",
            fun: function(args){
                let [cmd, rule] = args;
                let code = "@namespace url(http://www.w3.org/1999/xhtml);\n\n";
                if(rule) {
                    code += "@-moz-document " + rule + " {\n}\n";
                }
                return stylishOverlay.addCode(code);
                //return control.newStyle();
            },
            completer: function(args){
                let title = ["rule"];
                let completions = [];
                control.getDomains().forEach(function(x) completions.push(["domain("+x+")", "domain"]));
                if(content&&content.document&&content.document.location){
                    completions.push(["url("+content.document.location+")", "url"]);
                }
                control.getDirectories().forEach(function(x) completions.push(["url-prefix("+x+")", "url-prefix"]));
                return [title, completions];
            },
        },
        dialog: {
            description: "Open stylish dialog",
            fun: function(){
                return stylishOverlay.openManage();
            },
        },
        find: {
            description: "Find styles for this site",
            fun: function(){
                return stylishOverlay.findStyle();
            },
        },
        turnall: {
            description: "Turn all styles",
            fun: function(args){
                let turn = gPrefService.getBoolPref("extensions.stylish.styleRegistrationEnabled");
                let on = false;
                if (args[1]) {
                    if (args[1] == "on")
                      on = true;
                    else if (args[1] != "off")
                        liberator.echoerr("Not a stylish turncommand: " + args[1]);
                } else {
                    on = !turn;
                }
                if (turn != on)
                    gPrefService.setBoolPref("extensions.stylish.styleRegistrationEnabled", on);
                return on;
            },
            completer: function(args)
            [
                ["turnall", "description"],
                [["on","Turn all styles on"], ["off","Turn all styles off"]]
            ],
        },
    },
    listStyle: function()
        [s for each(s in stylishService.list(0, {}))],
    getStyle: function(name)
    {
        let styles = [s for each(s in control.listStyle()) if(s.name==name)];
        if(styles.length == 0) return false
        return styles[0];
    },
    editStyle: function(name)
    {
        if(!name) return control.newStyle();
        let style = control.getStyle(name);
        if(!style) return false;
        return stylishCommon.openEditForStyle(style);
    },
    newStyle: function() {
        var style = Components.classes["@userstyles.org/style;1"].createInstance(Components.interfaces.stylishStyle);
        style.mode = style.CALCULATE_META | style.REGISTER_STYLE_ON_CHANGE;
        style.init(null, null, null, null, "", false, null);
        stylishCommon.openEdit(stylishCommon.getWindowName("stylishEdit"), {style: style});
    },
    getDomains: function()
    {
        let domains = [];
        if(content&&content.document&&content.document.domain){
            stylishOverlay.getDomainList(content.document.domain, domains);
        }
        return domains;
    },
    getDirectories: function()
    {
        let uri = buffer.URI;
        let dirs = [];
        while (uri.match(/^(.*?:\/)(.*?)(\/+[^\/]+)\/?$/))
        {
            uri = RegExp.$1 + RegExp.$2 + "/";
            dirs.push(uri);
        }
        return dirs;
    },
    execute: function(args)
    {
        let command = control.commands[args[0]];
        if(command&&command.fun)
            return command.fun(args);
        return false;
    },
    complete: function(args)
    {
        if (args.completeArg == 0){
            let title = ["command", "description"];
            let completions = [[c, control.commands[c].description] for(c in control.commands)];
            return [title, completions];
        }
        let command = control.commands[args[0]];
        if(command&&command.completer)
            return command.completer(args);
        return [];
    }
};
commands.addUserCommand(["stylish"], "stylish command",
    function(args){
        return control.execute(args);
    }, {
        completer: function(context, args){
            [context.title, context.completions] = control.complete(args);
        },
        literal: 1,
    });
})();
// vim: fdm=marker sw=4 ts=4 et:
