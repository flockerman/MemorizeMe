/*******************************
 * Global Variables
 *******************************/
var json; //Eliminates redundant server calls by globally caching the data

//configuration
var stockPack = "SummerPack.json" //url to stock pack to be used

/*******************************
 * Helper Prototypes
 *******************************/

Storage.prototype.setObject = function (key, value) {
	this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function (key) {
	var value = this.getItem(key);
	return value && JSON.parse(value);
}

/******************************
 *  function loadVerses()
 *  Load Verses from the Server and populate the screen.
 *   = location: URL that the JSON is coming from.
 *	 = storageName: localStorage name to store the JSON under.
 ******************************/

function loadVerses(location, storageName) {
	$.ajax({
		url: location,
		dataType: "text",
		success: function (data) {
			json = JSON.parse(data);
			localStorage.setObject(storageName, json);

			//Enable when Quizlet Integration is added

			/*if (localStorage.quizlet == "true") {
				quizlet_populate(currentVerse);
			} else {*/

			populate(storageName);
			return json;
		}
	})
}


/******************************
 * function fixHeight()
 * Redraws the interface after calculating the exact measurments. Guarentees a beautiful interface on every device.
 ******************************/
function fixHeight() {
	var newHeight = window.innerHeight - 50 - $("#knownButton").height() - 26.22 + "px"; //subtract the header, nav size, and padding for nav
	$(".versecontainer").css("height", newHeight);
}

/******************************
 * function populate()
 * Parse the JSON object and populate the app with data.
 *   = storageName: name of localStorage array to load
 ******************************/
function populate(storageName, packSectionName) {
	if (localStorage[storageName]) { //Check that the data loaded properly
		jsonObject = JSON.parse(localStorage[storageName]);

		//generate the verses for this pack
		for (var key in jsonObject[packSectionName]) {
			$("#versecontainer").append('<div class="verse" data-role="collapsible" data-collapsed-icon="" data-expanded-icon="" data-inset="false" style="margin: 0px;"><h4><center>' + jsonObject[packSectionName][key].reference + '</center><a onclick=""><img src="assets/menu.png" class="menu" /></a></h4><p>' + jsonObject[packSectionName][key].text + '</p></div>').trigger('create');
		}

		// Update the pack name on the screen
		$("#headerText").html(jsonObject.packName);

		//Check if the user is authorized to add verses to this pack
		if (jsonObject.userPack == "true") {
			$("#versecontainer").append('<a href="#" id="addVerseButton" class="ui-btn ui-icon-delete ui-btn-icon-right ui-icon-plus" onclick="window.location=addVerse.html">Add a Verse</a>').trigger('create');
			$('#addVerseButton').click(function(){
			  window.location = 'addVerse.html';
			});
		}

		fixHeight(); //redraw the interface

	} else { //Catch the error if the data is missing. Alert the user.

		/** TODO *********
		 * Attach to a nicer user alert interface for mobile devices
		 *****************/

		alert("There appears to be no data loaded. Please restart the app and try again.");
	}
}


/*************************************
 * function addVerse()
 * Adds a verse to the verse pack
     = storageName: localStorage name to store the new data under.
 *************************************/
function addVerse(storageName) {
	if (localStorage[storageName]) {
		var json = JSON.parse(localStorage[storageName])
		json.verse.push({
			text: $("#verseInput").val(),
			reference: $("#versionInput").val(),
			version: $("#versionInput").val()
		});
		localStorage.setItem('userAdded', JSON.stringify(json));
	} else {
		var holder = '{"verse":[{"text":"' + $("#verseInput").val() + '","reference":"' + $("#versionInput").val() + '","version":"' + $("#versionInput").val() + '"}]}';
		localStorage.setItem('userAdded', holder);
	}
}


/************************************
 * function initializeApp()
 * Initialize the app for first time use and more
 ************************************/

function initializeApp() {

	// verify required settings are present
	if (!localStorage["packList"]) {
		$.ajax({
			url: stockPack,
			dataType: "text",
			success: function (data) {

				//initialize for first use
				json = JSON.parse(data);
				localStorage.setObject('currentPack', json);

				// Create the pack list default settings
				var systemname = json.packName.replace(/ /g, '');
				localStorage.packList = '{"defaultPack":"' + systemname + '","packs": [{"userName": "' + json.packName + '","systemName": "' + systemname + '"}]}';

				//run first use if needed
				if (!localStorage["firstUse"]) {
					localStorage.firstUse = true;
				} else { //catch Errors
					alert("Something went wrong with the stored data. Please resync your data.");
				}
				populate("currentPack", "working"); //update user
			}
		})
	} else { //required files exist, proceed with display
		populate('currentPack','working');
	}
}