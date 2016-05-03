var INFO = xml`
<plugin name="google-tasks.js"
        version="0.1"
        summary="For Google Tasks"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="ebith.h@gmail.com">ebith</author>
  <license href="http://www.opensource.org/licenses/bsd-license.php">New BSD License</license>
  <project name="Vimperator" minVersion="3.3"/>
</plugin>`;


let httpGet = util.httpGet;

let client_id = liberator.globalVariables.google_tasks_client_id || '325101095880-m0je2n37i1b6dch0apoc59u7h81l0a9l.apps.googleusercontent.com';
let client_secret = liberator.globalVariables.google_tasks_client_secret || 'eVOLvAwsyDar0OiCVEqTUJvG';
let debug = liberator.globalVariables.google_tasks_debug || 0;
let oauth2_url = 'https://accounts.google.com/o/oauth2/';
let redirect_uri = 'urn:ietf:wg:oauth:2.0:oob';
let scope = 'https://www.googleapis.com/auth/tasks';
let rest_uri = 'https://www.googleapis.com/tasks/v1';

if (debug) {
  var log = liberator.log;
  var logFile = io.File("~/google-tasks.log");
  logFile.write(Date() + ' : source\n', '>>');
}

let store = storage.newMap('google-tasks', {store: true});

let access_token,timer;

if (!store.get('access_token') && !store.get('refresh_token')) {
  preSetup();
} else {
  setup();
}

function setup() {
  commands.addUserCommand(
    ['gtas[ks]'],
    'Google Tasks',
    function (args) {
      access_token = getAccessToken();
      let url = rest_uri + '/users/@me/lists?oauth_token=' + access_token;
      let lists = JSON.parse(httpGet(url).responseText).items;
      let tbody = xml``;
      for (let i=0; i<lists.length; i++) {
        let url = rest_uri + '/lists/' + lists[i].id + '/tasks?oauth_token=' + access_token;
        let tasks = JSON.parse(httpGet(url).responseText).items;
        if (!tasks) { continue; } //空っぽのリストは飛ばす
        for (let i2=0; i2<tasks.length; i2++) {
          let taskTitle = (tasks[i2].status == 'completed') ? xml`&#x2611;<del>${tasks[i2].title}</del>`  : `&#x2610;${tasks[i2].title}`;
          tbody += xml`<tr style="border-bottom: 1px dotted;"><td style="width: 20%">${lists[i].title}</td><td>${taskTitle}</td></tr>`;
        }
      }
      liberator.echo(xml`<table style="width: 100%; line-height: 1.6; border-collapse: collapse; border-top: 1px solid;">{tbody}</table>`);
    },
    {
      subCommands: [
        new Command(
          ['a[dd]'],
          'Add a task',
          function (args) {
            let [list_id, title] = args;
            access_token = getAccessToken();
            let url = rest_uri + '/lists/' + list_id + '/tasks?oauth_token=' + access_token;
            let param = JSON.stringify({ title: title });
            let res = httpPot(url, param, 'POST', 'application/json');
            if (res.status == 200){
              liberator.echo('google-tasks : added "' + JSON.parse(res.responseText).title + '"');
            } else {
              liberator.log(res.responseText);
            }
          },
          {
            literal: 1,
            completer: gtasCompleter,
          }
        ),
        new Command(
          ['cl[ear]'],
          'Clear completed tasks',
          function (args) {
            access_token = getAccessToken();
            let url = rest_uri + '/lists/' + args.literalArg + '/clear?oauth_token=' + access_token;
            let res = httpPot(url, null, 'POST', 'application/json');
            if (res.status == 204) {
              liberator.echo('googole-tasks : cleared "' + args.literalArg + '"');  //リスト名表示したい
            } else {
              liberator.log(res);
            }
          },
          {
            literal: 0,
            completer: gtasCompleter,
          }
        ),
        new Command(
          ['co[mplete]'],
          'Complete a task',
          function (args) {
            let [list_id, task_id] = args;
            access_token = getAccessToken();
            let url = rest_uri + '/lists/' + list_id + '/tasks/' + task_id + '?oauth_token=' + access_token;
            let task = JSON.parse(httpGet(url).responseText);
            task.status = 'completed';
            let param = JSON.stringify(task);
            let res = httpPot(url, param, 'PUT', 'application/json');
            if (res.status == 200){
              liberator.echo('google-tasks : completed "' + JSON.parse(res.responseText).title + '"');
            } else {
              liberator.log(res.responseText);
            }
          },
          {
            literal: 1,
            completer: gtasCompleter,
          }
        ),
        new Command(
          ['d[elete]'],
          'Delete a task or list',
          function (args) {
            let [list_id, task_id] = args;
            access_token = getAccessToken();
            if (task_id) {
              let url = rest_uri + '/lists/' + list_id + '/tasks/' + task_id + '?oauth_token=' + access_token;
              let res = httpPot(url, null, 'DELETE', 'application/json');
              if (res.status == 204){
                liberator.echo('google-tasks : deleted "' + task_id + '"');  //title持ってきたい
              } else {
                liberator.log(res.responseText);
              }
            } else if (list_id) {
              let url = rest_uri + '/users/@me/lists/' + list_id + '?oauth_token=' + access_token;
              let res = httpPot(url, null, 'DELETE', 'application/json');
              if (res.status == 204){
                liberator.echo('google-tasks : deleted "' + list_id + '"');  //title持ってきたい
              } else {
                liberator.log(res.responseText);
              }
            }
          },
          {
            literal: 1,
            completer: gtasCompleter,
          }
        ),
        new Command(
          ['n[ew]'],
          'Create a list',
          function (args) {
            access_token = getAccessToken();
            let url = rest_uri + '/users/@me/lists?oauth_token=' + access_token;
            let param = JSON.stringify({ title: args.literalArg });
            let res = httpPot(url, param, 'POST', 'application/json');
            log(res.responseText);
            if (res.status == 200) {
              liberator.echo('google-tasks : created "' + JSON.parse(res.responseText).title + '"');
            } else {
              liberator.log(res.responseText);
            }
          },
          {
            literal: 0,
          }
        ),
        new Command(
          ['u[ncomplete]'],
          'Uncomplete a task',
          function (args) {
            let [list_id, task_id] = args;
            access_token = getAccessToken();
            let url = rest_uri + '/lists/' + list_id + '/tasks/' + task_id + '?oauth_token=' + access_token;
            let task = JSON.parse(httpGet(url).responseText);
            task.status = 'needsAction';
            delete task.completed;
            let param = JSON.stringify(task);
            let res = httpPot(url, param, 'PUT', 'application/json');
            if (res.status == 200){
              liberator.echo('google-tasks : uncompleted "' + JSON.parse(res.responseText).title + '"');
            } else {
              liberator.log(res.responseText);
            }
          },
          {
            literal: 1,
            completer: gtasCompleter,
          }
        ),
      ]
    },
    true
  );
}

function gtasCompleter(context, args) {
  if (args.completeArg == 0){
    context.incomplete = true;
    context.title = ['id', 'title'];
    context.filters = [CompletionContext.Filter.textDescription];
    context.compare = void 0;

    access_token = getAccessToken();
    let url = rest_uri + '/users/@me/lists?oauth_token=' + access_token;
    httpGet(url, function (xhr) {
      context.incomplete = false;
      context.completions = JSON.parse(xhr.responseText).items.map(function (v) {
        return [v.id, v.title];
      });
    });
  } else if (args.completeArg == 1 && !/add/.test(context.name) && !/clear/.test(context.name)){
    context.incomplete = true;
    context.title = ['id', 'title'];
    context.filters = [CompletionContext.Filter.textDescription];
    context.compare = void 0;

    access_token = getAccessToken();
    if (/delete/.test(context.name)) {
      let url = rest_uri + '/lists/' + args[0] + '/tasks?oauth_token=' + access_token + '&showHidden=true';
      httpGet(url, function (xhr) {
        context.incomplete = false;
        context.completions = JSON.parse(xhr.responseText).items.map(function (v) {
          return [v.id, v.title];
        });
      });
    } else if (/uncomplete/.test(context.name)) {
      let url = rest_uri + '/lists/' + args[0] + '/tasks?oauth_token=' + access_token + '&showHidden=true';
      httpGet(url, function (xhr) {
        context.incomplete = false;
        context.completions = JSON.parse(xhr.responseText).items.filter(function (v) {
          return v.status == 'completed';
        }).map(function (v) {
          return [v.id, v.title];
        });
      });
    } else {
      let url = rest_uri + '/lists/' + args[0] + '/tasks?oauth_token=' + access_token;
      httpGet(url, function (xhr) {
        context.incomplete = false;
        context.completions = JSON.parse(xhr.responseText).items.filter(function (v) {
          return v.status == 'needsAction';
        }).map(function (v) {
          return [v.id, v.title];
        });
      });
    }
  }
}

function preSetup() {
  commands.addUserCommand(
    ['gtas[ks]'],
    'Google Tasks',
    function (args) {
      if (args['-getCODE']) {
        let url = oauth2_url + 'auth?response_type=code&client_id='+ client_id + '&redirect_uri=' + redirect_uri + '&scope=' + scope;
        liberator.open(url, liberator.NEW_TAB);
      } else if (args['-setCODE']) {
        let url = oauth2_url + 'token';
        let param = 'code=' + args['-setCODE'] + '&client_id=' + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirect_uri + '&grant_type=authorization_code';
        let res = JSON.parse(httpPot(url, param, 'POST', 'application/x-www-form-urlencoded').responseText);
        store.set('refresh_token', res.refresh_token);
        liberator.echo('google-tasks : token saved!')
        setup(); //中身のチェックが必要？
      }
    },
    {
      options: [
        [['-getCODE'], commands.OPTION_NOARG],
        [['-setCODE'], commands.OPTION_STRING]
      ],
    },
    true
  );
}

function getAccessToken() {
  if(!access_token || !timer){
    let refresh_token = store.get('refresh_token');
    let url = oauth2_url + 'token';
    let param = 'client_id=' + client_id + '&client_secret=' + client_secret +'&refresh_token=' + refresh_token + '&grant_type=refresh_token';
    let res = JSON.parse(httpPot(url, param, 'POST', 'application/x-www-form-urlencoded').responseText);
    timer = setTimeout(function() { timer = false }, (res.expires_in - 5) * 1000);
    return res.access_token;
  }
  return access_token;
}

//util.httpGetを書き換えた
function httpPot(url, param, method, contentType, callback) {
    try {
        let xmlhttp = new XMLHttpRequest;
        xmlhttp.mozBackgroundRequest = true;
        if (callback) {
            xmlhttp.onreadystatechange = function () {if (xmlhttp.readyState == 4) {callback(xmlhttp);}};
        }
        xmlhttp.open(method, url, !!callback);
        xmlhttp.setRequestHeader('Content-Type', contentType);
        xmlhttp.send(param);
        return xmlhttp;
    } catch (e) {
        return null;
    }
}
