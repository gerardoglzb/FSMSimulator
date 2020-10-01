function restoreMachine(states, connections) {
	for (let i = 0; i < states.length; i++) {
		makeState(null, states[i].pk, states[i].fields.left, states[i].fields.top, states[i].fields.name, states[i].fields.value, states[i].pk == initialStateID);
	}
	for (let i = 0; i < connections.length; i++) { // checks every connection in the DB
		let originId = 'state-ball-' + connections[i].fields.origin;
		let targetId = 'state-ball-' + connections[i].fields.target;
		originBall = document.getElementById(originId);
		let tempTargetBall = document.getElementById(targetId);
		let lineFound = false;
		if (!localConnections[originBall.id]) { // if this is the first connection coming out of this ball...
			let slope = 0;
			let isReversed = false;
			if (originBall == tempTargetBall) { // if it's a circular connection
				makeCircle(originBall);
				makeTransitionContainer(currentLine, connections[i].fields.transition, slope, true);
			} else { // if it's connecting to another state
				if (localConnections[tempTargetBall.id]) { // if the target state has arrows coming out of it
					for (let j = 0; j < localConnections[tempTargetBall.id].length; j++) {
						if (localConnections[tempTargetBall.id][j].target == originBall) {
							secondArrow(localConnections[tempTargetBall.id][j].path, connections[i].fields.transition, localConnections[tempTargetBall.id][j].angle);
							slope = localConnections[tempTargetBall.id][j].slope;
							isReversed = true;
							lineFound = true; // an arrow from the target is pointing to he origin
						}
					}
				}
				if (!lineFound) {
					makeLine();
					slope = drawMainArrow(tempTargetBall.offsetLeft + diameter / 2, tempTargetBall.offsetTop + diameter / 2);
					makeTransitionContainer(currentLine, connections[i].fields.transition, slope, false);
				}
			}
			if (!lineFound) {
				currentLine.id = 'line-' + originBall.id.substr(11) + '-' + tempTargetBall.id.substr(11);
			}
			localConnections[originBall.id] = [];
			localConnections[originBall.id].push(new Connection(tempTargetBall, currentLine, [connections[i].fields.transition], slope, isReversed));
		} else { // if this isn't the first connection from this state
			let lineIndex = null;
			for (let j = 0; j < localConnections[originBall.id].length; j++) { // if there's a line going to that state already
				if (localConnections[originBall.id][j].target == tempTargetBall) {
					lineIndex = j;
					break;
				}
			}
			if (lineIndex != null) {
				currentLine = localConnections[originBall.id][lineIndex].path;
				makeTransitionText(currentLine, connections[i].fields.transition, localConnections[originBall.id][lineIndex].angle, currentLine.className == 'connection-circle', localConnections[originBall.id][lineIndex].isReversed);
				localConnections[originBall.id][lineIndex].transitions.push(connections[i].fields.transition);
			} else {
				let slope = 0;
				let isReversed = false;
				if (originBall == tempTargetBall) { // if it's a circular connection
					makeCircle(originBall);
					makeTransitionContainer(currentLine, connections[i].fields.transition, slope, true);
				} else {
				if (localConnections[tempTargetBall.id]) {
					for (let j = 0; j < localConnections[tempTargetBall.id].length; j++) {
						if (localConnections[tempTargetBall.id][j].target == originBall) {
							isReversed = true;
							slope = localConnections[tempTargetBall.id][j].angle;
							secondArrow(localConnections[tempTargetBall.id][j].path, connections[i].fields.transition, slope);
							lineFound = true;
						}
					}
				}
				if (!lineFound) {
					makeLine();
					slope = drawMainArrow(tempTargetBall.offsetLeft + diameter / 2, tempTargetBall.offsetTop + diameter / 2);
					makeTransitionContainer(currentLine, connections[i].fields.transition, slope, false);
				}
				}
				if (!lineFound) {
					currentLine.id = 'line-' + originBall.id.substr(11) + '-' + tempTargetBall.id.substr(11);
				}
				localConnections[originBall.id].push(new Connection(tempTargetBall, currentLine, [connections[i].fields.transition], slope, isReversed));
			}
		}
	}
}

function startScript(isNewSession, states, connections) {
	if (isNewSession == 'True') {
		newState(isNewSession, null);
	} else {
		restoreMachine(states, connections);
	}
}

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

// Function for getting token for ajax call
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

pressingCanvas.addEventListener("dblclick", function(e) {
	e = e || window.event;
	newState(false, e);
});