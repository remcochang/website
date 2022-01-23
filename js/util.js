function element (elementType) {
    this.newBlock = document.createElement(elementType);

    this.id = function (val) {
	this.newBlock.id = val;
	return this;
    }

    this.class = function (val) {
	this.newBlock.className = val;
	return this;
    }
    
    this.label = function (val) {
	this.newBlock.appendChild(document.createTextNode(val));
	return this;
    }

    this.conditionalLabel = function (condition, val) {
	if (condition != undefined) {
	    this.label(val);
	}
	return this;
    }

    this.href = function (val) {
	this.newBlock.href = val;
	return this;
    }
    
    this.style = function (key, val) {
	this.newBlock.style[key] = val;
	return this;
    }

    this.addEventListener = function (name, func) {
	this.newBlock.addEventListener(name, func);
    }
    
    this.parent = function (parentNode) {
	if (parentNode instanceof element) {
	    parentNode.newBlock.appendChild(this.newBlock);
	}
	else {
	    parentNode.appendChild(this.newBlock);
	}
	return this;
    }

    this.addChild = function (childNode) {
	if (childNode instanceof element) {
	    this.newBlock.appendChild(childNode.newBlock);
	}
	else {
	    this.newBlock.appendChild(childNode);
	}
	return this;
    }
}

