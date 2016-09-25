Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

assets.minigame.race = function(obj, game) {
  obj.style.background = '#000000';
  var canvas = $('<canvas id="gameCanvas"></canvas>');
  $(obj).append(canvas);
  var ctx = canvas[0].getContext('2d');
  var endResolve;
  var endReject;
  var startTime = Date.now();
  var angle = Math.PI/2;
  var inGame = true

  var badReviews = [
    "great service",
    "ten out of ten ign",
    "loved the cat picture",
    "my porn arrived safely",
    "bobby can finally play cod",
    "reminds me of home",
    "literally god tier",
    "handled my package real well",
    "would order again",
    "i rate eight out of eight",
    "quite fast shipping",
    "just fast enough",
    "gotta go fast",
    "excellent service",
    "good customer support"
  ]

  var reviewSpeed = 200
  var reviews = []
  var planes = []

  var lastFire = 0;
  var fireReview = function() {
    if(!SHOOT_PHASE) return;
    if(lastFire + 500 > Date.now())
      return;

    lastFire = Date.now();

    reviews.push({
      x: 0,
      y: $(obj).height()/2-30,
      angle: angle,
      color: '#000',
      text: currWord
    })
    newWord();
  }

  var colors = {
    "dhl": "#ffff00",
    "ups": "#996633",
    "fedex": "#ff9900",
    "usps": "#0000ff"
  }
  var keys = {}
  $('body').keydown(function(event) {
    var key = event.keyCode
    if(!inGame)
      return;

    var currLetter = currWord.substring(progress, progress+1).toUpperCase()
    if(currLetter.charCodeAt(0) == key) {
      progress ++;
      if(progress >= currWord.length) {
        phase = SHOOT_PHASE;
        return;
      }
    }

    if(key == 32 && phase == SHOOT_PHASE)
      fireReview();

    keys[key] = true
  })

  $('body').keyup(function(event) {
    var key = event.keyCode
    if(!inGame)
      return;
    keys[key] = false;
  })

  var lastTime = Date.now();
  var phase = 0;
  var TYPE_PHASE = 0;
  var SHOOT_PHASE = 1;

  var currWord;
  var progress = 0;
  var numSuccess = 0;
  var numAttempt = 0;

  var newWord = function () {
    phase = TYPE_PHASE;
    progress = 0;
    currWord = badReviews[Math.floor(Math.random() * badReviews.length)]
  }
  newWord();
  var colorIndex = 0;
  var loop = function () {
    var time = Date.now();
    delta = (time-lastTime)/1000.0;
    lastTime = time;

    if(phase == SHOOT_PHASE) {
      if(keys[65]) { // A
        angle += Math.PI*delta
      }
      if(keys[68]) { // D
        angle -= Math.PI*delta
      }
      angle = angle.clamp(Math.PI*1/6, Math.PI*5/6)
    }

    var w = ctx.canvas.width = $(obj).width();
    var h = ctx.canvas.height = $(obj).height();

    var skyGradient = ctx.createLinearGradient(0, 0, 0, h);
    skyGradient.addColorStop(0,"#aaaaee");
    skyGradient.addColorStop(1,"#ddddff");

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, w, h);

    if(phase == TYPE_PHASE) {
      ctx.font = "50px Tahoma"
      ctx.textBaseline = "top";
      ctx.fillStyle = "#000";
      var text = "Type the review! ("+numAttempt+"/5)"
      ctx.fillText(text, 11, 11)
      ctx.fillStyle = "#fff";
      ctx.fillText(text, 10, 10)

      ctx.translate(w/2, h/2);

      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      var strWidth = ctx.measureText(currWord).width
      ctx.fillStyle = "#000"
      ctx.fillText(currWord, -strWidth/2+1, 1);
      ctx.fillStyle = "#fff"
      ctx.fillText(currWord, -strWidth/2, 0);
      ctx.fillStyle = "#0f0"
      ctx.fillText(currWord.substring(0, progress), -strWidth/2, 0);
    } else {
      ctx.font = "50px Tahoma"
      ctx.textBaseline = "top";
      ctx.fillStyle = "#000";
      var text = "A+D to aim, Space to post review!"
      ctx.fillText(text, 11, 11)
      ctx.fillStyle = "#fff";
      ctx.fillText(text, 10, 10)

      ctx.translate(w/2, h/2);
    }

    var minDim = Math.min(w,h);

    var durr = 500
    var grad = Math.cos((time % durr) / durr * Math.PI) * 0.5 + 0.5
    var colorArr = Object.keys(colors)
    colorIndex = 4 - Math.floor(time/durr) % 4
    var part = w/4

    ctx.font = "20px Tahoma"
    for(var i = 0; i < reviews.length; i++) {
      var rev = reviews[i];
      rev.x += reviewSpeed * Math.cos(-rev.angle) * delta
      rev.y += reviewSpeed * Math.sin(-rev.angle) * delta
      if(Math.abs(rev.x) > w || Math.abs(rev.y) > h) {
        reviews.splice(i--, 1)
        continue;
      }
      ctx.save()
      ctx.translate(rev.x, rev.y)
      ctx.rotate(rev.angle < Math.PI/2 ? -rev.angle : -rev.angle-Math.PI)
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = rev.color;
      ctx.fillText(rev.text, 0, 0)
      ctx.restore()

      if(rev.color === '#000') {
        for(var i = 0; i < 5; i++) {
          var color = colors[colorArr[(i+colorIndex)%colorArr.length]]
          var theta = -rev.angle
          var len = ctx.measureText(rev.text).width
          var posX = rev.x + Math.cos(theta) * len / 2
          var posY = rev.y + Math.sin(theta) * len / 2
          if(Math.abs(posX-((i - grad + 0.5) * part - w/2)) < part/2 && posY-(-h/4+20) < 10 ) {
            numAttempt ++;
            if(color == colors[game.gameType]) {
              numSuccess ++;
            }
            if(numAttempt == 5) {
              if(numSuccess >= 3) {
                endResolve();
              } else {
                endReject();
              }
              clearInterval(interval);
              inGame = false;
              return;
            }
            rev.color = color;
            break;
          }
        }
      }
    }

    ctx.lineWidth = 20;
    ctx.beginPath()
    ctx.moveTo(0, h/2-30)
    ctx.lineTo(0+Math.cos(angle) * 90, h/2-30 - Math.sin(angle) * 90)
    ctx.strokeStyle = "#333"
    ctx.stroke()

    ctx.fillStyle = colors[game.gameType];
    ctx.beginPath();
    ctx.moveTo(-40, h/2)
    ctx.arc(0, h/2-30, 30, 3.142, 0)
    ctx.lineTo(40, h/2)
    ctx.lineTo(-40, h/2)
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.stroke();


    for(var i = 0; i < 5; i++) {
      ctx.fillStyle = colors[colorArr[(i+colorIndex)%colorArr.length]]
      ctx.fillRect((i - grad) * part - w/2, -h/4, part, 40)
    }
  };

  var interval = setInterval(loop, 1);
  return new Promise(function(resolve, reject) {
    endResolve = resolve;
    endReject = reject;
  })
}