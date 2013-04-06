/*
 * ステータスバーにはてブ数を表示
 *
 * Usage:
 *   let g:ego_counter_uri = 'Your site URI'
 *     or
 *   js liberator.globalVariables.ego_counter_hatenaId = 'Your site URI'
 *
 *   ex.
 *   let g:ego_counter_uri = 'http://d.hatena.ne.jp/snaka72'
 *
 */
(function() {

  const MY_SITE = liberator.globalVariables.ego_counter_uri || '';
  let update = function(color) {
    myHatebu.setAttribute(
      'src',
      `http://b.hatena.ne.jp/bc/{color}/{MY_SITE}/`.toSource()
    );
  };

  let rotate = (function() {
    var current;
    var colors = "bl de dg gr pr br rd sp pk te lg lb wh li or".split(" ");

    return function(next) {
      if (!next) return current;

      current = colors.shift();
      colors.push(current);
      return current;
    };
  })();

  let myHatebu = document.getElementById('status-bar').appendChild(
                    document.createElement('statusbarpanel')
                 );
  myHatebu.setAttribute('id', 'my-hatebu-count-icon');
  myHatebu.setAttribute('class', 'statusbarpanel-iconic');
  update(rotate(true));

  setInterval(function() update(rotate(true)), 1000 * 60 * 10);
  myHatebu.addEventListener("click", function(event){
    update(rotate(true));
  }, false);

})()

// vim: sw=2 ts=2 et:
