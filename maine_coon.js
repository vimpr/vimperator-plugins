/*
Copyright (c) 2008-2013, anekos.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
    3. The names of the authors may not be used to endorse or promote products
       derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
THE POSSIBILITY OF SUCH DAMAGE.


###################################################################################
# http://sourceforge.jp/projects/opensource/wiki/licenses%2Fnew_BSD_license       #
# に参考になる日本語訳がありますが、有効なのは上記英文となります。                #
###################################################################################

*/

var INFO = xml `
<plugin name="Maine Conn" version="2.6.6"
  href="https://github.com/vimpr/vimperator-plugins/raw/master/maine_coon.js"
  summary = "hide the bottom statusbar"
  xmlns="http://vimperator.org/namespaces/liberator">
  <author href="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>BSD</license>
  <project name="Vimperator" minVersion="3.6.1"/>
  <p>
    <code><![CDATA[
      == Requires ==
        _libly.js
      == Options ==
        mainecoon:
          Possible values
            c:
              Hide caption-bar
            a:
              Hide automatically command-line
            f:
              Fullscreeen
            C:
              Hide caption-bar
              If window is maximized, then window maximize after window is hid.
            m:
              Displays the message to command-line.
              (e.g. "Yanked http://..." "-- CARET --")
            u:
              Displays the message of current page URL when page is loaded.
          >||
            :set mainecoon=ac
          ||<
          The default value of this option is "amu".
          === note ===
            The C and c options probably are supported on some OSs only.
      == Global Variables ==
        maine_coon_targets:
          Other elements IDs that you want to hide.
          let g:maine_coon_targets = "sidebar-2 sidebar-2-splitter"
        maine_coon_default:
          The default value of 'mainecoon' option.
          >||
            let g:maine_coon_default = "ac"
          ||<
        maine_coon_style:
          The Style for message output.
          >||
            let g:maine_coon_style = "border: 1px solid pink; padding: 3px; color: pink; background: black; font: 18px/1 sans-serif;"
          ||<
      == Thanks ==
        * snaka72 (hidechrome part):
          http://vimperator.g.hatena.ne.jp/snaka72/20090106/1231262955
        * seenxu
          make maine_coon.js works with vimperator 3.6.1)
      == Maine Coon ==
        http://en.wikipedia.org/wiki/Maine_Coon
    ]]></code>
  </p>
</plugin>`;

(function () {

  let U = libly.$U;
  let mainWindow = document.getElementById('main-window');
  let messageBox = document.getElementById('liberator-message');
  let bottomBar = document.getElementById('liberator-bottombar');
  let commandlineBox = document.getElementById('liberator-commandline-command');

  let tagetIDs = (liberator.globalVariables.maine_coon_targets || '').split(/\s+/);
  let elemStyle =
    (
      liberator.globalVariables.maine_coon_style
      ||
      libly.$U.toStyleText({
        height: '1em',
        margin: 0,
        padding: '3px',
        border: '1px solid #b3b3b3',
        borderLeft: 0,
        borderBottom: 0,
        textAlign: 'left',
        color: '#000',
        font: '11px/1 sans-serif',
        background: '#ebebeb'
      })
    );

  function s2b (s, d) !!((!/^(\d+|false)$/i.test(s)|parseInt(s)|!!d*2)&1<<!s);

  function hideTargets (hide) {
    tagetIDs.forEach(
      function (id)
        let (elem = document.getElementById(id))
          (elem && (elem.collapsed = hide))
    );
  }

  function getWindowInfo () {
      let box = mainWindow.boxObject;
      let x = screenX < 0 ? 0 : screenX;
      let y = screenY < 0 ? 0 : screenY;
      let width =  box.width;
      let height = box.height;
      let adjustHeight = box.screenY - y; // maybe caption height?
      let adjustWidth  = (box.screenX - x) * 2;
      return {
        x: x,
        y: y,
        width: width,
        height: height,
        adjustHeight: adjustHeight,
        adjustWidth: adjustWidth,
        state: window.windowState
      };
  }

  function delay (f, t)
    setTimeout(f, t || 0);

  function refreshWindow () {
    // FIXME
    let old = window.outerWidth;
    window.outerWidth = old + 1;
    window.outerWidth = old;
  }

  function getHideChrome ()
    s2b(mainWindow.getAttribute('hidechrome'), false);

  function hideChrome (hide, maximize) {
    hide = !!hide;
    if (getHideChrome() === hide)
      return;
    if (hide)
      windowInfo = getWindowInfo();
    mainWindow.setAttribute('hidechrome', hide);
    delay(function () {
      window.outerWidth = windowInfo.width;
      window.outerHeight = windowInfo.height + windowInfo.adjustHeight;
    });
    if (maximize && windowInfo.state == window.STATE_MAXIMIZED)
      delay(function () window.maximize());
    refreshWindow();
  }

  function setFullscreen (full) {
    full = !!full;
    if (full === !!window.fullScreen)
      return;
    window.fullScreen = full;
    delay(function () {
      hideTargets(full);
      document.getElementById('navigator-toolbox').collapsed = full;
      if (!full)
        window.maximize();
    }, 1000); // FIXME
  }

  function nothing (value)
    (value === undefined);

  function important (style)
    style.replace(/(!important)?\s*;/g, ' !important;');

  let setAutoHideCommandLine = (function () {
    let hiddenNodes = [];

    return function (hide) {
      hide = !!hide;

      if (hide === autoHideCommandLine)
        return;

      autoHideCommandLine = hide;

      if (hide) {
        bottomBar.collapsed = true;
        let cs = messageBox.parentNode.childNodes;
        hiddenNodes = [];
        for (let i = 0, l = cs.length, c; i < l; i++) {
          c = cs[i];
          if (c.id == 'liberator-commandline')
            continue;
          let style = window.getComputedStyle(c, '');
          hiddenNodes.push([c, c.collapsed, style.display]);
          if (c.id != 'liberator-message')
            c.style.display = 'none';
          c.collapsed = true;
        }
      } else {
        bottomBar.collapsed = false;
        hiddenNodes.forEach(
          function ([c, v, d]) [c.collapsed, c.style.display] = [v, d]);
      }
    }
  })();

  function makeTimeoutDelay (f, n) {
    if (typeof n === 'undefined')
      n = 1;

    if (n > 1)
      f = makeTimeoutDelay(f, n - 1);

    return function () setTimeout(f, 10);
  }

  function focusToCommandline ()
    commandlineBox.inputField.focus();

  let useEcho = false;
  let autoHideCommandLine = false;
  let displayURL = true;
  let inputting = false;
  let windowInfo = {};

  {
    let a = liberator.globalVariables.maine_coon_auto_hide;
    let d = liberator.globalVariables.maine_coon_default;

    let def = !nothing(d) ? d :
              nothing(a)  ? 'amu' :
              s2b(a)      ? 'amu' :
              'm';

    autocommands.add(
      'VimperatorEnter',
      /.*/,
      function () delay(function () options.get('mainecoon').set(def), 1000)
    );
  }

  U.around(commandline, 'input', function (next, args) {
    let result = next();
    inputting = true;
    bottomBar.collapsed = false;
    focusToCommandline();
    return result;
  }, true);

  U.around(commandline, 'open', function (next, args) {
    let result = next();
    bottomBar.collapsed = false;
    focusToCommandline();
    return result;
  }, true);

  U.around(commandline, 'close', function (next, args) {
    if (autoHideCommandLine && !inputting)
      bottomBar.collapsed = true;
    return next();
  }, true);

  U.around(commandline._callbacks.submit, modes.EX, function (next, args) {
    let r = next();
    if (autoHideCommandLine && !inputting && !(
        modes.extended & modes.OUTPUT_MULTILINE))
      commandline.close();
    return r;
  }, true);

  let (
    callback = function (next) {
      if (autoHideCommandLine)
        bottomBar.collapsed = true;
      inputting = false;
      return next();
    }
  ) {
    U.around(commandline._callbacks.submit, modes.PROMPT, callback, true);
    U.around(commandline._callbacks.cancel, modes.PROMPT, callback, true);
  }

  options.add(
    ['mainecoon'],
    'Make big screen like a Maine Coon',
    'charlist',
    '',
    {
      setter: function (value) {
        function has (c)
          (value.indexOf(c) >= 0);

        if (has('f')) {
          hideChrome(false);
          delay(function () setFullscreen(true));
        } else if (has('c')) {
          setFullscreen(false);
          delay(function () hideChrome(true));
        } else if (has('C')) {
          setFullscreen(false);
          delay(function () hideChrome(true, true));
        } else {
          hideChrome(false);
          delay(function () setFullscreen(false));
        }

        setAutoHideCommandLine(has('a'));
        useEcho = has('m');
        displayURL = has('u');

        return value;
      },
      completer: function (context, args) {
        context.title = ['Value', 'Description'];
        context.completions = [
          ['c', 'Hide caption bar'],
          ['f', 'Fullscreen'],
          ['a', 'Hide automatically command-line'],
          ['C', 'Hide caption bar (maximize)'],
          ['m', 'Displays the message to command-line'],
          ['u', 'Displays the message of current page URL when page is loaded.'],
        ];
      },
      validater: function (value) /^[cfa]*$/.test(value)
    }
  );

  // XXX obsolete
  commands.addUserCommand(
    ['fullscreen', 'fs'],
    'Toggle fullscreen mode',
    function () setFullscreen(!window.fullScreen),
    {},
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
