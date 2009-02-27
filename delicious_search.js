let PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>search DeliciousBookmark and that completer</description>
<require type="extension" id="{2fa4ed95-0317-4c6a-a74c-5f3e3912c1f9}">Delicious Bookmarks</require>
<author mail="teramako@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/teramako/">teramako</author>
<version>0.1</version>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0</maxVersion>
<detail>
== Command ==
:ds[earch] -tags tag, ...:
:delicious[search] -tags tag, ...:
  search bookmark contains all tags

:ds[earch] -query term: 
:delicious[search] -query term:
  search bookmark contains term in the titile or the URL or the note

== Completion ==
:open or :tabopen command completion

set complete+=D

or write in RC file

autocmd VimperatorEnter . :set complete+=D

</detail>
</VimperatorPlugin>;

liberator.plugins.delicious = (function(){

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
  try {
    if (!tags || tags.length == 0){
      st = statements.simpleQuery;
      st.bindUTF8StringParameter(0, '%' + query + '%');
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
          'GROUP BY b.rowid HAVING COUNT (b.rowid) = ?' + (num+1)
        ].join(" "));
        sql = sqlList.join(" ");
        st = dbc.createStatement(sql);
        st.bindUTF8StringParameter(tags.length, '%'+query+'%');
        st.bindInt32Parameter(tags.length+1, tags.length);
      } else {
        sqlList.push('GROUP BY b.rowid HAVING COUNT (b.rowid) = ?' + (tags.length + 1));
        sql = sqlList.join(" ");
        st = dbc.createStatement(sql);
        st.bindInt32Parameter(tags.length, tags.length);
      }
      for (let i in tags){
        st.bindUTF8StringParameter(i, tags[i]);
      }
    }
    while (st.executeStep()){
      let name = st.getString(0);
      let url = st.getString(1);
      let note = st.getString(2);
      list.push([url, name, note]);
    }
  } finally {
    st.reset();
  }
  return list;
}

commands.addUserCommand(["delicious[search]","ds[earch]"], "Delicious Bookmark Search",
  function(args){
    if (args.length > 0){
      liberator.open(args[0], liberator.CURRENT_TAB);
      return;
    }
    let list = bookmarkSearch(args["-tags"], args["-query"]);
    let xml = template.tabular(["Title","Note"], [], list.map(function($_){
      return [<a highlight="URL" href={$_[0]}>{$_[1]}</a>, $_[2]];
    }));
    liberator.echo(xml, true);
  },{
    options: [
      [["-tags","-t"], commands.OPTION_LIST, null, tagCompletion],
      [["-query","-q"], commands.OPTION_STRING]
    ],
    completer: function(context, args){
      let list = bookmarkSearch(args["-tags"], args["-query"]);
      if (list.length > 0){
        context.title = ["URL","TITLE"];
        context.completions = list.map(function($_) [$_[0], $_[1]]);
      }
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
      'description like ?1'
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
    context.anchored = false;
    context.title = ["Delicous Bookmarks"];
    let list = bookmarkSearch([], context.filter);
    context.filterFunc = null;
    context.completions = list.map(function($_) [$_[0], $_[1]]);
  },
  close: function(){
    dbc.close();
  }
};
self.init();
liberator.registerObserver("shutdown", self.close);
completion.addUrlCompleter("D", "Delicious Bookmarks", self.urlCompleter);
return self;
})();
function onUnload(){
  liberator.plugins.delicious.close();
}
// vim: sw=2 ts=2 et:
