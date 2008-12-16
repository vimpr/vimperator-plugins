// Vimperator plugin: Hatena Bookmark image counter
// Maintainer: mattn <mattn.jp@gmail.com> - http://mattn.kaoriya.net

(function() {
    const ICON = 'data:image/x-icon;base64,'+
        'AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAA'+
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
        'AAAAAAAAAAAAAAAAAAAAAOd5Uv/JXyr/yV8q/8lfKv/JXyr/yV8q/8lfKv/JXyr/yV8q/8lfKv/J'+
        'Xyr/yV8q/8lfKv/JXyr/AAAAAAAAAAD6pYX/53lS/+d5Uv/neVL/53lS/+d5Uv/neVL/53lS/+d5'+
        'Uv/neVL/53lS/+d5Uv/neVL/yV8q/wAAAAAAAAAA+qWF/+d5Uv/neVL/53lS/+d5Uv/neVL/53lS'+
        '/+d5Uv/neVL/53lS/+d5Uv/neVL/53lS/8lfKv8AAAAAAAAAAPqlhf/neVL/53lS/+d5Uv//////'+
        '///////////////////////////neVL/53lS/+d5Uv/JXyr/AAAAAAAAAAD6pYX/53lS/+d5Uv/n'+
        'eVL////////////neVL/53lS/+d5Uv///////////+d5Uv/neVL/yV8q/wAAAAAAAAAA+qWF/+d5'+
        'Uv/neVL/53lS////////////53lS/+d5Uv/neVL////////////neVL/53lS/8lfKv8AAAAAAAAA'+
        'APqlhf/neVL/53lS/+d5Uv///////////+d5Uv/neVL/53lS////////////53lS/+d5Uv/JXyr/'+
        'AAAAAAAAAAD6pYX/53lS/+d5Uv/neVL/////////////////////////////////53lS/+d5Uv/n'+
        'eVL/yV8q/wAAAAAAAAAA+qWF/+d5Uv/neVL/53lS////////////53lS/+d5Uv///////////+d5'+
        'Uv/neVL/53lS/8lfKv8AAAAAAAAAAPqlhf/neVL/53lS/+d5Uv///////////+d5Uv/neVL/////'+
        '///////neVL/53lS/+d5Uv/JXyr/AAAAAAAAAAD6pYX/53lS/+d5Uv/neVL/////////////////'+
        '///////////neVL/53lS/+d5Uv/neVL/yV8q/wAAAAAAAAAA+qWF/+d5Uv/neVL/53lS/+d5Uv/n'+
        'eVL/53lS/+d5Uv/neVL/53lS/+d5Uv/neVL/53lS/8lfKv8AAAAAAAAAAPqlhf/neVL/53lS/+d5'+
        'Uv/neVL/53lS/+d5Uv/neVL/53lS/+d5Uv/neVL/53lS/+d5Uv/JXyr/AAAAAAAAAAD6pYX/+qWF'+
        '//qlhf/6pYX/+qWF//qlhf/6pYX/+qWF//qlhf/6pYX/+qWF//qlhf/6pYX/53lS/wAAAAAAAAAA'+
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
        'AAAA//8AAIABAACAAQAAgAEAAIABAACAAQAAgAEAAIABAACAAQAAgAEAAIABAACAAQAAgAEAAIAB'+
        'AACAAQAA//8AAA==';
    var hbCountIcon = document.getElementById('status-bar')
                              .insertBefore(document.createElement('statusbarpanel'),
                                            document.getElementById('security-button')
                                                    .nextSibling);
    hbCountIcon.setAttribute('id', 'hatena-bookmark-count-icon');
    hbCountIcon.setAttribute('src', ICON);
    hbCountIcon.setAttribute('class', 'statusbarpanel-iconic');
    hbCountIcon.addEventListener('click', function(e) {
        liberator.open('http://b.hatena.ne.jp/entry/' + liberator.modules.buffer.URL
                                                                 .replace(/#/g, '%23'),
                       liberator.NEW_TAB);
    }, false);
    liberator.plugins.hbCountUpdate = function() {
        hbCountIcon.setAttribute('src',
                                 'http://b.hatena.ne.jp/entry/image/' +
                                 liberator.modules.buffer.URL.replace(/#/g, '%23'));
    };
    liberator.modules.autocommands.add('LocationChange', '.*',
                                       'js liberator.plugins.hbCountUpdate()');
})();
// vim:sw=4 ts=4 et:
