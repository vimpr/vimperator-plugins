/*

prevent_focus_ietab.js

Prevent focusing IE Tab when select a tab that renderd in IE Tab plugin.
IE Tab に勝手にフォーカスを奪われて操作不能になるのを防ぐ

Copyright (c) 2009, snaka<snaka.gml@gmail.com>.
All rights reserved.
This software distribute under term of new BSD style license.

*/
(function() {

if (!gIeTab || !gIeTab.onTabSelected) return;
liberator.log("replace IeTab.onTabSelected() function");
var func = gIeTab.onTabSelected.toSource();
var newFunc = func.replace(/window\.setTimeout\(gIeTab\.focusIeTab, 0\);/, '');
gIeTab.removeEventListener("appcontent", "select", gIeTab.onTabSelected);
gIeTab.addEventListener("appcontent", "select", new Function(newFunc));

})();
