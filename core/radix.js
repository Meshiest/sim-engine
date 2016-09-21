/**
A trie that is space efficient, and stores its children in a sorted array.
*/
function RadixTree(symbolPartial, symbolNotFound) {
	this.root = new RadixTree.Node(0, symbolPartial, "", null);
	this.partial = symbolPartial;
	this.notFound = symbolNotFound;
	this.searchstr = "";
	this.searchInvalid = false;
	this.searchIndex = 0;
	this.searchNode = this.root;
	this.treeUpdated = false;
};

/**
Resets the consume feature
*/
RadixTree.prototype.resetConsume = function () {
	this.searchNode = this.root;
};

/**
You essentially pump in one symbol at a time to this function
and it will keep track of if what you've pumped is a valid
word, a part of a valid word, or could not possibly be a word
@return Whatever you passed in for the partial or not found symbol
along with the possibility of whatever you pumped in for the leaf
nodes.
*/
RadixTree.prototype.consume = function (searchindex, character) {
	return this.searchNode.consume(searchindex, character, this);
};

/**
Checks whether something is in the tree or not. This was the predecessor
of the consume method. Deprecated.
@private
@return Whatever you passed in for the partial or not found symbol
along with the possibility of whatever you pumped in for the leaf
nodes.
*/
RadixTree.prototype.check = function (searchterm) {
	var old = this.searchstr,
		olen = old.length;
	this.searchstr = searchterm;
	if (!this.treeUpdated && searchterm.length >= olen) {
		for (var i = 0; i < olen; i++) {
			if (searchterm.charCodeAt(i) != old.charCodeAt(i)) {
				this.searchIndex = 0;
				this.searchInvalid = false;
				this.searchNode = this.root;
				break;
			}
		}
		if (this.searchInvalid)
			return this.notFound;
	} else {
		this.searchIndex = 0;
		this.searchNode = this.root;
		this.treeUpdated = false;
	}
	return this.searchNode.check(this.searchIndex, searchterm, this);
};

/**
Set something in the tree as a leaf node.
@return what you replaced.
*/
RadixTree.prototype.set = function (toAdd, newValue) {
	this.treeUpdated = true;
	return this.root.set(0, toAdd, newValue, this);
};

/**
Get something from the tree.
@return Whatever you passed in for the partial or not found symbol
along with the possibility of whatever you pumped in for the leaf
nodes.
*/
RadixTree.prototype.get = function (toGet) {
	return this.root.get(0, toGet, this);
};

/**
Remove something from the tree.
@return Whatever you passed in for the partial or not found symbol
along with the possibility of whatever you pumped in for the leaf
nodes.
*/
RadixTree.prototype.remove = function (toRemove) {
	return this.root.remove(0, toRemove, this)
};

/**
A node in the tree.
*/
RadixTree.Node = function (fromChar, isToken, searchToken, parent) {
	this.fromChar = fromChar;
	this.isToken = isToken;
	this.token = searchToken;
	this.children = [];
	this.chars = [];
	this.parent = parent;
};

/**
The internals for setting a leaf node in the tree
@return the old value you replaced.
*/
RadixTree.Node.prototype.set = function (fromChar, toAdd, newValue, tree) {
	if (fromChar == toAdd.length) {
		var token = this.isToken;
		this.isToken = newValue;
		return token;
	}
	var searchChar = toAdd.charCodeAt(fromChar);
	var index = this.search(searchChar);
	var needNew = (index == this.chars.length) || (this.chars[index] != searchChar);
	if (needNew) {
		if (this.chars[index] < searchChar)
			index++;
		this.chars.splice(index, 0, searchChar);
		this.children.splice(index, 0, new RadixTree.Node(fromChar, newValue, toAdd.substring(fromChar), this));
	} else {
		var replacingNode = this.children[index];
		var sim = replacingNode.compare(fromChar, toAdd);
		if (sim < replacingNode.token.length) {
			var newNode = this.children[index] = new RadixTree.Node(fromChar, tree.partial, replacingNode.token.substring(0, sim), this);
			replacingNode.token = replacingNode.token.substring(sim);
			replacingNode.parent = newNode;
			newNode.children.push(replacingNode);
			newNode.chars.push(replacingNode.token.charCodeAt(0));
			replacingNode.fromChar = fromChar + sim;
			newNode.set(fromChar + sim, toAdd, newValue, tree);
		} else {
			replacingNode.set(fromChar + sim, toAdd, newValue, tree);
		}
	}
};

/**
The internals for getting a leaf node in the tree
@return see RadixTree.prototype.get
*/
RadixTree.Node.prototype.get = function (fromChar, toGet, tree) {
	if (fromChar == toGet.length) {
		return this.isToken;
	}
	var searchChar = toGet.charCodeAt(fromChar);
	var index = this.search(searchChar);
	var needNew = (index == this.chars.length) || (this.chars[index] != searchChar);
	if (needNew) {
		return tree.notFound;
	} else {
		var replacingNode = this.children[index];
		var sim = replacingNode.compare(fromChar, toGet);
		if (sim < replacingNode.token.length) {
			if (sim + fromChar < toGet.length)
				return tree.notFound;
			return tree.partial;
		} else {
			return replacingNode.get(fromChar + sim, toGet, tree);
		}
	}
};

/**
Trim a node, handle stuffs if it's not a leaf. Or if it is one.
Not a nice function.
*/
RadixTree.Node.prototype.trim = function (tree) {
	var l = this.children.length;
	if (l > 1) {
		this.isToken = tree.partial;
	} else {
		var parent = this.parent;
		var index = parent.search(this.token.charCodeAt(0));
		if (l == 0) {
			parent.children.splice(index, 1);
			parent.chars.splice(index, 1);
			if (parent) {
				var token = parent.isToken;
				if (token == tree.partial) {
					parent.trim(tree);
				}
			}
		} else {
			var child = this.children[0];
			parent.children[index] = child;
			child.token = this.token + child.token;
			child.fromChar = this.fromChar;
		}
	}
};


/**
The internals for getting rid of a leaf node in the tree
@return see RadixTree.prototype.remove
*/
RadixTree.Node.prototype.remove = function (fromChar, toRemove, tree) {
	if (fromChar == toRemove.length) {
		var token = this.isToken;
		if (token != tree.notFound && token != tree.partial) {
			this.trim(tree);
		}
		return token;
	}
	var searchChar = toRemove.charCodeAt(fromChar);
	var index = this.search(searchChar);
	var needNew = (index == this.chars.length) || (this.chars[index] != searchChar);
	if (needNew) {
		return tree.notFound;
	} else {
		var replacingNode = this.children[index];
		var sim = replacingNode.compare(fromChar, toRemove);
		if (sim < replacingNode.token.length) {
			if (sim + fromChar < toRemove.length)
				return tree.notFound;
			return tree.partial;
		} else {
			return replacingNode.remove(fromChar + sim, toRemove, tree);
		}
	}
};

/**
Honestly, don't use this, maintained for in case it comes in handy.
@private
@return see RadixTree.prototype.get
*/
RadixTree.Node.prototype.check = function (fromChar, searchterm, tree) {
	var t = this.token,
		tlen = t.length;
	var max = this.fromChar + tlen;
	if (fromChar < max) {
		var i = fromChar - this.fromChar;
		while (i < tlen && fromChar < searchterm.length) {
			if (searchterm.charCodeAt(fromChar) != t.charCodeAt(i)) {
				tree.searchInvalid = true;
				tree.searchIndex = fromChar;
				return tree.notFound;
			}
			fromChar++;
			i++;
		}
		tree.searchIndex = fromChar;
		if (fromChar < max && fromChar == searchterm.length) {
			return tree.partial;
		}
	}
	if (fromChar == max && fromChar >= searchterm.length) {
		if (this.isToken == tree.notFound) {
			tree.searchInvalid = true;
		}
		return this.isToken;
	}
	var searchChar = searchterm.charCodeAt(fromChar);
	var index = this.search(searchChar);
	var needNew = (index == this.chars.length) || (this.chars[index] != searchChar);
	if (needNew) {
		tree.searchInvalid = true;
		return tree.notFound;
	} else {
		var replacingNode = this.children[index];
		tree.searchNode = replacingNode;
		return replacingNode.check(fromChar, searchterm, tree);
	}
};

/**
Internal for checking whether something is in the tree or not by consumption.
@return see RadixTree.prototype.consume
*/
RadixTree.Node.prototype.consume = function (fromChar, nextChar, tree) {
	var t = this.token,
		tlen = t.length;
	var max = this.fromChar + tlen;
	if (fromChar < max) {
		var i = fromChar - this.fromChar;
		if (i < tlen) {
			if (nextChar != t.charCodeAt(i)) {
				return tree.notFound;
			}
			fromChar++;
		}
		if (fromChar < max) {
			return tree.partial;
		} else {
			return this.isToken;
		}
	}
	var index = this.search(nextChar);
	var needNew = (index == this.chars.length) || (this.chars[index] != nextChar);
	if (needNew) {
		return tree.notFound;
	} else {
		var replacingNode = this.children[index];
		tree.searchNode = replacingNode;
		return replacingNode.consume(fromChar, nextChar, tree);
	}
};

/**
Compare the similarity in two strings from a point to whenever it's done.
*/
RadixTree.Node.prototype.compare = function (fromChar, toCompare) {
	var t = this.token,
		len = t.length,
		i = 0;
	while (i < len && toCompare.charCodeAt(fromChar++) == t.charCodeAt(i)) {
		i++;
	}
	return i;
};

/**
Search for the index of a char.
@return same as Array.prototype.binaryIndexOf
*/
RadixTree.Node.prototype.search = function (character) {
	return this.chars.binaryIndexOf(character);
};

/**
Search for the index of an element that's comparable in an ordered list.
@return {number} -1 or index.
*/
Array.prototype.binaryIndexOf = function (searchElement) {
	'use strict';

	var minIndex = 0;
	var maxIndex = this.length - 1;
	var currentIndex = 0;
	var currentElement;

	while (minIndex <= maxIndex) {
		currentIndex = (minIndex + maxIndex) / 2 | 0;
		currentElement = this[currentIndex];

		if (currentElement < searchElement) {
			minIndex = currentIndex + 1;
		} else if (currentElement > searchElement) {
			maxIndex = currentIndex - 1;
		} else {
			return currentIndex;
		}
	}

	return currentIndex;
};

/**
Checks if the stream has any symbols in the tree that can be consumed.
Will always consume the longest index.
@return {Object} an indication of what was found.
*/
function canConsume(raw_stream, tree) {
	var data = raw_stream.data,
		len = data.length;
	var i = raw_stream.i,
		x = 0;
	tree.resetConsume();

	var ret = -1;
	var retSym = tree.notFound;
	while (i < len) {
		var sym = tree.consume(x, data.charCodeAt(i));
		if (sym === tree.notFound)
			return {
				len: ret,
				sym: retSym
			};
		x++;
		i++;
		if (sym !== tree.partial) {
			ret = x;
			retSym = sym;
		}
	}
	return {
		len: ret,
		sym: retSym
	};
};