function restoreMachine(states, connections) {
	for (let i = 0; i < states.length; i++) {
		makeState(null, states[i].pk, states[i].fields.left, states[i].fields.top, states[i].fields.name, states[i].fields.value, states[i].pk == initialStateID);
	}
	for (let i = 0; i < connections.length; i++) {
		let originId = 'state-ball-' + connections[i].fields.origin;
		let targetId = 'state-ball-' + connections[i].fields.target;
		originBall = document.getElementById(originId);
		let tempTargetBall = document.getElementById(targetId);
		if (!localConnections[originBall.id]) {
			makeLine();
			let slope = drawMainArrow(tempTargetBall.offsetLeft + diameter / 2, tempTargetBall.offsetTop + diameter / 2);
			currentLine.id = 'line-' + originBall.id.substr(11) + '-' + tempTargetBall.id.substr(11);
			makeTransitionContainer(currentLine, connections[i].fields.transition, slope);
			localConnections[originBall.id] = [];
			localConnections[originBall.id].push(new Connection(tempTargetBall, currentLine, [connections[i].fields.transition], slope));
		} else {
			let lineIndex = null;
			for (let j = 0; j < localConnections[originBall.id].length; j++) {
				if (localConnections[originBall.id][j].target == tempTargetBall) {
					lineIndex = j;
					break;
				}
			}
			if (lineIndex != null) {
				currentLine = localConnections[originBall.id][lineIndex].path;
				makeTransitionText(currentLine, connections[i].fields.transition, localConnections[originBall.id][lineIndex].angle);
				localConnections[originBall.id][lineIndex].transitions.push(connections[i].fields.transition);
			} else {
				makeLine();
				let slope = drawMainArrow(tempTargetBall.offsetLeft + diameter / 2, tempTargetBall.offsetTop + diameter / 2);
				currentLine.id = 'line-' + originBall.id.substr(11) + '-' + tempTargetBall.id.substr(11);
				makeTransitionContainer(currentLine, connections[i].fields.transition, slope);
				localConnections[originBall.id].push(new Connection(tempTargetBall, currentLine, [connections[i].fields.transition], slope));
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