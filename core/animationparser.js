var AnimationRadix = new RadixTree(null, undefined);

AnimationRadix.set("delta", function (token, stream, keyframe) {
  stream.i += 5;
  keyframe.isDelta = true;
});

Globals.private.parse2 = function(stream){
  var temp = stream.data.substring(stream.i);

  var nums = temp.match(/\s+(-?[\d\.]+)\s+(-?[\d\.]+)\s?/);
  var array = new Array(2);
  if (nums.length == 3) {
    array[0] = nums[1] - 0;
    array[1] = nums[2] - 0;
    stream.i += nums[0].length;
  }else{
    throw new Error("incorrect number of numbers: "+temp);
  }
  return array;
};

Globals.private.parse1 = function(stream){
  var temp = stream.data.substring(stream.i);

  var nums = temp.match(/\s+(-?[\d\.]+)\s?/);
  var t = 0;
  if (nums.length == 2) {
    t = nums[1] - 0;
    stream.i += nums[0].length;
  }else{
    throw new Error("incorrect number of numbers: "+temp);
  }
  return t;
};

Globals.private.parseStr = function(stream){
  var temp = stream.data.substring(stream.i);

  var nums = temp.match(/\s+(-?[^\s]+)\s?/);
  var t = "";
  if (nums.length == 2) {
    t = nums[1];
    stream.i += nums[0].length;
  }else{
    throw new Error("incorrect number of strs: "+temp);
  }
  return t;
};


AnimationRadix.set("move", function (token, stream, keyframe) {
  stream.i += 4;
  var a = Globals.private.parse2(stream);
  keyframe.transform.x = a[0];
  keyframe.transform.y = a[1];
});

AnimationRadix.set("scale", function (token, stream, keyframe) {
  stream.i += 5;
  var a = Globals.private.parse2(stream);
  keyframe.transform.sx = a[0];
  keyframe.transform.sy = a[1];
});

AnimationRadix.set("width", function (token, stream, keyframe) {
  stream.i += 5;
  keyframe.width = Globals.private.parse1(stream);
});

AnimationRadix.set("time", function (token, stream, keyframe) {
  stream.i += 4;
  keyframe.time = Globals.private.parse1(stream);
});

AnimationRadix.set("alpha", function (token, stream, keyframe) {
  stream.i += 5;
  keyframe.transform.a = Globals.private.parse1(stream);
});

AnimationRadix.set("equation", function (token, stream, keyframe) {
  stream.i += 8;
  keyframe.equation = Globals.private.parseStr(stream);
});

AnimationRadix.set("image", function (token, stream, keyframe) {
  stream.i += 5;
  keyframe.image = Globals.private.parseStr(stream);
});

AnimationRadix.set("height", function (token, stream, keyframe) {
  stream.i += 6;
  keyframe.height = Globals.private.parse1(stream);
});

AnimationRadix.set(" ", function (token, stream, keyframe) {
  stream.i++;

});