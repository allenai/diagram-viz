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

// Renders the content of the loaded json file.
function displayContents(contents) {
    var j = JSON.parse(contents);
    theJson = j;

    redraw();

    var element = document.getElementById('loading-success');
    element.innerHTML = "success";
}

function redraw() {
    // Clear the canvas.
    var elt = document.getElementById('arrow-canvas');
    elt.width = imgWidth * IMG_SCALE;
    elt.height = imgHeight * IMG_SCALE;
    var c = elt.getContext("2d");
    c.clearRect(0, 0, elt.width, elt.height);

    // Draw elements
    constituents = theJson["constituents"];
    blobs = constituents["blobs"];

    var overlayHolder = document.getElementById('overlay-holder');
    overlayHolder.innerHTML = "";

    var blobThreshold = document.getElementById('blob-slider').value / 100;
    document.getElementById('blob-score-threshold').innerHTML = blobThreshold;
    overlayHolder.innerHTML += drawBboxes(constituents["blobs"], blobThreshold, "blob");
    document.getElementById('num-blobs').innerHTML = count(blobs, -1);
    document.getElementById('num-displayed-blobs').innerHTML = count(blobs, blobThreshold);

    var arrowHeads = constituents["arrowHeads"];
    var arrowHeadThreshold = document.getElementById('arrowhead-slider').value / 100;
    document.getElementById('arrowhead-score-threshold').innerHTML = arrowHeadThreshold;
    // overlayHolder.innerHTML += drawBboxes(constituents["arrowHeads"], arrowHeadThreshold, "arrowhead");
    drawArrowHeads(arrowHeads, arrowHeadThreshold);
    document.getElementById('num-arrowheads').innerHTML = count(arrowHeads, -1);
    document.getElementById('num-displayed-arrowheads').innerHTML = count(arrowHeads, arrowHeadThreshold);

    var arrows = constituents["arrows"];
    var arrowThreshold = document.getElementById('arrow-slider').value / 100;
    document.getElementById('arrow-score-threshold').innerHTML = arrowThreshold;
    drawArrows(arrows, arrowThreshold);
    document.getElementById('num-arrows').innerHTML = count(arrows, -1);
    document.getElementById('num-displayed-arrows').innerHTML = count(arrows, arrowThreshold);
    

    var texts = constituents["text"];
    var textThreshold = document.getElementById('text-slider').value / 100;
    document.getElementById('text-score-threshold').innerHTML = textThreshold;
    overlayHolder.innerHTML += drawBboxes(texts, textThreshold, "text");
    document.getElementById('num-texts').innerHTML = count(texts, -1);
    document.getElementById('num-displayed-texts').innerHTML = count(texts, textThreshold);


    // overlayHolder.innerHTML += drawBboxes(constituents["arrowHeads"], 0);
    // overlayHolder.innerHTML += drawBboxes(constituents["arrows"]);
    // overlayHolder.innerHTML += drawBboxes(constituents["text"], 0);
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

function drawBboxes(blobs, scoreThreshold, classId) {
    html = "";
    for (var blobId in blobs) {
	if (blobs.hasOwnProperty(blobId)) {
	    var blob = blobs[blobId];
	    if (blob["score"] > scoreThreshold) {
		html += getOverlayHtml(blob, blobId, classId);
	    }
	}
    }
    return html;
}


function drawArrows(arrows, scoreThreshold) {
    var elt = document.getElementById('arrow-canvas');
    var c = elt.getContext("2d");
    c.font = "12px Arial";
    c.fillStyle = "red";
    for (var arrowId in arrows) {
	if (arrows.hasOwnProperty(arrowId)) {
	    var arrow = arrows[arrowId];
	    if (arrow["score"] > scoreThreshold) {
		var detection = arrow["detection"];
		if (detection.length == 0) {
		    continue;
		}

		c.fillText(arrowId, detection[0][1] * IMG_SCALE, detection[0][0] * IMG_SCALE);
		
		c.beginPath();
		c.strokeStyle="red";
		c.moveTo(detection[0][1] * IMG_SCALE, detection[0][0] * IMG_SCALE);
		for (i = 0; i < detection.length; i++) {
		    yx = detection[i];
		    c.lineTo(yx[1] * IMG_SCALE, yx[0] * IMG_SCALE);
		    c.moveTo(yx[1] * IMG_SCALE, yx[0] * IMG_SCALE);
		}
		c.stroke();
	    }
	}
    }
}

function drawArrowHeads(arrowheads, scoreThreshold) {
    var elt = document.getElementById('arrow-canvas');
    var c = elt.getContext("2d");
    c.font = "12px Arial";
    c.fillStyle = "green";
    for (var id in arrowheads) {
	if (arrowheads.hasOwnProperty(id)) {
	    var ah = arrowheads[id];

	    if (ah["score"] > scoreThreshold) {
		var bbox = ah["bbox"];
		var topleft = bbox["topleftyx"];
		var bottomright = bbox["bottomrightyx"];

		var centerx = (topleft[1] + bottomright[1]) / 2;
		var centery = (topleft[0] + bottomright[0]) / 2;

		// var centerx = ah["yxCentroid"][1];
		// var centery = ah["yxCentroid"][0];
		
		c.fillText(id, centerx * IMG_SCALE + 4, centery * IMG_SCALE - 4);

		// Draw the direction of the arrow:
		var angle = 2 * Math.PI * ah["angle"] / 360;
		var arrowlength = 10;
		var radius = 3;
		var xcomp = Math.cos(angle) * arrowlength;
		var ycomp = Math.sin(angle) * arrowlength;

		c.beginPath();
		c.strokeStyle="green";
		c.fillStyle="green";
		c.moveTo(centerx * IMG_SCALE, centery * IMG_SCALE);
		c.arc(centerx * IMG_SCALE, centery * IMG_SCALE, radius, 0, 2 * Math.PI);
		c.fill();
		c.moveTo(centerx * IMG_SCALE, centery * IMG_SCALE);
		c.lineTo( (centerx + xcomp) * IMG_SCALE, (centery + ycomp) * IMG_SCALE);
		c.stroke();
	    }
	}
    }
}

function getOverlayHtml(blob, id, classId) {
    var bbox = blob["bbox"];
    var topleft = bbox["topleftyx"];
    var bottomright = bbox["bottomrightyx"];

    var top = topleft[0] * IMG_SCALE;
    var left = topleft[1] * IMG_SCALE;
    var height = (bottomright[0] - topleft[0]) * IMG_SCALE;
    var width = (bottomright[1] - topleft[1]) * IMG_SCALE;

    style = "position: absolute; left: " + left + "px; top: " + top + "px; "
    style += "width: " + width + "px; height: " + height + "px;"

    var value = "";
    /*
    if (blob.hasOwnProperty("value")) {
	value = blob["value"];
    }
    */
    
    return "<div class=\"" + classId + "\" style=\"" + style + "\">" + id + " " + value + "</div>";
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

getFileObject(jsonFilename, function (fileObject) {
    var reader = new FileReader();
    reader.onload = function(e) {
	var contents = e.target.result;
	displayContents(contents);
    };
    reader.readAsText(fileObject);
}); 

