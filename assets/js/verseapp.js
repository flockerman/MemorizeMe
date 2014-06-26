/*******************************
 * Global Variables
 *******************************/

var json; //Eliminates redundant server calls by globally caching the data
var verseNumber; //used to easily pass "id" numbers for functions
var debug = false; //turn on debugging

//configuration
var stockPack = "assets/SummerPack.json"; //url to the stock pack that comes with the app

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
	var newHeight = window.innerHeight - 50 - $("#knownButton").height() - 26.22 - 40 + "px";
	$(".versecontainer").css("height", newHeight);
}


/******************************
 * function populate()
 * Parse the JSON object and populate the app with data.
 *   = storageName: name of localStorage array to load
 *   = packSectionName: which section of the pack should be loaded
 *
 * TODO: potentially eliminate packSectionName due to localStorage.currentSection
 ******************************/

function populate(storageName, packSectionName) {
	if (localStorage[storageName]) { //Check that the data loaded properly
		jsonObject = JSON.parse(localStorage[storageName]);

		//generate the verses for this pack
		for (var key in jsonObject[packSectionName]) {
			$("#versecontainer").append('<div class="verse" data-role="collapsible" data-collapsed-icon="" data-expanded-icon="" data-inset="false" style="margin: 0px;"><h4><center>' + jsonObject[packSectionName][key].reference + ' (' + jsonObject[packSectionName][key].version + ')</center><a onclick="toggleVerseMenu(' + jsonObject[packSectionName][key].id + '); "><img src="assets/img/menu.png" class="menu" /></a></h4><p>' + jsonObject[packSectionName][key].text + '</p></div>').trigger('create');
		}

		// Update the pack name on the screen
		$("#headerText").html(jsonObject.packName);

		//Check if the user is authorized to add verses to this pack
		if (jsonObject.userPack == "true") {
			$("#versecontainer").append('<a href="#" id="addVerseButton" class="ui-btn ui-icon-delete ui-btn-icon-right ui-icon-plus" onclick="window.location=addVerse.html">Add a Verse</a>').trigger('create');

			// bind a click event to the newly generated button
			$('#addVerseButton').click(function () {
				window.location.href = "addVerse.html";
			});
		}

		fixHeight(); //redraw the interface
		addSelected();

	} else { //Catch the error if the data is missing. Alert the user.
		alert("There appears to be no data loaded. Please restart the app and try again.");
	}
}


/************************************
 * function initializeApp()
 * Initialize the app for first time use and more
 ************************************/

function initializeApp() {

	// verify required settings are present
	if (!localStorage["packList"]) {
		makeUserProfile();
		$.ajax({
			url: stockPack,
			dataType: "text",
			success: function (data) { //initialize for first use				
				json = JSON.parse(data);
				var systemname = json.packName.replace(/ /g, '');
				localStorage.setObject(systemname, json);

				// Create the pack list default settings
				localStorage.packList = '{"defaultPack":"' + systemname + '","packs": [{"userName": "' + json.packName + '","systemName": "' + systemname + '","id":"1"}]}';
				localStorage["currentPack"] = systemname;
				localStorage["currentSection"] = "other";
				populate(systemname, "other"); //update users screen
			}
		})
	} else { //required files exist, proceed with display

		//process a pack change
		if (localStorage["changePack"]) {
			if (debug) {
				console.log("Pack changed to " + localStorage.changePack);
			}
			populate(localStorage.changePack, localStorage.currentSection);
			localStorage.currentPack = localStorage.changePack;
			localStorage.removeItem("changePack");

		}
		// process the current pack selected
		else if (localStorage["currentPack"]) {
			populate(localStorage["currentPack"], localStorage["currentSection"]);

		}
		// if this is not first run and the user has not added anything that needs processing, process the default pack
		else {
			var jsonObject = JSON.parse(localStorage["packList"]);
			populate(jsonObject.defaultPack, localStorage.currentSection);
			localStorage["currentPack"] = jsonObject.defaultPack;
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


/********************************************
 * function addSelected()
 * Visually displays the current pack section to the user by changing the color of the button
 ********************************************/
function addSelected() {
	if (localStorage.currentSection == "other") {
		$("#allButton").addClass("selected");
	} else {
		$("#" + localStorage.currentSection + "Button").addClass("selected");
	}
}


/********************************************
 * function removeSelected()
 * Removes the background that is added from addSelected()
 ********************************************/
function removeSelected() {
	if (localStorage.currentSection == "other") {
		$("#allButton").removeClass("selected");
	} else {

		$("#" + localStorage.currentSection + "Button").removeClass("selected");
	}


}
/****************************************
 * function removeVerse()
 * Removes a verse a pack
 *  = storageName: name of the pack being edited
 *  = packSectionName: name of the section being edited
 *  = idNumber: "id" of verse that is being edited
 ****************************************/

function removeVerse(storageName, packSectionName, idNumber) {
	//prevent accidental deletion
	if (confirm("Are you sure you want to delete this verse?") == true) {
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
}

/******************************************
 * function moveVerse()
 * Moves a verse between sections in a pack
 *  = location: the name of the section to move the verse to
 *
 * TODO: this can be optimized with array manupulation instead of the holder var
 ******************************************/

function moveVerse(location) {
	var pack = localStorage.currentPack;
	var section = localStorage.currentSection;
	var jsonObject = JSON.parse(localStorage[pack]); //get the pack
	for (var key in jsonObject[section]) {
		if (jsonObject[section][key].id == verseNumber) { //find the right verse
			jsonObject[location].push({
				"text": jsonObject[section][key].text,
				"reference": jsonObject[section][key].reference,
				"id": jsonObject[location].length + 1,
				"version": jsonObject[section][key].version
			});
			jsonObject[section].splice(key, 1); //remove the old data
			localStorage[pack] = JSON.stringify(jsonObject);
			clearScreen();
			populate(pack, section);
		}
	}
}


/********************************************
 * function changeSection()
 * Changes the section in the current pack
 *  = section: name of section to change to
 ********************************************/

function changeSection(section) {
	removeSelected();
	localStorage.currentSection = section;
	clearScreen();
	populate(localStorage.currentPack, section);

}

function makeUserProfile() {
	/*
	   Test Styles
		 1. Question
		 2. Reference
		 3. Verse
		 4. Fill in the Blank
		 5. Random
	*/
	var d = new Date();
	var uuid = d.getTime() + Math.uuid(10, 16);
	localStorage.userProfile = '{"uuid": "' + uuid + '","userProfile":"","userSettings": [{"moveToKnown": "6","wolTestStyle": "1","customTestStyle":"2"}]}';
}