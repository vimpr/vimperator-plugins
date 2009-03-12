/*
 * http://www.bijint.com/
 *
 * == Start ==
 * js plugins.bijin_clock.start(min)
 *    min: interval minutes (default: 1)
 *
 * == Stop ==
 * js plugins.bijin_clock.stop()
 */
let PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Bijin Clock - http://www.bijint.com</description>
<version>0.1</version>
</VimperatorPlugin>;

liberator.plugins.bijin_clock = (function(){
const BASE_URL = 'http://www.bijint.com/jp/img/photo/';
const TITLE = fromUTF8Octets("美人時計");
const NAME = "Bijin Clock";
let interval = null;
function getTimeString(date){
  let time = date.toTimeString();
  return time.substr(0,2) + time.substr(3,2);
}
function fromUTF8Octets(octets){
    return decodeURIComponent(octets.replace(/[%\x80-\xFF]/g, function(c){
        return '%' + c.charCodeAt(0).toString(16);
    }));
}
function showBijinClock(){
  let date = new Date;
  let image_src = BASE_URL + getTimeString(date) + ".jpg";
  liberator.echomsg(date.toLocaleString(), 0);
  openDialog('data:application/vnd.mozilla.xul+xml;charset=utf-8,' +
    <><?xml-stylesheet type="text/css" href="chrome://global/skin/"?>
    <?xml-stylesheet type="text/css" href="chrome://browser/skin/browser.css"?>
    <window title={TITLE}
            windowtype="alert:clock"
            style="background-color:transparent;"
            xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">
      <script type="application/javascript"><![CDATA[
      var image;
      var interval;
      var opacity = 1;
      function init(){
        image = document.getElementById('contents');
        var x = screen.availLeft + screen.availWidth - outerWidth;
        var y = screen.availTop  + screen.availHeight - outerHeight;
        window.moveTo(x, y);
        image.style.backgroundColor = "-moz-dialog";
        setTimeout(function(){
          interval = window.setInterval(setOpacity, 200);
        }, 5 * 1000);
      }
      function setOpacity(){
        if (opacity < 0.2){
          stopAndClose();
        }
        opacity -= 0.1;
        image.style.opacity = opacity;
      }
      function stopAndClose(){
        clearInterval(interval);
        window.close();
      }
      ]]></script>
      <vbox id="contents" flex="1"
            style="border:thin solid black;">
        <hbox flex="1">
          <label value={TITLE + "-" + date.toLocaleString()} flex="1"/>
          <toolbarbutton label="X" oncommand="stopAndClose()" style="padding:0;margin:0;"/>
        </hbox>
        <image id="img" src={image_src} onload="init()" onerror="window.close()"/>
      </vbox>
    </window></>.toXMLString(),
    TITLE,
    'chrome,dialog=yes,titlebar=no,popup=yes');
}
let self = {
  start: function(){
    showBijinClock();
    if (interval) this.stop();
    interval = window.setInterval(showBijinClock, 60 * 1000);
    return interval;
  },
  stop: function(){
    if (interval){
      window.clearInterval(interval);
    }
    let w = Cc["@mozilla.org/appshell/window-mediator;1"]
      .getService(Ci.nsIWindowMediator)
      .getMostRecentWindow("alert:clock")
    if (w) w.close();
  },
};
setTimeout(function(){showBijinClock();}, 0);
setTimeout(function(){self.start();}, 60 * 1000 - Date.now() % (60*1000));

return self;
})();
// vim:sw=2 ts=2 et:
