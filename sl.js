/**
 * SL
 */


liberator.plugins.SL = (function(){

function xmlToDom(xml, xmlns){
  if (!xmlns) xmlns = xulNS;
  XML.ignoreWhitespace = true;
  XML.prettyPrinting = false;
  var doc = (new DOMParser).parseFromString('<box xmlns="' + xmlns + '">' + xml.toXMLString() + "</box>", "application/xml")
  var imported = document.importNode(doc.documentElement, true);
  var range = document.createRange();
  range.selectNodeContents(imported);
  var fragment = range.extractContents();
  range.detach();
  return fragment.childNodes.length > 1 ? fragment : fragment.firstChild;
}

function getFullScreenAttr(){
  let s = window.screen;
  return {
    top:    s.top,
    left:   s.left,
    width:  s.availWidth,
    height: s.availHeight
  };
}

function SL(){ this.init.apply(this, arguments); }
SL.prototype = { // {{{
  init: function(elm, width, height, fontSize, frameRate, speed){
    this.canvas = elm;
    this.width = width + 10;
    this.height = height;
    this.fontSize = fontSize || 20;
    this.frameRate = frameRate || 60;
    this.speed = speed || 20;
    this.interval = null;
    this.slWidth = null;
    this.slPositionY = 0;
    this.count = 0;
    this.rotateRadian = 0;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.clearRect(0,0, this.width, this.height);
    elm.setAttribute("width", this.width);
    elm.setAttribute("height", this.height);
  },
  start: function(isLogo, isAccident, isFly, isLuckyStar){
    this.isFly = isFly || false;
    this.ctx.clearRect(0,0, this.width, this.height);
    this.ctx.font = this.fontSize + 'px monospace';
    if (isFly){
      let len = Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2));
      this.rotateRadian = Math.acos(this.width / len);
      this.width = len;
    }
    if (isLuckyStar){
      luckyStar.init(this.ctx, this.width, this.height);
    }
    //this.slWidth = isLogo ? this.ctx.mozMeasureText(this.slData.logo[0] + this.slData.lcoal[0] + this.slData.lcar[0]) :
    //                        this.ctx.mozMeasureText(this.slData.body[0] + this.slData.coal[0]);
    this.slWidth = isLogo ? this.ctx.measureText(this.slData.logo[0] + this.slData.lcoal[0] + this.slData.lcar[0]).width :
                            this.ctx.measureText(this.slData.body[0] + this.slData.coal[0]).width;
    this.slPositionY = this.getSLPositionY();
    let sl = this.slGenerator(isLogo);
    let self = this;
    this.interval = window.setInterval(function(){
      self.draw(sl, isLuckyStar);
    }, this.frameRate);
  },
  getSLPositionY: function(){
    return (this.height - (this.slData.steam[0].length + this.slData.body.length + this.slData.wheel[0].length) * this.fontSize) / 2;
  },
  draw: function(gene, isLuckyStar){
    this.count++;
    this.ctx.clearRect(0,0, this.width, this.height);
    this.ctx.save();
    this.ctx.fillStyle = "rgba(0,0,0,0.8)";
    this.ctx.fillRect(0, 0, this.width, this.height);
    if (this.isFly){
      this.ctx.rotate(this.rotateRadian);
      this.ctx.translate(0, - this.height/2);
    }
    this.ctx.fillStyle = "rgb(255,255,255)";
    let data = gene.next();
    let x = this.width - this.count * this.speed,
        fontSize = this.fontSize,
        baseHeight = this.slPositionY;
    data.forEach(function(str, i){
      this.ctx.fillText(str, x, baseHeight + (i+1)*fontSize);
    }, this);
    this.ctx.restore();
    if (isLuckyStar){
      luckyStar.draw();
    }
    if (this.count * this.speed > this.width + this.slWidth){
      window.clearInterval(this.interval);
      liberator.plugins.SL.close();
    }
  },
  merge: function(){
    let data = [];
    Array.slice(arguments).forEach(function($_){
      $_.forEach(function(str, i){
        if (!data[i]) data[i] = [];
        data[i].push(str);
      });
    });
    return data.map(function($_) $_.join(""));
  },
  slGenerator: function(isLogo){
    let steam = this.createGenerator(this.slData.steam);
    if (isLogo){
      let sl = this.slData.logo;
      let wheel = this.createGenerator(this.slData.logoWheel);
      let coal = this.slData.lcoal;
      let car = this.slData.lcar;
      while(true){
        yield [].concat(steam.next(), this.merge(sl.concat(wheel.next()), coal, car, car));
      }
    } else {
      let sl = this.slData.body;
      let wheel = this.createGenerator(this.slData.wheel);
      let coal = this.slData.coal;
      while(true){
        yield [].concat(steam.next(), this.merge(sl.concat(wheel.next()), coal));
      }
    }
  },
  createGenerator: function(array){
    var i = 0, len = array.length;
    while(true){
      yield array[i];
      yield array[i];
      i++;
      if (i == len){
        i = 0;
      }
    }
  },
  slData: { /// {{{
    steam: [
      [
        "                      (@@) (  ) (@)  ( )  @@    ()    @     O     @     O      @",
        "                 (   )",
        "             (@@@@)",
        "          (    )",
        "",
        "        (@@@)",
      ],[
        "                      (  ) (@@) ( )  (@)  ()    @@    O     @     O     @      O",
        "                 (@@@)",
        "             (    )",
        "          (@@@@)",
        "",
        "        (   )"
      ]
    ],
    body: [
      "      ====        ________                ___________ ",
      "  _D _|  |_______/        \\__I_I_____===__|_________| ",
      "   |(_)---  |   H\\________/ |   |        =|___ ___|   ",
      "   /     |  |   H  |  |     |   |         ||_| |_||   ",
      "  |      |  |   H  |__--------------------| [___] |   ",
      "  | ________|___H__/__|_____/[][]~\\_______|       |   ",
      "  |/ |   |-----------I_____I [][] []  D   |=======|__ "
    ],
    wheel: [
      [
        "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
        " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
        "  \\_/      \\O=====O=====O=====O_/      \\_/            "
      ],[
        "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
        " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
        "  \\_/      \\_O=====O=====O=====O/      \\_/            "
      ],[
        "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
        " |/-=|___|=   O=====O=====O=====O|_____/~\\___/        ",
        "  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            "
      ],[
        "__/ =| o |=-~O=====O=====O=====O\\ ____Y___________|__ ",
        " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
        "  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            "
      ],[
        "__/ =| o |=-O=====O=====O=====O \\ ____Y___________|__ ",
        " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
        "  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            "
      ],[
        "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
        " |/-=|___|=O=====O=====O=====O   |_____/~\\___/        ",
        "  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            "
      ]
    ],
    coal: [
      "                              ",
      "                              ",
      "    _________________         ",
      "   _|                \\_____A  ",
      " =|                        |  ",
      " -|                        |  ",
      "__|________________________|_ ",
      "|__________________________|_ ",
      "   |_D__D__D_|  |_D__D__D_|   ",
      "    \\_/   \\_/    \\_/   \\_/    "
    ],
    logo: [
      "     ++      +------ ",
      "     ||      |+-+ |  ",
      "   /---------|| | |  ",
      "  + ========  +-+ |  "
    ],
    logoWheel: [
      [
        " _|--/~O========O-+  ",
        "//// \\_/      \\_/    "
      ],[
        " _|--/O========O\\-+  ",
        "//// \\_/      \\_/   "
      ],[
        " _|--O========O~\\-+  ",
        "//// \\_/      \\_/    "
      ],[
        " _|--/~\\------/~\\-+  ",
        "//// O========O_/    "
      ],[
        " _|--/~\\------/~\\-+  ",
        "//// \\O========O/    "
      ],[
        " _|--/~\\------/~\\-+  ",
        "//// \\_O========O    "
      ]
    ],
    lcoal: [
      "____                 ",
      "|   \\@@@@@@@@@@@     ",
      "|    \\@@@@@@@@@@@@@_ ",
      "|                  | ",
      "|__________________| ",
      "   (O)       (O)     "
    ],
    lcar: [
      "____________________",
      "|  ___ ___ ___ ___ | ",
      "|  |_| |_| |_| |_| | ",
      "|__________________| ",
      "|__________________| ",
      "   (O)        (O)    "
    ]
  }, /// }}}
};
// }}}

let luckyStar = (function(){

let colors = [
  ["rgba(255,215,0,alpha)", "rgba(255,255,0,alpha)"], //gold, yellow
  ["rgba(255,20,147,alpha)","rgba(255,0,255, alpha)"], // deeppink, magenta
  ["rgba(34,139,34,alpha)", "rgba(0,128,0,alpha)"], // forestgreen,green
  ["rgba(0,255,255,alpha)", "rgba(0,191,255,alpha)"] // cyan, deepskyblue
];
function getColor(){
  let i = Math.round(Math.random()*10) % colors.length;
  return colors[i];
}

function Star(){ this.init.apply(this, arguments); }
Star.prototype = { // {{{
  init: function(x, y, size, ctx, color){
    this.x = x;
    this.y = y;
    this.r = size * 10;
    this.ctx = ctx;

    this.points = [];
    for (var i=0; i < 5; i++){
      var rad = 2 * i * Math.PI / 5 - Math.PI / 2;
      this.points.push([
        this.r * Math.cos(rad),
        this.r * Math.sin(rad)
      ]);
      this.points.push([
        this.r / 2 * Math.cos(rad + Math.PI / 5),
        this.r / 2 * Math.sin(rad + Math.PI / 5)
      ]);
    }
    if (!color) color = getColor();
    this.styles = {
      fillStyle: color[0],
      strokeStyle: color[1],
    };
    this.rotateSpeed = 2 * Math.PI / 10 * Math.random();
  },
  draw: function(x, y, alpha, doRotate){
    if (typeof alpha == "undefined") alpha = 1;
    if (alpha < 0.1) alpha = 0;
    if (this.x > width + this.r) this.x = -Math.random() * width;
    if (this.y + this.r < 0) this.y = height + Math.random() * height;
    this.x += x;
    this.y += y;
    ctx.save();
    ctx.fillStyle = this.styles.fillStyle.replace(/alpha/, alpha);
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    if (doRotate){
      ctx.rotate(this.rotateSpeed*time);
    }
    ctx.moveTo(this.points[9][0], this.points[9][1]);
    this.points.forEach(function(p){
      ctx.lineTo(p[0],p[1])
    })
    ctx.fill();
    ctx.restore();
  }
}; // }}}
function BigStar(){ this.init.apply(this, arguments); }
BigStar.prototype = { // {{{
  init: function(x, y, size, ctx){
    this.x = x;
    this.y = y;
    this.r = size * 10;
    this.scale = 1;
    this.ctx = ctx;

    this.setPoints(0);
    this.styles = {
      fillStyle: "magenta",
      strokeStyle: "black",
      lineWidth: 100,
      lineCap: "round"
    };
  },
  setPoints: function(r){
    this.r += r;
    this.points = [];
    for (var i=0; i < 5; i++){
      var rad = 2 * i * Math.PI / 5 - Math.PI / 2;
      this.points.push([
        this.r * Math.cos(rad),
        this.r * Math.sin(rad)
      ]);
      this.points.push([
        this.r / 2 * Math.cos(rad + Math.PI / 5),
        this.r / 2 * Math.sin(rad + Math.PI / 5)
      ]);
    }
  },
  draw: function(x, y, scale, doStroke, doFill){
    this.x += x;
    this.y += y;
    this.scale += scale;
    ctx.save();
    ctx.fillStyle = this.styles.fillStyle;
    ctx.strokeStyle = this.styles.strokeStyle;
    ctx.lineWidth = this.styles.lineWidth;
    ctx.lineCap = this.styles.lineCap;
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.moveTo(this.points[9][0], this.points[9][1]);
    this.points.forEach(function(p){
      ctx.lineTo(p[0],p[1])
    })
    if (doStroke) ctx.stroke();
    if (doFill) ctx.fill();
    ctx.restore();
  },
  draw2: function(scale){
    var nowScale = this.scale + scale;
    this.draw(0, 0, scale, true, false);
    this.draw(0, 0, - 3 * this.scale / 5, false, true);
    this.scale = nowScale;
  },
}; // }}}
function Logo() { this.init.apply(this, arguments); }
Logo.prototype = { // {{{
  init: function(str, x, y){
    this.str = decodeURIComponent(escape(str));
    this.x = x;
    this.y = y;
    this.fontSize = 150;
    this.styles = {
      mozTextStyle: this.fontSize + "px Monospace",
      lineWidth: 50,
      strokeStyle: "black",
      fillStyle: "magenta",
      lineJoin: "round"
    };
    this.radian = 0;
  },
  draw: function(x, y, doRotate){
    this.x += x;
    this.y += y;
    ctx.save();
    ctx.fillStyle = this.styles.fillStyle;
    ctx.strokeStyle = this.styles.strokeStyle;
    ctx.lineWidth = this.styles.lineWidth;
    ctx.mozTextStyle = this.styles.mozTextStyle;
    ctx.lineJoin = this.styles.lineJoin;
    for (var i=0; i<this.str.length; i++){
      ctx.save();
      ctx.translate(this.x, this.y + this.fontSize * i);
      if (doRotate){
        ctx.translate(this.fontSize / 2, - this.fontSize /2);
        ctx.rotate(this.radian);
        ctx.translate(-this.fontSize / 2, this.fontSize /2);
      }
      ctx.beginPath();
      ctx.mozPathText(this.str.charAt(i));
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    this.radian -= Math.PI /4;
  }
}; // }}}
let ctx;
let stars, bigStar;
let interval, time;
let alpha, ctx;
let width, height;
let bsSpeedX = 60;
let bsSpeedY = -100;
let logo1,logo2,logo3,logo4,logoSpeed = 40;

let self = {
  init: function(c, w, h){
    ctx = c;
    width = w;
    height = h;
    time = 0;
    alpha = 1;
    ctx.clearRect(0, 0, width, height);
    stars = [];
    for (var row = 1; row < 8; row++){
      for (var r = row; r < row+10; r++){
        for (var num = 1; num < 2*row; num++){
          var x = num * width / (row+1) -width- (Math.random() * 50 * row)
          var y = r * row * 30 + height + (Math.random() * 100);
          stars.push(new Star(x, y, r+1.5));
        }
      }
    }
    let x = width / 2 - 20 * bsSpeedX;
    let y = height /2 - 20 * bsSpeedY;
    bigStar = new BigStar(x, y, 30);
    logoSpeed = (width / 2 + 75) /20;
    logo1 = new Logo("え", width, height/2 - 240);
    logo2 = new Logo("す", -150,  height/2 - 80);
    logo3 = new Logo("え", width, height/2 + 180);
    logo4 = new Logo("る", -150,  height/2 + 340);
  },
  draw: function(){
    time++;
    if (time < 25){
      stars.forEach(function(s){ s.draw(3*time, -4*time, 1, true); });
    } else if (time < 40){
      stars.forEach(function(s){ s.draw(3*time, -4*time, 1, true); });
      bigStar.draw(bsSpeedX, bsSpeedY, 0, false, true);
    } else if (time < 45){
      alpha -= 0.2;
      stars.forEach(function(s){ s.draw(3*time, -4*time, alpha, true); });
      bigStar.draw(bsSpeedX, bsSpeedY, 0, false, true)
    } else if (time < 50){
      bigStar.draw2(0);
    } else if (time < 55){
      bigStar.draw2(-0.092);
    } else if (time < 60){
      bigStar.draw2(-0.092);
    } else if (time < 65){
      bigStar.draw2(0);
      logo1.draw(-logoSpeed,0, true);
      logo2.draw(logoSpeed,0, true);
      logo3.draw(-logoSpeed,0, true);
      logo4.draw(logoSpeed,0, true);
    } else if (time < 80){
      bigStar.draw2(0);
      logo1.draw(-logoSpeed,0, true);
      logo2.draw(logoSpeed,0, true);
      logo3.draw(-logoSpeed,0, true);
      logo4.draw(logoSpeed,0, true);
    } else {
      bigStar.draw2(0);
      logo1.draw(0,0);
      logo2.draw(0,0);
      logo3.draw(0,0);
      logo4.draw(0,0);
    }
  }
}
return self;
})();

let xulNS = new Namespace("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");
let xhtmlNS = new Namespace("http://www.w3.org/1999/xhtml");
let dialog;
let self = {
  panel: xmlToDom(<panel id="vimp-sl" noautohide="true" style="background:transparent;border:none;" xmlns={xulNS}/>),
  open: function(attr){
    if (!attr) attr = {};
    let defAttr = getFullScreenAttr();
    let canvas = this.panel.getElementsByTagName("canvas")[0];
    let sl = new SL(canvas,
      attr.width || defAttr.width,
      attr.height || defAttr.height,
      attr.fontSize,
      attr.frameRate,
      attr.speed
    );
    sl.start(attr.logo, attr.accident, attr.fly, attr.luckystar);
    this.panel.openPopupAtScreen(attr.left || defAttr.left, attr.top || defAttr.top, false);
  },
  init: function(){
    let panel = document.getElementById("vimp-sl");
    if (panel){
      this.panel = panel;
    } else {
      document.documentElement.appendChild(this.panel);
      let canvas = document.createElementNS(xhtmlNS, "canvas");
      canvas.setAttribute("id", "vimp-sl-canvas");
      this.panel.appendChild(canvas);
    }
  },
  close: function(){
    this.panel.hidePopup();
  }
};
self.init();
// -----------------------------------------------------
// Commmand
// -----------------------------------------------------
commands.addUserCommand(['sl'], 'キータイプを矯正します。',
  function(args){
    let opt = {};

    args.string.split(/\s+/).forEach(function(arg){
      if (arg && arg.charAt(0) == "-"){
        for (let i=1, len=arg.length; i<len; i++){
          switch (arg.charAt(i)){
            case "a":
              opt.accident = true; break;
            case "l":
              opt.logo = true; break;
            case "F":
              opt.fly = true; break;
            case "s":
              opt.luckystar = true; break;
          }
        }
      }
    });
    self.open(opt);
  },{
    options: [
      [["-l"], commands.OPTION_NOARG],
      [["-a"], commands.OPTION_NOARG],
      [["-F"], commands.OPTION_NOARG],
      [["-s"], commands.OPTION_NOARG],
    ]
  },true);
return self;
})();

function onUnload(){
  try {
    liberator.plugins.SL.closePopup();
    document.documentElement.removeChild(liberator.plugins.SL.panel);
  } catch(e) {};
}

// vim: sw=2 ts=2 et fdm=marker:
