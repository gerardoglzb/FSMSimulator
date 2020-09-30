function makeTransitionContainer(line, txt, lineAngle) {
	let tContainer = document.createElement('div');
	tContainer.className = 'line-container';
	line.append(tContainer);
	makeTransitionText(line, txt, lineAngle);
}

function makeTransitionText(line, txt, lineAngle) {
	let tText = document.createElement('div');
	tText.className = 'line-text';
	tText.innerText = txt;
	line.getElementsByClassName('line-container')[0].append(tText);
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
	let line = selectedText.parentElement.parentElement;
	let counter = 0;
	for (let i = 0; i < localConnections[originBall.id].length; i++) {
		if (localConnections[originBall.id][i].target == targetBall) {
			if (localConnections[originBall.id][i].path == line) {
				localConnections[originBall.id].splice(i, 1);
			} else {
				counter++;
			}
		}
	}
	if (counter == 0) {
		line.remove();
	} else {
		selectedText.remove();
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
	data.append('originBall', originBall.id.substr(11));
	data.append('targetBall', targetBall.id.substr(11));
	data.append('oldPath', selectedText.innerText);
	xhr.send(data);
}

function showModel() {
	modal.style.display = 'none';
}

console.log("esconde");
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
		console.log("new con");
		storeLine(targetBall, currentLine, connectionInput.value, true);
	} else if (isAnotherConnection) {
		console.log("another con");
		storeLine(targetBall, currentLine, connectionInput.value, false);
	} else {
		console.log("change line");
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
		removeText();
	}
}

function openConnectionBox(newConnection, anotherConnection) {
	modal.style.display = "block";
	isNewConnection = newConnection;
	if (selectedText) {
		connectionInput.value = selectedText.innerText;
	}
	isAnotherConnection = anotherConnection;
	acceptBtn.addEventListener('click', acceptModel);
	cancelBtn.addEventListener('click', cancelModel);
	connectionInput.addEventListener('keydown', connectionBoxKeyController);
}