function CircularArray(size) {
	this.length = size || 127;
	this.array = new Array(this.length);
	this.next = 0;
	this.fill = 0;
}

CircularArray.prototype.add = function (elem) {
	if ((this.fill + 1) > (this.length >> 1)){
		this.grow();
	}
	
	while (this.array[this.next] !== undefined) {
		++this.next;
		if(this.next > this.length)
		this.next = 0;
	}
	var i = elem._index = this.next;
	++this.fill;
	this.array[++this.next] = elem;
	if(this.next > this.length)
		this.next = 0;
	return i;
};

CircularArray.prototype.nextIndex = function () {
	if (this.fill + 1 > (this.next >> 1))
		this.grow();
	while (this.array[this.next] !== undefined) {
		++this.next;
	}
	return this.next;
};

CircularArray.prototype.remove = function (elem) {
	this.array[elem._index] = undefined;
	--this.fill;
};

CircularArray.prototype.grow = function () {
	var size = this.length,
		array = this.array;
	this.length = (this.length << 1) | 1;
	this.array = new Array(this.length);
	this.fill = 0;
	this.next = 0;
	for(var i = 0; i < size; ++i){
		if(array[i] !== undefined)
			this.add(array[i]);
	}
}