// Vimperator Plugin: Auto-Focus Canceller
// Version: 0.1

(function(){

const DEBUG = false;
var org_focus = {};

function disable_focus(){
    var doc = content.document;

    var input = doc.getElementsByTagName("input");
    if(input.length > 0){
        input = input[0];
        org_focus.input = input.wrappedJSObject.__proto__.focus;
        input.wrappedJSObject.__proto__.focus = function(){};
    }

    var textarea = doc.getElementsByTagName("textarea");
    if(textarea.length > 0){
        textarea = textarea[0];
        org_focus.textarea = textarea.wrappedJSObject.__proto__.focus;
        textarea.wrappedJSObject.__proto__.focus = function(){};
    }
}

function enable_focus(){
    var doc = content.document;

    if(org_focus.input){
        var input = doc.getElementsByTagName("input");
        if(input.length > 0){
            input = input[0];
            input.wrappedJSObject.__proto__.focus = org_focus.input;
        }
    }

    if(org_focus.textarea){
        var textarea = doc.getElementsByTagName("textarea");
        if(textarea.length > 0){
            textarea = textarea[0];
            textarea.wrappedJSObject.__proto__.focus = org_focus.textarea;
        }
    }

    org_focus = {};
}

liberator.autocommands.add("PageLoad",
    ".*",
    ":autofocuscanceller"
);

liberator.commands.addUserCommand(
    ["autofocuscanceller"],
    "",
    function(){
        disable_focus();
        content.window.addEventListener("load", function(){
            setTimeout(function(){
                enable_focus();
            }, 1000);
        }, false);
    },
    null, true
);

if(DEBUG){
    liberator.commands.addUserCommand(
        ["disablefocus"],
        "",
        function(){
            disable_focus();
        },
        null, true
    );

    liberator.commands.addUserCommand(
        ["enablefocus"],
        "",
        function(){
            enable_focus();
        },
        null, true
    );
}

})();
