console.log('Example log showing that this script is loaded')

assets.minigame.demo = function(obj, game) {
  obj.style.background = '#000000';
  var canvas = $('<canvas id="demoGame"></canvas>');
  $(obj).append(canvas);
  var ctx = canvas[0].getContext('2d');

  var lastTime = Date.now();
  var loop = function () {
    var time = Date.now();
    var delta = (time-lastTime)/1000.0;
    lastTime = time;

    var w = ctx.canvas.width = $(obj).width();
    var h = ctx.canvas.height = $(obj).height();

    ctx.fillStyle = "#f00"
    ctx.fillRect(0, 0, time % w, h)
  };

  var interval = setInterval(loop, 1);
  return new Promise(function(resolve, reject) {
    game.variable = 1

    setTimeout(function() {
      clearInterval(interval);
      resolve();
    }, 5000)
  })
}