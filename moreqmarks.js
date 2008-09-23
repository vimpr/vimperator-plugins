/**
 * ==VimperatorPlugin==
 * @name           moreqmarks.js
 * @description    add feature(record position, stack, queue) to QuickMarks
 * @description-ja QuickMarksに機能追加(位置の記憶、qmarksとは別のスタックとキュー追加)
 * @author         hogelog
 * @version        0.01
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
    var usepos = true;
    var qmarks = {};
    var qmark_stack = [];
    var qmark_queue = [];

    // TODO: move to a storage module
    var savedMarks = liberator.options.getPref("extensions.vimperator.moreqmarks", "").split("\n");
    var savedMarkStack = liberator.options.getPref("extensions.vimperator.moreqmarkstack", "").split("\n");
    var savedMarkQueue = liberator.options.getPref("extensions.vimperator.moreqmarkqueue", "").split("\n");

    // load the saved quickmarks -- TODO: change to sqlite
    if(usepos) {
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
    } else {
        for (var i = 0; i < savedMarks.length - 1; i += 2) {
            qmarks[savedMarks[i]] = savedMarks[i+1];
        }
        for (var i = 0; i < savedMarkStack.length - 1; i += 1) {
            qmark_stack.push(savedMarkStack[i]);
        }
        for (var i = 0; i < savedMarkQueue.length - 1; i += 1) {
            qmark_queue.unshift(savedMarkQueue[i]);
        }
    }

    function add_qmark(qmark, item, target) {
        switch(target) {
            case "stack":
                qmark_stack.push(item);
                break;
            case "queue":
                qmark_queue.unshift(item);
                break;
            default:
                qmarks[qmark] = item;
                break;
        }
    }
    function get_qmark(qmark, target) {
        switch(target) {
            case "stack":
                return qmark_stack.pop();
            case "queue":
                return qmark_queue.pop();
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
            default:
                list = qmarks; 
                break;
        }
        if(usepos) {
            for (var mark in list) {
                marks.push([mark, list[mark].url, list[mark].x, list[mark].y]);
            }
        } else {
            for (var mark in list) {
                marks.push([mark, list[mark]]);
            }
        }
        marks.sort();
        return marks;
    }
    function list_qmarks(marks) {
        if(usepos) {
            var list = ":" + liberator.util.escapeHTML(liberator.commandline.getCommand()) + "<br/>" +
                       "<table><tr align=\"left\" class=\"hl-Title\"><th>mark</th><th>line</th><th>col</th><th>file</th></tr>";
            for (var i = 0; i < marks.length; i++)
            {
                list += "<tr>" +
                        "<td> "                        + marks[i][0]                              +  "</td>" +
                        "<td align=\"right\">"         + Math.round(marks[i][2] * 100) + "%</td>" +
                        "<td align=\"right\">"         + Math.round(marks[i][3] * 100) + "%</td>" +
                        "<td style=\"color: green;\">" + liberator.util.escapeHTML(marks[i][1]) + "</td>" +
                        "</tr>";
            }
            list += "</table>";
            return list;
        } else {
            var list = ":" + liberator.util.escapeHTML(liberator.commandline.getCommand()) + "<br/>" +
                       "<table><tr align=\"left\" class=\"hl-Title\"><th>QuickMark</th><th>URL</th></tr>";
            for (var i = 0; i < marks.length; i++)
            {
                list += "<tr><td>    " + marks[i][0] +
                        "</td><td style=\"color: green;\">" + liberator.util.escapeHTML(marks[i][1]) + "</td></tr>";
            }
            list += "</table>";
            return list;
        }
    }
    function jump_item(item, where, find) {
        var url, x, y;
        if(usepos) {
            url = item.url;
            x = item.x;
            y = item.y;
        } else {
            url = item;
        }
        if (url) {
            if(find) {
                var items = liberator.completion.buffer("")[1];
                var number, title;
    
                for (var i = 0; i < items.length; i++)
                {
                    [number, title] = items[i][0].split(/:\s+/, 2);
                    var marked_url = liberator.util.escapeHTML(items[i][1]);
                    if(marked_url == url) {
                        liberator.tabs.switchTo(number);
                        var win = getBrowser().selectedTab.linkedBrowser.contentWindow;
                        if(usepos) {
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
                if(usepos) {
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
                if(usepos) {
                    for (var mark in qmark_stack) {
                        savedQuickMarkStack += qmark_stack[mark].url + "\n";
                        savedQuickMarkStack += qmark_stack[mark].x + "\n";
                        savedQuickMarkStack += qmark_stack[mark].y + "\n";
                    }
                } else {
                    for (var mark in qmark_stack) {
                        savedQuickMarkStack += qmark_stack[mark]+ "\n";
                    }
                }
                liberator.options.setPref("extensions.vimperator.moreqmarkstack", savedQuickMarkStack);
                break;
            case "queue":
                var savedQuickMarkQueue = "";
                if(usepos) {
                    for (var mark in qmark_queue) {
                        savedQuickMarkStack += qmark_queue[mark].url + "\n";
                        savedQuickMarkStack += qmark_queue[mark].x + "\n";
                        savedQuickMarkStack += qmark_queue[mark].y + "\n";
                    }
                } else {
                    for (var mark in qmark_queue) {
                        savedQuickMarkStack += qmark_queue[mark] + "\n";
                    }
                }
                liberator.options.setPref("extensions.vimperator.moreqmarkqueue", savedQuickMarkQueue);
                break;
            default:
                var savedQuickMarks = "";
                if(usepos) {
                    for (var mark in qmarks)
                    {
                        savedQuickMarks += mark + "\n";
                        savedQuickMarks += qmarks[mark].url + "\n";
                        savedQuickMarks += qmarks[mark].x + "\n";
                        savedQuickMarks += qmarks[mark].y + "\n";
                    }
                } else {
                    for (var mark in qmarks)
                    {
                        savedQuickMarks += mark + "\n";
                        savedQuickMarks += qmarks[mark] + "\n";
                    }
                }
                liberator.options.setPref("extensions.vimperator.moreqmarks", savedQuickMarks);
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

            default:
                liberator.echoerr("Exxx: Invalid 'where' directive in liberator.plugins.moreqmarks openurls(...)");
                return false;
        }
    }

    //// MAPPINGS

    var modes = [liberator.modes.NORMAL];

    liberator.mappings.addUserMap(modes,
        ["gj"], "Jump to QuickMark for current URL",
        function (arg)
        {
            var where = /\bquickmark\b/.test(liberator.options["activate"]) ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB;
            liberator.quickmarks.jumpTo(arg, where, true);
        },
        { flags: liberator.Mappings.flags.ARGUMENT });

    liberator.mappings.addUserMap(modes,
        ["gd"], "Delete QuickMark for current URL",
        function ()
        {
            liberator.plugins.moreqmarks.remove('', liberator.buffer.URL);
        });
    liberator.mappings.addUserMap(modes,
        ["gs"], "Push QuickMarkStack for current URL",
        function ()
        {
            liberator.plugins.moreqmarks.add("", liberator.buffer.URL, "stack");
        });
    liberator.mappings.addUserMap(modes,
        ["gS"], "Pop QuickMarkStack and Jump",
        function ()
        {
            var where = /\bquickmark\b/.test(liberator.options["activate"]) ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB;
            liberator.quickmarks.jumpTo("", where, true, "stack");
        });

    liberator.mappings.addUserMap(modes,
        ["gq"], "Queue QuickMarkQueue for current URL",
        function ()
        {
            liberator.plugins.moreqmarks.add("", liberator.buffer.URL, "queue");
        });
    liberator.mappings.addUserMap(modes,
        ["gQ"], "Dequeue QuickMarkStack and Jump",
        function ()
        {
            var where = /\bquickmark\b/.test(liberator.options["activate"]) ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB;
            liberator.quickmarks.jumpTo("", where, true, "queue");
        });

    //// COMMANDS

    liberator.commands.add(["qmarkpu[sh]", "qmpu[sh]"], "Push QuickMarkStack for current URL",
        function ()
        {
            liberator.plugins.moreqmarks.add("", liberator.buffer.URL, "stack");
        });
    liberator.commands.add(["qmarkpo[p]", "qmpo[p]"], "Pop QuickMarkStack and Jump",
        function ()
        {
            var where = /\bquickmark\b/.test(liberator.options["activate"]) ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB;
            liberator.quickmarks.jumpTo("", where, true, "stack");
        });
    liberator.commands.add(["stackli[st]", "stli[st]"], "List QuickMarkStack",
        function ()
        {
            liberator.plugins.moreqmarks.list("", "stack");
        });
    liberator.commands.add(["qmarkqu[eue]", "qmqu[eue]"], "Queue QuickMarkQueue for current URL",
        function ()
        {
            liberator.plugins.moreqmarks.add("", liberator.buffer.URL, "queue");
        });
    liberator.commands.add(["qmarkde[que]", "qmde[que]"], "Dequeue QuickMarkStack and Jump",
        function ()
        {
            var where = /\bquickmark\b/.test(liberator.options["activate"]) ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB;
            liberator.quickmarks.jumpTo("", where, true, "queue");
        });
    liberator.commands.add(["queueli[st]", "quli[st]"], "List QuickMarkQueue",
        function ()
        {
            liberator.plugins.moreqmarks.list("", "queue");
        });

    //// PUBLIC SECTION 
    liberator.plugins.moreqmarks = {

        add: function (qmark, url, target)
        {
            if(usepos) {
                var win = window.content;

                if (win.document.body.localName.toLowerCase() == "frameset")
                {
                    liberator.echoerr("Marks support for frameset pages not implemented yet");
                    return;
                }

                var x = win.scrollMaxX ? win.pageXOffset / win.scrollMaxX : 0;
                var y = win.scrollMaxY ? win.pageYOffset / win.scrollMaxY : 0;
                add_qmark(qmark, {url: url, x: x, y: y}, target);
                var message = (target?target+" : ":"add : "+qmark+" | ")+"("+x*100+"%, "+y*100+"%) | "+url;
                liberator.commandline.echo(message, liberator.commandline.HL_INFOMSG);
            } else {
                add_qmark(qmark, url, target);
                var message = (target?target+" : ":"add : "+qmark+" | ")+url;
                liberator.commandline.echo(message, liberator.commandline.HL_INFOMSG);
            }
            save_qmarks(target);
        },

        remove: function (filter, url)
        {
            if(url) {
                for(var mark in qmarks) {
                    if(usepos) {
                        if(url == qmarks[mark].url) {
                            delete qmarks[mark];
                            liberator.commandline.echo("delete qmark "+mark, liberator.commandline.HL_INFOMSG);
                            return;
                        }
                    } else {
                        if(url == qmarks[mark]) {
                            delete qmarks[mark];
                            liberator.commandline.echo("delete qmark "+mark, liberator.commandline.HL_INFOMSG);
                            return;
                        }
                    }
                }
                liberator.echoerr('No QuickMark set to '+url);
            } else {
                var pattern = new RegExp("[" + filter.replace(/\s+/g, "") + "]");

                for (var qmark in qmarks) {
                    if (pattern.test(qmark)) {
                        delete qmarks[qmark];
                        liberator.commandline.echo("delete qmark "+qmark, liberator.commandline.HL_INFOMSG);
                        return;
                    }
                }
                liberator.echoerr('No QuickMark match '+filter);
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
                    default:
                        liberator.echoerr("E20: QuickMark not set");
                        break;
                }
            }
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
                if (marks.length == 0)
                {
                    liberator.echoerr("E283: No QuickMarks matching \"" + filter + "\"");
                    return;
                }
            }

            var list = list_qmarks(marks);
            liberator.commandline.echo(list, liberator.commandline.HL_NORMAL, liberator.commandline.FORCE_MULTILINE);
        },

        destroy: function ()
        {
            // save_qmarks is called when add:
            // save_qmarks("stack");
            // save_qmarks("queue");
            // save_qmarks("list");
        }
    };
    for(var name in liberator.plugins.moreqmarks) {
        liberator.quickmarks[name] = liberator.plugins.moreqmarks[name];
    }
})();
// vim: set sw=4 ts=4 et:
