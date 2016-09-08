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
var INFO = xml`
  <plugin name="Win Cursor" version="1.3.2"
          href="http://vimpr.github.com/"
          summary="Cursor control plugin for MS Windows"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:mouse</tags>
      <spec>:mouse</spec>
      <description>
        <p>
          Display current position and color information (RGB and the name).
        </p>
      </description>
    </item>
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
      <spec>g:win_mouse_auto_blur = <a>0 or 1</a></spec>
      <description>
        <p>
          For automatic mappings (g:win_mouse_map_).
          automatically blur(unfocus) from embed element, after clicking.
        </p>
      </description>
    </item>
    <item>
      <tags>g:win_mouse_blur_delay</tags>
      <spec>g:win_mouse_blur_delay = <a>msec</a></spec>
      <description>
        <p>
          <a>msec</a> milliseconds after clicking, blur(unfocus) from embed element.
        </p>
      </description>
    </item>
    <item>
      <tags>g:win_mouse_release_delay</tags>
      <spec>g:win_mouse_release_delay = <a>msec</a></spec>
      <description>
        <p>
          <a>msec</a> milliseconds after clicking, release modifier keys.
        </p>
      </description>
    </item>
  </plugin>
`;
// }}}

(function () {

  // ctypes {{{
  Components.utils.import("resource://gre/modules/ctypes.jsm");
  // }}}

  // Color {{{
  const Colors = {
    0xffffff: 'white',
    0xf5f5f5: 'whitesmoke',
    0xfff8f8: 'ghostwhite',
    0xfff8f0: 'aliceblue',
    0xfae6e6: 'lavendar',
    0xfffff0: 'azure',
    0xffffe0: 'lightcyan',
    0xfafff5: 'mintcream',
    0xf0fff0: 'honeydew',
    0xf0ffff: 'ivory',
    0xdcf5f5: 'beige',
    0xe0ffff: 'lightyellow',
    0xd2fafa: 'lightgoldenrodyellow',
    0xcdfaff: 'lemonchiffon',
    0xf0faff: 'floralwhite',
    0xe6f5fd: 'oldlace',
    0xdcf8ff: 'cornsilk',
    0xd5efff: 'papayawhite',
    0xcdebff: 'blanchedalmond',
    0xc4e4ff: 'bisque',
    0xfafaff: 'snow',
    0xe6f0fa: 'linen',
    0xd7ebfa: 'antiquewhite',
    0xeef5ff: 'seashell',
    0xf5f0ff: 'lavenderblush',
    0xe1e4ff: 'mistyrose',
    0xdcdcdc: 'gainsboro',
    0xd3d3d3: 'lightgray',
    0xdec4b0: 'lightsteelblue',
    0xe6d8ad: 'lightblue',
    0xface87: 'lightskyblue',
    0xe6e0b0: 'powderblue',
    0xeeeeaf: 'paleturquoise',
    0xebce87: 'skyblue',
    0xaacd66: 'mediumaquamarine',
    0xd4ff7f: 'aquamarine',
    0x98fb98: 'palegreen',
    0x90ee90: 'lightgreen',
    0x8ce6f0: 'khaki',
    0xaae8ee: 'palegoldenrod',
    0xb5e4ff: 'moccasin',
    0xaddeff: 'navajowhite',
    0xb9daff: 'peachpuff',
    0xb3def5: 'wheat',
    0xcbc0ff: 'pink',
    0xc1b6ff: 'lightpink',
    0xd8bfd8: 'thistle',
    0xdda0dd: 'plum',
    0xc0c0c0: 'silver',
    0xa9a9a9: 'darkgray',
    0x998877: 'lightslategray',
    0x908070: 'slategray',
    0xcd5a6a: 'slateblue',
    0xb48246: 'steelblue',
    0xee687b: 'mediumslateblue',
    0xe16941: 'royalblue',
    0xff0000: 'blue',
    0xff901e: 'dodgerblue',
    0xed9564: 'cornflowerblue',
    0xffbf00: 'deepskyblue',
    0xffff00: 'cyan',
    0xffff00: 'aqua',
    0xd0e040: 'turquoise',
    0xccd148: 'mediumturquoise',
    0xd1ce00: 'darkturquoise',
    0xaab220: 'lightseagreen',
    0x9afa00: 'mediumspringgreen',
    0x7fff00: 'springgreen',
    0x00ff00: 'lime',
    0x32cd32: 'limegreen',
    0x32cd9a: 'yellowgreen',
    0x00fc7c: 'lawngreen',
    0x00ff7f: 'chartreuse',
    0x2fffad: 'greenyellow',
    0x00ffff: 'yellow',
    0x00d7ff: 'gold',
    0x00a5ff: 'orange',
    0x008cff: 'darkorange',
    0x20a5da: 'goldenrod',
    0x87b8de: 'burlywood',
    0x8cb4d2: 'tan',
    0x60a4f4: 'sandybrown',
    0x7a96e9: 'darksalmon',
    0x8080f0: 'lightcoral',
    0x7280fa: 'salmon',
    0x7aa0ff: 'lightsalmon',
    0x507fff: 'coral',
    0x4763ff: 'tomato',
    0x0045ff: 'orangered',
    0x0000ff: 'red',
    0x9314ff: 'deeppink',
    0xb469ff: 'hotpink',
    0x9370db: 'palevioletred',
    0xee82ee: 'violet',
    0xd670da: 'orchid',
    0xff00ff: 'magenta',
    0xff00ff: 'fuchsia',
    0xd355ba: 'mediumorchid',
    0xcc3299: 'darkorchid',
    0xd30094: 'darkviolet',
    0xe22b8a: 'blueviolet',
    0xdb70931:' mediumpurple',
    0x808080: 'gray',
    0xcd0000: 'mediumblue',
    0x8b8b00: 'darkcyan',
    0xa09e5f: 'cadetblue',
    0x8fbc8f: 'darkseagreen',
    0x71b33c: 'mediumseagreen',
    0x808000: 'teal',
    0x228b22: 'forestgreen',
    0x578b2e: 'seagreen',
    0x6bb7bd: 'darkkhaki',
    0x3f85cd: 'peru',
    0x3c14dc: 'crimsin',
    0x5c5ccd: 'indianred',
    0x8f8fbc: 'rosybrown',
    0x8515c7: 'mediumvioletred',
    0x696969: 'dimgray',
    0x000000: 'black',
    0x701919: 'midnightblue',
    0x8b3d48: 'darkslateblue',
    0x8b0000: 'darkblue',
    0x800000: 'navy',
    0x4f4f2f: 'darkslategray',
    0x008000: 'green',
    0x006400: 'darkgreen',
    0x2f6b55: 'darkolivegreen',
    0x238e6b: 'olivedrab',
    0x008080: 'olive',
    0x0b86b8: 'darkgoldenrod',
    0x1e69d2: 'chocolate',
    0x2d52a0: 'sienna',
    0x13458b: 'saddlebrown',
    0x2222b2: 'firebrick',
    0x2a2aa5: 'brown',
    0x000080: 'maroon',
    0x00008b: 'darkred',
    0x8b008b: 'darkmagenta',
    0x800080: 'purple',
    0x82004b: 'indigo',
  };
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
  const KEYEVENTF_EXTENDEDKEY    = 0x0001;
  const KEYEVENTF_KEYDOWN        = 0x0000;
  const KEYEVENTF_KEYUP          = 0x0002;

  const User32 = ctypes.open("user32.dll");
  const GDI32 = ctypes.open("gdi32.dll");

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
      ctypes.voidptr_t,
      ctypes.uint32_t
    );
  const GetDC =
    User32.declare(
      "GetDC",
      ctypes.winapi_abi,
      ctypes.uint32_t,
      ctypes.uint32_t
    );
  const GetPixel =
    GDI32.declare(
      "GetPixel",
      ctypes.winapi_abi,
      ctypes.int32_t,
      ctypes.uint32_t,
      ctypes.int32_t,
      ctypes.int32_t
    );
  // }}}

  // Hint {{{
  const DefaultXPath = '//img | //a | //embed | //object';
  function showHint (action, xpath) {
    const HINT_ELEM = 'win-mouse-hint-elem';
    hints.addMode(
      HINT_ELEM,
      'Select the element',
      action,
      function () (xpath || DefaultXPath)
    );
    hints.show(HINT_ELEM);
  }
  // }}}

  // Functions {{{
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

    move: function ({x, y, elem, relative}) {
      if (elem) {
        let view = elem.ownerDocument.defaultView;
        let [sx, sy] = [view.mozInnerScreenX, view.mozInnerScreenY];
        let rect = elem.getBoundingClientRect();
        let [bx, by] = [sx + rect.left, sy + rect.top];
        x  = !x               ? bx + rect.width / 2 :
             (0 < x && x < 1) ? bx + rect.width * x :
             bx + x;
        y  = !y               ? by + rect.height / 2 :
             (0 < y && y < 1) ? by + rect.height * y :
             by + y;
      }

      [x, y] = [x, y].map(function (it) parseInt(it));

      if (relative) {
        let pos = API.position;
        SetCursorPos(pos.x + x, pos.y + y);
      } else {
        SetCursorPos(x, y);
      }
    },

    click: function ({name, release, blur, x, y, elem, relative}) {
      let vs = buttonNameToClickValues(name || 'left');
      if (!vs)
        throw 'Unknown button name';

      if (x || y || elem)
        API.move({x: x, y: y, elem: elem, relative: relative});

      let relKeys = [];
      if (release) {
        let ev = events.fromString(release).slice(-1)[0];
        if (ev.shiftKey)
          relKeys.push(0x10);
        if (ev.ctrlKey)
          relKeys.push(0x11);
        if (ev.altKey)
          relKeys.push(0x12);

        if (relKeys.length > 0) {
          setTimeout(
            function () {
              let ClickInput = new new ctypes.ArrayType(MouseInput, relKeys.length);
              for (let [i, relKey] in Iterator(relKeys)) {
                ClickInput[i].type = 1;
                ClickInput[i].dx = relKey;
                ClickInput[i].dy = KEYEVENTF_KEYDOWN;
              }
              SendInput(relKeys.length, ClickInput.address(), MouseInput.size)
            },
            liberator.globalVariables.win_mouse_release_delay || 5
          );
        }
      }

      let inputSize = relKeys.length + 2;
      let ClickInput = new new ctypes.ArrayType(MouseInput, inputSize);
      for (let [i, relKey] in Iterator(relKeys)) {
        ClickInput[i].type = 1;
        ClickInput[i].dx = relKey;
        ClickInput[i].dy = KEYEVENTF_KEYUP;
      }

      ClickInput[relKeys.length + 0].flags = vs[0];
      ClickInput[relKeys.length + 1].flags = vs[1];

      SendInput(inputSize, ClickInput.address(), MouseInput.size)

      if (blur) {
        setTimeout(
          function () {
            if (modes.main === modes.EMBED)
              liberator.focus.blur();
          },
          liberator.globalVariables.win_mouse_blur_delay || 50
        );
      }
    },

    getPixel: function ({x, y}) {
      if (arguments.length == 0) {
        [x, y] = let (pos = API.position) [pos.x, pos.y];
      }
      let col = GetPixel(GetDC(0), x, y);
      let [r, g, b] = [col & 0x0000ff, (col & 0x00ff00) >> 8, (col & 0xff0000) >> 16];
      return {
        r: r,
        g: g,
        b: b,
        name: Colors[col] || '?'
      };
    }
  };
  // }}}

  // Define mappings {{{
  ALL_MODE = [];
  for (let i = 1; i <= modes.PROMPT; i *= 2)
    ALL_MODE.push(i);

  function mapIfGiven (name, func) {
    let key = liberator.globalVariables[name];
    if (!key)
      return;

    let [description, action, extra]  = func(key);
    mappings.addUserMap(
      ALL_MODE,
      [key],
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
      function (key) {
        return [
          'Move cursor to' + name,
          function (count) API.move({x: D(dx, count), y: D(dy, count), relative: true}),
          {count: true}
        ];
      }
    );
  });

  ['left', 'right', 'middle'].forEach(function (name) {
    mapIfGiven(
      'win_mouse_map_' + name + '_click',
      function (key) {
        return [
          name + ' click',
          function () API.click({name: name, release: key, blur: liberator.globalVariables.win_mouse_auto_blur}),
          {}
        ];
      }
    );
  });
  // }}}

  // Define commands {{{
  function displayCurrent () {
    let pos = API.position;
    let col = API.getPixel(pos);
    return liberator.echo(`[Position] {pos.x}, {pos.y} [Color] {col.r}, {col.g}, {col.b} ({col.name})`);
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
            for (let [i, button] in Iterator(args))
              API.click({name: button, blur: (i == (args.length - 1)) && args['-blur']});
          },
          {
            completer: function (context, args) {
              context.title = ['Button'];
              context.completions = [[it, it] for ([, it] in Iterator('left right middle'.split(' ')))];
            },
            options: [
              [['-blur'], commands.OPTION_NOARG],
            ]
          }
        ),
        new Command(
          ['move'],
          'Move cursor',
          function (args) {
            let [x, y] = args.map(function (it) parseInt(it));

            if (args.length == 1)
              y = x;

            if (args.length <= 0)
              return displayCurrent();

            API.move({x: x, y: y, relative: args['-relative'] || args.bang});
          },
          {
            bang: true,
            options: [
              [['-relative'], commands.OPTION_NOARG],
              [['-hint'], commands.OPTION_NOARG]
            ],
          }
        ),
        new Command(
          ['e[lement]'],
          'Do something with the specified element. (use XPath)',
          function (args) {
            function action (elem) {
              API.move({
                elem: elem,
                x: args['-x'],
                y: args['-y']
              });
              if (args['-click'])
                API.click({name: args['-click'], blur: args['-blur']});
            }

            let xpath = args.literalArg;
            let index = args['-index'];

            if (index !== undefined) {
              let elem = [m for (m in util.evaluateXPath(xpath))][index];
              if (elem)
                action(elem);
              else
                liberator.echoerr('Not found the element: ' + xpath);
              return
            }

            showHint(action, args.literalArg);
          },
          {
            literal: 0,
            bang: true,
            options: [
              [['-blur'], commands.OPTION_NOARG],
              [['-index'], commands.OPTION_INT],
              [['-x'], commands.OPTION_INT],
              [['-y'], commands.OPTION_INT],
              [
                ['-click', '-c'],
                commands.OPTION_STRING,
                function (it) (!!buttonNameToClickValues(it)),
                [[name, name + ' click'] for ([, name] in Iterator('left right middle'.split(' ')))]
              ]
            ]
          }
        )
      ]
    },
    true
  );
  // }}}

})();

// vim:sw=2 ts=2 et si fdm=marker:

