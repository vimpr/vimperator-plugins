/*
 * ステータスバーにはてブ数を表示
 *
 * Usage:
 *   let g:ego_counter_hatenaId = 'Your hatena ID'
 *     or
 *   js liberator.globalVariables.ego_counter_hatenaId = 'Your hatena ID'
 *
 */
(function() {

  const MY_ID = liberator.globalVariables.ego_counter_hatenaId || '';
  let update = function(color) {
    myHatebu.setAttribute(
      'src',
      <>http://b.hatena.ne.jp/bc/{color}/http://d.hatena.ne.jp/{MY_ID}/</>.toSource()
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

  let myHatebu = document.getElementById('status-bar')
                 .insertBefore(document.createElement('statusbarpanel'),
                               document.getElementById('security-button')
                               .nextSibling);
  myHatebu.setAttribute('id', 'my-hatebu-count-icon');
  myHatebu.setAttribute('class', 'statusbarpanel-iconic');
  update(rotate(true));

  setInterval(function() update(rotate(true)), 1000 * 60 * 10);
  myHatebu.addEventListener("click", function(event){
    update(rotate(true));
  }, false);

})()
