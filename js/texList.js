function talkListPrinter () {
    this.orderedList = [];

     this.orderList = function (allEntries) {
	var superObj = this;
	this.orderedList = [];
	allEntries.map(function (entry) {
	    
	    if (superObj.orderedList[entry.date.year] == undefined) {
		superObj.orderedList[entry.date.year] = [];
	    }
	    superObj.orderedList[entry.date.year].push(entry);
	});
	
	return this;
    }
    

    this.printTalkList = function (htmlObj) {
	var superObj = this;

	var childNode = htmlObj.firstElementChild;
	if (childNode) {
	    htmlObj.removeChild(childNode);
	}
	
	childNode = document.createElement('span');
	htmlObj.appendChild(childNode);

	//sort the years from recent to past (hight to low)
    	var keys = Object.keys(this.orderedList).sort(function(a, b) {
    	    return b-a;
    	});
	
	keys.map(function (year) {
	    var yearBlock = new element('div')
		//.style('fontw-eight', 'bold')
		//.style('font-size', 'medium')
		.id(year)
		.parent(childNode);
	    
	    var curYearObj = superObj.orderedList[year];
	    curYearObj.map(function(entry) {
		var entryBlock = new element('div')
		    .class('entry');
		
		var linkBlock = new element('div')
		    .parent(entryBlock);
		
		if (entry.ppt != undefined) {
		    var str = entry.ppt.replace('\\', '');
		    var slidesBlock = new element('a')
			.label(entry.title)
			.href('talks/'+year+'/'+str)
			.parent(linkBlock);
		}
		else {
		    linkBlock.label(entry.title);
		}
		
		if (entry.other != undefined) {
		    linkBlock.label(' ');
		    entry.other.trim().replace(/(.*?):(.*)/g, function (inputstr, p1, p2) {
			var othersBlock = new element('a')
			    .label('('+p1+')')
			    .href(p2)
			    .parent(linkBlock);
		    });
		}
		
		entryBlock.style('font-weight', 'normal')
		    .style('font-size', '90%')
		    .parent(yearBlock)
		    //.label('. ')
		    .addChild(new element('span')
			      .style('font-weight', 'bold')
			      .label(entry.name))
		    .label(', ('+entry.location+')')
		    .label('. '+entry.date.day+", "+entry.date.year);
		    //.conditionalLabel(entry.detail, entry.detail);


	    });
	    
	});
	return this;
    }
}


function grantListPrinter () {
    this.orderedList = [];

   this.orderList = function (allEntries) {
	var superObj = this;
	this.orderedList = [];
	allEntries.map(function (entry) {
	    superObj.orderedList.push(entry);
	});

	this.orderedList.sort(function(a, b) {
	    var startyearA, endyearA;
	    var startyearB, endyearB;

	    if (a.date.indexOf('-') > -1) {
		a.date.replace(/(.*?)-(.*)/g, function(inputstr, p1, p2) {
		    startyearA = p1;
		    endyearA = p2;
		});
	    }
	    else {
		startyearA = a.date;
		endyearA = a.date;
	    }

	    if (b.date.indexOf('-') > -1) {
		b.date.replace(/(.*?)-(.*)/g, function(inputstr, p1, p2) {
		    startyearB = p1;
		    endyearB = p2;
		});
	    }
	    else {
		startyearB = b.date;
		endyearB = b.date;
	    }

	    if (startyearA == startyearB) {
		return endyearB - endyearA;
	    }
	    return startyearB - startyearA;
	});
	
	return this;
    }


    this.printGrantList = function (htmlObj) {

	var childNode = htmlObj.firstElementChild;
	if (childNode) {
	    htmlObj.removeChild(childNode);
	}
	
	childNode = document.createElement('span');
	htmlObj.appendChild(childNode);

	this.orderedList.map(function(entry) {
	    var entryBlock = new element('div')
		.class('entry')
		.style('font-size', '90%')
		.parent(childNode)
		.addChild(new element('div')
			  .style('font-weight', 'bold')
			  .label(entry.agency))
		.addChild(new element('div')
			  .label(entry.title))
		.label(entry.date)
		.label(', ' + entry.amount);


	    
	    if (entry.other != undefined) {
		var othersBlock = new element('div')
		    .label(entry.other)
		    .parent(entryBlock);
	    }
	    entryBlock.addChild(new element('div')
				.label(entry.persons));
	    
	});
	return this;
    }
}

function talkList (htmlbody) {
    this.htmlbody = htmlbody;
    this.allEntries = [];

    //note that each entry has up to 7 fields:
    // (1) date: date (in the format of (MMM DD, YYYY). For example, Jan 20, 2015)
    //     date is further divided into:
    //     (0) day: the first two parts
    //     (1) year: the last part
    // (2) name: name of institute or event
    // (3) location:  location (e.g. Medford, MA, or Toronto, Canada)
    // (4) title: title of talk
    // (5) detail: specification of the event (e.g. invited workshop title)
    // (6) ppt: (optional) the name of the pptx of the talk
    // (7) other: (optional) additional file. The format is (XXX:path). For example, 'video':url

    this.load = function (talkfile) {
	var superObj = this;
	var file = new XMLHttpRequest();
	file.open("GET", talkfile, true);

	file.onreadystatechange = function () {
	    if ((file.readyState == 4) && (file.status == 200)) {
		file.responseText.trim().replace(/\\cvtalkWeb{(.*?)}\s*{(.*?)}\s*{(.*?)}\s*{(.*?)}\s*{(.*)?}\s*{(.*)?}\s*{(.*)?}/g, function (inputstr, p1, p2, p3, p4, p5, p6, p7) {
		    var obj = {};
		    p1.trim().replace(/(.*?),\s*(.*)/g, function (origstr, day, year) {
			obj.date = {};
			obj.date.day = day.trim();
			obj.date.year = year.trim();
		    });
		    obj.name = p2;
		    obj.location = p3;
		    obj.title = p4;
		    obj.detail = p5;
		    obj.ppt = p6;
		    obj.other = p7;

		    superObj.allEntries.push(obj);
		});

		var print = new talkListPrinter()
		    .orderList(superObj.allEntries)
		    .printTalkList(htmlbody);
	    }
	}
	file.send();
	return this;
    }
}


function grantList (htmlbody) {
    this.htmlbody = htmlbody;
    this.allEntries = [];

    //note that each entry has up to 7 fields:
    // (1) role: (could be empty, in which case it follows the role from previous entry)
    // (2) agency: name of funding agency
    // (3) title:  title of the grant
    // (4) amount: amount of money
    // (5) date: range of the dates
    // (6) persons: the people involved
    // (7) other: (optional) additional info

    this.load = function (talkfile) {
	var superObj = this;
	var file = new XMLHttpRequest();
	file.open("GET", talkfile, true);
	var curRole = 'PI';

	file.onreadystatechange = function () {
	    if ((file.readyState == 4) && (file.status == 200)) {
		file.responseText.trim().replace(/\\cventryWeb{(.*?)}\s*{(.*?)}\s*{(.*?)}\s*{(.*?)}\s*{(.*)?}\s*{(.*)?}\s*{(.*)?}/g, function (inputstr, p1, p2, p3, p4, p5, p6, p7) {
		    if (p1 == undefined) {
			p1 = curRole;
		    }
		    var obj = {};
		    obj.role = p1;
		    obj.agency = p2.replace('\\', '');
		    obj.title = p3.replace('\\', '');
		    obj.amount = p4.replace('\\', ''); //escape the dollar sign \$ in latex
		    obj.date = p5;
		    obj.persons = p6;
		    obj.other = p7;
		    if (p7 != undefined) {
			obj.other = p7.replace('\\', ''); //escape the dollar sign \$ in latex
		    }

		    superObj.allEntries.push(obj);
		});

		var print = new grantListPrinter()
		    .orderList(superObj.allEntries)
		    .printGrantList(htmlbody);
	    }
	}
	file.send();
	return this;
    }
}
