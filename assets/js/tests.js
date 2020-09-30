document.querySelector('#test-form').addEventListener('submit', function(e) {
	e.preventDefault();
	const csrftoken = getCookie('csrftoken');
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "testSample/", true);
	xhr.onload = function() {
		if (this.status == 200) {
			responseBox.innerText = this.responseText;
		}
	}
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('testSample', document.getElementById('test-sample').value);
	data.append('initialStateID', initialStateID);
	xhr.send(data);
});

document.querySelector('#multi-test-form').addEventListener('submit', function(e) {
	e.preventDefault();
	const csrftoken = getCookie('csrftoken');
	let xhr = new XMLHttpRequest();
	xhr.open('POST', "multiTestSample/", true);
	xhr.onload = function(responseData) {
		if (this.status == 200) {
			multiResponseBox.remove();
			multiResponseBox = document.createElement('div');
			multiResponseBox.className = 'multi-response-box';
			let prefix = 'Accept: ';
			let responses = [];
			responses.push(JSON.parse(this.responseText).posResponse);
			responses.push(JSON.parse(this.responseText).negResponse);
			for (let i = 0; i < responses.length; i++) {
				let responseString = responses[i];
				for (let j = 0; j < responseString.length; j++) {
					let responseLine = document.createElement('div');
					responseLine.className = 'response-line';
					if (responseString.charAt(j) == '0') {
						responseLine.innerText = prefix + 'False';
						responseLine.style.backgroundColor = 'red';
					} else {
						responseLine.innerText = prefix + 'True';
						responseLine.style.backgroundColor = 'green';
					}
					multiResponseBox.append(responseLine);
				}
				prefix = 'Reject: ';
			}
			leftBarBox4.append(multiResponseBox);
		}
	}
	xhr.setRequestHeader('X-CSRFToken', csrftoken);
	let data = new FormData();
	data.append('testSamplePositive', document.getElementById('multi-test-sample-positive').value);
	data.append('testSampleNegative', document.getElementById('multi-test-sample-negative').value);
	data.append('initialStateID', initialStateID);
	xhr.send(data);
});