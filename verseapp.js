/******************
 * Global Variables
 ******************/
var currentVerse = 1; //************DOES THIS GET USED?*****************
var json;
var maxVerse; //******** DOES THIS GET USED??***********************

//Check for Quizlet Mode
if (localStorage.quizlet == "true") {
	var quizlet = true;
} else {
	var quizlet = false;
};


Storage.prototype.setObject = function (key, value) {
	this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function (key) {
	var value = this.getItem(key);
	return value && JSON.parse(value);
}

/******************************
 *  Load Verses from the Server.
 *   - location: URL that the JSON is coming from.
 *	 - storageName: localStorage name to store the JSON under.
 ******************************/

function loadVerses(location, storageName) {
	$.ajax({
		url: location,
		dataType: "text", //force to handle it as text
		success: function (data) {
			json = JSON.parse(data);
			localStorage.setObject(storageName, json);
			/*if (quizlet) {
				quizlet_populate(currentVerse);
			} else {*/
			populate(storageName);

		}
	})
}

/******************************
 *
 *
 ******************************/
function populate(storageName) {
	if (localStorage[storageName]) {
		jsonObject = JSON.parse(localStorage[storageName]);

		//generate the verses for this pack
		for (var key in jsonObject.verse) {
			$("#versecontainer").append('<div class="verse" data-role="collapsible" data-collapsed-icon="" data-expanded-icon="" data-inset="false" style="margin: 0px;"><h4><center>' + jsonObject.verse[key].reference + '</center><a onclick=""><img src="assets/menu.png" class="menu" /></a></h4><p>' + jsonObject.verse[key].text + '</p></div>').trigger('create');
		}

		// change the pack name
		$("#header").html(jsonObject.packName);

		//Check if the user is authorized to add verses to this pack
		if (jsonObject.userPack == "true") {
			$("#versecontainer").append('<a href="#" class="ui-btn ui-icon-delete ui-btn-icon-right">Add a Verse</a>').trigger('create');
		} else {

		}
		fixHeight();

	} else {
		alert("There appears to be no data loaded. Please restart the app."); //*******MAKE MORE USER FRIENDLY*******
	}
}

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