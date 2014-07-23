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
function fixHeight(adjustment) {
	//subtract the header and nav size 
	var newHeight = window.innerHeight - 50 - $("#knownButton").outerHeight() - adjustment + "px";
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
		var jsonObject = JSON.parse(localStorage[storageName]);
		var up = JSON.parse(localStorage.userProfile);

		//bug fix for issue with height when there are no verses in the queue
		var counter = 0;

		//generate the verses for this pack
		for (var key in jsonObject["data"]) {
			var ident = jsonObject["data"][key].id;
			for (var num in up["userProfile"][storageName]) {
				if (up["userProfile"][storageName][num].id == ident) {
					var queue = up["userProfile"][storageName][num].queue;
					if (packSectionName == "all") {
						if (queue == "A") {
							$("#versecontainer").append('<div class="verse" data-role="collapsible" data-collapsed-icon="" data-expanded-icon="" data-inset="false" style="margin: 0px;"><h4><center>' + jsonObject["data"][key].reference + ' (' + jsonObject["data"][key].version + ')</center><a onclick="toggleVerseMenu(' + ident + '); "><img src="assets/img/menu.png" class="menu" /></a></h4><p>' + jsonObject["data"][key].text + '</p></div>').trigger('create');
							counter++;
						} else if (queue == "W") {
							$("#versecontainer").append('<div class="verse" data-role="collapsible" data-collapsed-icon="" data-expanded-icon="" data-inset="false" style="margin: 0px;"><h4><center><img src="assets/img/working_icon.png" class="icons" />' + jsonObject["data"][key].reference + ' (' + jsonObject["data"][key].version + ')</center><a onclick="toggleVerseMenu(' + ident + '); "><img src="assets/img/menu.png" class="menu" /></a></h4><p>' + jsonObject["data"][key].text + '</p></div>').trigger('create');
							counter++;
						} else if (queue == "K") {
							$("#versecontainer").append('<div class="verse" data-role="collapsible" data-collapsed-icon="" data-expanded-icon="" data-inset="false" style="margin: 0px;"><h4><center><img src="assets/img/known_icon.png" class="icons" />' + jsonObject["data"][key].reference + ' (' + jsonObject["data"][key].version + ')</center><a onclick="toggleVerseMenu(' + ident + '); "><img src="assets/img/menu.png" class="menu" /></a></h4><p>' + jsonObject["data"][key].text + '</p></div>').trigger('create');
							counter++;
						}


					} else if (packSectionName == "working" && queue == "W") {
						$("#versecontainer").append('<div class="verse" data-role="collapsible" data-collapsed-icon="" data-expanded-icon="" data-inset="false" style="margin: 0px;"><h4><center>' + jsonObject["data"][key].reference + ' (' + jsonObject["data"][key].version + ')</center><a onclick="toggleVerseMenu(' + ident + '); "><img src="assets/img/menu.png" class="menu" /></a></h4><p>' + jsonObject["data"][key].text + '</p></div>').trigger('create');
						counter++;
					} else if (packSectionName == "known" && queue == "K") {
						$("#versecontainer").append('<div class="verse" data-role="collapsible" data-collapsed-icon="" data-expanded-icon="" data-inset="false" style="margin: 0px;"><h4><center>' + jsonObject["data"][key].reference + ' (' + jsonObject["data"][key].version + ')</center><a onclick="toggleVerseMenu(' + ident + '); "><img src="assets/img/menu.png" class="menu" /></a></h4><p>' + jsonObject["data"][key].text + '</p></div>').trigger('create');
						counter++;
					}
				}
			}
		}

		// Update the pack name on the screen
		$("#headerText").html(jsonObject.packName);

		//Check if the user is authorized to add verses to this pack and
		//the current section is not known
		if (jsonObject.userPack == "true" && localStorage.currentSection != "known") {
			var local = JSON.parse(localStorage.localization);
			$("#versecontainer").append('<a href="#" id="addVerseButton" class="ui-btn ui-icon-delete ui-btn-icon-right ui-icon-plus" onclick="window.location=addVerse.html">' + local["home"]["7"] + '</a>').trigger('create');

			// bind a click event to the newly generated button
			$('#addVerseButton').click(function () {
				window.location.href = "addVerse.html";
			});
		}

		//redraw the interface
		if (counter > 0) {
			fixHeight(0);
		} else if (counter == 0 && localStorage.currentSection == "working") {
			fixHeight(8);
		} else if (counter == 0 && localStorage.currentSection == "known") {
			fixHeight(0);
		}
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
		console.log("All Clear!");
		$.ajax({
			url: stockPack,
			dataType: "text",
			success: function (data) { //initialize for first use				
				json = JSON.parse(data);
				//var systemname = json.packName.replace(/ /g, '');
				var d = new Date();
				var systemname = d.getTime() + Math.uuid(10, 16)
				localStorage.setObject(systemname, json);

				// Create the pack list default settings
				localStorage.packList = '{"defaultPack":"' + systemname + '","packs": [{"userName": "' + json.packName + '","systemName": "' + systemname + '","id":"1"}]}';
				localStorage.currentPack = systemname;
				localStorage.currentSection = "all";
				makeUserSettings();
				populate(systemname, "all"); //update users screen
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
	//ajust menu based on context
	var local = JSON.parse(localStorage.localization);
	if (localStorage.currentSection == "all" || localStorage.currentSection == "known") {
		$("#menu_move_verse").html(local["verseMenu"]["4"]["1"]);
	} else if (localStorage.currentSection == "working") {
		$("#menu_move_verse").html(local["verseMenu"]["4"]["2"]);
	}
	//show the menu
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
	$("#" + localStorage.currentSection + "Button").addClass("selected");
}


/********************************************
 * function removeSelected()
 * Removes the background that is added from addSelected()
 ********************************************/
function removeSelected() {
	$("#" + localStorage.currentSection + "Button").removeClass("selected");
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
		var pack = JSON.parse(localStorage[storageName]);
		var up = JSON.parse(localStorage.userProfile);

		for (var key in pack["data"]) {
			if (pack["data"][key].id == idNumber) {
				pack["data"].splice(key, 1);
			}
		}
		if (debug) {
			console.log("Removed from Pack");
		};
		for (var key in up["userProfile"][storageName]) {
			if (up["userProfile"][storageName][key].id == idNumber) {
				up["userProfile"][storageName].splice(key, 1);
			}
		}
		if (debug) {
			console.log("Removed from User Profile");
		}
		localStorage[storageName] = JSON.stringify(pack);
		localStorage.userProfile = JSON.stringify(up);
		clearScreen();
		populate(storageName, packSectionName);
	}
}

/******************************************
 * function moveVerse()
 * Moves a verse between sections in a pack
 *  = location: the name of the section to move the verse to
 ******************************************/
function moveVerse(location) {
	var pack = localStorage.currentPack;
	var section = localStorage.currentSection;
	var profile = JSON.parse(localStorage.userProfile); //get the user's profile
	var change;

	for (var key in profile["userProfile"][pack]) {
		if (profile["userProfile"][pack][key].id == verseNumber) { //find the right verse
			switch (location) {
			case "all":
				change = "A";
				break;
			case "working":
				change = "W";
				break;
			case "known":
				change = "K";
				break;
			};
			profile["userProfile"][pack][key].queue = change;
			localStorage.userProfile = JSON.stringify(profile); // put the user's profile back
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


/********************************************
 * function makeUserSettings()
 * Generates the User Profile if it does not exist
 ********************************************/
function makeUserSettings() {
	/* Test Styles
		 1. Question
		 2. Reference
		 3. Verse
		 4. Fill in the Blank
		 5. Random*/
	var packlist = JSON.parse(localStorage.packList),
		array = [],
		final = new Object,
		sysname;

	for (var key in packlist["packs"]) {
		sysname = packlist["packs"][key].systemName;
		var json = JSON.parse(localStorage[sysname]);
		for (var key in json["data"]) {
			var obj = new Object();
			ident = json['data'][key].id;
			obj.id = ident;
			obj.queue = "A";
			obj.correct = 0;
			array.push(obj);
		};
		final[sysname] = array;
	};
	localStorage.userProfile = '{"uuid": "","userProfile": ' + JSON.stringify(final) + ',"userSettings": {"moveToKnown": "6","wolTestStyle": "1","customTestStyle": "2","showHelp":"true"}}';
}

/********************************************
 * function resetCorrect()
 * Resets the correct count for a verse
 ********************************************/
function resetCorrect() {
	var up = JSON.parse(localStorage.userProfile);
	for (var key in up["userProfile"][localStorage.currentPack]) {
		if (up["userProfile"][localStorage.currentPack][key].id == verseNumber) {
			up["userProfile"][localStorage.currentPack][key].correct = 0;
		}
	}
	localStorage.userProfile = JSON.stringify(up);
}

//TODO: Possibly optimize this 
function localize(where) {
	if (!localStorage.localization) {
		$.ajax({
			url: "assets/local-en-us.json",
			dataType: "text",
			success: function (data) {
						localStorage.localization = data;
				showLocal(where);
			}
		})
	} else {
		showLocal(where);
	}
}

function showLocal(where) {
	var local = JSON.parse(localStorage.localization);
	if (where == "home") {
		//Interface Buttons
		$("#1").html(local["home"]["1"]);
		$("#2").html(local["home"]["2"]);
		$("#3").html(local["home"]["3"]);
		$("#4").html(local["home"]["4"]);
		$("#5").html(local["home"]["5"]);
		$("#testButton").html(local["home"]["6"]);

		//Pack Menu
		$("#pack_menu").html(local["packMenu"]["1"]);
		$("#pack_choose").html(local["packMenu"]["2"]);
		$("#pack_add").html(local["packMenu"]["3"]);
		$("#pack_remove").html(local["packMenu"]["4"]);

		//Verse Menu

		$("#verse_menu").html(local["verseMenu"]["1"]);
		$("#menu_Edit").html(local["verseMenu"]["2"]);
		$("#menu_Share").html(local["verseMenu"]["3"]);
		$("#menu_MovePacks").html(local["verseMenu"]["5"]);
		$("#menu_Delete").html(local["verseMenu"]["6"]);

	}
	$(document).trigger("localize");
}