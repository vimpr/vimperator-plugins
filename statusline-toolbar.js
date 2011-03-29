var INFO =
<plugin name="Statusline Toolbar" version="0.1"
        href="http://github.com/vimpr/vimperator-plugins/raw/master/statusline-toolbar.js"
        summary="Append Toolbar to Statusline"
        xmlns="http://vimperator.org/namespaces/liberator">
    <author email="teramako@gmail.com">teramako</author>
    <license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
    <project name="Vimperator" minVersion="3.0"/>
    <description>
      <ul>
        <li>Add toolbar to status-line</li>
        <li>Move the status-bar to the toolbar.</li>
        <li>Make the toolbarbuttons in the toolbar palette configurable
          <ul>
            <li>Can customize by command (ex. <ex>:set statuslinetoolbars=feed-button</ex>)</li>
            <li>Also, can drop the toolbarbutton from Customize Toolbar window</li>
          </ul>
        </li>
      </ul>
    </description>
    <item>
      <tags>'slt' 'statuslinetoolbars'</tags>
      <spec>'statuslinetoolbars' 'slt'</spec>
      <type>stringlist</type>
      <default></default>
      <description>
        <p>
          Add/Remove toolbarbutton of the toolbar palette.
        </p>
      </description>
    </item>
</plugin>

var updater = {
  "star-button": [
    null,
    function rm(elm) {
      $("urlbar-icons").insertBefore(elm, $("go-button"));
    }
  ],
};
var css = <css><![CDATA[
  #liberator-customize-toolbar {
    border: none !important;
    min-width: 5px !important;
    max-height: 17px;
  }
  #liberator-customize-toolbar > :-moz-any(image, toolbarbutton) { max-height: 16px; }
  #liberator-customize-toolbar .statusbar-resizerpanel { display: none; }
  #liberator-customize-toolbar toolbarbutton { padding: 0 !important; }
  #status-bar { background-color: transparent !important; }
]]></css>.toString() +
({
  WINNT: <css></css>,
  Linux: <css></css>,
  Darwin: <css><![CDATA[
    #liberator-customize-toolbar toolbarbutton {
      background: transparent !important;
      border: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  ]]></css>
})[Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS].toString();

function $(id) document.getElementById(id);
function createElement (name, attrs) {
  var elm = document.createElement("toolbar");
  for (let [name, value] in Iterator(attrs)) {
    elm.setAttribute(name, value);
  }
  return elm;
}
function customizeDone () {
  window.BrowserToolboxCustomizeDone(true);
}

var gToolbox = gNavToolbox;
var id = "liberator-customize-toolbar";
if (!$(id)) {
  init();
}

function init () {
  styles.addSheet(true, "customize-toolbar", "chrome://*", css, false);

  var t = createToolbar();
  t.appendChild($("status-bar"));
  $("liberator-bottombar").appendChild(t);
  updateSets(t, t.currentSet.split(","), []);

  config.toolbars.statuslinetoolbar = [[id], "Statusline Toolbar"];

  options.add(["statuslinetoolbars", "slt"], "Statusline Toolbar Sets",
   "stringlist", "", {
     toolbar: t,
     getter: function () {
       return this.toolbar.currentSet.split(",").filter(function(id) id != "status-bar").join(",") || "none";
     },
     setter: function (val) {
       if (val == "none")
         val = "";

       let newSets = [],
           removeSets = this.toolbar.currentSet.split(",").filter(function(id) id != "status-bar"),
           index;
       for (let [, id] in Iterator(this.parseValues(val))) {
         let i = removeSets.indexOf(id);
         if (i != -1) {
           newSets.push(id);
           removeSets.splice(i, 1);
           continue;
         }
         let elm = $(id);
         if (elm) {
           if (elm.parentNode !== t) {
             t.appendChild(elm);
             if (updater[id] && typeof updater[id][0] == "function") 
               updater[id][0](elm);
           }
           newSets.push(id);
         } else if (gToolbox.palette.querySelector("#" + id)) {
           newSets.push(id);
         }
       }
       t.currentSet = newSets.join(",");
       t.setAttribute("currentset", newSets.join(","));
       updateSets(this.toolbar, newSets, removeSets);
       document.persist(this.toolbar.id, "currentset");
       customizeDone();
       return val;
     },
     completer: function (context) {
       context.completions = [["none","-"]].concat(Array.map(gToolbox.palette.children, function(elm) {
         return [ elm.id, elm.getAttribute("label") || "-" ];
       }));
     },
     validator: function (ids) {
       return ids.every(function(id) {
         return ($(id) || gToolbox.palette.querySelector("#" + id));
       });
     },
   });

  customizeDone();
}

function updateSets (toolbar, newSets, removeSets) {
  for (let [, id] in Iterator(newSets)) {
     if (updater[id] && typeof updater[id][0] == "function") {
       updater[id][0](id);
     }
  }
 for (let [, id] in Iterator(removeSets)) {
   let elm = $(id);
   if (!elm)
     continue;

   toolbar.removeChild(elm);
   if (updater[id] && typeof updater[id][1] == "function") {
     updater[id][1](elm);
   }
 }
}

function createToolbar () {
  var toolbar = createElement("toolbar", {
    id: id,
    toolbarname: "Liberator Statusline Toolbar",
    toolboxid: "navigator-toolbox",
    mode: "icons",
    iconsize: "small",
    defaulticonsize: "small",
    lockiconsize: "small",
    customizable: "true",
    context: "toolbar-context-menu",
  });
  toolbar.setAttributeNS(NS.uri, "highlight", "ModeMsg");

  var RDF = services.get("rdf");
  var localStore = RDF.GetDataSource("rdf:local-store");
  var currentSet = localStore.GetTarget(
    RDF.GetResource(document.baseURI + "#" + toolbar.id),
    RDF.GetResource("currentset"),
    true);
  if (currentSet) {
    currentSet = currentSet.QueryInterface(Ci.nsIRDFLiteral).Value;
    toolbar.setAttribute("currentset", currentSet);
  }
  return toolbar;
}


// vim: sw=2 ts=2 et:
