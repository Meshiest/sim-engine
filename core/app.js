var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1];
    }
  }
}

window.errorShown = false;

function showError(header, body) {
  if(window.errorShown)
    return;

  window.errorShown = true;
  $("#loadScreen").addClass('hidden');
  $("#gameScreen").addClass('hidden');
  $("#errorScreen").toggleClass('hidden');
  $("#errorHeader").text(header);
  $("#errorBody").text(body);
}

var assetTypes = {
  "^script (.+\\.js)$": {
    path: "/",
    name: "script",
    addFn: addScript,
  },
  "^style (.+\\.css)$": {
    path: "/",
    name: "style",
    addFn: addStyle,
  },
  "^image background ([a-zA-Z0-9_]+) (.+)$": {
    path: "/image/background/",
    name: "background",
    addFn: addImage,
  },
  "^image bust ([a-zA-Z0-9_]+) (.+)$": {
    path: "/image/bust/",
    name: "bust",
    addFn: addImage,
  },
  "^audio effect ([a-zA-Z0-9_]+) (.+)$": {
    path: "/audio/effect/",
    name: "effect",
    addFn: addEffect,
  },
  "^audio music ([a-zA-Z0-9_]+) (.+)$": {
    path: "/audio/music/",
    name: "music",
    addFn: addMusic,
  },
  "^scene ([a-zA-Z0-9_]+) (color|background) (.+)$": {
    name: "scene",
    addFn: addScene,
  },
  "^character ([a-zA-Z0-9_]+) ([a-zA-Z0-9_]+) \"(.+)\"$": {
    name: "character",
    addFn: addCharacter,
  },
}

function addStyle(data) {
  $('head').append($('<link rel="stylesheet" type="text/css" href="'+GAME_NAME+'/'+data[0]+'" />'))
}

function addScript(type, data) {
  $('body').append($('<script/>').attr('src', data))
}

function addMusic(type, data) {
  numAssets ++;
  var obj = {
    name: data[0],
    audio: document.createElement('audio'),
    loaded: false
  };
  document.body.appendChild(obj.audio)
  obj.audio.src = GAME_NAME + '/assets' + type.path + data[1];
  obj.audio.loop = true;
  obj.audio.preload = "auto";
  obj.audio.load()
  finishLoadingAsset();
  obj.audio.addEventListener("load", function() {
    obj.loaded = true;
    loadText(data[1]);
    obj.audio.play();
  }, true);

  return obj;
}

function addEffect(type, data) {
  numAssets ++;
  var obj = {
    name: data[0],
    audio: document.createElement('audio'),
    loaded: false
  };
  document.body.appendChild(obj.audio)
  obj.audio.src = GAME_NAME + '/assets' + type.path + data[1];
  obj.audio.preload = "auto";
  obj.audio.load();
  finishLoadingAsset();
  obj.audio.addEventListener("load", function() {
    obj.loaded = true;
    loadText(data[1]);
  }, true);

  return obj;
}

function addImage(type, data) {
  numAssets ++;
  var obj = {
    name: data[0],
    image: new Image(),
    loaded: false
  };
  
  obj.image.src = GAME_NAME + '/assets' + type.path + data[1];
  obj.image.addEventListener("load", function() {
    obj.loaded = true;
    loadText(data[1]);
    finishLoadingAsset();
  }, true);

  return obj;
}

function addCharacter(type, data) {
  if(!assets.bust[data[1]]) {
    showError("Failed Adding Character","Invalid file '"+data[1]+"' in '" + data.join(" ") + "'");
    return {};
  }
  var obj = {
    name: data[0],
    bust: assets.bust[data[1]],
    displayName: data[2],
  };
  return obj;
}

function addScene(type, data) {
  var obj = {
    name: data[0],
    style: '',
  }
  switch(data[1]) {
  case 'color':
    obj.style = 'background: ' + data[2] + ';';
    break;
  case 'background':
    obj.style = 'background-image: url(' + assets.background[data[2]].image.src + ');'
    break;
  }
  return obj;
}

var assets = {
  background: {},
  bust: {},
  effect: {},
  music: {},
  scene: {},
  character: {},
};

var numAssets = 0;
var numLoadedAssets = 0;

function finishLoadingAsset() {
  numLoadedAssets ++;
  console.log('Loaded',numLoadedAssets,'/',numAssets)
  if(numLoadedAssets == numAssets) {
    startGame();
  }
}

function loadAssets(code) {
  for(var i in code) {
    var line = code[i];

    if(!line.length)
      continue;

    for(var pattern in assetTypes) {
      var type = assetTypes[pattern];
      var regex = new RegExp(pattern);
      var matches = line.match(regex);
      if(matches) {
        matches.splice(0, 1);
        assets[type.name][matches[0]] = type.addFn(type, matches);
      }
    }
  }
}

function loadPoints(code) {
  for(var i in code) {
    var line = code[i];
    var match = line.match(/^POINT ([a-zA-Z0-9_]+)$/)
    if(match) {
      gamePoints[match[1]] = i;
    }
  }
}

function loadText(text) {
  $('#resourceName').text(text);
}

var GAME_NAME = window.GAME_NAME = getUrlParameter("game");

if(!GAME_NAME) {
  showError("No Game Set", "use '?game=[gamename] to specify where to load the game from");
}

var gameCode = [];
var gamePoints = {};
var gameVars = {};
var gameStage = {};
var currGameLine = 0;
var isWaiting = false;

loadText("Game File")
$.ajax({
  url: GAME_NAME + "/main.simfile",
  success: function(body) {
    body = body.replace(/\r/g, "");
    gameCode = body.split("\n");
    loadText("Assets")
    loadAssets(gameCode);
    loadPoints(gameCode);
  }
})

function setScene(scene) {
  if(!assets.scene[scene]) {
    showError("Scene Not Found", "Cannot find scene '" + scene + "'");
    return;
  }
  var scene = assets.scene[scene];
  $('#gameScreen').attr('style', scene.style)
  for(var name in gameStage) {
    exitCharacter(name, true);
  }
  nextLine();
}

function enterCharacter(char, loc) {
  if(gameStage[char]) {
    showError("Character already on stage", "For reasons, we can't display the same character twice")
    return;
  }

  if(!loc) {
    loc = "center";
  } else {
    loc = loc.toLowerCase();
  }
  gameStage[char] = loc;
  $('#gameScreen').prepend(
    $('<div id="char" class="show-'+loc+'" char="' + char + '">')
      .attr('style', 'background-image: url('+assets.character[char].bust.image.src+')')
  )

  nextLine();
}

function exitCharacter(char, noNext) {
  var loc = gameStage[char];
  delete gameStage[char];
  var char = $("#char[char='"+char+"']")
    .removeClass('show-'+loc)
    .addClass('hide-'+loc)

  setTimeout(function() {
    char.remove();
  }, 1000);

  if(!noNext)
    nextLine();
}

var currMusic = undefined;
function setMusic(music) {
  if(currMusic) {
    currMusic.pause();
    currMusic.currentTime = 0;
  }
  if(music === 'STOP') {
    currMusic = undefined;
  } else {
    assets.music[music].audio.play();
    currMusic = assets.music[music].audio    
  }
  nextLine();
}

function playEffect(effect) {
  assets.effect[effect].audio.currentTime = 0;
  assets.effect[effect].audio.play();
  nextLine();
}

function sendMessage(name, message, autoNext) {
  $('#textName').text(name);
  $('#textBody').text(message);

  if(autoNext)
    nextLine();
}

function charMessage(char, message, autoNext) {
  if(char == 'you') {
    sendMessage("You", message)
    return;
  } else if(char == 'talk') {
    sendMessage("", message)
    return;
  }
  sendMessage(getDisplayName(char), message, autoNext);
}

function showMenu(text) {
  var line = parseInput(gameCode[++currGameLine]);
  var options = [];
  while(!line.match(/^ENDMENU$/)) {
    var match = line.match(/^\"(.+?)\" *-> *(.+)$/);
    if(!match) {
      showError("Invalid Menu Option", line)
      return;
    } else {
      options.push({
        text: match[1],
        line: match[2]
      })
    }
    $('#boxName').text(text);
    var menu = $('#menuBox .menu');
    menu.empty()

    options.forEach(function(option, i) {
      var item = $('<li/>')
        .text(option.text)

      item.attr('index', i)

      item.mouseenter(function(){
        item.addClass('selected')
      })
      
      item.mouseleave(function(){
        item.removeClass('selected')
      })

      item.click(function(){
        $('#textBox').removeClass('hidden')
        $('#menuBox').addClass('hidden')
        interpretLine(option.line)
      })
      $('#menuBox .menu').append(item)
    })

    $('#textBox').addClass('hidden')
    $('#menuBox').removeClass('hidden')

    line = parseInput(gameCode[++currGameLine]);
  }
}

function gotoPoint(point) {
  currGameLine = gamePoints[point];
  nextLine();
}

function evalLine(line) {
  line = line.replace(/%[a-zA-Z0-9_]+/g, function(s){
    return "gameVars['" + s.match(/%([a-zA-Z0-9_]+)/)[1] + "']";
  });
  eval(line)
  nextLine();
}

function waitMS(time) {
  var time = parseInt(time);
  isWaiting = true;
  setTimeout(function(){
    isWaiting = false;
    nextLine();
  }, time);
}

function getDisplayName(char) {
  return assets.character[char].displayName;
}


function parseInput(text) {
  text = text.trim()
  if(text[0] == '#')
    return '';
  // now---
  // <% code %>
  // <%= code %>
  // {game variable}
  // :name:

  text = text.replace(/<%=.+?%>/g, function(s){
    return eval(s.match(/<%=(.+?)%>/)[1])
  });
  text = text.replace(/<%.+?%>/g, function(s){
    eval(s.match(/<%(.+?)%>/)[1]);
    return "";
  });
  text = text.replace(/{[a-zA-Z0-9_]+}/g, function(s){
    return gameVars[s.match(/{([a-zA-Z0-9_]+)}/)[1]];
  });
  text = text.replace(/:([a-zA-Z0-9_]+):/g, function(s){
    return getDisplayName(s.match(/:([a-zA-Z0-9_]+):/)[1]);
  });
  return text;
}

function startGame() {
  $("#loadScreen").toggleClass('hidden');
  $("#gameScreen").toggleClass('hidden');
  
  nextLine();
}

var selectIndex = -1;
$('body').keydown(function(a){
  var key = a.keyCode;

  if($('#gameScreen.hidden').length || isWaiting)
    return;

  var menu = !!$('#textBox.hidden').length;

  var ENTER_KEY = 13;
  var SPACE_KEY = 32;
  var KEY_DOWN = 40;
  var KEY_UP = 38;

  if((key == ENTER_KEY || key == SPACE_KEY) && !menu) {
    nextLine();
  }

  if(menu) {
    if(key == KEY_DOWN && $('.menu li[index="'+(selectIndex+1)+'"]').length) {
      $('.menu li[index="' + selectIndex + '"]').removeClass('selected');
      $('.menu li[index="' + (selectIndex+1) + '"]').addClass('selected');
      selectIndex ++;
    }
    if(key == KEY_UP && $('.menu li[index="'+(selectIndex-1)+'"]').length) {
      $('.menu li[index="' + selectIndex + '"]').removeClass('selected');
      $('.menu li[index="' + (selectIndex-1) + '"]').addClass('selected');
      selectIndex --;
    }
    if((key == ENTER_KEY || key == SPACE_KEY) && selectIndex >= 0) {
      $('.menu li[index="' + selectIndex + '"]').click();
      selectIndex = -1;
    }
  }


  // 38 up 40 down
})

gameOperators = {
  // character operator
  "^([a-zA-Z0-9_]+): \"(.+?)\"(@)?$": charMessage,
  // narrator operator
  "^\"(.+?)\": \"(.+?)\"(@)?$": sendMessage,
  "^ENTER ([a-zA-Z0-9_]+) *(LEFT|RIGHT|)?$": enterCharacter,
  "^EXIT ([a-zA-Z0-9_]+)$": exitCharacter,
  "^SCENE ([a-zA-Z0-9_]+)$": setScene,
  "^MENU \"(.+?)\"$": showMenu,
  "^MUSIC ([a-zA-Z0-9_]+)$": setMusic,
  "^EFFECT ([a-zA-Z0-9_]+)$": playEffect,
  "^GOTO ([a-zA-Z0-9_]+)$": gotoPoint,
  "^WAIT (\\d+)$": waitMS,
  "^\\$(.*)$": evalLine,
}

function nextLine() {
  currGameLine ++;
  if(currGameLine >= gameCode.length) {
    console.log("not sure how to handle the end of the game")
    return;
  }
  var rawLine = gameCode[currGameLine];
  interpretLine(rawLine);
}

function interpretLine(rawLine) {
  var line = parseInput(rawLine);
  for(var pattern in gameOperators) {
    var fn = gameOperators[pattern];
    var regex = new RegExp(pattern);
    var matches = line.match(regex);
    if(matches) {
      console.log(line)
      matches.splice(0, 1);
      fn(...matches);
      return;
    }
  }
  nextLine();
}