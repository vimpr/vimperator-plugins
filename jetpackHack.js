let INFO =
<plugin name="jetpackHack" version="1.0"
        href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/jetpackHack.js"
        summary="enable to access to Jetpack inner context"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="teramako@gmail.com">teramako</author>
  <license>BSD</license>
  <project name="Vimperator" minVersion="2.2"/>
  <p>Example: list executing Jetpack feature</p>
  <code>
:echo jetpack.contexts.map(function(ctx) ctx.feed.title);
  </code>
  <p>Example: access to the sandbox of the feature</p>
  <code>
:echo jetpack.contexts[0].unsafeSandbox
  </code>
  <p>Example: select and open slidebar</p>
  <code>
:js jetpack.slideBar.select("featureTitle")
  </code>
  <p>Example: toggle slidebar</p>
  <code>
:js jetpack.slideBar.toggle()
  </code>
  <p>Example: install a feature form local file</p>
  <code>
:js jetpack.install("~/var/jetpackScripts/test.js")
  </code>
  <p>Example: refresh the feature</p>
  <code>
:js jetpack.refresh("test")
  </code>
  <p>Example: uninstall the feature</p>
  <code>
:js jetpack.uninstall("test")
  </code>
  <p>Example: reinstall the feature</p>
  <code>
:js jetpack.reinstall("test")
  </code>
  <p>Example: purge the feature</p>
  <code>
:js jetpack.purge("test")
  </code>
</plugin>;

let EXT = {};
liberator.modules.jetpack = (function(){
  let id = "jetpack@labs.mozilla.com";
  if (!Application.extensions.has(id) || !Application.extensions.get(id).enabled){
    liberator.echoerr("Jetpack is not enable or installed");
    return {};
  }
  Cu.import("resource://jetpack/modules/init.js", EXT);
  let self = {
    get jWin()  EXT.get("chrome://jetpack/content/index.html"),
    get JetpackRuntime() this.jWin.JetpackRuntime,
    get contexts() this.jWin.JetpackRuntime.contexts,
    get feedManager() this.jWin.JetpackRuntime.FeedPlugin.FeedManager,
    get slideBar(){
      let slideBar = window.slideBar;
      slideBar.__proto__ = slideBarProto;
      return slideBar;
    },
    getContextByTitle: function jetpack_getContextByTitle(title){
      let contexts = this.contexts.filter(function(ctx){
        return ctx.feed.title == title;
      });
      liberator.assert(contexts.length > 0, "no jetpack features");
      return contexts[0];
    },
    getFeedByTitle: function jetpack_getFeedByTitle(title){
      return getFeedByTitle(title, FEED_FLAG.ALL);
    },
    install: function jetpack_install(path){
      let file = io.File(path);
      let uri = util.createURI(file.path);
      let name = file.leafName.replace(/\..*/, "").replace(/-([a-z])/g, function (m, n1) n1.toUpperCase());
      this.feedManager.addSubscribedFeed({
        canAutoUpdate: false,
        sourceCode: file.read("UTF-8"),
        sourceUrl: uri.spec,
        title: name,
        type: "jetpack",
        url: uri.spec
      });
    },
    refresh: function jetpack_refresh(title){
      let feed = getFeedByTitle(title, FEED_FLAG.SUBSCRIBED | FEED_FLAG.NOT_BUILTIN);
      this.JetpackRuntime.forceFeedUpdate(feed);
    },
    uninstall: function jetpack_uninstall(title){
      let feed = getFeedByTitle(title, FEED_FLAG.SUBSCRIBED | FEED_FLAG.NOT_BUILTIN);
      feed.remove();
    },
    reinstall: function jetpack_reinstall(title){
      let feed = getFeedByTitle(title, FEED_FLAG.UNSUBSCRIBED);
      feed.unremove();
    },
    purge: function jetpack_purge(title){
      let feed = getFeedByTitle(title, FEED_FLAG.ALL | FEED_FLAG.NOT_BUILTIN);
      if (feed.isSubscribed)
        feed.remove();

      feed.purge();
    },
  };
  let slideBarProto = {
    select: function jetpack_slideBar_select(title){
      let features = this.features.filter(function(f){
        return f.context.feed.title == title;
      });
      liberator.assert(features.length > 0, "no such jetpack feature");
      this.selectFeature(features[0]);
    }
  };
  const FEED_FLAG= {
    NOT_BUILTIN:  1 << 0,
    SUBSCRIBED:   1 << 1,
    UNSUBSCRIBED: 1 << 2,
    ALL:          6
  };
  function getFeedByTitle(title, flag){
    let feeds = [];
    if (flag >= FEED_FLAG.ALL)
      feeds = getAllFeeds();
    else if (flag & FEED_FLAG.UNSUBSCRIBED)
      feeds = getUnsubscribedFeeds();
    else if (flag & FEED_FLAG.SUBSCRIBED)
      feeds = getSubscribedFeeds(true);

    if (flag & FEED_FLAG.NOT_BUILTIN)
      feeds = feeds.filter(function(f) !f.isBuiltIn);

    feeds = feeds.filter(function(f) f.title == title);
    liberator.assert(feeds.length > 0, "not such jetpack feature");
    return feeds[0];
  }
  function getAllFeeds(includeBuiltin){
    return [].concat(getSubscribedFeeds(includeBuiltin), getUnsubscribedFeeds());
  }
  function getSubscribedFeeds(includeBuiltin){
    let feeds = self.feedManager.getSubscribedFeeds();
    if (includeBuiltin)
      return feeds;
    else
      return feeds.filter(function(f) !f.isBuiltIn);
  }
  function getUnsubscribedFeeds(){
    return self.feedManager.getUnsubscribedFeeds();
  }
  JavaScript.setCompleter([self.getContextByTitle],
    [function(){ return getSubscribedFeeds(true).map(function(f)  [f.title, f.uri.spec]); }]);

  JavaScript.setCompleter([self.refresh, self.uninstall],
    [function(){ return getSubscribedFeeds(false).map(function(f)  [f.title, f.uri.spec]); }]);

  JavaScript.setCompleter([self.purge],
    [function(){ return getAllFeeds(false).map(function(f)  [f.title, f.uri.spec]); }]);

  JavaScript.setCompleter([self.getFeedByTitle],
    [function(){ return getAllFeeds(true).map(function(f)  [f.title, f.uri.spec]); }]);

  JavaScript.setCompleter([self.reinstall],
    [function(){ return getUnsubscribedFeeds().map(function(f)  [f.title, f.uri.spec]); }]);

  JavaScript.setCompleter([self.install],
    [function (context, obj, args) {
      context.quote[2] = "";
      completion.file(context, true);
    }]);
  JavaScript.setCompleter([slideBarProto.select],
    [function(){ return self.slideBar.features.map(function(f) [f.context.feed.title, f.context.feed.uri.spec]); }]);
  return self;
})();

// vim: sw=2 ts=2 et:
