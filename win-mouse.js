/* NEW BSD LICENSE {{{
Copyright (c) 2011, anekos.
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

}}} */

// INFO {{{
let INFO =
<>
  <plugin name="Win Cursor" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="Cursor control plugin for MS Windows"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:mouse click</tags>
      <spec>:mouse click <oa>button</oa></spec>
      <description>
        <p>
          <a>Button</a> click.
        </p>
      </description>
    </item>
    <item>
      <tags>:mouse move</tags>
      <spec>:mouse move <oa>-relative</oa> <oa>x</oa> <oa>y</oa></spec>
      <description>
        <p>
          Move cursor to specified (x, y) position.
          If not given position, display current cursor position.
        </p>
      </description>
    </item>
    <item>
      <tags>g:win_mouse_map_move_DIR</tags>
      <spec>g:win_mouse_map_move_(left|right|up|down) = <a>keys</a></spec>
      <description>
        <p>
          Map the <a>keys</a> to mouse moving action in all mode.
        </p>
      </description>
    </item>
    <item>
      <tags>g:win_mouse_map_BUTTON_click</tags>
      <spec>g:win_mouse_map_(left|right|middle)_click = <a>keys</a></spec>
      <description>
        <p>
          Map the <a>keys</a> to mouse clicking action in all mode.
        </p>
      </description>
    </item>
    <item>
      <tags>g:win_mouse_auto_blur</tags>
      <spec>g:win_mouse_auto_blur = <a>msec</a></spec>
      <description>
        <p>
          <a>msec</a> milliseconds after clicking, automatically blur(unfocus) from embed element.
        </p>
      </description>
    </item>
  </plugin>
</>;
// }}}

(function () {

  // ctypes {{{
  Components.utils.import("resource://gre/modules/ctypes.jsm");
  // }}}

  // 定数 {{{
  const INPUT_MOUSE = 0;
  const MOUSEEVENTF_MOVE         = 0x0001; /* mouse move */
  const MOUSEEVENTF_LEFTDOWN     = 0x0002; /* left button down */
  const MOUSEEVENTF_LEFTUP       = 0x0004; /* left button up */
  const MOUSEEVENTF_RIGHTDOWN    = 0x0008; /* right button down */
  const MOUSEEVENTF_RIGHTUP      = 0x0010; /* right button up */
  const MOUSEEVENTF_MIDDLEDOWN   = 0x0020; /* middle button down */
  const MOUSEEVENTF_MIDDLEUP     = 0x0040; /* middle button up */
  const MOUSEEVENTF_XDOWN        = 0x0080; /* x button down */
  const MOUSEEVENTF_XUP          = 0x0100; /* x button down */
  const MOUSEEVENTF_WHEEL        = 0x0800; /* wheel button rolled */
  // #if (_WIN32_WINNT >= 0x0600)
  // #define MOUSEEVENTF_HWHEEL      0x01000 /* hwheel button rolled */
  // #endif
  // #if(WINVER >= 0x0600)
  // #define MOUSEEVENTF_MOVE_NOCOALESCE 0x2000 /* do not coalesce mouse moves */
  // #endif /* WINVER >= 0x0600 */
  const MOUSEEVENTF_VIRTUALDESK  = 0x4000; /* map to entire virtual desktop */
  const MOUSEEVENTF_ABSOLUTE     = 0x8000; /* absolute move */
  // }}}

  // 構造体 {{{
  const MouseInput =
    new ctypes.StructType(
      'MouseInput',
      [
       {type: ctypes.uint32_t},
       {dx: ctypes.int32_t},
       {dy: ctypes.int32_t},
       {mouseData: ctypes.uint32_t},
       {flags: ctypes.uint32_t},
       {time: ctypes.uint32_t},
       {extraInfo: ctypes.uint32_t.ptr},
      ]
    );

  const CursorPosition =
    new ctypes.StructType(
      'CursorPosition',
      [
       {x: ctypes.uint32_t},
       {y: ctypes.uint32_t},
      ]
    );
  // }}}

  // {{{ WinAPI
  const User32 = ctypes.open("user32.dll");
  const GetCursorPos =
    User32.declare(
      "GetCursorPos",
      ctypes.winapi_abi,
      ctypes.int32_t,
      CursorPosition.ptr
    );
  const SetCursorPos =
    User32.declare(
      "SetCursorPos",
      ctypes.winapi_abi,
      ctypes.int32_t,
      ctypes.int32_t,
      ctypes.int32_t
    );
  const SendInput =
    User32.declare(
      "SendInput",
      ctypes.winapi_abi,
      ctypes.uint32_t,
      ctypes.uint32_t,
      new ctypes.ArrayType(MouseInput, 2).ptr,
      ctypes.uint32_t
    );
  // }}}

  // Functions {{{
  const ClickInput = new new ctypes.ArrayType(MouseInput, 2);

  function buttonNameToClickValues (name) {
    if (typeof name != 'string')
      return;
    switch (name.trim().toLowerCase()) {
    case 'left':
      return [MOUSEEVENTF_LEFTDOWN, MOUSEEVENTF_LEFTUP];
    case 'right':
      return [MOUSEEVENTF_RIGHTDOWN, MOUSEEVENTF_RIGHTUP];
    case 'middle':
    case 'center':
      return [MOUSEEVENTF_MIDDLEDOWN, MOUSEEVENTF_MIDDLEUP];
    }
  }



  const API = __context__.API = {
    get position () {
      let pos = new CursorPosition(0, 0);
      GetCursorPos(pos.address());
      return pos;
    },

    move: function (x, y, relative) {
      if (relative) {
        let pos = API.position;
        SetCursorPos(pos.x + x, pos.y + y);
      } else {
        SetCursorPos(x, y);
      }
    },

    click: function (name) {
      let vs = buttonNameToClickValues(name || 'left');
      if (!vs)
        throw 'Unknown button name';

      [ClickInput[0].flags, ClickInput[1].flags] = vs;
      SendInput(2, ClickInput.address(), MouseInput.size);

      let autoBlur = liberator.globalVariables.win_mouse_auto_blur;
      if (autoBlur) {
        setTimeout(
          function () {
            if (modes.main === modes.EMBED)
              liberator.focus.blur();
          },
          autoBlur
        );
      }
    }
  };
  // }}}

  // Define mappings {{{
  ALL_MODE = [];
  for (let i = 1; i <= modes.PROMPT; i *= 2)
    ALL_MODE.push(i);

  function mapIfGiven (name, description, action, extra) {
    let keys = liberator.globalVariables[name];
    if (!keys)
      return;

    mappings.addUserMap(
      ALL_MODE,
      [keys],
      description,
      action,
      extra
    );
  }

  const D = function (v, p) (v * (p > 0 ? p : 10));
  [
    ['left',  -1,  0],
    ['right',  1,  0],
    ['up',     0, -1],
    ['down',   0,  1],
  ].forEach(function ([name, dx, dy]) {
    mapIfGiven(
      'win_mouse_map_move_' + name,
      'Move cursor to' + name,
      function (count) API.move(D(dx, count), D(dy, count), true),
      {count: true}
    );
  });

  ['left', 'right', 'middle'].forEach(function (name) {
    mapIfGiven(
      'win_mouse_map_' + name + '_click',
      name + ' click',
      function () API.click(name),
      {}
    );
  });
  // }}}

  // Define commands {{{
  function displayCurrent () {
    let pos = API.position;
    return liberator.echo(<>Position: {pos.x}, {pos.y}</>);
  }

  commands.addUserCommand(
    ['mouse'],
    'Mouse control',
    function () {
      displayCurrent();
    },
    {
      subCommands: [
        new Command(
          ['click'],
          'Click',
          function (args) {
            for (let [, button] in Iterator(args))
              API.click(button);
          },
          {
            completer: function (context, args) {
              context.title = ['Button'];
              context.completions = [[it, it] for ([, it] in Iterator('left right middle'.split(' ')))];
            }
          }
        ),
        new Command(
          ['move'],
          'Move cursor',
          function (args) {
            let [x, y] = args.map(function (it) parseInt(it));

            if (args.length <= 0)
              return displayCurrent();

            if (args.length == 1)
              y = x;

            API.move(x, y, args['-relative'] || args.bang);
          },
          {
            bang: true,
            options: [
              [['-relative'], commands.OPTION_NOARG]
            ],
          }
        )
      ]
    },
    true
  );
  // }}}

})();

// vim:sw=2 ts=2 et si fdm=marker:

