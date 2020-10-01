function makeState(e, ballID, leftOffset, topOffset, htmlName, value, isInitial) {
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
	if (isInitial) {
		initialStateID = ballID;
		// stateBall.style.backgroundColor = initialStateColor;
		stateBall.style.color = initialStateColor;
	}
	ballTextDiv.contentEditable = true;
	stateBall.id = 'state-ball-' + ballID;
	ballTextDiv.innerText = htmlName;
	stateBall.addEventListener('mousedown', startDragging);
	stateBall.addEventListener('mouseenter', enterState);
	stateBall.addEventListener('mouseleave', leaveState);
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
		innerBall.style.borderColor = 'red';
	} else {
		innerBall.style.borderColor = 'transparent';
	}
	stateBall.appendChild(innerBall);
	canvas.appendChild(stateBall);
}

function makeStateInitial(ballID) {
	document.getElementById('state-ball-' + initialStateID).style.color = normalStateColor;
	let state = document.getElementById('state-ball-' + ballID);
	initialStateID = state.id.substr(11);
	state.style.color = initialStateColor;
}

function changeInitialState(id) {
	const csrftoken = getCookie('csrftoken');
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "changeInitialState/", true);
	xhr.onload = function() {
		if (this.status == 200) {
			if (this.responseText == '') {
				alert("There was a problem setting initial state. Try reloading the page.");
			} else {
				makeStateInitial(this.responseText);
			}
		}
	}
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('id', id);
	xhr.send(data);
}

function deleteState(id, otherStates) {
	document.getElementById(id).remove();
	if (localConnections[id]) {
		let lConnections = localConnections[id];
		for (let i = 0; i < lConnections.length; i++) {
			lConnections[i].path.remove();
		}
	}
	for (let i = 0; i < otherStates.length; i++) {
		if (localConnections['state-ball-' + otherStates[i]]) {
			let otherConnections = localConnections['state-ball-' + otherStates[i]];
			for (let i = 0; i < otherConnections.length; i++) {
				if (otherConnections[i].target.id == id) {
					otherConnections[i].path.remove();
					otherConnections.splice(i, 1);
				}
			}
		}
	}
	delete localConnections.id;
}

function removeState(id) {
	const csrftoken = getCookie('csrftoken');
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "removeState/", true);
	xhr.onload = function() {
		if (this.status == 200) {
			deleteState(id, this.responseText.split('-'));
		}
	}
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('id', id.substr(11));
	xhr.send(data);
}

function changeVisualState(id, isFalse) {
	if (isFalse) {
		document.getElementById(id).getElementsByClassName('inner-ball')[0].style.borderColor = '#FB8F67';
	} else {
		document.getElementById(id).getElementsByClassName('inner-ball')[0].style.borderColor = 'transparent';
	}
}

function changeState(e) {
	let id = this.id;
	let isFalse = true;
	if (document.getElementById(id).getElementsByClassName('inner-ball')[0].style.borderColor == '#FB8F67') {
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
	xhr.send(data);
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

function newState(isInitial, e) {
	const csrftoken = getCookie('csrftoken');
	let leftOffset = leftBar.offsetWidth;
	let topOffset = window.innerHeight / 2 - diameter / 2;
	if (!isInitial) {
		leftOffset = e.clientX - diameter/2;
		topOffset = e.clientY - diameter/2;
	}
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "newState/", true);
	xhr.onload = function() {
		if (this.status == 200) {
			makeState(e, this.responseText, leftOffset, topOffset, this.responseText, false, isInitial);
		}
	}
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('isInitial', isInitial);
	data.append('leftOffset', leftOffset);
	data.append('topOffset', topOffset);
	xhr.send(data);
}

function stopEditing(e) {
	if (e.key == 'Enter' || e.key == 'Escape') {
		this.blur();
	} else if (e.key == 'Delete') {
		removeState(this.parentElement.id);
	}
}