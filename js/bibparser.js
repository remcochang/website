function bibEntry() {
    function formatKeyValue (paper, key, value) {
	
	//format strings to:
	//  (p1) remove extra white spaces beween words
	//  (p2) from latex: change -- to -
	//  (p3 and p4) from latex: remove any command, eg. \toUpper{blah}, except in the note section which will format the string further 
	//     note p3 = latex command, p4 = the formatted string
	//  (p4) from latex: anything that starts with \, for example \&
	
	value = value.replace(/(\s{2,})|(--)|\\(.+){(.*)}|(\\)/g, function(inputstr, p1, p2, p3, p4) {
	    if (p1 != undefined) {
		return ' ';
	    }
	    if (p2 != undefined) {
		return '-';
	    }
	    if ((p3 != undefined) && (p4 != undefined)) {
		if (key == 'note') {
		    return '\\'+p3+'{'+p4+'}';  //if its in the note, allow pass through
		}
		return p3;
	    }
	    if (p4 != undefined) {
		return '';
	    }
	});
	
	switch(key) {
	case 'title':
	    var stopwords = ['to', 'a', 'for', 'of', 'on', 'and', 'from', 'by', 'the', 'an', 'with'];
	    value = value.replace(/{([^}]*)}|^(\w*)|([\w']*)/g, function(inputstr, p2, p3, p4){
		//p2 matches all words surrounded by { and }, which we leave as is
		//p3 matches all the first words of the title, which we capitalize the first letter
		//p4 matches all the other words, which we check against the list of stop words.
		//   if it's a stop word, we use only lower case. 
		//   if it's not a stop word, we capitalize the first character
		if (p2 != undefined) {
		    return p2;
		}
		if (p3 != undefined) {
		    return p3.charAt(0).toUpperCase() + p3.substr(1).toLowerCase();
		}
		else if (p4 != undefined) {
		    var match = false;
		    var match = stopwords.reduce(function(prev, cur) {  //this is dumb, should use a for loop. But playing with functional ideas
			if (p4.toLowerCase() == cur) {
			    return prev | true;
			}
			return prev;
		    }, match);
		    if (match == false) {
			return p4.charAt(0).toUpperCase() + p4.substr(1).toLowerCase();
		    }
		    return p4.toLowerCase();
		}
	    });    
	    break;
	case 'author':
	    var names = value.split('and');
	    names = names.map(function(person) {
		person = person.replace(/([,]+)/, ',');  //for some reason, latex allows double commas in a name, such as Chang,, Remco
		person = person.replace(/([.]+)/, '');  //remove all periods, so that J.K. = JK
		var output = person.split(',');
		if (output.length > 1) {
		    output = output.map(function(elem) {
			return elem.trim();
		    });
		    return output[1] + " " + output[0];
		}
		return output[0].trim();
	    });
	    value = names;
	    break;
	}

	paper[key] = value;
    }
    
    this.parse = function (paper, entry) {
	entry = entry.replace(/[\n\r]/g, '');

	entry.replace(/^([^{]+){([^,]+),(.*)}\s*$/g, function(inputstr, p1, p2, p3) {
	    paper.type = p1.trim();
	    paper.name = p2.trim();
	    p3 = p3.trim();

	    //adding a comma to the last entry so that the regex can pick it up
	    //  without this, the regex cannot distinguish nested parens, for example:
	    //  title={My System {Awesome} is Great}  if there is no comma in the end 
	    //       (which could happen for the last entry of the bib)
	    if (p3.charAt(p3.length-1) != ',') {
		p3 = p3+",";
	    }

	    //super clean parsing of elements in a bib entries... separates into the string before '=' and the string after
	    //  note that the /g in the regex saves writing a loop
	    p3.replace(/(.*?)\s*=\s*[{\"](.*?)[}\"]\s*,\s*/g, function(inputstr, p4, p5) {
		p4 = p4.toLowerCase().trim();
		p5 = p5.trim();
		formatKeyValue(paper, p4, p5);
	    });
	});
    }
}

function bibFile (inputArr) {
    this.allEntries = [];

    this.load3 = async function () {
	var superobj = this;
	var args = Array.prototype.slice.call(arguments);

	for (let arg of args) {
	    var response = await fetch (arg);
	    var data = await response.text();

	    console.log(data);


	    var category = (/.*\/(.*).bib/gi.exec(arg))[1];
	    
	    function trimComments (textfile) {
		var re = /(%+[^\r]*\r)/gi;
		return textfile.replace(re, '').trim();
	    }
	    
	    function parse (allText) {
		return trimComments(allText)
		    .split('@')  //split into an array of bib entries based on @
		    .slice(1)  //slice off the first element (which is empty)
		    .map(function(elem) {  //for each entry, parse
			var paper = new bibEntry();
			paper.parse(paper, elem);
			return paper;
		    });
	    }
	   

	    superobj.allEntries = superobj.allEntries.concat(parse(data)
							     .map(function(entry) {
								 entry.category = category;
								 return entry;
							     }));
	}

	console.log(superobj.allEntries);
	return superobj.allEntries;

    }



    this.load2 = function () {
	var superobj = this;
	var args = Array.prototype.slice.call(arguments);

	var outcome = args.map(async function(arg) {
	//var outcome = await args.reduce(async function(accumulate, arg) {
	    var response = await fetch (arg);
	    var data = await response.text();

	    console.log(data);


	    var category = (/.*\/(.*).bib/gi.exec(arg))[1];
	    
	    function trimComments (textfile) {
		var re = /(%+[^\r]*\r)/gi;
		return textfile.replace(re, '').trim();
	    }
	    
	    function parse (allText) {
		return trimComments(allText)
		    .split('@')  //split into an array of bib entries based on @
		    .slice(1)  //slice off the first element (which is empty)
		    .map(function(elem) {  //for each entry, parse
			var paper = new bibEntry();
			paper.parse(paper, elem);
			return paper;
		    });
	    }
	   

	    superobj.allEntries = superobj.allEntries.concat(parse(data)
							     .map(function(entry) {
								 entry.category = category;
								 return entry;
							     }));
	});

	console.log(superobj.allEntries);
	return superobj.allEntries;

    }


    this.load = async function () {
	var superobj = this;
	var args = Array.prototype.slice.call(arguments);

	const promises = await args.map(async function(arg) {
	    var file = new XMLHttpRequest();
	    file.open("GET", arg, true);
	    
	    var category = (/.*\/(.*).bib/gi.exec(arg))[1];
	    
	    function trimComments (textfile) {
		var re = /(%+[^\r]*\r)/gi;
		return textfile.replace(re, '').trim();
	    }
	    
	    function parse (allText) {
		return trimComments(allText)
		    .split('@')  //split into an array of bib entries based on @
		    .slice(1)  //slice off the first element (which is empty)
		    .map(function(elem) {  //for each entry, parse
			var paper = new bibEntry();
			paper.parse(paper, elem);
			return paper;
		    });
	    }
	    
	    
	    return new Promise (function(resolve, reject) {
		file.onreadystatechange = function() {
		    if (file.readyState != 4) return;
		    if ((file.status >= 200) && (file.status < 300)) {
			superobj.allEntries = superobj.allEntries
			    .concat(parse(file.responseText)
				    .map(function(entry) {
					entry.category = category;
					return entry;
				    }));
			resolve(file);
		    }
		    else {
			reject({status: file.status,
				statusTxt: file.statusText});
		    }
		}
		file.send();
	    });
	});

	return Promise.all(promises);
    }
}
