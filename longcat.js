/* NEW BSD LICENSE {{{
Copyright (c) 2012, anekos.
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
  <plugin name="longcat" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="Longcat beautifies your life."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:longcat</tags>
      <spec>:longcat <oa>HOWLONG</oa></spec>
      <description><p>Meow!</p></description>
    </item>
  </plugin>
`;
// }}}


(function () {

  const HEADIMG = 'data:image/png;base64,'+ // {{{
    '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'+
    'Vf4HOxIHLA87nOEAAAAASUVORK5CYII='; // }}}
  const BODYIMG = 'data:image/png;base64,'+ // {{{
    'iVBORw0KGgoAAAANSUhEUgAAAHIAAABkCAYAAABaUmT7AAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A'+
    '/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wECREfCYjC4MMAAAAdaVRYdENv'+
    'bW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAAANdJREFUeNrt0bENxCAQRcGVE0oh3JIp'+
    'g5ASKGmdOfPpQtuaJ/0ISJiIiHrzMrP23tcy8++3vfeac9Zaq8YY1Vq7vfvr7Ak7Qp8IJEiBFEiB'+
    'BCmQAimQIAVSIAVSIEEKpEAKJEiBFEiBBCmQAimQAglSIAVSIEEKpEAKJEhfAFIgBVIgQQqkQAok'+
    'SIEUSIEUSJACKZACCVIgBVIgQQqkQAqkQIIUSIEUSJACKZACCVIgBVIgBRKkQAqkQIIUSIEUSIEE'+
    'KZACKZAgBVIgBRKkQAqkQAokSD21E0f2gZR9zLZDAAAAAElFTkSuQmCC'; // }}}
  const TAILIMG = 'data:image/png;base64,'+ // {{{
    'iVBORw0KGgoAAAANSUhEUgAAAHIAAAAeCAYAAADw60pcAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A'+
    '/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wECREKM3l732UAAAAdaVRYdENv'+
    'bW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAAA3hJREFUaN7tmiFsvEgUxr+7I5mRuI5o'+
    'UiSuIxFNikTiWomoWFlXi1yJbB1yRQUSt0iqFlckOOpmRZMh2YYzx6T0dreb/90/BTJfgliSYcn8'+
    '5nvz3mMAoJvydXZ21m02m+719bXbbDbd5eXlyWOvr6+79Xrdrdfr7uHhoSOETHYe/sTEJYSAlFL9'+
    'ZoydNI4QAtu2QSmFlBJVVaFt28nOw+RBAkDTNL80znEcSCkhpURZlpOeg9mApJQCwMCdx2RZFizL'+
    'AgA1VoP8YVVVpYDYtg1CyLdh1XXdAfz+GRrkD6lt20FY7F32nXzfVxDzPD/ZyRrkb1RZlhBCKEee'+
    'sjeapqlArlYrHVrHElqLooCUcrD3HQqrQRCosFoUBYQQk85YZwMSAPI8BwCYpgnP8/bukz1Ezjmk'+
    'lGiaBnEcTz6sjg7k18knhAyu77LQPlTe3t7urSdt20YQBJBSglKKNE3RNM3k3QgAfwEIx/IyhmHg'+
    '/PwcUkoYhgHHcXB3dwfHcbDb7SCEAAB8fHwo0IZhgHOOxWKhwqVpmuCcI01T9dyrqytEUQRKKXa7'+
    'HZ6fnxHHMd7f32cRkf74p8UzGkeGYYgsy0ApRRiG/yoR4jhGlmUqaXFdF67rgjGGOI6RJAmWyyVs'+
    '20ae50iSBJxzeJ4HSimEEEiSBFEUzcKJowWZJMkgLJZlqZIYxpja23rnmaYJSimqqoLv+9hut7i5'+
    'ucFyuVQLoB9TVRUYY1gul3h5ecGcZIzpZb5mnEVRIAgCVewvFgv4vq9A933SLMsQhiGklCCEDBbC'+
    '4+MjkiSBlBJCCDiOg/v7ewRBMCtHjgok51y5iFIKy7Jgmibe3t7Qti2iKMJqtQLnHIwxCCFQFMWg'+
    '4U0IGSQ+aZqiruvB4mCMgTE2uK9B/s+Ffe80ALi4uEAQBGo/a9sWdV2jrmsQQg46qg/BvQs/q79v'+
    '27YG+TsL+yiK0DQNmqaBbdsqsfmqY2GxD619x2ff/1iWdXQxaJD/QdvtFk9PT+r3ryQkn79k7GuE'+
    't22LPM/heR7iOJ6NI2fT2fkMsod56BtjWZZgjKl+qwY5UpC9DnVt+pJGg5yAhBAHTw70zYVTj4Xo'+
    'PfKH1DfBjx0ByfN8FicDZu/IY5DatkVVVSedJtAgf9CNlFI0TbO39Pic0c7JkaPqtWppR2qQego0'+
    'SC0NUkuD1NqrvwFj/TqAROK84QAAAABJRU5ErkJggg=='; // }}}

  function loadImage (path) {
    let img = new Image();
    img.src = path;
    return img;
  }

  function drawCat (n) {
    let doc = content.document;

    let container = doc.createElement('div');
    let canvas = doc.createElement('canvas');
    let bg = doc.createElement('div');

    canvas.setAttribute('style', String(`<![CDATA[
      position: absolute; !important;
      top: 0px !important;
      background-color: black !important;
      margin: auto;
      right: 0;
      left: 0;
      z-index: 666;
    ]]>`));

    bg.setAttribute('style', String(`<![CDATA[
      position: fixed; !important;
      top: 0px;
      left: 0px;
      background-color: black !important;
      width: 100%;
      height: 100%;
      z-index: 616;
    ]]>`));

    canvas.width = 114;
    canvas.height = 100 + n * 100 + 30;

    doc.body.appendChild(bg);
    container.appendChild(canvas);
    doc.body.appendChild(container);


    let head = loadImage(HEADIMG);
    let body = loadImage(BODYIMG);
    let tail = loadImage(TAILIMG);

    let ctx = canvas.getContext('2d');

    setTimeout(
      function () {
        ctx.drawImage(head, 0, 0);
        ctx.drawImage(body, 0, 100, 114, n * 100);
        ctx.drawImage(tail, 0, 100 + n * 100);
      },
      0
    );
  }

  commands.addUserCommand(
    ['longcat'],
    'Longcat beautifies your life.',
    function (args) {
      let n = parseInt(args[0] || 20, 10);
      drawCat(n);
    },
    {},
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
