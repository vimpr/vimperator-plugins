# Vimperator Plugins

This is a set of plugins that will work with Vimperator

While Vimperator offers already lots of cool features, we cannot and don't want to include every feature directly in the core. Therefore you can enhance the Vimperator experience by adding plugins which add new commands or mappings. Install these plugins by copying them to the ~/.vimperator/plugin/ directory (or %HOME%\vimperator\plugin on Windows) unless noted differently.

> ###### Note: Master is valid only for versions Firefox 19.* and lower. 
> ##### For versions Firefox 20.* and higher, please check the branch 3.6 [here](https://github.com/vimpr/vimperator-plugins/tree/3.6)

## Plugins
### feedSomeKeys_3.js

You can add the following commands to your .vimperatorrc file


```
:command! -nargs=+ lazy autocmd VimperatorEnter .* &lt;args>
:lazy fmaps -u='mail\.google\.com/mail' c / j k n p o u e x s r a # [ ] ? gi gs gt gd ga gc
:lazy fmaps -u='mail\.google\.com/mail/.*/[0-9a-f]+$' c / j,n k,p n,j p,k o u e x s r a # [ ] ? gi gs gt gd ga gc
:lazy fmaps -u='www\.google\.co\.jp/reader' -events=vkeypress j k n p m s v A r S N P X O gh ga gs gt gu u / ? J K
:lazy fmaps -u='(fastladder|livedoor)\.com/reader' j k s a p o v c i,p &lt;Space> &lt;S-Space> z b &lt; > q w e,g
:lazy fmaps -u='https?://www\.rememberthemilk\.com/home/' j k m i c t ? d F,f G,g S,s L,l Y,y H,h M,m &lt;Del> &lt;C-S-Left> &lt;C-S-Right>
:lazy fmaps -u='http://code.google.com/p/vimperator-labs/issues/list' o j k
:lazy fmaps -u='http://code.google.com/p/vimperator-labs/issues/detail' u
```

> Note: If you are planning to add them via command line, then remove the "lazy"


