function makeTransitionContainer(line, txt, lineAngle, isCircle) {
	let tContainer = document.createElement('div');
	tContainer.className = 'line-container';
	line.append(tContainer);
	makeTransitionText(line, txt, lineAngle, isCircle, false);
}

function makeTransitionText(line, txt, lineAngle, isCircle, isReversed) {
	let tText = document.createElement('div');
	tText.className = 'line-text';
	tText.innerText = txt;
	let lineContainer = line.getElementsByClassName('line-container')[0];
	if (isReversed) {
		// alert("colrin");
		tText.style.backgroundColor = '#AD343E';
	}
	lineContainer.append(tText);
	if (isCircle) {
		let textCount = lineContainer.getElementsByClassName('line-text').length;
		lineContainer.style.top = (-20 * textCount) + 'px';
	}
	addFunctionalityToLine(currentLine, tText);
	addTransitionContainer(line, lineAngle);
}

function addTransitionContainer(line, lineAngle) {
	tContainer = line.getElementsByClassName('line-container')[0];
	if (lineAngle > 90 || lineAngle < -90) {
		tContainer.style.transformOrigin = 'top left';
		tContainer.style.transform = 'rotate(' + (360 - lineAngle) + 'deg) translate(-50%, 0%)';
		tContainer.style.left = '50%';
		tContainer.style.right= 'auto';
	} else {
		tContainer.style.transformOrigin = 'top right';
		tContainer.style.transform = 'rotate(' + (-lineAngle) + 'deg) translate(50%, 0%)';
		tContainer.style.right = '50%';
		tContainer.style.left = 'auto';
	}
}

function deleteText() {
	let container = selectedText.parentElement;
	let line = container.parentElement;
	let counter = 0;
	let reverseCounter = 0;
	for (let i = 0; i < localConnections[originBall.id].length; i++) {
		if (localConnections[originBall.id][i].target == targetBall) {
			for (let j = 0; j < localConnections[originBall.id][i].transitions.length; j++) {
				if (localConnections[originBall.id][i].transitions[j] != selectedText.innerText) {
					counter++;
				}
			}
			if (counter == 0) {
				localConnections[originBall.id].splice(i, 1);
			} else {
				localConnections[originBall.id][i].transitions.splice(j, 1);
			}
			break;
		}
	}
	let containerTexts = container.getElementsByClassName('line-text');
	for (let i = 0; i < containerTexts.length; i++) {
		if (containerTexts[i].style.backgroundColor == 'rgb(173, 52, 62)') {
			reverseCounter++;
			break;
		}
	}
	if (counter == 0 && reverseCounter == 0) {
		line.remove();
	} else {
		if (reverseCounter == 0) {
			let secondArrowHead = line.getElementsByClassName('second-arrow-head')[0];
			if (secondArrowHead){
				secondArrowHead.remove();
				line.getElementsByClassName('arrow-body')[0].style.width = 'calc(100% - 30px)';
			}
		}
		selectedText.remove();
		let textCount = container.getElementsByClassName('line-text').length;
		container.style.top = (-20 * textCount) + 'px';
		unselectText(line);
	}
	hideModel();
}

function removeText() {
	const csrftoken = getCookie('csrftoken');
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "removeText/", true);
	xhr.onload = function() {
		if (this.status == 200) {
			if (this.responseText == '1') {
				deleteText();
			} else {
				alert("Could not remove connection.");
			}
		}
	}
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	let originID = originBall.id.substr(11);
	let targetID = targetBall.id.substr(11);
	if (selectedText.style.backgroundColor == 'rgb(173, 52, 62)') {
		let temp = originID;
		originID = targetID;
		targetID = temp;
	}
	data.append('originBall', originID);
	data.append('targetBall', targetID);
	data.append('oldPath', selectedText.innerText);
	xhr.send(data);
}

function showModel() {
	modal.style.display = 'none';
}

function acceptModel() {
	if (/\s/g.test(connectionInput.value)) {
		alert("You can't use white spaces.");
		return;
	}
	if (connectionInput.value == '') {
		alert("You can't use empty spaces as transitions.");
		return;
	}
	if (isNewConnection) {
		storeLine(targetBall, currentLine, connectionInput.value, true);
	} else if (isAnotherConnection) {
		storeLine(targetBall, currentLine, connectionInput.value, false, isReversedConnection);
	} else {
		changeLine(targetBall, selectedText, connectionInput.value);
	}
	hideModel();
}

function hideModel() {
	acceptBtn.removeEventListener('click', acceptModel);
	cancelBtn.removeEventListener('click', cancelModel);
	if (selectedText) {
		unselectText();
	}
	modal.style.display = 'none';
	connectionInput.value = '';
}

function cancelModel() {
	hideModel();
	if (isNewConnection) {
		currentLine.remove();
	}
}

function connectionBoxKeyController(e) {
	e = e || window.event;
	if (e.key == 'Escape') {
		cancelModel();
	} else if (e.key == 'Enter') {
		acceptModel();
	} else if (!isNewConnection && e.key == 'Delete') {
		removeText(); // when going the other way, make sure to switch target and origin in python and jscript
	}
}

function openConnectionBox(newConnection, anotherConnection, reversedConnection) {
	modal.style.display = "block";
	isNewConnection = newConnection;
	if (selectedText) {
		connectionInput.value = selectedText.innerText;
	}
	isAnotherConnection = anotherConnection;
	isReversedConnection = reversedConnection;
	acceptBtn.addEventListener('click', acceptModel);
	cancelBtn.addEventListener('click', cancelModel);
	connectionInput.addEventListener('keydown', connectionBoxKeyController);
}