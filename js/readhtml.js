function readHTML (filename, htmlObj) {
    var file = new XMLHttpRequest();
    file.open("GET", filename, true);
    file.onreadystatechange = function() {
	if ((file.readyState == 4) && (file.status == 200)) {
	    htmlObj.innerHTML = file.responseText;
	}
    }
    file.send();
}