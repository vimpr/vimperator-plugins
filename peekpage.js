/**
 * ==VimperatorPlugin==
 * @name            peekpage.js
 * @description     peek page in commandline
 * @author          hogelog
 * @version         0.2
 * ==/VimperatorPlugin==
 *
 * COMMANDS:
 *  :peekpage {URL}     -> Peek URL page in commandline
 *  :peeksrc {URL}      -> Peek URL page source in commandline
 *
 */
(function(){
    var multilineOutputWidget = document.getElementById("liberator-multiline-output");
    var outputContainer = multilineOutputWidget.parentNode;

    var option = {
        bang: true,
        completer: function (context) {
            var complete = options.complete.replace(/[sS]/g, '');
            completion.url(context, complete);
        },
        literal: 0
    };

    function peekview(url){
        var win = multilineOutputWidget.contentWindow;
        var doc = multilineOutputWidget.contentDocument;
        var iframe = doc.createElement('iframe');
        iframe.src = url;
        iframe.width = '100%';

        if (outputContainer.collapsed)
            doc.body.innerHTML = "";

        doc.body.appendChild(iframe);
        commandline.updateOutputHeight(true);

        win.scrollTo(0, doc.height);
        commandline.updateMorePrompt();

        win.focus();

        modes.set(modes.COMMAND_LINE, modes.OUTPUT_MULTILINE);
    }

    commands.addUserCommand(['peekpage'],
        'Peek Page in Commandline',
        function (args){
            peekview(args.string || buffer.URL);
        }, option);
    commands.addUserCommand(['peeksrc'],
        'Peek Page Source in Commandline',
        function (args){
            var http = util.httpGet(args.string || buffer.URL);
            if (http){
                liberator.echo(http.responseText, commandline.FORCE_MULTILINE);
            }
        }, option);
})();

// vim: set fdm=marker sw=4 ts=4 et:
