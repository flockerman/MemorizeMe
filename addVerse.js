//helper functions
Storage.prototype.setObject = function (key, value) {
	this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function (key) {
	var value = this.getItem(key);
	return value && JSON.parse(value);
}

function addVerse(storage)
{
	var obj = localStorage.getObject(storage);
	obj["working"].push({"text": $("#verseInput").val() ,"reference":$("#referenceInput").val()});
	localStorage[storage]  = JSON.stringify(obj);
}