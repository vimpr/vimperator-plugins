// Vimperator plugin: "Update Twitter & Wassr"
// Last Change: 31-Jul-2008. Jan 2008
// License: Public domain
// Maintainer: mattn <mattn.jp@gmail.com> - http://mattn.kaoriya.net/

(function(){
    liberator.commands.addUserCommand(["twissr"], "Change Twitter & Wassr status",
        function(arg, special){
            arg = (special ? '! ' : ' ') + arg;
            liberator.execute('twitter' + arg);
            liberator.execute('wassr' + arg);
        },
    { });
})();
