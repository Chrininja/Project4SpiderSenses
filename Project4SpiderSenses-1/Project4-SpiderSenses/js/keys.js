"use strict";
const keyboard = Object.freeze({
	w: 87,
	a: 65,
	s: 83,
	d: 68,
	q: 81,
	r: 82,
	SHIFT: 16,
	SPACE: 32,
	ENTER: 10
});

// this is the "key daemon" that we poll every frame
const keys = [];

window.onkeyup = (e) => {
	//	console.log("keyup=" + e.keyCode);
	keys[e.keyCode] = false;
	e.preventDefault();
};

window.onkeydown = (e) => {
	//	console.log("keydown=" + e.keyCode);
	keys[e.keyCode] = true;

	// checking for other keys - ex. 'p' and 'P' for pausing
	let char = String.fromCharCode(e.keyCode);
};