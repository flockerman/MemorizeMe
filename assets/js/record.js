$(document).ready(function () {
	$("#mic").mousedown(function () {
    record();
	})
	$("#mic").mouseup(function () {
    mediaRec.stopRecord();
	})

});
// Record audio
//
function recordAudio() {
	var src = "myrecording.amr";
	var mediaRec = new Media(src, onSuccess, onError);

	// Record audio
	mediaRec.startRecord();

	/*// Stop recording after 10 sec
	var recTime = 0;
	var recInterval = setInterval(function () {
		recTime = recTime + 1;
		setAudioPosition(recTime + " sec");
		if (recTime >= 10) {
			clearInterval(recInterval);
			mediaRec.stopRecord();
		}
	}, 1000);*/
}

// device APIs are available
//
function record() {
	recordAudio();
}

// onSuccess Callback
//
function onSuccess() {
	console.log("recordAudio():Audio Success");
}

// onError Callback
//
function onError(error) {
	alert('code: ' + error.code + '\n' +
		'message: ' + error.message + '\n');
}

// Set audio position
//
function setAudioPosition(position) {
	document.getElementById('audio_position').innerHTML = position;
}


function playAudio(url) {
	// Play the audio file at url
	var my_media = new Media(url,
		// success callback
		function () {
			console.log("playAudio():Audio Success");
		},
		// error callback
		function (err) {
			console.log("playAudio():Audio Error: " + err);
		}
	);
	// Play audio
	my_media.play();
}