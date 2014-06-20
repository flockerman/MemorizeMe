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
	obj[localStorage.currentSection].push({"text": $("#verseInput").val() ,"reference":$("#referenceInput").val() ,"id":obj[localStorage.currentSection].length+1});
	localStorage[storage]  = JSON.stringify(obj);
}