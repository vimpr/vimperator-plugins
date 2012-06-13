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
let INFO =
<>
  <plugin name="PDF.js.js" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="PDF.js controller."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:pdfjs-mapping-sample</tags>
      <description><p>mapping sample</p><code><![CDATA[
        nnoremap -urls ^\\.pdf$ i :<C-u>pdfjs index<Space>
        nnoremap -urls ^\\.pdf$ z :<C-u>pdfjs zoom<Space>
      ]]></code></description>
    </item>
  </plugin>
</>;
// }}}

(function () {

  let scrollCount = 1;

  // Functions {{{

  function getScrollHeight (count) {
    let base = content.innerHeight / 10;
    if (count > 0)
      scrollCount = count;
    return base  * scrollCount;
  }

  function addMap (keys, desc, action) {
    mappings.addUserMap(
      [modes.NORMAL],
      keys,
      desc + ' - PDF.js.js',
      action,
      {
        count: true,
        matchingUrls: /\.pdf$/
      }
    );
  }

  function getOutline () {
    return Array.slice(content.document.querySelector('#outlineView').querySelectorAll('.outlineItem > a'));
  }

  function getOutlineLevel (node) {
    let level = 0;
    while (node && (node.getAttribute('id') != 'outlineView')) {
      node = node.parentNode;
      level++;
    }
    return node ? (level / 2): 0;
  }

  function nSpace (level) {
    let res = '';
    for (i = 0; i < level; i++)
      res += '　';
    return res;
  }

  // }}}

  // Mappings {{{

  addMap(
    ['j'],
    'Scroll Down',
    function (count) {
      content.document.querySelector('#viewerContainer').scrollTop += getScrollHeight(count);
    }
  );

  addMap(
    ['k'],
    'Scroll up',
    function (count) {
      content.document.querySelector('#viewerContainer').scrollTop -= getScrollHeight(count);
    }
  );

  addMap(
    ['n'],
    'Next page',
    function (count) {
      content.window.wrappedJSObject.PDFView.page += (count > 0 ? count : 1);
    }
  );

  addMap(
    ['p'],
    'Previous page',
    function (count) {
      content.window.wrappedJSObject.PDFView.page -= (count > 0 ? count : 1);
    }
  );

  addMap(
    ['gg'],
    'Go to page top or N page.',
    function (count) {
      if (count > 0)
        content.window.wrappedJSObject.PDFView.page = count;
      else
        content.window.wrappedJSObject.PDFView.page = 1;
    }
  );

  addMap(
    ['zh'],
    'Fit to page.',
    function (count) {
      liberator.execute('pdfjs zoom page-fit');
    }
  );

  addMap(
    ['zw'],
    'Fit to page to width.',
    function (count) {
      liberator.execute('pdfjs zoom page-width');
    }
  );

  addMap(
    ['za'],
    'Fit to page to width.',
    function (count) {
      liberator.execute('pdfjs zoom auto');
    }
  );

  addMap(
    ['zz'],
    'Fit to page to width.',
    function (count) {
      commandline.open('', 'pdfjs zoom ', modes.EX);
    }
  );

  // }}}

  commands.addUserCommand( // {{{
    ['pdfjs'],
    'PDF.js',
    function () void 'Meow is best',
    {
      subCommands: [
        new Command(
          ['i[ndex]'],
          'Jump page by index',
          function (args) {
            let index = args.literalArg.match(/^#(\d+)$/);
            if (index) {
              let os = getOutline();
              buffer.followLink(os[parseInt(index[1], 10)], liberator.CURRENT_TAB);
            } else {
              content.window.wrappedJSObject.PDFView.page = parseInt(args.literalArg, 10);
            }
          },
          {
            literal: 0,
            completer: function (context, args) {
              function desc (o) {
                const PageRE = /#page=(\d+)\&/;
                if (o.href && PageRE.test(o.href)) {
                  return String(<>{nSpace(getOutlineLevel(o))} {o.textContent} (p{o.href.match(PageRE)[1]})</>);
                } else {
                  return String(<>{nSpace(getOutlineLevel(o))} {o.textContent}</>);
                }
              }

              let os = getOutline();
              context.compare = void 0;
              context.filters = [CompletionContext.Filter.textDescription];
              context.completions = [
                [
                  '#' + i, desc(o)
                ]
                for ([i, o] in Iterator(os))
              ];
            }
          }
        ),

        new Command(
          ['z[oom]'],
          'Zoom',
          function (args) {
            content.window.wrappedJSObject.PDFView.parseScale(args.literalArg);
          },
          {
            literal: 0,
            completer: function (context, args) {
              let os = Array.slice(content.document.querySelector('#scaleSelect').querySelectorAll('option'));
              context.completions = [
                [o.value, o.textContent]
                for ([, o] in Iterator(os))
              ];
            }
          }
        )
      ]
    },
    true
  ); // }}}

})();

// vim:sw=2 ts=2 et si fdm=marker:
