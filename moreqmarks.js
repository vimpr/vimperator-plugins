/**
 * ==VimperatorPlugin==
 * @name           moreqmarks.js
 * @description    add feature(record position, stack, queue) to QuickMarks
 * @description-ja QuickMarksに機能追加(位置の記憶、qmarksとは別のスタックとキュー追加)
 * @author         hogelog
 * @version        0.05
 * ==/VimperatorPlugin==
 *
 * MAPPINGS:
 *  "gj" -> Jump to QuickMark for current URL
 *  "gd" -> Delete QuickMark for current URL
 *  "gs" -> Push QuickMarkStack for current URL
 *  "gS" -> Pop QuickMarkStack and Jump
 *  "gq" -> Queue QuickMarkQueue for current URL
 *  "gQ" -> Dequeue QuickMarkStack and Jump
 *
 * COMMANDS:
 *  :qmarkpu[sh],  :qmpu[sh]    -> Push QuickMarkStack for current URL
 *  :qmarkpo[p],   :qmpo[p]     -> Pop QuickMarkStack and Jump
 *  :stackli[st],  :stli[st]    -> List QuickMarkStack
 *  :qmarkqu[eue], :qmqu[eue]   -> Queue QuickMarkQueue for current URL
 *  :qmarkde[que], :qmde[que]   -> Dequeue QuickMarkStack and Jump
 *  :queueli[st],  :quli[st]    -> List QuickMarkQueue
 *
 */

(function(){
    var use_position = true;
    var use_default_data = true;
    var qmarks = {};
    var qmark_stack = [];
    var qmark_queue = [];

    // TODO: move to a storage module
    var savedMarks = liberator.modules.options.getPref("extensions.vimperator.moreqmarks", "").split("\n");
    var savedMarkStack = liberator.modules.options.getPref("extensions.vimperator.moreqmarkstack", "").split("\n");
    var savedMarkQueue = liberator.modules.options.getPref("extensions.vimperator.moreqmarkqueue", "").split("\n");

    // load the saved quickmarks -- TODO: change to sqlite
    if(use_default_data) {
        var defaultMarks = liberator.modules.options.getPref("extensions.vimperator.quickmarks", "").split("\n");
        for (var i = 0; i < defaultMarks.length - 1; i += 2) {
            var url = defaultMarks[i+1];
            qmarks[defaultMarks[i]] = {url: url, x: 0, y: 0};
        }
    }
    for (var i = 0; i < savedMarks.length - 1; i += 4) {
        var url = savedMarks[i+1];
        var x = savedMarks[i+2];
        var y = savedMarks[i+3];

        qmarks[savedMarks[i]] = {url: url, x: x, y:y};
    }
    for (var i = 0; i < savedMarkStack.length - 1; i += 3) {
        var url = savedMarkStack[i];
        var x = savedMarkStack[i+1];
        var y = savedMarkStack[i+2];

        qmark_stack.push({url: url, x: x, y:y});
    }
    for (var i = 0; i < savedMarkQueue.length - 1; i += 3) {
        var url = savedMarkQueue[i];
        var x = savedMarkQueue[i+1];
        var y = savedMarkQueue[i+2];

        qmark_queue.unshift({url: url, x: x, y:y});
    }

    function add_qmark(qmark, item, target) {
        switch(target) {
            case "stack":
                qmark_stack.push(item);
                break;
            case "queue":
                qmark_queue.unshift(item);
                break;
            case "mark":
            default:
                qmarks[qmark] = item;
                break;
        }
    }
    function get_qmark(qmark, target) {
        switch(target) {
            case "stack":
                return qmark_stack[qmark_stack.length-1];
            case "queue":
                return item = qmark_queue[qmark_queue.length-1];
            case "mark":
            default:
                return qmarks[qmark];
        }
    }
    function get_qmarks(target) {
        var marks = [];
        // TODO: should we sort these in a-zA-Z0-9 order?
        var count = 0;
        var list;
        switch(target) {
            case "stack":
                list = qmark_stack;
                break;
            case "queue":
                list = qmark_queue;
                break;
            case "mark":
            default:
                list = qmarks;
                break;
        }
        for (var mark in list) {
            marks.push([mark, list[mark].url, list[mark].x, list[mark].y]);
        }
        marks.sort();
        return marks;
    }
    function list_qmarks(marks) {
        if(use_position) {
            var list = ":" + liberator.modules.util.escapeHTML(liberator.modules.commandline.command) + "<br/>" +
                       "<table><tr align=\"left\" class=\"hl-Title\"><th>mark</th><th>line</th><th>col</th><th>file</th></tr>";
            for (var i = 0; i < marks.length; i++)
            {
                list += "<tr>" +
                        "<td> "                        + marks[i][0]                              +  "</td>" +
                        "<td align=\"right\">"         + Math.round(marks[i][2] * 100) + "%</td>" +
                        "<td align=\"right\">"         + Math.round(marks[i][3] * 100) + "%</td>" +
                        "<td style=\"color: green;\">" + liberator.modules.util.escapeHTML(marks[i][1]) + "</td>" +
                        "</tr>";
            }
            list += "</table>";
            return list;
        } else {
            var list = ":" + liberator.modules.util.escapeHTML(liberator.modules.commandline.command) + "<br/>" +
                       "<table><tr align=\"left\" class=\"hl-Title\"><th>QuickMark</th><th>URL</th></tr>";
            for (var i = 0; i < marks.length; i++)
            {
                list += "<tr><td>    " + marks[i][0] +
                        "</td><td style=\"color: green;\">" + liberator.modules.util.escapeHTML(marks[i][1]) + "</td></tr>";
            }
            list += "</table>";
            return list;
        }
    }
    function jump_item(item, where, find) {
        var url = item.url;
        var x = item.x;
        var y = item.y;
        if (url) {
            if(find) {
                for (let [number, browser] in Iterator(liberator.modules.tabs.browsers)) {
                    var marked_url = browser.contentDocument.location.href;
                    if(marked_url == url) {
                        liberator.modules.tabs.select(number, false);
                        var win = getBrowser().selectedTab.linkedBrowser.contentWindow;
                        if(use_position) {
                            if(x!=0 || y!=0) {
                                win.scrollTo(x*win.scrollMaxX, y*win.scrollMaxY);
                            }
                        }
                        return true;
                    }
                }
            }
            var tab = open_url(url, where);
            if(tab) {
                var win = tab.linkedBrowser.contentWindow;
                if(use_position) {
                    if(x!=0 || y!=0) {
                        // scrollMaxX and scrollMaxY are 0 before construct content
                        // But small document(scrollMaxX = 0 and scrollMaxY = 0) is marked,
                        // maybe f is run forever.
                        var f = function() {
                            if(win.scrollMaxX==0 && win.scrollMaxY==0) {
                                setTimeout(f, 100);
                            } else {
                                win.scrollTo(x*win.scrollMaxX, y*win.scrollMaxY);
                            }
                        }
                        f();
                    }
                }
            }
            return true;
        }
        return false;
    }
    function save_qmarks(target) {
        switch(target) {
            case "stack":
                var savedQuickMarkStack = "";
                for (var mark in qmark_stack) {
                    savedQuickMarkStack += qmark_stack[mark].url + "\n";
                    savedQuickMarkStack += qmark_stack[mark].x + "\n";
                    savedQuickMarkStack += qmark_stack[mark].y + "\n";
                }
                liberator.modules.options.setPref("extensions.vimperator.moreqmarkstack", savedQuickMarkStack);
                break;
            case "queue":
                var savedQuickMarkQueue = "";
                for (var mark in qmark_queue) {
                    savedQuickMarkQueue += qmark_queue[mark].url + "\n";
                    savedQuickMarkQueue += qmark_queue[mark].x + "\n";
                    savedQuickMarkQueue += qmark_queue[mark].y + "\n";
                }
                liberator.modules.options.setPref("extensions.vimperator.moreqmarkqueue", savedQuickMarkQueue);
                break;
            case "mark":
            default:
                var savedQuickMarks = "";
                for (var mark in qmarks) {
                    savedQuickMarks += mark + "\n";
                    savedQuickMarks += qmarks[mark].url + "\n";
                    savedQuickMarks += qmarks[mark].x + "\n";
                    savedQuickMarks += qmarks[mark].y + "\n";
                }
                liberator.modules.options.setPref("extensions.vimperator.moreqmarks", savedQuickMarks);
                if(use_default_data) {
                    var savedQuickMarks = "";
                    for (var mark in qmarks) {
                        savedQuickMarks += mark + "\n";
                        savedQuickMarks += qmarks[mark].url + "\n";
                    }
                    liberator.modules.options.setPref("extensions.vimperator.quickmarks", savedQuickMarks);
                }
                break;
        }
    }
    function open_url(url, where) {
        if (liberator.forceNewTab && liberator.has("tabs"))
            where = liberator.NEW_TAB;
        else if (!where || !liberator.has("tabs"))
            where = liberator.CURRENT_TAB;

        var whichwindow = window;

        // decide where to load the first url
        switch (where)
        {
            case liberator.CURRENT_TAB:
                getBrowser().loadURIWithFlags(url, null, null, null, null);
                return getBrowser().selectedTab;

            case liberator.NEW_TAB:
                return getBrowser().selectedTab = getBrowser().addTab(url, null, null, null);

            case liberator.NEW_BACKGROUND_TAB:
                return getBrowser().addTab(url, null, null, null);

            case liberator.NEW_WINDOW:
                window.open();
                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
                whichwindow = wm.getMostRecentWindow("navigator:browser");
                whichwindow.loadURI(url, null, null);
                return witchWindow.getBrowser().selectedTab;

            case "mark":
            default:
                liberator.echoerr("Exxx: Invalid 'where' directive in liberator.plugins.moreqmarks openurls(...)");
                return false;
        }
    }

    //// MAPPINGS

    var modes = [liberator.modules.modes.NORMAL];

    liberator.modules.mappings.addUserMap(modes,
        ["gj"], "Jump to QuickMark for current URL",
        function (arg)
        {
            var where = /\bquickmark\b/.test(liberator.modules.options["activate"]) ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB;
            liberator.modules.quickmarks.jumpTo(arg, where, true);
        },
        {arg: true});

    liberator.modules.mappings.addUserMap(modes,
        ["gd"], "Delete QuickMark for current URL",
        function ()
        {
            liberator.plugins.moreqmarks.remove('', liberator.modules.buffer.URL);
        });
    liberator.modules.mappings.addUserMap(modes,
        ["gs"], "Push QuickMarkStack for current URL",
        function ()
        {
            liberator.plugins.moreqmarks.add("", liberator.modules.buffer.URL, "stack");
        });
    liberator.modules.mappings.addUserMap(modes,
        ["gS"], "Pop QuickMarkStack and Jump",
        function ()
        {
            var where = /\bquickmark\b/.test(liberator.modules.options["activate"]) ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB;
            if(liberator.modules.quickmarks.jumpTo("", where, true, "stack")) {
                liberator.modules.quickmarks.remove("", "", "stack");
            }
        });

    liberator.modules.mappings.addUserMap(modes,
        ["gq"], "Queue QuickMarkQueue for current URL",
        function ()
        {
            liberator.plugins.moreqmarks.add("", liberator.modules.buffer.URL, "queue");
        });
    liberator.modules.mappings.addUserMap(modes,
        ["gQ"], "Dequeue QuickMarkStack and Jump",
        function ()
        {
            var where = /\bquickmark\b/.test(liberator.modules.options["activate"]) ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB;
            if(liberator.modules.quickmarks.jumpTo("", where, true, "queue")) {
                liberator.modules.quickmarks.remove("", "", "queue");
            }
        });

    //// COMMANDS

    liberator.modules.commands.add(["qmarkpu[sh]", "qmpu[sh]"], "Push QuickMarkStack for current URL",
        function ()
        {
            liberator.plugins.moreqmarks.add("", liberator.modules.buffer.URL, "stack");
        });
    liberator.modules.commands.add(["qmarkpo[p]", "qmpo[p]"], "Pop QuickMarkStack and Jump",
        function ()
        {
            var where = /\bquickmark\b/.test(liberator.modules.options["activate"]) ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB;
            liberator.modules.quickmarks.jumpTo("", where, true, "stack");
        });
    liberator.modules.commands.add(["stackli[st]", "stls"], "List QuickMarkStack",
        function ()
        {
            liberator.plugins.moreqmarks.list("", "stack");
        });
    liberator.modules.commands.add(["qmarkqu[eue]", "qmqu[eue]"], "Queue QuickMarkQueue for current URL",
        function ()
        {
            liberator.plugins.moreqmarks.add("", liberator.modules.buffer.URL, "queue");
        });
    liberator.modules.commands.add(["qmarkde[que]", "qmde[que]"], "Dequeue QuickMarkStack and Jump",
        function ()
        {
            var where = /\bquickmark\b/.test(liberator.modules.options["activate"]) ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB;
            liberator.modules.quickmarks.jumpTo("", where, true, "queue");
        });
    liberator.modules.commands.add(["queueli[st]", "quli[st]"], "List QuickMarkQueue",
        function ()
        {
            liberator.plugins.moreqmarks.list("", "queue");
        });

    //// PUBLIC SECTION
    liberator.plugins.moreqmarks = {

        add: function (qmark, url, target)
        {
            if(use_position) {
                var win = window.content;

                var x, y;
                if (win.document.body.localName.toLowerCase() == "frameset") {
                    x = 0;
                    y = 0;
                } else {
                    x = win.scrollMaxX ? win.pageXOffset / win.scrollMaxX : 0;
                    y = win.scrollMaxY ? win.pageYOffset / win.scrollMaxY : 0;
                }
                add_qmark(qmark, {url: url, x: x, y: y}, target);
                var message = (target?target+" : ":"add : "+qmark+" | ")+"("+x*100+"%, "+y*100+"%) | "+url;
                liberator.modules.commandline.echo(message, liberator.modules.commandline.HL_INFOMSG)
            } else {
                add_qmark(qmark, {url: url, x: 0, y: 0}, target);
                var message = (target?target+" : ":"add : "+qmark+" | ")+url;
                liberator.modules.commandline.echo(message, liberator.modules.commandline.HL_INFOMSG);
            }
            save_qmarks(target);
        },

        remove: function (filter, url, target)
        {
            var item;
            switch(target) {
                case "stack":
                    if(item = qmark_stack.pop()) {
                        liberator.modules.commandline.echo("pop "+item.url, liberator.modules.commandline.HL_INFOMSG);
                        save_qmarks("stack");
                    } else {
                        liberator.echoerr('No QuickStack set');
                    }
                    break;
                case "queue":
                    var item;
                    if(item = qmark_queue.pop()) {
                        liberator.modules.commandline.echo("dequeue "+item.url, liberator.modules.commandline.HL_INFOMSG);
                        save_qmarks("queue");
                    } else {
                        liberator.echoerr('No QuickQueue set');
                    }
                    break;
                case "mark":
                default:
                    if(url) {
                        for(var mark in qmarks) {
                            if(url == qmarks[mark].url) {
                                delete qmarks[mark];
                                liberator.modules.commandline.echo("delete qmark "+mark, liberator.modules.commandline.HL_INFOMSG);
                                save_qmarks("mark");
                                return;
                            }
                        }
                        liberator.echoerr('No QuickMark set to '+url);
                    } else {
                        var pattern = new RegExp("[" + filter.replace(/\s+/g, "") + "]");

                        for (var qmark in qmarks) {
                            if (pattern.test(qmark)) {
                                delete qmarks[qmark];
                                liberator.modules.commandline.echo("delete qmark "+qmark, liberator.modules.commandline.HL_INFOMSG);
                                save_qmarks("mark");
                                return;
                            }
                        }
                        liberator.echoerr('No QuickMark match '+filter);
                    }
            }
        },

        removeAll: function ()
        {
            qmarks = {};
        },

        jumpTo: function (qmark, where, find, target)
        {
            var item;
            if(!(item=get_qmark(qmark, target)) || !jump_item(item, where, true)) {
                switch(target) {
                    case "stack":
                        liberator.echoerr("E20: QuickMarkStack is empty");
                        break;
                    case "queue":
                        liberator.echoerr("E20: QuickMarkQueue is empty");
                        break;
                    case "mark":
                    default:
                        liberator.echoerr("E20: QuickMark not set");
                        break;
                }
                return false;
            }
            return true;
        },

        list: function (filter, target)
        {
            var marks = get_qmarks(target);

            if (marks.length == 0) {
                switch(target) {
                    case "stack":
                        liberator.echoerr("No QuickMarkStack set");
                        break;
                    case "queue":
                        liberator.echoerr("No QuickMarkQueue set");
                        break;
                    case "mark":
                    default:
                        liberator.echoerr("No QuickMarks set");
                        break;
                }
                return;
            }

            if (filter.length > 0) {
                marks = marks.filter(function (mark) {
                        if (filter.indexOf(mark[0]) > -1)
                            return mark;
                });
                if (marks.length == 0) {
                    liberator.echoerr("E283: No QuickMarks matching \"" + filter + "\"");
                    return;
                }
            }

            var list = list_qmarks(marks);
            liberator.modules.commandline.echo(list, liberator.modules.commandline.HL_NORMAL, liberator.modules.commandline.FORCE_MULTILINE);
        },

        destroy: function ()
        {
            // save_qmarks is called when liberator.plugins.moreqmarks.add
            // save_qmarks("stack");
            // save_qmarks("queue");
            // save_qmarks("mark");
        }
    };
    for(var name in liberator.plugins.moreqmarks) {
        liberator.modules.quickmarks[name] = liberator.plugins.moreqmarks[name];
    }
})();
// vim: set sw=4 ts=4 et:
