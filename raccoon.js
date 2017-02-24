/* The MIT LICENSE {{{

The MIT License (MIT)
Copyright (c) 2015 oniatsu
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

}}} */

// INFO {{{
var INFO = xml`
  <plugin
    name="Raccoon" version="1.0.0"
    href="http://vimpr.github.com/"
    summary="Automatically hide command line bar"
    lang="en-US"
    xmlns="http://vimperator.org/namespaces/liberator">
  
    <author href="https://twitter.com/oniatsu">oniatsu</author>
    <license>The MIT LISCENSE</license>
    <project name="Vimperator" minVersion="3.6"/>
    <p></p>
    <item>
      <tags>:raccoon</tags>
      <spec>:rac[coon]</spec>
      <description><p>
        Toggle automatic hiding command line bar
      </p></description>
    </item>
  </plugin>
`;
// }}}

(function() {

  // global flag
  var _isValid = true;

  // mode element's state
  var _mode = {
    value: '',
    collapsed: false,
  };

  // commandline element's state
  var _commandline = {
    focused: false,
  };

  // message element's state
  var _message = {
    value: '',
  };

  var observe = function(param) {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(param.onChange);    
    });
    var config = { attributes: true };
    observer.observe(param.target, config);
  };

  // return necessity for showing bottom bar
  var hasBottomBarInfo = function() {
    if (!(_mode.value === '' && _mode.collapsed) || _commandline.focused || _message.value) {
      return true;
    } else {
      return false;
    }
  };

  var setBottombarDisplay = function(flag) {
    if (flag === undefined) {
      flag = hasBottomBarInfo();
    }

    var bottombar = document.getElementById('liberator-bottombar');

    if (flag) {
      bottombar.style.height = '';
      bottombar.style.overflow = '';
    } else {
      bottombar.style.height = '0px';
      bottombar.style.overflow = 'hidden';
    }
  };

  // toggle automatic hiding command line
  var toggle = function() {
    _isValid = !_isValid;

    if (_isValid) {
      setBottombarDisplay();
    } else {
      setBottombarDisplay(true);
    }
  };

  (function initialize() {

    setBottombarDisplay(false);

    // observe mode element
    observe({
      target: document.querySelector("#liberator-mode"),
      onChange: function (mutation) {
        _mode.value = mutation.target.value;
        _mode.collapsed = mutation.target.collapsed;

        if (_isValid) {
          setBottombarDisplay();
        }
      }
    });

    // observe commandline element
    observe({
      target: document.querySelector("#liberator-commandline-command"),
      onChange: function (mutation) {
        _commandline.focused = mutation.target.getAttribute('focused');

        if (_isValid) {
          setBottombarDisplay();
        }
      }
    });

    // observe message element
    observe({
      target: document.querySelector("#liberator-message"),
      onChange: function (mutation) {
        _message.value = mutation.target.value;

        if (_isValid) {
          setBottombarDisplay();
        }
      }
    });

    // add user command
    commands.addUserCommand(
      ['rac[coon]',],
      'Toggle raccoon',
      function () {
        toggle();
      },
      {},
      true
    );

  }());

}());

