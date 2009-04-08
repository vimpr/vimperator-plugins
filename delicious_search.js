let PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>search DeliciousBookmark and that completer</description>
<require type="extension" id="{2fa4ed95-0317-4c6a-a74c-5f3e3912c1f9}">Delicious Bookmarks</require>
<author mail="teramako@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/teramako/">teramako</author>
<version>0.3</version>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0</maxVersion>
<detail><![CDATA[
== Command ==
:ds[earch] -tags tag, ...:
:delicious[search] -tags tag, ...:
  search bookmark contains all tags

:ds[earch] -query term:
:delicious[search] -query term:
  search bookmark contains term in the titile or the URL or the note

== Completion ==
:open or :tabopen command completion

>||
set complete+=D
||<

or write in RC file

>||
autocmd VimperatorEnter ".*" :set complete+=D
||<

== guioptions ==
show Delicious Toolbar or not
>||
set go+=D
or
set go-=D
||<

]]></detail>
</VimperatorPlugin>;

liberator.plugins.delicious = (function(){

let uuid = PLUGIN_INFO.require[0].@id.toString();
if (Application.extensions.has(uuid) && Application.extensions.get(uuid).enabled){
  const ydls = Cc["@yahoo.com/nsYDelLocalStore;1"].getService(Ci.nsIYDelLocalStore);
} else {
  return null;
}
const ss = Cc["@mozilla.org/storage/service;1"].getService(Ci.mozIStorageService);

// dabase connection object
let dbc = null;

// sql statements
let statements = {
  allTags: null,
  simpleQuery: null,
};

/**
 * return Delicious bookmark batabase file
 * @return {nsIFile}
 */
function getBookmarkFile(){
  let file = services.get("directory").get("ProfD",Ci.nsIFile)
  file.append("ybookmarks.sqlite");
  if (!file.exists() || !file.isReadable()){
    return null;
  }
  return file;
}

/**
 * get all tag names from Delicious Bookmark
 * @return {String[]}
 */
function getAllTags(){
  let list = [];
  let st = statements.allTags;
  try {
    while (st.executeStep()){
      list.push(st.getString(0));
    }
  } finally {
    st.reset();
  }
  return list;
}
/**
 * @param {CompetionContext} context
 * @param {Array} args
 * @return {Array}
 */
function tagCompletion(context, args){
  let filter = context.filter;
  let have = filter.split(",");
  args.completeFilter = have.pop();
  let prefix = filter.substr(0, filter.length - args.completeFilter.length);
  let tags = getAllTags();
  return [[prefix + tag, tag] for ([i, tag] in Iterator(tags)) if (have.indexOf(tag)<0)];
}
/**
 * search Delicious Bookmarks
 * contains all tags and query in title or URL or Note
 * @param {String[]} tags
 * @param {String} query
 * @return {Array[]} [[url, title, note], ...]
 *         if both tags and query is none, returns []
 */
function bookmarkSearch(tags, query){
  if (!query && (!tags || tags.length == 0))
    return [];

  let sql;
  let list = [];
  let st;
  let finalize = true;
  try {
    if (!tags || tags.length == 0){
      st = statements.simpleQuery;
      st.bindUTF8StringParameter(0, '%' + query + '%');
      finalize = false;
    }  else {
      let sqlList = [
        'SELECT b.name,b.url,b.description',
        'FROM bookmarks b, bookmarks_tags bt, tags t',
        'WHERE bt.tag_id = t.rowid',
        'AND b.rowid = bt.bookmark_id',
        'AND t.name in (',
        ['?' + (parseInt(i)+1) for (i in tags)].join(","),
        ')'];
      if (query){
        let num = tags.length + 1;
        sqlList.push([
          'AND (',
          'b.name like', '?' + num,
          'OR b.url like', '?' + num,
          'OR b.description like', '?' + num,
          ')',
          'GROUP BY b.rowid HAVING COUNT (b.rowid) = ?' + (num + 1),
          'ORDER BY b.added_date DESC'
        ].join(" "));
        sql = sqlList.join(" ");
        st = dbc.createStatement(sql);
        st.bindUTF8StringParameter(tags.length, '%'+query+'%');
        st.bindInt32Parameter(tags.length+1, tags.length);
      } else {
        sqlList.push([
          'GROUP BY b.rowid HAVING COUNT (b.rowid) = ?' + (tags.length + 1),
          'ORDER BY b.added_date DESC'
        ].join(" "));
        sql = sqlList.join(" ");
        st = dbc.createStatement(sql);
        st.bindInt32Parameter(tags.length, tags.length);
      }
      for (let i in tags){
        st.bindUTF8StringParameter(i, tags[i]);
      }
    }
    while (st.executeStep()){
      let url = st.getString(1);
      list.push({
        url: url,
        name: st.getString(0),
        note: st.getString(2),
        icon: bookmarks.getFavicon(url),
        tags: ydls.getTags(url, {})
      });
    }
  } finally {
    st.reset();
    if (finalize) st.finalize();
  }
  return list;
}
function templateDescription(item){
  return (item.tags && item.tags.length > 0 ? "[" + item.tags.join(",") + "]" : "") + item.note;
}
function templateTitleAndIcon(item){
  let simpleURL = item.text.replace(/^https?:\/\//, '');
  return <>
    <span highlight="CompIcon">{item.icon ? <img src={item.icon}/> : <></>}</span><span class="td-strut"/>{item.name}<a href={item.text} highlight="simpleURL">
      <span class="extra-info">{simpleURL}</span>
    </a>
  </>;
}

commands.addUserCommand(["delicious[search]","ds[earch]"], "Delicious Bookmark Search",
  function(args){
    if (args.length > 0){
      liberator.open(args[0], liberator.CURRENT_TAB);
      return;
    }
    let list = bookmarkSearch(args["-tags"], args["-query"]);
    let xml = template.tabular(["Title","Tags and Note"], [], list.map(function(item){
      return [
        <><img src={item.icon}/><a highlight="URL" href={item.url}>{item.name}</a></>,
        "[" + item.tags.join(",") + "] " + item.note
      ];
    }));
    liberator.echo(xml, true);
  },{
    options: [
      [["-tags","-t"], commands.OPTION_LIST, null, tagCompletion],
      [["-query","-q"], commands.OPTION_STRING]
    ],
    completer: function(context, args){
      context.format = {
        anchored: true,
        title: ["Title and URL", "Tags and Note"],
        keys: { text: "url", name: "name", icon: "icon", tags: "tags", note: "note"},
        process: [templateTitleAndIcon, templateDescription],
      };
      context.filterFunc = null;
      context.regenerate = true;
      context.generate = function() bookmarkSearch(args["-tags"], args["-query"]);
    },
  },true);

let self = {
  init: function(){
    if (dbc){
      try {
        this.close();
      } catch(e) {}
    }
    let file = getBookmarkFile();
    if (!file) return;
    dbc = ss.openDatabase(file);

    statements.allTags = dbc.createStatement("SELECT name FROM tags");
    statements.simpleQuery = dbc.createStatement([
      'SELECT name,url,description FROM bookmarks',
      'WHERE name like ?1 OR',
      'url like ?1 OR',
      'description like ?1',
      'ORDER BY added_date DESC'
    ].join(" "));
  },
  get tags(){
    return getAllTags();
  },
  /**
   * @see bookmarkSearch
   */
  search: function(tags, query){
    return bookmarkSearch(tags, query);
  },
  /**
   * used by completion
   * :set complete+=D
   * @param {CompletionContext} context
   */
  urlCompleter: function(context){
    context.format = {
      anchored: true,
      title: ["Delicious Bookmarks"],
      keys: { text: "url", name: "name", icon: "icon", tags: "tags", note: "note"},
      process: [templateTitleAndIcon, templateDescription],
    };
    context.filterFunc = null;
    context.regenerate = true;
    context.generate = function() bookmarkSearch([], context.filter);
  },
  close: function(){
    for each(let st in statements){
      if (st.state > 0)
        st.finalize();
    }
    if (dbc.connectionReady)
      dbc.close();
  },
};
self.init();
liberator.registerObserver("shutdown", self.close);
config.guioptions['D'] = ['Delicious Toolbar',['ybToolbar']];
completion.addUrlCompleter("D", "Delicious Bookmarks", self.urlCompleter);
return self;
})();
function onUnload(){
  liberator.plugins.delicious.close();
}
// vim: sw=2 ts=2 et:
