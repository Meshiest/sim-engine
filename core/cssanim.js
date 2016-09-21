var GlobalAnimations = {};

function Animation(name, isDelta, final, time, easing, delay, loops, direction, events) {
	GlobalAnimations[name] = this;
	this.dir = direction || false;
	this.loops = loops || 0;
	this.name = name;
	this.delay = delay || 0
	this.time = time || 1;
	this.easing = easing || "ease";
	this.isDelta = isDelta;
	this.final = final;
	this.events = events || {};

}

Animation.prototype.toString = function (elem) {
	var index = AnimationArray.nextIndex();
	var opacityFinal = "",
		opacityInitial = "";
	if (elem.transform.a != this.final.a) {
		opacityInitial = "\nopacity:" + elem.transform.a + ";";
		opacityFinal = "\nopacity:" + this.final.a + ";";
	}
	var transformFinal = "";
	if (this.isDelta) {
		transformFinal = elem.transform.delta(this.final);
	} else {
		transformFinal = this.final.toString();
	}
	var str = "@keyframes css-anim-" + index + " {from {transform:" + elem.transform.toString() +
		";" + opacityInitial + "} to {transform:" + transformFinal +
		";" + opacityFinal + "} }";
	return str;
};

Animation.prototype.applyTo = function (elem, time, func, delay, loops, dir) {
	if (time === undefined)
		time = this.time;
	if (!func)
		func = this.easing;
	if (delay === undefined)
		delay = this.delay;
	var index = AnimationArray.nextIndex();
	var str = "css-anim-" + index + " " + time + "s " + func + " " + delay + "s";

	if (loops)
		str += " " + loops;
	else if (this.loops)
		str += " " + this.loops;

	if (dir)
		str += " " + dir;
	else if (this.dir)
		str += " " + this.dir;



	var events = this.events;

	var style = AnimationImport(this, elem);
	var container = elem.container;
	var t = this;
	if (events.step) {
		var event = "animationiteration";
		var listen = function (e) {
			container.removeEventListener(event, listen);
			events.step(t, e);
		};
		container.addEventListener(event, listen);
	}
	if (events.start) {
		var event = "animationstart";
		var listen = function (e) {
			container.removeEventListener(event, listen);
			events.start(t, e);
		};
		container.addEventListener(event, listen);
	}
	var event = "animationend";
	var listen = function (e) {
		container.removeEventListener(event, listen);
		if (events.end)
			events.end(t, e);
		if (t.isDelta) {
			elem.transform.deltaTo(t.final);
			console.log(elem.transform);
		} else {
			elem.transform.setTo(t.final);
		}
		elem.container.style.animation = undefined;
		elem.update();
		document.body.removeChild(style.s);
		AnimationArray.remove(style);
	};
	container.addEventListener(event, listen);
	container.style.animation = undefined;
	void elem.container.offsetWidth; //trigger dom (not strictly safe)
	container.style.animation = str;
	container.style.animationFillMode = "forwards";
	container.style.animationPlayState = "inherit";
};

var AnimationArray = new CircularArray();


function AnimationUsing(names) {
	for (var i = 0, len = AnimationStyles.length; i < len; ++i) {
		document.body.removeChild(AnimationStyles[i]);
	}
	AnimationsOut = {};
	AnimationStyles = new Array(names.length);
	for (var i = 0, len = names.length; i < len; ++i) {
		var name = names[i];
		var animation = GlobalAnimations[name];
		if (!AnimationsOut[name]) {
			var style = AnimationStyles[i] = document.createElement("style");
			style.innerHTML = animation.toString();
			document.body.appendChild(style);
			AnimationsOut[name] = style;
		} else {
			AnimationsOut[name].innerHTML = animation.toString();
		}
	}
}

function AnimationPurge(name) {
	try {
		delete(GlobalAnimations[name]);
		delete(AnimationsOut[name]);
	} catch (e) {
		GlobalAnimations[name] = undefined;
		AnimationsOut[name] = undefined;
	}
	document.body.removeChild(AnimationStyles[i]);
}

function AnimationImport(animation, elem) {
	var style = {
		s: document.createElement("style"),
		elem:elem,
		anim:animation
	};
	style.s.innerHTML = animation.toString(elem);
	AnimationArray.add(style);
	document.body.appendChild(style.s);
	return style;

}