var Gui = {};
var Gui = {};
var Globals = {};
Globals.Animation = {
  paused: false
};

Globals.private = {};
Globals.private.arrayCons = [].constructor;

function append(p, e) {
  p.container && (p = p.container);
  if (e.constructor = Globals.private.arrayCons) {
    for (var i = 0; i < e.length; ++i) {
      append(p, e[i]);
    }
    return;
  }
  e.container && (e = e.container);
  p.appendChild(e);
}

function bind(names, context) {
  for (var i = 0; i < names.length; ++i) {
    var name = names[i];
    context[name] = context[name].bind(context);
  }
}


Gui.KeyFrame = function (isDelta, width, height, transform, image, equation, time) {
  if (isDelta === undefined)
    isDelta = true;
  if (time === undefined)
    time = 1;
  this.time = time;
  this.image = image || "error";
  this.equation = equation || "linear";
  this.isDelta = isDelta;
  this.width = width || 0;
  this.height = height || 0;
  this.transform = transform || new Gui.Transform();
};

Globals.Animation.Pause = function () {
  Globals.Animation.paused = !Globals.Animation.paused;
  Globals.Body.container.style.animationPlayState = (Globals.Animation.paused ? "paused" : "running");
};

Globals.private.intermediate = function (elem, className) {
  var container = Globals.private.create("div", className);
  container.appendChild(elem);
  return container;
};

Globals.private.create = function (type, className, innerHTML) {
  var container = document.createElement(type);
  if (className)
    container.className = className;
  if (innerHTML)
    container.innerHTML = innerHTML;
  return container;
};



Gui.Element = function () {
  this.container = Globals.private.create("div", "anime-element");
  this.width = 100;
  this.height = 200;
  this.container.gui_ele = this;
  Globals.Body.container.appendChild(this.container);
  this.transform = new Gui.Transform();
  this.animations = [];
  this.update();
};

Gui.Element.prototype.move = function (x, y, noUpdate) {
  this.transform.x += x || 0;
  this.transform.y += y || 0;
  if (!noUpdate)
    this.update();
};

Gui.Element.prototype.grow = function (x, y, noUpdate) {
  this.width += x || 0;
  this.height += y || 0;
  if (!noUpdate)
    this.update();
};

Gui.Element.prototype.rotate = function (r, noUpdate) {
  this.transform.r += r;
  if (!noUpdate)
    this.update();
};

Gui.Element.prototype.update = function () {
  var style = this.container.style;
  style.transform = this.transform.toString();
  style.opacity = this.transform.a;
  var w = this.width,
    h = this.height;
  style.width = w + "px";
  style.height = h + "px";
};

Gui.Transform = function (x, y, sx, sy, r, a) {
  this.x = x || 0;
  this.y = y || 0;
  if (sx === undefined)
    sx = 1;
  this.sx = sx;
  if (sy === undefined)
    sy = 1;
  this.sy = sy;
  this.r = r || 0;
  if (a === undefined)
    a = 1;
  this.a = a;
};

Gui.Transform.prototype.delta = function (other) {
  var str = "translate(" + (other.x + this.x) + "px, " + (other.y + this.y) + "px)";
  if (other.sx != 1 || other.sy != 1) {
    str += " scale(" + other.sx + ", " + other.sy + ")";
  }
  if (other.r != 0) {
    str += " rotate(" + other.r + "deg)";
  }
  return str;
};

Gui.Transform.prototype.deltaTo = function (other) {
  this.x = other.x + this.x;
  this.y = other.y + this.y;
  this.sx = other.sx;
  this.sy = other.sy;
  this.r = other.r;
  this.a = other.a;
};

Gui.Transform.prototype.setTo = function (other) {
  this.x = other.x;
  this.y = other.y;
  this.sx = other.sx;
  this.sy = other.sy;
  this.r = other.r;
  this.a = other.a;
};

Gui.Transform.prototype.copy = function () {
  return new Gui.Transform(this.x, this.y, this.sx, this.sy, this.r, this.a);
};

Gui.Transform.prototype.toString = function () {
  var str = "translate(" + this.x + "px, " + this.y + "px)";
  if (this.sx != 1 || this.sy != 1) {
    str += " scale(" + this.sx + ", " + this.sy + ")";
  }
  if (this.r != 0) {
    str += " rotate(" + this.r + "deg)";
  }
  return str;
};