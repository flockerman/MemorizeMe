/*******************************
 * Global Variables
 *******************************/

var json; //Eliminates redundant server calls by globally caching the data
var verseNumber, packSection;
var debug = true;
//configuration
var stockPack = "SummerPack.json"; //url to stock pack to be used

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
	//subtract the header, nav size, padding for nav, and jqueryMobile menus that are hidden
	var newHeight = window.innerHeight - 50 - $("#knownButton").height() - 26.22 - 40+ "px"; 
	$(".versecontainer").css("height", newHeight);
}




/******************************
 * function populate()
 * Parse the JSON object and populate the app with data.
 *   = storageName: name of localStorage array to load
 *   = packSectionName: which section of the pack should be loaded?
 ******************************/
function populate(storageName, packSectionName) {
	if (localStorage[storageName]) { //Check that the data loaded properly
		jsonObject = JSON.parse(localStorage[storageName]);

		//generate the verses for this pack
		for (var key in jsonObject[packSectionName]) {
			$("#versecontainer").append('<div class="verse" data-role="collapsible" data-collapsed-icon="" data-expanded-icon="" data-inset="false" style="margin: 0px;"><h4><center>' + jsonObject[packSectionName][key].reference + '</center><a onclick="toggleVerseMenu(' + jsonObject[packSectionName][key].id + '); "><img src="assets/menu.png" class="menu" /></a></h4><p>' + jsonObject[packSectionName][key].text + '</p></div>').trigger('create');
		}

		// Update the pack name on the screen
		$("#headerText").html(jsonObject.packName);

		//Check if the user is authorized to add verses to this pack
		if (jsonObject.userPack == "true") {
			$("#versecontainer").append('<a href="#" id="addVerseButton" class="ui-btn ui-icon-delete ui-btn-icon-right ui-icon-plus" onclick="window.location=addVerse.html">Add a Verse</a>').trigger('create');
			$('#addVerseButton').click(function () {
				window.location.href = "addVerse.html";
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
			success: function (data) { //initialize for first use				
				json = JSON.parse(data);
				var systemname = json.packName.replace(/ /g, '');
				localStorage.setObject(systemname, json);

				// Create the pack list default settings
				localStorage.packList = '{"defaultPack":"' + systemname + '","currentPackName":"","packs": [{"userName": "' + json.packName + '","systemName": "' + systemname + '","id":"1"}]}';
				populate(systemname, "working"); //update user
			}
		})
	} else { //required files exist, proceed with display
		if (localStorage["changePack"]) {
			if(debug){console.log("Pack changed to "+localStorage["changePack"]);}
			populate(localStorage["changePack"], "working");
			localStorage.currentPack = localStorage["changePack"];
			localStorage.removeItem("changePack");
		} else {
			var jsonObject = JSON.parse(localStorage["packList"]);
			populate(jsonObject.defaultPack, 'working');
			localStorage.currentPack = jsonObject.defaultPack;
			packSection = "working"; // update current section in use
		}
	}
}



/*****************************************
 * function toggleVerseMenu()
 * Displays the popup menu for the verses
 *****************************************/

function toggleVerseMenu(num) { // Pop up menu 
	$('#popupMenu').popup("open");
	verseNumber = num;
};


/******************************************
 * function clearScreen()
 * A simple function to clear the verse screen for a redraw
 ******************************************/

function clearScreen() {
	$("#versecontainer").empty();
}


/****************************************
 * function removeVerse()
 * Removes a verse a pack
   = storageName: name of the pack being edited
	 = packSectionName: name of the section being edited
	 = idNumber: "id" of verse that is being edited
 ****************************************/

function removeVerse(storageName, packSectionName, idNumber) {

	var jsonObject = JSON.parse(localStorage[storageName]);
	for (var key in jsonObject[packSectionName]) {
		if (jsonObject[packSectionName][key].id == idNumber) {
			jsonObject[packSectionName].splice(key, 1);
		} else continue
	}

	localStorage[storageName] = JSON.stringify(jsonObject);
	clearScreen();
	populate(storageName, packSectionName);
}