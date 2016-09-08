/* {{{
###################################################################################
# SL 部分は、Takahito Yagami さんの著作権物です。                                 #
# JavaScriptでSLを走らせる「SL.JS」を作りました ::: creazy photograph             #
# http://creazy.net/2008/02/sl_js.html                                            #
###################################################################################
}}} */

// PLUGIN_INFO {{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>Alert</name>
  <name lang="ja">アラート</name>
  <description>Displays an alert after the specified time.</description>
  <description lang="ja">指定時間後にアラートダイアログを出したりする。タイマー。</description>
  <version>1.0.2</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <detail lang="ja"><![CDATA[
    かなり変梃な仕様です。
    == Command ==
        :alert [<TIME> | <METHOD> | <MESSAGE>] ...:
        <TIME> 分後に、<MESSAGE> を表示する。
        <METHOD> でアラート方法を指定する。
        引数はどのような順番でも良い。
      e.g.:
        >||
          :alert 1.5 ugh
          :alert -meow=4 -alert 2.0 This is Message!
          :alert This 1.5 -meow=4 -pokimon=10 is Message!
        ||<
    == Methods ==
      :-alert:
        標準的な JS の alert
      :-gunsou:
        恐ろしい軍曹が出現
      :-pokimon:
        ピッカー！
        使用には注意してください！
      :-meow:
        "みゃお"
      :-quit:
        Firefox を終了する
    == Thanks ==
      SL 部分は下記のスクリプトからパクリました！
      プラグインから呼べるように多少書き換えています。
      JavaScriptでSLを走らせる「SL.JS」を作りました ::: creazy photograph
      http://creazy.net/2008/02/sl_js.html
  ]]></detail>
</VimperatorPlugin>`;
// }}}

(function () {

  ////////////////////////////////////////////////////////////////////////////////
  // SL - copyright (c) Takahito Yagami
  ////////////////////////////////////////////////////////////////////////////////

  let sl = function (next) {
    var document = content.document;
    /**
     * SL.JS
     * 
     * # execute bookmarklet below
     * javascript:(function(){var d=document,sl_open,sl_run,sl_close,s=d.createElement('script');s.charset='UTF-8';s.src='http://labs.creazy.net/sl/bookmarklet.js';d.body.appendChild(s)})();
     * 
     * @author  Takahito Yagami <takahito.yagami[at]gmail[dot]com> (a.k.a yager)
     * @version v1.0.0 2008/02/16
     */
    (function(){
      //------------------------------------------------------------
      // Setting (You can chage options in this block)
      //------------------------------------------------------------
      var sl_speed = 100;
      var sl_pitch = 15;
      var sl_tx_color = "#FFFFFF";
      var sl_bg_color = "#000000";
      //------------------------------------------------------------

      //------------------------------------------------------------
      // SL Parts
      //------------------------------------------------------------
      var sl_steam = [];
      sl_steam[0]
        ="                      (@@) (  ) (@)  ( )  @@    ()    @     O     @     O      @<br>"
        +"                 (   )<br>"
        +"             (@@@@)<br>"
        +"          (    )<br>"
        +"<br>"
        +"        (@@@)<br>";
      sl_steam[1]
        ="                      (  ) (@@) ( )  (@)  ()    @@    O     @     O     @      O<br>"
        +"                 (@@@)<br>"
        +"             (    )<br>"
        +"          (@@@@)<br>"
        +"<br>"
        +"        (   )<br>";
      
      var sl_body
        ="      ====        ________                ___________ <br>"
        +"  _D _|  |_______/        \\__I_I_____===__|_________| <br>"
        +"   |(_)---  |   H\\________/ |   |        =|___ ___|      _________________         <br>"
        +"   /     |  |   H  |  |     |   |         ||_| |_||     _|                \\_____A  <br>"
        +"  |      |  |   H  |__--------------------| [___] |   =|                        |  <br>"
        +"  | ________|___H__/__|_____/[][]~\\_______|       |   -|                        |  <br>"
        +"  |/ |   |-----------I_____I [][] []  D   |=======|____|________________________|_ <br>";
      
      var sl_wheels = [];
      sl_wheels[0]
        ="__/ =| o |=-O=====O=====O=====O \\ ____Y___________|__|__________________________|_ <br>"
        +" |/-=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|   <br>"
        +"  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/               \\_/   \\_/    \\_/   \\_/    <br>";
      sl_wheels[1]
        ="__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_ <br>"
        +" |/-=|___|=O=====O=====O=====O   |_____/~\\___/          |_D__D__D_|  |_D__D__D_|   <br>"
        +"  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/               \\_/   \\_/    \\_/   \\_/    <br>";
      sl_wheels[2]
        ="__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_ <br>"
        +" |/-=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|   <br>"
        +"  \\_/      \\O=====O=====O=====O_/      \\_/               \\_/   \\_/    \\_/   \\_/    <br>";
      sl_wheels[3]
        ="__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_ <br>"
        +" |/-=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|   <br>"
        +"  \\_/      \\_O=====O=====O=====O/      \\_/               \\_/   \\_/    \\_/   \\_/    <br>";
      sl_wheels[4]
        ="__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_ <br>"
        +" |/-=|___|=   O=====O=====O=====O|_____/~\\___/          |_D__D__D_|  |_D__D__D_|   <br>"
        +"  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/               \\_/   \\_/    \\_/   \\_/    <br>";
      sl_wheels[5]
        ="__/ =| o |=-~O=====O=====O=====O\\ ____Y___________|__|__________________________|_ <br>"
        +" |/-=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|   <br>"
        +"  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/               \\_/   \\_/    \\_/   \\_/    <br>";

      sl_steam[0]  = sl_steam[0].replace(/ /g,'&nbsp;');
      sl_steam[1]  = sl_steam[1].replace(/ /g,'&nbsp;');
      sl_body      = sl_body.replace(/ /g,'&nbsp;');
      sl_wheels[0] = sl_wheels[0].replace(/ /g,'&nbsp;');
      sl_wheels[1] = sl_wheels[1].replace(/ /g,'&nbsp;');
      sl_wheels[2] = sl_wheels[2].replace(/ /g,'&nbsp;');
      sl_wheels[3] = sl_wheels[3].replace(/ /g,'&nbsp;');
      sl_wheels[4] = sl_wheels[4].replace(/ /g,'&nbsp;');
      sl_wheels[5] = sl_wheels[5].replace(/ /g,'&nbsp;');
      
      var sl_patterns = [];
      sl_patterns[0]  = sl_steam[0] + sl_body + sl_wheels[0];
      sl_patterns[1]  = sl_steam[0] + sl_body + sl_wheels[1];
      sl_patterns[2]  = sl_steam[0] + sl_body + sl_wheels[2];
      sl_patterns[3]  = sl_steam[1] + sl_body + sl_wheels[3];
      sl_patterns[4]  = sl_steam[1] + sl_body + sl_wheels[4];
      sl_patterns[5]  = sl_steam[1] + sl_body + sl_wheels[5];
      
      //------------------------------------------------------------
      // SL Initialize
      //------------------------------------------------------------
      var sl_counter  = 0;
      var sl_position = 0;
      var scrollTop = document.body.scrollTop  || document.documentElement.scrollTop;
      if (window.opera||document.layers) {
        var windowWidth = window.innerWidth;
      } else if (document.all) {
        var windowWidth = document.body.clientWidth;
      } else if(document.getElementById){
        var windowWidth = window.innerWidth;
      }
      var sl_style_base
        ='display: block;'
        +'position: absolute;'
        +'text-align: left;'
        +'overflow: visible;'
        +'white-space: pre;'
        +'font: 12px/12px monospace;';

      var sl_style_main
        =sl_style_base
        +'top: '+(scrollTop+100)+'px;'
        +'left: '+windowWidth+'px;'
        +'padding: 20px;'
        +'z-index: 999;'
        +'color: '+sl_tx_color+';';

      document.body.innerHTML += '<div id="__sl_main__" style="'+sl_style_main+'">'+sl_patterns[0]+'</div>';

      var sl_w = document.getElementById("__sl_main__").clientWidth;
      var sl_h = document.getElementById("__sl_main__").clientHeight;

      var sl_style_background
        =sl_style_base
        +'top: '+(scrollTop+100)+'px;'
        +'left: 0px;'
        +'width: '+windowWidth+'px;'
        +'height: '+sl_h+'px;'
        +'z-index: 998;'
        +'background-color: '+sl_bg_color+';'
        +'filter: alpha(opacity=0);'
        +'-moz-opacity: 0.0;'
        +'opacity: 0.0;';

      document.body.innerHTML += '<div id="__sl_background__" style="'+sl_style_background+'"><br /></div>';

      //------------------------------------------------------------
      // Actions
      //------------------------------------------------------------
      var sl_bg_counter = 0;

      /**
       * sl_open (gradually open background)
       */
      sl_open = function() {
        var oid = "__sl_background__";
        var op  = sl_bg_counter;
        var ua  = navigator.userAgent
        document.getElementById(oid).style.filter = 'alpha(opacity=' + (op * 10) + ')';
        document.getElementById(oid).style.MozOpacity = op / 10;
        document.getElementById(oid).style.opacity = op / 10;
        if ( sl_bg_counter < 8 ) {
          sl_bg_counter++;
          setTimeout('sl_open()',100);
        } else {
          sl_run();
        }

      }

      /**
       * sl_run (move a train)
       */
      sl_run = function() {
        document.getElementById("__sl_main__").innerHTML = sl_patterns[sl_counter];
        document.getElementById("__sl_main__").style.left = windowWidth - sl_position + "px";
        if ( sl_counter < 5 ) {
          sl_counter++;
        } else {
          sl_counter = 0;
        }
        sl_position += sl_pitch;
        if ( sl_w + (windowWidth - sl_position) < 0 ) {
          sl_counter  = 0;
          sl_position = 0;
          document.body.removeChild(document.getElementById("__sl_main__"));
          sl_close();
        } else {
          setTimeout('sl_run()',sl_speed);
        }
      }

      /**
       * sl_close (gradually close background)
       */
      sl_close = function() {
        var oid = "__sl_background__";
        var op  = sl_bg_counter;
        var ua = navigator.userAgent
        document.getElementById(oid).style.filter = 'alpha(opacity=' + (op * 10) + ')';
        document.getElementById(oid).style.MozOpacity = op / 10;
        document.getElementById(oid).style.opacity = op / 10;
        if ( sl_bg_counter > 0 ) {
          sl_bg_counter--;
          setTimeout('sl_close()',100);
        } else {
          next();
          document.body.removeChild(document.getElementById(oid));
        }
      }

      // start actions !
      sl_open();

    })();
  };
  ////////////////////////////////////////////////////////////////////////////////
  // END OF SL
  ////////////////////////////////////////////////////////////////////////////////

  let gv = liberator.globalVariables;

  let defaults = {
    methods: (gv.alert_default_methods || 'alert').split(/\W+/),
    time: parseFloat(gv.alert_default_time || '3'),
    message: gv.alert_default_message || 'Time out!',
  };

  let maxMeow = parseInt(liberator.globalVariables.alert_mex_meow || '60', 10);

  let sound = Cc["@mozilla.org/sound;1"].createInstance(Ci.nsISound);
  sound.init();

  let gunsou = 'data:image/gif;base64,'+
        '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'+
        'J04QDASAfeIRAgA7';

  function nop ()
    undefined;

  function singularize (fs, msg) {
    if (!fs.length)
      return nop;
    let [f, arg] = fs[0];
    return function () {
      f(singularize(fs.slice(1), msg), msg, arg);
    };
  }

  function torelativetime(h, m) {
    if (m > 59)
      return false;
    h %= 24;
    var now = new Date();
    var d = (h * 60 + parseInt(m)) - (now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60);
    return d >= 0 ? d : d + 60 * 24;
  }

  let alertMethods = {
    alert: function (next, msg) {
        window.alert(msg);
        next();
    },
    pokimon: function (next, msg, arg) {
      let times = parseInt(arg || '10', 10);
      let colors = ['red', 'blue', 'yellow'];
      let elem = content.document.body;
      let indicator = elem.appendChild(elem.ownerDocument.createElement('div'));
      let rect = elem.getBoundingClientRect();
      indicator.id = 'nyantoro-element-indicator';
      let style = 'background-color: ' + colors[0] + ';' +
                  'opacity: 0.5; z-index: 999;' +
                  'position: fixed;' +
                  'top: '    +                   0 + 'px;' +
                  'height: ' + content.innerHeight + 'px;' +
                  'left: '   +                   0 + 'px;' +
                  'width: '  +  content.innerWidth + 'px';
      indicator.setAttribute('style', style);
      (function () {
        let count = 0;
        let handle = setInterval(
          function () {
            if (count++ < times) {
              indicator.style.backgroundColor = colors[count % colors.length];
            } else {
              clearInterval(handle);
              elem.removeChild(indicator);
              next();
            }
          },
          100
        );
      })();
    },
    gunsou: function (next, msg, arg) {
      let sleep = parseFloat(arg || 3) * 1000;
      let sz = innerWidth / msg.length / 1.5;
      liberator.echo(
        xml`<div style="background: white; color: black;">
          <table>
            <tr>
              <td><img src={gunsou}/></td>
              <td style={"font-size: " + sz + "px; white-space: nowrap;"}>{msg}</td>
            </tr>
          </table>
        </div>`
      );
      setTimeout(next, sleep);
    },
    meow: function (next, msg, arg) {
      let times = Math.min(parseInt(arg || '3', 10), maxMeow);
      let handle = setInterval(
        function () {
          if (times--) {
            sound.play(makeURI('http://www.kurinton.net/~snca/files/meow.wav'));
          } else {
            clearInterval(handle);
            next();
          }
        },
        1000
      );
    },
    quit: function (next, msg) {
      liberator.quit(true);
      next();
    },
    SL: function (next, msg) {
      sl(next);
    }
  };


  defaults.methods = defaults.methods.map(
    function (it) {
      let [_, name, arg] = it.match(/^-?(\w+)(?:=(.*))?$/);
      return [alertMethods[name] || nop, arg];
    }
  );

  commands.addUserCommand(
    ['alert'],
    'Timer alert (:alert [<TIME> | <METHOD> | <MESSAGE>] ...)',
    function (args) {
      let methods = [], time = null, message = '';
      args.forEach(function (v) {
        let m, f, t;
        if ((m = v.match(/^-(\w+)(?:=(.*))?$/)) && (f = alertMethods[m[1]]))
          methods.push([f, m[2]]);
        else if (!time && v.match(/^\d+(\.\d+)?$/))
          time = parseFloat(v);
        else if (!time && (m = v.match(/^(\d{1,2}):(\d{1,2})$/)) && (t = torelativetime(m[1], m[2])))
          time = parseFloat(t);
        else
          message += ' ' + v;
      });
      if (!message)
          message = defaults.message;
      if (typeof time != 'number')
        time = defaults.time;
      if (!methods.length)
          methods = defaults.methods;
      setTimeout(singularize(methods, message), time * 60 * 1000);
    },
    {
      argCount: '*',
      completer: function (context, args) {
        context.title = ['method', 'Description'];
        context.completions = [
          ['-alert',   'JS alert'],
          ['-gunsou',  'Spawn horrible sergeant'],
          ['-meow',    'Meow'],
          ['-pokimon', 'Like a electric mouse'],
          ['-quit',    'Quit firefox'],
          ['-SL',      'Run SL'],
        ];
      }
    },
    true
  );


})();

// vim:sw=2 ts=2 et si fdm=marker:

