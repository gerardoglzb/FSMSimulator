let diameter = 120;
let innerDiameter = 100;
let originX;
let originY;
let currentLine;
let currentBall;
let previousX;
let previousY;
let mayDragHorizontally = true;
let isShifting = false;
let isDrawingArrow = false;
let mayDragVertically = true;
let canvas = document.getElementById('canvas');
let  pressingCanvas = document.getElementById('pressingCanvas');
let leftBar = document.getElementById('left-bar');

document.addEventListener('keydown', function(e) {
    e = e || window.event;
    if (e.key == 'Shift') {
    	isShifting = true;
    }
});

document.addEventListener('keyup', function(e) {
	e = e || window.event;
	if (e.key == 'Shift') {
		isShifting = false;
	}
});

// function for getting token for ajax call
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.querySelector('form').addEventListener('submit', function(e) {
	e.preventDefault();
	const csrftoken = getCookie('csrftoken');
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "testSample/", true);
	xhr.onload = function() {
		if (this.status == 200) {
			console.log("test is", this.responseText);
		}
	}
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('testSample', document.getElementById('testSample').value);
	xhr.send(data); //JSON.stringify
});

// creates visual states in the front-end
function makeState(e, ballID, leftOffset, topOffset, htmlName, value) {
	if (ballID == 'None') {
		console.log('ball not created by python');
		return;
	}
	let stateBall = document.createElement('div');
	let ballTextDiv = document.createElement('div');
	stateBall.appendChild(ballTextDiv);
	stateBall.offsetParent = canvas;
	stateBall.className = 'state-ball noselect';
	ballTextDiv.className = 'noselect';
	// stateBall.contentEditable = true;
	ballTextDiv.contentEditable = true;
	// stateBall.addEventListener('select', function(e) {
		// console.log("but i know....");
		// e.preventDefault();
	// })
	stateBall.id = 'state-ball-' + ballID;
	ballTextDiv.innerText = htmlName;
	stateBall.addEventListener('mousedown', startDragging);
	stateBall.addEventListener('mouseup', stopArrowState);
	stateBall.addEventListener('dblclick', changeState);
	ballTextDiv.addEventListener('keydown', stopEditing);
	ballTextDiv.addEventListener('focusout', storeName);
	stateBall.style.lineHeight = diameter + "px";
	stateBall.style.height = diameter + "px";
	stateBall.style.width = diameter + "px";
	stateBall.style.left = leftOffset + "px";
	stateBall.style.top = topOffset + "px";
	let innerBall = document.createElement('div');
	innerBall.className = 'inner-ball';
	innerBall.style.height = innerDiameter + 'px';
	innerBall.style.width = innerDiameter + 'px';
	if (value) {
		innerBall.style.borderColor = 'orange';
	} else {
		innerBall.style.borderColor = 'transparent';
	}
	stateBall.appendChild(innerBall);
	canvas.appendChild(stateBall);
}

function deleteState(id) {
	document.getElementById(id).remove();
}

function removeState(id) {
	const csrftoken = getCookie('csrftoken');
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "removeState/", true);
	xhr.onload = function() {
		if (this.status == 200) {
			deleteState(id);
		}
	}
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('id', id.substr(11));
	xhr.send(data); //JSON.stringify
}

console.log("no");

function stopEditing(e) {
	if (e.key == 'Enter' || e.key == 'Escape') {
		this.blur();
	} else if (e.key == 'Delete') {
		removeState(this.parentElement.id);
	}
}

function changeVisualState(id, isFalse) {
	if (isFalse) {
		document.getElementById(id).getElementsByClassName('inner-ball')[0].style.borderColor = 'orange';
	} else {
		document.getElementById(id).getElementsByClassName('inner-ball')[0].style.borderColor = 'transparent';
	}
}

function changeState(e) {
	let id = this.id;
	let isFalse = true;
	if (document.getElementById(id).getElementsByClassName('inner-ball')[0].style.borderColor == 'orange') {
		isFalse = false;
	}
	const csrftoken = getCookie('csrftoken');
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "changeState/", true);
	xhr.onload = function() {
		if (this.status == 200) {
			changeVisualState(id, isFalse);
		}
	}
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('id', id.substr(11));
	data.append('isFalse', isFalse);
	xhr.send(data); //JSON.stringify
}

function storeName() {
	const csrftoken = getCookie('csrftoken');
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "storeName/", true);
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('id', this.parentElement.id.substr(11));
	data.append('name', this.innerText);
	xhr.send(data);
}

function moveState(ball) {
	const csrftoken = getCookie('csrftoken');
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "moveState/", true);
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('id', ball.id.substr(11));
	data.append('leftOffset', parseInt(ball.style.left, 10));
	data.append('topOffset', parseInt(ball.style.top, 10));
	xhr.send(data);
}

// creates states in the python back-end
function newState(isInitial, e) {
	const csrftoken = getCookie('csrftoken');
	let leftOffset = leftBar.offsetWidth;
	let topOffset = window.innerHeight / 2 - diameter / 2;
	if (!isInitial) {
		leftOffset = e.clientX - diameter/2;
		topOffset = e.clientY - diameter/2;
	}
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "something/", true); // TODO: change something url
	xhr.onload = function() {
		if (this.status == 200) {
			makeState(e, this.responseText, leftOffset, topOffset, this.responseText, false);
		}
	}
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('isInitial', isInitial); // true or false to see if appending initialState
	data.append('leftOffset', leftOffset);
	data.append('topOffset', topOffset);
	xhr.send(data); //JSON.stringify
}

function restoreMachine(states) { // stringify it some other way
	for (let i = 0; i < states.length; i++) {
		makeState(null, states[i].pk, states[i].fields.left, states[i].fields.top, states[i].fields.name, states[i].fields.value);
	}
}

function startScript(isNewSession, states) {
	if (isNewSession == 'True') {
		newState(isNewSession, null);
	} else {
		restoreMachine(states);
	}
}

// document.getElementById('canvas').ondblclick = function(e) {
// 	console.log("plantilla");
// }

// document.getElementById("canvas").addEventListener("dblclick", function(e) {

// 	console.log("new state");
// 	e = e || window.event;
// 	newState(false, e);
// });

pressingCanvas.addEventListener("dblclick", function(e) {
	console.log("new state");
	e = e || window.event;
	newState(false, e);
	// makeState(null, 4, e.clientX - diameter/2, e.clientY - diameter/2);
});

function drawArrow(targetX, targetY) {
	let distance = Math.sqrt( ((originX - targetX) * (originX - targetX)) + ((originY - targetY) * (originY - targetY)) );
	let xMid = (originX + targetX) / 2;
	let yMid = (originY + targetY) / 2;
	let slope = Math.atan2(originY - targetY, originX - targetX) * 180 / Math.PI;
	currentLine.style.width = distance + "px";
	currentLine.style.left = (xMid - distance/2) + "px";
	currentLine.style.top = yMid + "px";
	currentLine.style.transform = "rotate("+slope+"deg)";
}

function dragArrow(e) {
	e = e || window.event;
	e.preventDefault();
	drawArrow(e.clientX, e.clientY);
}

function drawLine() {
	isDrawingArrow = true;
	let line = document.createElement('div');
	line.className = 'connection-line';
	let arrowBody = document.createElement('div');
	arrowBody.className = 'arrow-body';
	let head = document.createElement('div');
	head.className = 'arrow-head';
	line.appendChild(head);
	line.appendChild(arrowBody);
	let headImg = document.createElement('img');
	headImg.src = arrowSrc;
	head.appendChild(headImg);
	// let img = document.createElement('img');
	// img.className = 'arrow-img';/
	// img.src = arrowSrc;
	// line.appendChild(img);
	// line.style.backgroundColor = "red";
	// line.style.height = "10px";
	// line.style.position = "absolute";
	currentLine = line;
	canvas.appendChild(line);
	canvas.addEventListener('mousemove', dragArrow);
}

// let peter = document.createElement('div');
// peter.style.height = "50px";
// peter.style.width = "250px";
// peter.style.backgroundColor = "red";
// peter.style.position = "absolute";
// peter.style.left = "350px";
// peter.style.top = "100px";
// canvas.appendChild(peter);

function startDragging(e) {
	e = e || window.event;
	e.preventDefault();
	console.log("cliked on sttae");
	if (isShifting) {
		console.log("started with the arrow");
		originX = this.offsetLeft + diameter / 2;
		originY = this.offsetTop + diameter / 2;
		drawLine();
		return;
	}
	// this.blur();
	console.log("started dragging");
	this.getElementsByClassName('noselect')[0].focus();
	currentBall = this;
	previousX = e.clientX;
	previousY = e.clientY;
	canvas.addEventListener('mousemove', doDragging);
	document.addEventListener('mouseup', stopDragging);
}

function doDragging(e) {
	e = e || window.event;
	e.preventDefault();
	let newLeft = currentBall.offsetLeft + e.clientX - previousX;
	let newTop = currentBall.offsetTop + e.clientY - previousY;
	if (newTop > 0 && newTop < window.innerHeight - diameter) {
		currentBall.style.top = newTop + 'px';
	}
	if (newLeft > leftBar.offsetWidth && newLeft < window.innerWidth - diameter) {
		currentBall.style.left = newLeft + 'px';
	}
	previousX = e.clientX;
	previousY = e.clientY;
}

function stopDragging(e) {
	moveState(currentBall);
	canvas.removeEventListener('mousemove', doDragging);
	document.removeEventListener('mouseup', stopDragging);
}

function stopArrowState(e) {
	console.log("stopped on top of state");
	if (isDrawingArrow) {
		isDrawingArrow = false;
		canvas.removeEventListener('mousemove', dragArrow);
		drawArrow(this.offsetLeft + diameter / 2, this.offsetTop + diameter / 2); // might rebuild this whole thing, use onenter and shit, calculate accurate position like Evan
	}
}

pressingCanvas.addEventListener('mouseup', stopArrowCanvas);

function stopArrowCanvas(e) {
	console.log("stopped on top of canvas");
	if (isDrawingArrow) {
		isDrawingArrow = false;
		canvas.removeEventListener('mousemove', dragArrow);
		currentLine.remove();
	}
}