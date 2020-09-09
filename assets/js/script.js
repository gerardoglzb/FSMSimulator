let diameter = 120;
let innerDiameter = 100;
let currentBall;
let previousX;
let previousY;
let movingBall;
let mayDragHorizontally = true;
let mayDragVertically = true;
let canvas = document.getElementById('canvas');
let leftBar = document.getElementById('left-bar');

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
	console.log(document.getElementById('testSample').value);
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
	stateBall.offsetParent = canvas;
	stateBall.className = 'state-ball noselect';
	stateBall.contentEditable = true;
	stateBall.id = 'state-ball-' + ballID;
	stateBall.innerText = htmlName;
	stateBall.addEventListener('mousedown', startDragging);
	stateBall.addEventListener('dblclick', changeState);
	stateBall.addEventListener('keydown', stopEditing);
	stateBall.addEventListener('focusout', storeName);
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

console.log("hiiii");

function stopEditing(e) {
	if (e.key == 'Enter' || e.key == 'Escape') {
		this.blur();
	} else if (e.key == 'Delete') {
		removeState(this.id);
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
	data.append('id', this.id.substr(11));
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
	console.log(ball.style.left);
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

document.getElementById("pressingCanvas").addEventListener("dblclick", function(e) {
	e = e || window.event;
	newState(false, e);
	// makeState(null, 4, e.clientX - diameter/2, e.clientY - diameter/2);
});

function startDragging(e) {
	movingBall = this;
	this.focus();
	e = e || window.event;
	e.preventDefault();
	currentBall = e.target || e.srcElement;
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
	console.log("stopped raginggg");
	moveState(movingBall);
	canvas.removeEventListener('mousemove', doDragging);
	document.removeEventListener('mouseup', stopDragging);
}