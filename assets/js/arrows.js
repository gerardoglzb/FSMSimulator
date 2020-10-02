function moveArrow(line, originB, targetB) {
	let slope = drawArrow(line, originB.offsetLeft + diameter / 2, originB.offsetTop + diameter / 2, targetB.offsetLeft + diameter / 2, targetB.offsetTop + diameter / 2);
	if (localConnections[originB.id]) {
		for (let i = 0; i < localConnections[originB.id].length; i++) {
			if (localConnections[originB.id][i].target == targetB) {
				addTransitionContainer(line, slope);
				break;
			}
		}
	}
}

function moveCircle(circle, originB) {
	circle.style.top = (originB.offsetTop - circleDiameter / 2) + 'px';
	circle.style.left = (originB.offsetLeft + diameter / 2 - circleDiameter / 2 - 5) + 'px';
}

function drawMainArrow(targetX, targetY) {
	let slope = drawArrow(currentLine, originBall.offsetLeft + diameter / 2, originBall.offsetTop + diameter / 2, targetX, targetY);
	currentLine.getElementsByClassName('arrow-head-img')[0].src = blackPointSrc;
	// currentLine.getElementsByClassName('arrow-body')[0].style.width = "calc(100% - 83px)";
	// currentLine.getElementsByClassName('arrow-head')[0].style.width = "83px";
	return slope;
}

function secondArrow(path, transition, angle) {
	currentLine = path;
	makeTransitionText(currentLine, transition, angle, false, true);
	let secondArrowHead = document.createElement('div');
	secondArrowHead.className = 'arrow-head second-arrow-head';
	let secondHeadImg = document.createElement('img');
	secondHeadImg.className = 'arrow-head-img';
	secondHeadImg.setAttribute('draggable', false);
	secondHeadImg.src = redArrowSrc;
	secondArrowHead.append(secondHeadImg);
	currentLine.getElementsByClassName('arrow-body')[0].style.width = 'calc(100% - 60px)';
	currentLine.append(secondArrowHead);
}

function dragArrow(e) {
	e = e || window.event;
	e.preventDefault();
	if (!arrowInState) {
		drawArrow(currentLine, originBall.offsetLeft + diameter / 2, originBall.offsetTop + diameter / 2, e.clientX, e.clientY);
		currentLine.getElementsByClassName('arrow-head-img')[0].src = blackPointSrc;
		// currentLine.getElementsByClassName('arrow-body')[0].style.width = "calc(100% - 30px)";
		// currentLine.getElementsByClassName('arrow-head')[0].style.width = "30px";
	}
}

function activateArrow(e) {
	e = e || window.event;
	currentLine.remove();
	this.removeEventListener('mouseleave', activateArrow);
	// delete circle
	originBall = this;
	drawLine();
}

function unselectText(line) {
	if (selectedText.parentElement) {
		changeLineColor(selectedText.parentElement.parentElement, "black");
	} else if (line) {
		changeLineColor(line, "black");
	}
	selectedText = null;
}

function changeLineColor(line, color) {
	let arrowBodies = line.getElementsByClassName('arrow-body');
	if (arrowBodies.length > 0) {
		arrowBodies[0].style.backgroundColor = color;
		if (color == 'black') {
			line.getElementsByClassName('arrow-head')[0].getElementsByClassName('arrow-head-img')[0].src = blackPointSrc;
		} else {
			line.getElementsByClassName('arrow-head')[0].getElementsByClassName('arrow-head-img')[0].src = blueArrowSrc;
		}
	} else {
		line.style.borderColor = color;
	}
}

function selectText(line, textDiv) {
	selectedText = textDiv;
	changeLineColor(line, '#224af6');
	let splitLine = line.id.split('-');
	originBall = document.getElementById('state-ball-' + splitLine[1]);
	targetBall = document.getElementById('state-ball-' + splitLine[2]);
	openConnectionBox(false, false);
}

function selectLine(line) {
	selectedLine = line;
	changeLineColor(line, '#224af6');
	let splitLine = line.id.split('-');
	originBall = document.getElementById('state-ball-' + splitLine[1]);
	targetBall = document.getElementById('state-ball-' + splitLine[2]);
	openConnectionBox(false, false);
}

function makeCircle(state) {
	let circle = document.createElement('div');
	circle.className = 'connection-circle';
	circle.style.height = circleDiameter + 'px';
	circle.style.width = circleDiameter + 'px';
	circle.style.top = (state.offsetTop - circleDiameter / 2) + 'px';
	circle.style.left = (state.offsetLeft + diameter / 2 - circleDiameter / 2 - 5) + 'px';
	// circle.style.bottom = (diameter - circleDiameter / 2 - 5) + 'px';
	// circle.style.left = (diameter / 2 - circleDiameter / 2 - 10) + 'px';
	currentLine = circle;
	targetBall = state;
	canvas.appendChild(circle);
}

function makeLine() {
	let line = document.createElement('div');
	line.className = 'connection-line';
	let arrowBody = document.createElement('div');
	arrowBody.className = 'arrow-body';
	let head = document.createElement('div');
	head.className = 'arrow-head';
	line.appendChild(head);
	line.appendChild(arrowBody);
	let headImg = document.createElement('img');
	headImg.className = 'arrow-head-img';
	headImg.setAttribute('draggable', false);
	headImg.src = blackPointSrc;
	head.appendChild(headImg);
	currentLine = line;
	canvas.appendChild(line);
}

function drawLine() {
	isDrawingArrow = true;
	makeLine();
	canvas.addEventListener('mousemove', dragArrow);
}

function drawArrow(line, originX, originY, targetX, targetY) {
	let distance = Math.sqrt( ((originX - targetX) * (originX - targetX)) + ((originY - targetY) * (originY - targetY)) ) - diameter;
	let xMid = (originX + targetX) / 2;
	let yMid = (originY + targetY) / 2;
	let slope = Math.atan2(originY - targetY, originX - targetX) * 180 / Math.PI;
	line.style.width = distance + "px";
	line.style.left = (xMid - distance/2) + "px";
	line.style.top = yMid + "px";
	line.style.transform = "rotate("+slope+"deg)";
	return slope;
}

function changeLine(tb, textDiv, txt) {
	const csrftoken = getCookie('csrftoken');
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "changeLine/", true);
	xhr.onload = function() {
		if (this.status == 200) {
			if (!localConnections[originBall.id]) {
				localConnections[originBall.id] = [];
			}
			let localConnection = localConnections[originBall.id].filter(function(el) {
				return el.target == tb;
			});
			for (let i = 0; i < localConnection[0].transitions.length; i++) {
				if (localConnection[0].transitions[i] == textDiv.innerText) {
					localConnection[0].transitions[i] = this.responseText;
					textDiv.innerText = this.responseText;
					break;
				}
			}
			originBall = null;
		}
	}
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('originBall', originBall.id.substr(11));
	data.append('targetBall', tb.id.substr(11));
	data.append('path', txt);
	data.append('oldPath', textDiv.innerText);
	xhr.send(data);
}

function storeLine(tb, l, txt, initializeTransitions, reverseConnection) {
	const csrftoken = getCookie('csrftoken');
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "storeLine/", true);
	xhr.onload = function() {
		if (this.status == 200) {
			if (this.responseText == '') {
				alert("Connection already exists.");
			} else {
				if (!localConnections[originBall.id]) {
					localConnections[originBall.id] = [];
				}
				if (tb == originBall) {
					let lConnections = localConnections[originBall.id];
					let circleIndex = null;
					for (let i = 0; i < lConnections.length; i++) {
						if (lConnections[i].target == tb) {
							circleIndex = i;
							break;
						}
					}
					if (circleIndex == null) {
						localConnections[originBall.id].push(new Connection(tb, l, [this.responseText], 0, false));
						l.id = 'line-' + originBall.id.substr(11) + '-' + tb.id.substr(11);
						makeTransitionContainer(l, txt, 0, true);
					} else {
						makeTransitionText(lConnections[circleIndex].path, txt, 0, true, false);
						l.remove();
					}
					return;
				}
				if (initializeTransitions) {
					localConnections[originBall.id].push(new Connection(tb, l, [this.responseText], currentSlope, false));
					l.id = 'line-' + originBall.id.substr(11) + '-' + tb.id.substr(11);
					makeTransitionContainer(l, txt, currentSlope, false);
				} else if (reverseConnection) {
					let lConnections = localConnections[tb.id];
					for (let i = 0; i < lConnections.length; i++) {
						if (lConnections[i].target == originBall) {
							localConnections[tb.id][i].transitions.push(this.responseText);
							makeTransitionText(localConnections[tb.id][i].path, txt, currentSlope, false, true);
							break;
						}
					}
				} else {
					let lConnections = localConnections[originBall.id];
					for (let i = 0; i < lConnections.length; i++) {
						if (lConnections[i].target == tb) {
							localConnections[originBall.id][i].transitions.push(this.responseText);
							makeTransitionText(localConnections[originBall.id][i].path, txt, currentSlope, false);
							break;
						}
					}
				}
			}
			originBall = null;
		}
	}
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('originBall', originBall.id.substr(11));
	data.append('targetBall', tb.id.substr(11));
	data.append('path', txt);
	xhr.send(data);
}

function removeLine(tb, l, lIndex) {
	const csrftoken = getCookie('csrftoken');
	let xhr = new XMLHttpRequest();
	let textDiv = l.getElementsByClassName('line-text')[0];
	xhr.open('POST', "removeLine/", true);
	xhr.onload = function() {
		if (this.status == 200) {
			l.remove();
			localConnections[originBall.id].splice(lIndex, 1);
		}
	}
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('originBall', originBall.id.substr(11));
	data.append('targetBall', tb.id.substr(11));
	data.append('oldPath', textDiv.innerText);
	xhr.send(data);
}

function addFunctionalityToLine(line, tDiv) {
	line.style.pointerEvents = 'auto';
	tDiv.addEventListener('click', function(e) {
		selectText(line, this);
	});
}

function startDragging(e) {
	e = e || window.event;
	e.preventDefault();
	if (e.shiftKey) {
		isDrawingArrow = true;
		makeCircle(this);
		originBall = this;
		this.addEventListener('mouseleave', activateArrow);
		return;
	}
	let stateText = this.getElementsByClassName('noselect')[0];
	stateText.focus();
	ballText = stateText.innerText;
	currentBall = this;
	if (holdingID) {
		clearInterval(holdingID);
		holdingID = null;
	}
	holdingID = setInterval(function() {
		checkForHolding(currentBall)
	}, 2500);
	previousX = e.clientX;
	previousY = e.clientY
	let lines = document.getElementsByClassName('connection-line');
	from = {}; //[];
	to = {}; //[];
	let thisId = this.id.substr(11);
	for (let i = 0; i < lines.length; i++) {
		let splitLine = lines[i].id.split('-');
		if (splitLine[1] == thisId) {
			from[splitLine[2]] = lines[i];
		} else if (splitLine[2] == thisId) {
			to[splitLine[1]] = lines[i];
		}
	}
	canvas.addEventListener('mousemove', doDragging);
	document.addEventListener('mouseup', stopDragging);
}

function checkForHolding(state) {
	let stateID = state.id.substr(11);
	if (stateID != initialStateID) {
		changeInitialState(stateID);
		clearInterval(holdingID);
		holdingID = null;
	}
}

function doDragging(e) {
	if (holdingID) {
		clearInterval(holdingID);
		holdingID = null;
	}
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
	let froms = Object.keys(from);
	for (let f of froms) {
		let fBall = document.getElementById('state-ball-' + f);
		moveArrow(from[f], currentBall, fBall);
	}
	let tos = Object.keys(to);
	for (let t of tos) {
		let tBall = document.getElementById('state-ball-' + t);
		moveArrow(to[t], tBall, currentBall);
	}
	let circleID = currentBall.id.substr(11);
	let circleConnection = document.getElementById('line-' + circleID + '-' + circleID);
	if (circleConnection) {
		moveCircle(circleConnection, currentBall);
	}
}

function stopDragging(e) {
	if (holdingID) {
		clearInterval(holdingID);
		holdingID = null;
	}
	moveState(currentBall);
	canvas.removeEventListener('mousemove', doDragging);
	document.removeEventListener('mouseup', stopDragging);
	// from = {};
	// to = {};
}

function stopArrowState(e) {
	this.removeEventListener('mouseleave', activateArrow);
	if (isDrawingArrow) {
		isDrawingArrow = false;
		if (originBall == this) {
			if (currentLine.className != 'connection-circle') {
				alert("Getting here");
				makeCircle(this);
				openConnectionBox(false, true, false);
				targetBall = this;
			} else {
				openConnectionBox(true, true, false);
			}
			return;
		} else {
			canvas.removeEventListener('mousemove', dragArrow);
			let lineFound = false;
			let reverseLineFound = false;
			if (localConnections[originBall.id]) { // use tos here
				let lConnections = localConnections[originBall.id];
				for (let i = 0; i < lConnections.length; i++) {
					if (lConnections[i].target == this && !lConnections[i].isReversed) {
						lineFound = true;
						break;
					}
				}
			}
			if (!lineFound) {
				// see if there's one from here to the other side
				if (localConnections[this.id]) {
					let lConnections = localConnections[this.id];
					for (let i = 0; i < lConnections.length; i++) {
						if (lConnections[i].target == originBall) {
							reverseLineFound = true;
							break;
						}
					}
				}
			}
			targetBall = this;
			if (!lineFound && !reverseLineFound) {
				currentSlope = drawMainArrow(this.offsetLeft + diameter / 2, this.offsetTop + diameter / 2);
				openConnectionBox(true, true, false);
				return;
			}
			if (reverseLineFound) {
				// reverse stuff
				currentLine.remove();
				openConnectionBox(false, true, true);
				return;
			}
			currentLine.remove();
		}
		openConnectionBox(false, true, false);
	}
}

function stopArrowCanvas(e) {
	if (isDrawingArrow) {
		isDrawingArrow = false;
		canvas.removeEventListener('mousemove', dragArrow);
		currentLine.remove();
	}
}

function enterState(e) {
	if (isDrawingArrow) {
		arrowInState = true;
		if (originBall == this) {
			currentLine.remove();
			makeCircle(this);
			this.addEventListener('mouseleave', activateArrow);
		} else {
			drawMainArrow(this.offsetLeft + diameter / 2, this.offsetTop + diameter / 2);
		}
	}
}

function leaveState(e) {
	if (isDrawingArrow) {
		arrowInState = false;
	}
}

pressingCanvas.addEventListener('mouseup', stopArrowCanvas);