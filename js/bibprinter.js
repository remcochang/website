function bibFilter () {
    this.filteredEntries = [];
    this.filters = [];

    this.resetFilter = function(allEntries) {
	this.filteredEntries = allEntries;
	this.filters = {};
	this.filters.year = [];
	this.filters.person = [];
	return this;
    }
    
    this.filterByYear = function(year) {
	var tempList = [];
	if (year) {
	    this.filters.year.push(year);
	}
	this.filteredEntries.map(function(entry) {
	    var addEntry = false;
	    if ((year == undefined) || (year == '')) {
		addEntry = true;
	    }
	    else {
		if (entry.year == year) {
		    addEntry = true;
		}
	    }
	    
	    if (addEntry == true) {
		tempList.push(entry);
	    }
	});

	this.filteredEntries = tempList;
	return this;
    }

    this.filterByAuthor = function(author) {
	if (author) {
	    this.filters.person.push(author);
	}
	var tempList = [];
	this.filteredEntries.map(function(entry) {
	    var addEntry = false;
	    if ((author == undefined) || (author == '')) {
		addEntry = true;
	    }
	    else {
		entry.author.map(function(person) {  
		    //search task, should use a loop and break... but having fun with functional languages
		    addEntry = addEntry || (person === author);
		});
	    }
	    
	    if (addEntry == true) {
		tempList.push(entry);
	    }
	});

	this.filteredEntries = tempList;
	return this;
    }
}

function bibPrinter () {
    this.catType = {'Journal':['jour'], 'Book Chapter':['book', 'intro'], 'Conference':['conf'], 'Misc':['workshop', 'misc']};
    this.orderedList = [];
    this.bibfilterObj = null;

    this.orderList = function (bibfilterObj) {
	this.bibfilterObj = bibfilterObj;

	var superObj = this;
	this.orderedList = [];
	bibfilterObj.filteredEntries.map(function (entry) {
	    if (superObj.orderedList[entry.year] == undefined) {
		superObj.orderedList[entry.year] = [];
	    }
	    if (superObj.orderedList[entry.year][entry.category] == undefined) {
		superObj.orderedList[entry.year][entry.category] = [];
	    }
	    superObj.orderedList[entry.year][entry.category].push(entry);
	});
	
	return this;
    }

    this.printHTML = function (htmlObj) {
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

	keys.map(function(year) {
	    var yearBlock = new element('div')
		.id(year)
		//.label(year)
		.parent(childNode);
	    
    	    var curYearObj = superObj.orderedList[year];

    	    for (typeKey in superObj.catType) {
		var typeBlock = null;
    		var printedTypeKey = false;
		
		superObj.catType[typeKey].map(function (fileVal) {
    		    if (curYearObj[fileVal] != undefined) {
    			//for (var entry of curYearObj[fileVal]) {  //not IE compliant
			curYearObj[fileVal].map(function (entry) {
			    if (printedTypeKey == false) {

				var arrowObj = 	new element ('span')
				    .style('display', 'inline-block')
				    .id('arrow-'+year+'-'+typeKey)
				    .style('font-size', 'x-small')
				    .label('\u25BC');  //25bc for side

				var labelBlock = new element('div')
				    .class('year-block')
				    .id(year+'-'+typeKey)
				    .style('font-weight','bold')
				    .style('font-size','medium')
				    //.style('margin-left', '10pt')
				    .addChild(arrowObj)
				    .label(typeKey + ' ('+year+')')
				    .parent(yearBlock);



				typeBlock = new element('div')
				    .id('block-'+year+'-'+typeKey)
				    .parent(labelBlock);

				//this is really sneaky... using immediate invocation, we lock in the variables for year and typeKey
				//  without the use of this, typeKey will always appear to be the last value of the array
				(function (lockedYear, lockedTypeKey) {  
				    //labelBlock.newBlock.addEventListener('mousedown', function() {
				    arrowObj.newBlock.addEventListener('mousedown', function() {
					var block = document.getElementById('block-'+lockedYear+'-'+lockedTypeKey);
					var style = window.getComputedStyle(block);

					//the use of the custom attribute needs to start with data- according to HTML 5.1
					//  here we use 'data-origHeight' to store the original height of the block
					if (block['data-origHeight'] === undefined) {
					    var height = 0;
					    height = style.getPropertyValue('height').replace(/px/, '');  //remove the 'px' suffix and turn height into just a number (e.g. 150px -> 150)
					    block['data-origHeight'] = height;
					    block.style['overflow'] = 'hidden';  //overflow: hidden hides the extra text when the height is smaller than the amount of text
					}

					var visible = true;
					var animPixels = block['data-origHeight'] / window.numAnimFrames;
					if (block.style.display === 'none') {
					    block.style.display = '';
					    visible = true;
					    var animFunc1 = function (curHeight) {
						curHeight += animPixels;
						return (function() {
						    block.style.height = curHeight + 'px';
						    if (curHeight < block['data-origHeight']) {
							window.animQueue.push(animFunc1(curHeight));
						    }
						});
					    }
					    window.animQueue.push(animFunc1(0));
					}
					else {
					    visible = false;
					    var animFunc2 = function (curHeight) {
						curHeight -= animPixels;
						return (function() {
						    block.style.height = curHeight + 'px';
						    if (curHeight <= 0) {
							block.style.display = 'none';
						    }
						    else {
							window.animQueue.push(animFunc2(curHeight));
						    }
						});
					    }
					    window.animQueue.push(animFunc2(block['data-origHeight']));
					}

					var arrow = document.getElementById('arrow-'+lockedYear+'-'+lockedTypeKey);
					var animRot = 90/window.numAnimFrames;
					if (visible) {
					    //arrow.style['-webkit-transform'] = '';
					    //arrow.style['-ms-transform'] = '';
					    //arrow.style['transform'] = '';
					    var animFunc3 = function (curRot) {
						curRot -=  animRot;
						return (function () {	
						    arrow.style['-webkit-transform'] = 'rotate(-'+curRot+'deg)';
						    arrow.style['-ms-transform'] = 'rotate(-'+curRot+'deg)';
						    arrow.style['transform'] = 'rotate(-'+curRot+'deg)';
						    if (curRot > 0) {
							window.animQueue.push(animFunc3(curRot));
						    }
						});
					    }
					    
					    window.animQueue.push(animFunc3(90));
					}
					else {
					    //arrow.style['-webkit-transform'] = 'rotate(-90deg)';
					    //arrow.style['-ms-transform'] = 'rotate(-90deg)';
					    //arrow.style['transform'] = 'rotate(-90deg)';

					    var animFunc4 = function (curRot) {
						curRot += animRot;
						return (function () {	
						    arrow.style['-webkit-transform'] = 'rotate(-'+curRot+'deg)';
						    arrow.style['-ms-transform'] = 'rotate(-'+curRot+'deg)';
						    arrow.style['transform'] = 'rotate(-'+curRot+'deg)';
						    if (curRot < 90) {
							window.animQueue.push(animFunc4(curRot));
						    }
						});
					    }
					    
					    window.animQueue.push(animFunc4(0));
					}
					animate();
				    });
				})(year, typeKey);

    				printedTypeKey = true;
    			    }

			    var entryBlock = new element('div')
				.id(entry.name)
				.class('entry')
				.style('marginLeft', '12pt')
				.style('font-weight', 'normal')
				.style('font-size', '90%')
				.parent(typeBlock);

			    
			    var linkBlock = new element ('a')
				.href('publications/' + entry.year + '/' + entry.pdf)
				.label(entry.title)
				.parent(entryBlock);	    

			    if (entry.video) {
				var videoBlock = new element ('a')
				    .href('publications/videos/' + entry.year + '/' + entry.video)
				    .label(' (video)')
				    .parent(entryBlock);
			    }

			    

			    var str = "";
			    entry.author.map(function(person, index) {
				if (index == 0) {
				    str += " " + person;
				}
				else {
				    str += ", " + person;
				}
			    });
			    var authorBlock = new element ('div')
				.label(str)
				.parent(entryBlock);

			    str = "";
    			    if (entry.chapter != undefined) {
    				str = entry.chapter;
    			    }
    			    else if (entry.journal != undefined) {
    				str = entry.journal;
    			    }
    			    else if (entry.booktitle != undefined) {
    				str = entry.booktitle;
    			    }
    			    else if(entry.howpublished != undefined) {
    				str = entry.howpublished;
    			    }
    			    else if (entry.school != undefined) {
    				str = entry.school;
    			    }
			    else if (entry.institution != undefined) {
				str = entry.institution;
			    }
			    var venueBlock = new element ('span')
				.label(str)
				.style('font-weight', 'bold')
				.parent(entryBlock)
				.addChild(new element ('span')
					  .style('font-weight', 'normal')
					  .label(', ' + year));

			    if ((entry.note != undefined) && (entry.note != '')) {
				var noteBlock = new element ('div').parent(entryBlock);
				var found = false;
				entry.note.replace(/\\(.*){(.*)}/g, function(inputstring, p1, p2){
				    //p1 is the latex command...  only handling the textbf case now
				    switch(p1.trim()) {
				    case 'textbf':
					found = true;
					noteBlock.class('award').label(p2);
					break;
				    }
				});
				if (found == false) {
				    noteBlock.class('footnote').label('('+entry.note+')');
				}
    		    	    }
			});
		    }
		});
	    }
	});

	return this;
    }

    this.initHeaderYear = function (htmlObj) {
	var childNode = htmlObj.firstElementChild;
	if (childNode) {
	    htmlObj.removeChild(childNode);
	}
	
	childNode = document.createElement('span');
	htmlObj.appendChild(childNode);

	var numElements = Object.keys(this.orderedList).length + 1; //+1 for (All)
	var width = 100/numElements;
	
	var entry = new element ('div')
	    .class('year_navbar')
	    .style('font-weight','bold')
	    .parent(childNode);

	var addBlock = function (parentNode, id, label, param) {
	    var year = new element ('span')
		.id('nav'+id)
		.class('filter_year')
		.style('width', width+'%')
		.style('display', 'inline-block')   
		.label(label)
		.parent(parentNode);
	    
	    year.newBlock.addEventListener('mousedown', function () {
		windowFilterByYear(param);
	    });
	    return year;
	}

	var allBlock = addBlock(entry, 'all', '(All)');
	
    	Object
	    .keys(this.orderedList).sort(function(a, b) {
    		return b-a;
    	    })
	    .map(function(year) {
		var curYearBlock = addBlock(entry, year, year, year);
	    });

	return this;
    }

    this.updateHeaderYear = function () {
	var allElemsNodeList = document.getElementsByClassName('filter_year');
	var allElems = Array.prototype.slice.call(allElemsNodeList);

	allElems.map(function(elem) {
	    elem.style.color = '#aaaaaa';		
	});

	if (this.bibfilterObj.filters.year.length == 0) {
	    var elem = document.getElementById('navall');
	    elem.style.color = '#333333';
	}
	else {
	    this.bibfilterObj.filters.year.map(function (filteredYear) {
		var elem = document.getElementById('nav'+filteredYear);
		elem.style.color = '#333333';		
	    });
	}
	return this;
    }

    this.printAllAuthors = function(htmlObj) {
	var uniqueAuthorList = [];
	this.bibfilterObj.filteredEntries.map(function(entry) {
	    var authorList = entry.author;
	    authorList.map(function(author) {
		var found = false;
		if ((uniqueAuthorList.filter(function(obj) {  //ok, this is dumb, should use a for loop. But playing with functional ideas
		    if (obj.key === author) {
			obj.val += 1;
			return true;
		    }
		    return false;
		}).length > 0) == false) {
		    uniqueAuthorList.push({key:author, val:1});
		}
	    });
	});
	
	var str = "";

	uniqueAuthorList
	    .sort(function(a, b) {
		return b.val - a.val;
	    })
	    .map(function(obj) {
		str += obj.key + " (" + obj.val + "), ";
	    });
	htmlObj.innerHTML = str + "<br>";
	return this;
    }

}