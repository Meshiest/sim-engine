function loadPipeImage(src) {
  numAssets ++;
  var obj = {
    image: new Image(),
    loaded: false
  };
  
  obj.image.src = GAME_NAME + '/assets/game/pipe/' + src;
  obj.image.addEventListener("load", function() {
    obj.loaded = true;
    loadText(src);
    finishLoadingAsset();
  }, true);
  return obj;
}

var truck = loadPipeImage("truck.png")
var house = loadPipeImage("house.png")

assets.minigame.pipe = function(obj, game) {
  obj.style.background = '#000000';
  var canvas = $('<canvas id="gameCanvas"></canvas>');
  $(obj).append(canvas);
  var ctx = canvas[0].getContext('2d');
  var mouse = {};
  var gMouse = {};
  var nMouse = {};
  var endResolve;
  var startTime = Date.now();
  canvas.on('mousemove', function(event) {
    mouse.x = event.pageX
    mouse.y = event.pageY

    var w = $(obj).width();
    var h = $(obj).height();
    var minDim = Math.min(w,h);
    nMouse = {x: mouse.x-w/2, y: mouse.y-h/2}
    var part = minDim/4 * 0.75;
    gMouse = {x: 3-Math.floor((part*2-nMouse.x)/part), y: 3-Math.floor((part*2-nMouse.y)/part)}
  })
  canvas.on('mousedown', function(event) {
    if((gMouse.y < 0 || gMouse.y > 3) ^ (gMouse.x < 0 || gMouse.x > 3)) {
      if(gMouse.y < 0 || gMouse.y > 3) {
        shift(gMouse.x, 3, true)
      } else {
        shift(3, gMouse.y, false)
      }
      if(checkMoves()) {
        endResolve();
      }
    }
  })

  var start = Math.floor(Math.random() * 4)
  var end = Math.floor(Math.random() * 4)
  var moves = [];
  var dy = end-start;
  var y = start;

  // create at least one valid path
  for(var i = 0; i < 4; i++) {
    moves.push({x: i, y: y})
    dy = (i == 3 ? end : Math.floor(Math.random() * 4))-y;
    for (var j = 0; j < Math.abs(dy); j++) {
      y += Math.sign(dy);
      moves.push({x: i, y: y})
    }
  }

  moves[0].sX = -1
  moves[0].sY = 0;
  moves[moves.length-1].eX = 1;  
  moves[moves.length-1].eY = 0;
  for(var i = 0; i < moves.length-1; i++) {
    var move = moves[i];
    var nextMove = moves[i+1];
    move.eX = Math.sign(nextMove.x-move.x)
    move.eY = Math.sign(nextMove.y-move.y)
    nextMove.sX = Math.sign(move.x-nextMove.x)
    nextMove.sY = Math.sign(move.y-nextMove.y)
  }

  // build empty grid
  var grid = {};
  for(var i = 0; i < 4; i++)
    grid[i] = {};

  // place moves in grid
  for(var i = 0; i < moves.length; i++) {
    var move = moves[i];
    grid[move.x][move.y] = move;
  }

  for(var x = 0; x < 4; x++) {
    for(var y = 0; y < 4; y++) {
      if(!grid[x][y]) {
        var move = {
          x: x,
          y: y
        }
        if(Math.random() < 0.5) { // straight
          var vert = Math.random() < 0.5;
          move.sX = vert ? 0 : -1;
          move.eX = vert ? 0 : 1;
          move.sY = vert ? -1 : 0;
          move.eY = vert ? 1 : 0;
        } else {
          move.sX = 0;
          move.eX = Math.floor(Math.random() * 2) * 2 - 1;
          move.sY = Math.floor(Math.random() * 2) * 2 - 1
          move.eY = 0;
        }
        grid[x][y] = move;
        
      }
    }
  }

  var getAfter = function(move) {
    if(!move)
      return move
    if(grid[move.x + move.eX] && grid[move.x + move.eX][move.y + move.eY])
      return grid[move.x + move.eX][move.y + move.eY]
  }

  var getBefore = function(move) {
    if(!move)
      return move
    if(grid[move.x + move.sX] && grid[move.x + move.sX][move.y + move.sY])
      return grid[move.x + move.sX][move.y + move.sY]
  }


  var getNext = function(move) {
    var after = getAfter(move)
    if(getBefore(after) != move && getAfter(after) != move)
      after = undefined;

    var before = getBefore(move)
    if(getBefore(before) != move && getAfter(before) != move)
      before = undefined;


    if(after && !after.valid)
      return after;
    if(before && !before.valid)
      return before;
    if(before && before.valid)
      return after;
    if(after && after.valid)
      return before;

    return undefined;
  }

  var checkMoves = function() {
    for(var i = 0; i < 4; i++) {
      for(var j = 0; j < 4; j++) {
        grid[i][j].valid = false;
      }
    }

    var curr = grid[0][start]
    if(curr.sX != -1 && curr.eX != -1)
      return false;
    while(curr && !curr.valid) {
      curr.valid = true;
      if(curr.x == 3 && curr.y == end && curr.eY == 0 && (curr.eX == 1 || curr.sX == 1)){
        return true;
      }
      curr = getNext(curr);
    }
    return false;
  }

  var shift = function(x, y, vert) {
    while(x < 0)
      x += 4
    while(y < 0)
      y += 4

    var copy = JSON.parse(JSON.stringify(grid));
    for(var i = 0; i < 4; i++) {
      if(vert) {
        grid[x][i] = copy[x][(i + y) % 4]
        grid[x][i].x = x
        grid[x][i].y = i
      } else {
        grid[i][y] = copy[(i + x) % 4][y]
        grid[i][y].x = i
        grid[i][y].y = y
      }
    }
    checkMoves();
  }

  for(var i = 0; i < (game.numPipeMoves || 15) || checkMoves(); i++) {
    var pos = Math.floor(Math.random() * 4);
    if(Math.random() < 0.5) {
      shift(pos, 3, true)  
    } else {
      shift(3, pos, false)
    }
  }

  checkMoves();

  var lastTime = Date.now();
  var loop = function () {
    var time = Date.now();
    var delta = (time-lastTime)/1000.0;
    lastTime = time;

    var w = ctx.canvas.width = $(obj).width();
    var h = ctx.canvas.height = $(obj).height();

    ctx.fillStyle = "#dcdeff";
    ctx.fillRect(0, 0, w, h);
    ctx.font="30px Tahoma";
    var hours = 90-Math.floor((time-startTime)/1000);
    ctx.textAlign = "right"
    ctx.textBaseline = "top"
    ctx.fillStyle = "#000";
    ctx.fillText(hours + " hour"+(hours == 1 ? "" : "s")+" before shipment", w - 9, 11);
    ctx.fillStyle = "#fff";
    ctx.fillText(hours + " hour"+(hours == 1 ? "" : "s")+" before shipment", w - 10, 10);
    ctx.textAlign = "left";
    ctx.fillStyle = "#000";
    ctx.fillText("Plan the shipping route!", 11, 11);
    ctx.fillStyle = "#fff";
    ctx.fillText("Plan the shipping route!", 10, 10);
    ctx.font="20px Tahoma"
    ctx.fillStyle = "#000";
    ctx.textBaseline = "bottom"
    ctx.fillText("Click outside of the grid to shift a row or column", 11, h-9);
    ctx.fillStyle = "#fff";
    ctx.fillText("Click outside of the grid to shift a row or column", 10, h-10);



    var minDim = Math.min(w,h);
    var part = minDim/4 * 0.75;

    ctx.translate(w/2, h/2);
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#000";
    ctx.fillRect(-minDim/2 * 0.75-5, -minDim/2 * 0.75-5, minDim * 0.75+10, minDim * 0.75+10);
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.2;
    for(var x = 0; x < 4; x ++) {
      for(var y = 0; y < 4; y++) {
        if(gMouse.x == x && (gMouse.y < 0 || gMouse.y > 3) || gMouse.y == y && (gMouse.x < 0 || gMouse.x > 3))
          ctx.fillRect(-minDim/2*0.75+x*part, -minDim/2*0.75+y*part, part, part)
      }
    }

    ctx.strokeStyle = "#fff";
    if((gMouse.y < 0 || gMouse.y > 3) ^ (gMouse.x < 0 || gMouse.x > 3)) {
      var grad = (time % 800) / 800
      for(var i = 0; i < 4; i++) {
        if(gMouse.y < 0 || gMouse.y > 3) {
          var x = -minDim/2*0.75+(gMouse.x+0.5)*part          
          var y = -minDim/2*0.75+(i+grad+0.125)*part
          ctx.globalAlpha = 0.5 - Math.cos((i+grad)*Math.PI*2/4) * 0.5;
          ctx.beginPath();
          ctx.moveTo(x-part*0.25, y-part*0.25)
          ctx.lineTo(x, y)
          ctx.lineTo(x+part*0.25, y-part*0.25)
          ctx.stroke();
        } else {
          var x = -minDim/2*0.75+(i+grad+0.125)*part
          var y = -minDim/2*0.75+(gMouse.y+0.5)*part
          ctx.globalAlpha = 0.5 - Math.cos((i+grad)*Math.PI*2/4) * 0.5;
          ctx.beginPath();
          ctx.moveTo(x-part*0.25, y+part*0.25)
          ctx.lineTo(x, y)
          ctx.lineTo(x-part*0.25, y-part*0.25)
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;

    ctx.fillStyle = "#cfc";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(-minDim/2*0.75 + (-0.5)*part, -minDim/2*0.75 + (start+0.5)*part, part * 0.25, 0, 6.29)
    ctx.fill();
    ctx.stroke();
    ctx.drawImage(truck.image, -minDim/2*0.75 + (-0.5)*part - 32, -minDim/2*0.75 + (start+0.5)*part - 32)

    ctx.fillStyle = "#fcc";
    ctx.beginPath();
    ctx.arc(-minDim/2*0.75 + (4.5)*part, -minDim/2*0.75 + (end+0.5)*part, part * 0.25, 0, 6.29)
    ctx.fill();
    ctx.stroke();
    ctx.drawImage(house.image, -minDim/2*0.75 + (4.5)*part - 32, -minDim/2*0.75 + (end+0.5)*part - 32)


    for(var i = 0; i < 4; i++) {
      for(var j = 0; j < 4; j++) {
        var move = grid[i][j];
        var x = -minDim/2*0.75+(move.x+0.5)*part;
        var y = -minDim/2*0.75+(move.y+0.5)*part;
        ctx.strokeStyle = move.valid ? "#fff" : '#ccc';
        var mult = move.valid ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x+move.sX*part*0.25*mult, y+move.sY*part*0.25*mult)
        ctx.lineTo(x, y)
        ctx.lineTo(x+move.eX*part*0.25*mult, y+move.eY*part*0.25*mult)
        ctx.stroke();
      }
    }
  };

  var interval = setInterval(loop, 1);
  return new Promise(function(resolve, reject) {
    endResolve = resolve;

    setTimeout(function() {
      clearInterval(interval);
      reject();
    }, 90000)
  })
}