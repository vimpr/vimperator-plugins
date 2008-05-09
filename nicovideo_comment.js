/**
 * ==VimperatorPlugin==
 * @name           nicovideo_comment.js
 * @description    This plugin allows you to fill in the comment form for NICO NICO DOUGA.
 * @description-ja ニコニコ動画のコメント欄を入力
 * @minVersion     0.6pre
 * @author         otsune
 * @version        0.1
 * ==/VimperatorPlugin==
 *
 * Usage:
 * :nico {String}             -> Fill comment form
 * :nico! {String}            -> Fill mail form
 */
(function(){
var flvp = window.content.wrappedJSObject.document.getElementById('flvplayer');

liberator.commands.addUserCommand(['nico'],'Fill comment form in nicovideo',
    function(arg, special){
        var form = special ? 'inputArea.MailInput.text' : 'inputArea.ChatInput1.text' ;
        flvp.SetVariable(form, arg.toString() );
    },{
        completer: function(filter, special){
            var templates = [];
            var commands = [
                'ue',
                'shita',
                'big',
                'medium',
                'small',
                'white',
                'red',
                'pink',
                'orange',
                'yellow',
                'green',
                'cyan',
                'blue',
                'purple',
                '184',
                'sage'
            ];
            var premiumcommands = [
                'invisible',
                'niconicowhite',
                'truered',
                'passionorange',
                'madyellow',
                'elementalgreen',
                'marineblue',
                'nobleviolet',
                'black'
            ];
            if (special){
                commands.forEach(function(command){
                    if (command[0].toLowerCase().indexOf(filter.toLowerCase()) == 0){
                        templates.push(command);
                    }
                });
            }
            if (special && !(flvp.GetVariable('premiumNo')) ){
                premiumcommands.forEach(function(premiumcommand){
                    if (premiumcommand[0].toLowerCase().indexOf(filter.toLowerCase()) == 0){
                        templates.push(premiumcommand);
                    }
                });
            }

            return [0, templates];
        }
    }
);

})();

// vim: set fdm=marker sw=4 ts=4 et:
