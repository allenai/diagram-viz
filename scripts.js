// Bunch of nonsense to read local files as JSON...
var getFileBlob = function (url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.addEventListener('load', function() {
	cb(xhr.response);
    });
    xhr.send();
};

var blobToFile = function (blob, name) {
    blob.lastModifiedDate = new Date();
    blob.name = name;
    return blob;
};

var getFileObject = function(filePathOrUrl, cb) {
    getFileBlob(filePathOrUrl, function (blob) {
	cb(blobToFile(blob, 'test.jpg'));
    });
};

function parseJson(j) {
    constituents = theJson["constituents"];
    drawnObjects = [];

    var blobs = constituents["blobs"];
    for (var blobId in blobs) {
	if (blobs.hasOwnProperty(blobId)) {
	    var blob = blobs[blobId];
	    drawnObjects.push(new Blob(blobId, blob["score"], blob["bbox"]["topleftyx"],
				       blob["bbox"]["bottomrightyx"]));
	}
    }

    var texts = constituents["text"];
    for (var textId in texts) {
	if (texts.hasOwnProperty(textId)) {
	    var text = texts[textId];
	    drawnObjects.push(new Text(textId, text["score"], text["value"],
				       text["bbox"]["topleftyx"], text["bbox"]["bottomrightyx"]));
	}
    }

    var arrows = constituents["arrows"];
    for (var arrowId in arrows) {
	if (arrows.hasOwnProperty(arrowId)) {
	    var arrow = arrows[arrowId];
	    drawnObjects.push(new Arrow(arrowId, arrow["score"], arrow["detection"]));
	}
    }

    var arrowheads = constituents["arrowHeads"];
    for (var id in arrowheads) {
	if (arrowheads.hasOwnProperty(id)) {
	    var ah = arrowheads[id];
	    drawnObjects.push(new ArrowHead(id, ah["score"], ah["bbox"]["topleftyx"],
					    ah["bbox"]["bottomrightyx"], ah["angle"]));
	}
    }
}

// Renders the content of the loaded json file.
function displayContents(contents) {
    var j = JSON.parse(contents);
    theJson = j;
    parseJson(theJson);

    init();
    redraw();

    var element = document.getElementById('loading-success');
    element.innerHTML = "success";
}

function init() {
    var elt = document.getElementById('arrow-canvas');
    elt.width = imgWidth * IMG_SCALE;
    elt.height = imgHeight * IMG_SCALE;

    elt.onmousedown = canvasMouseDown;

    var hidden = document.getElementById('hidden-canvas');
    hidden.width = imgWidth * IMG_SCALE;
    hidden.height = imgHeight * IMG_SCALE;
}

function redraw() {
    // Clear the canvas.
    var elt = document.getElementById('arrow-canvas');
    var c = elt.getContext("2d");
    c.clearRect(0, 0, elt.width, elt.height);

    var blobThreshold = document.getElementById('blob-slider').value / 100;
    var arrowHeadThreshold = document.getElementById('arrowhead-slider').value / 100;
    var arrowThreshold = document.getElementById('arrow-slider').value / 100;
    var textThreshold = document.getElementById('text-slider').value / 100;

    config['thresholds'] = new Object();
    config['thresholds']['blob'] = blobThreshold;
    config['thresholds']['arrowHead'] = arrowHeadThreshold;
    config['thresholds']['arrow'] = arrowThreshold;
    config['thresholds']['text'] = textThreshold;

    // Draw elements
    drawObjects(drawnObjects, config);

    // Show object counts
    var constituents = theJson["constituents"];

    var blobs = constituents["blobs"];
    document.getElementById('num-blobs').innerHTML = count(blobs, -1);
    document.getElementById('num-displayed-blobs').innerHTML = count(blobs, blobThreshold);

    var arrowHeads = constituents["arrowHeads"];
    document.getElementById('num-arrowheads').innerHTML = count(arrowHeads, -1);
    document.getElementById('num-displayed-arrowheads').innerHTML = count(arrowHeads, arrowHeadThreshold);

    var arrows = constituents["arrows"];
    document.getElementById('num-arrows').innerHTML = count(arrows, -1);
    document.getElementById('num-displayed-arrows').innerHTML = count(arrows, arrowThreshold);

    var texts = constituents["text"];
    document.getElementById('num-texts').innerHTML = count(texts, -1);
    document.getElementById('num-displayed-texts').innerHTML = count(texts, textThreshold);

    // Show interobject linkages if an arrow is selected
    var iolElt = document.getElementById('links');
    iolElt.innerHTML = "";
    if (selectedObject >= 0 && drawnObjects[selectedObject].type == "arrow") {
	var arrowId = drawnObjects[selectedObject].id;
	var iols = theJson["relationships"]["interObjectLinkage"];

	for (var id in iols) {
	    if (iols.hasOwnProperty(id)) {
		var iol = iols[id];
		var parts = id.split("+");
		if (parts[1] == arrowId && iol.hasDirectionality == true) {
		    var src = iol["origin"];
		    var dst = iol["destination"];
		    var score = iol["score"];
		    
		    iolElt.innerHTML += "<p>" + score + " " + src + " " + arrowId + " " + dst + "</p>";
		}
	    }
	}
    }
}

function count(dict, scoreThreshold) {
    var count = 0;
    for (var id in dict) {
	if (dict.hasOwnProperty(id)) {
	    if (dict[id]["score"] > scoreThreshold) {
		count++;
	    }
	}
    }
    return count;
}

function drawObjects(objects, config) {
    var elt = document.getElementById('arrow-canvas');
    var c = elt.getContext("2d");
    for (var j = 0; j < objects.length; j++) {
	var object = objects[j];
	if (object.score > config['thresholds'][object.type]) {
	    object.draw(c);
	}
    }
}

function canvasMouseDown(e) {
    mouseXy = getMouseXy(e);
    x = mouseXy[0];
    y = mouseXy[1];

    var ind = selectObject(x, y, drawnObjects, config);
    if (ind != selectedObject) {
	if (ind >= 0) {
	    drawnObjects[ind].selected = true;
	}
	if (selectedObject >= 0) {
	    drawnObjects[selectedObject].selected = false;
	}
	selectedObject = ind;

	redraw();
    }

    
    /*
    var elt = document.getElementById('arrow-canvas');
    var c = elt.getContext("2d");

    c.beginPath();
    c.strokeStyle="blue";
    c.fillStyle="blue";
    c.moveTo(x, y);
    c.arc(x, y, 2, 0, 2 * Math.PI);
    c.fill();
    c.stroke();
    */
}

function getMouseXy(e) {
    var element = document.getElementById('arrow-canvas');

    // For some reason there's an extra two pixel gap.
    var offsetX = 2;
    var offsetY = 2;    
    if (element.offsetParent) {
	do {
	    offsetX += element.offsetLeft;
	    offsetY += element.offsetTop;
	} while ((element = element.offsetParent));
    }
    
    return [e.pageX - offsetX, e.pageY - offsetY];
}

function selectObject(x, y, objects, config) {
    var elt = document.getElementById('hidden-canvas');
    var c = elt.getContext("2d");
    c.clearRect(0, 0, elt.width, elt.height);

    var selection = -1;
    for (var i = 0; i < objects.length; i++) {
	var object = objects[i];

	if (object.score > config['thresholds'][object.type]) {
	    object.draw(c);
	    var imageData = c.getImageData(x, y, 1, 1);

	    if (imageData.data[3] > 0) {
		selection = i;
		break;
	    }
	}
    }

    var selectionElt = document.getElementById('selected-object');
    if (selection >= 0) {
	selectionElt.innerHTML = objects[selection].id;
    } else {
	selectionElt.innerHTML = "none";
    }
    
    return selection;
}

// global parameters
var IMG_SCALE=2;

// Main code that runs on page load.

// ultra hacky way to read GET parameters
var filename = window.location.search.replace("?", "").split("&")[0].split("=")[1];

var jsonFilename = ("diagram_candidates/" + filename + ".json").trim();
var imageFilename = ("images/" + filename).trim();
var imageOriginalFilename = ("images_original/" + filename).trim();

// Read the image and display its natural dimensions
var imgWidth = 0;
var imgHeight = 0;
var imgElt = document.getElementById('file-image');
imgElt.src = imageFilename;

var imgResizedElt = document.getElementById('file-image-resized');
imgResizedElt.src = imageFilename;

var imgOrigElt = document.getElementById('file-image-orig');
imgOrigElt.src = imageOriginalFilename;

var img = new Image();
img.onload = function() {
    // alert(this.width + " " + this.height);
    imgElt.width = this.width * IMG_SCALE;
    imgWidth = this.width;
    imgHeight = this.height;
    document.getElementById('image-dimensions').innerHTML = "width: " + this.width + " height: " + this.height;
}
img.src = imageFilename;

// Variable for storing the result of loading the JSON
var theJson = null;
// Variable storing the objects drawn on the canvas
var drawnObjects = null;
var selectedObject = -1;
// Drawing configuration
var config = new Object();

getFileObject(jsonFilename, function (fileObject) {
    var reader = new FileReader();
    reader.onload = function(e) {
	var contents = e.target.result;
	displayContents(contents);
    };
    reader.readAsText(fileObject);
}); 

