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
    constituents = theJson["constituents"];
    blobs = constituents["blobs"];

    var overlayHolder = document.getElementById('overlay-holder');
    overlayHolder.innerHTML = "";

    var blobThreshold = document.getElementById('blob-slider').value / 100;
    document.getElementById('blob-score-threshold').innerHTML = blobThreshold;
    overlayHolder.innerHTML += drawBboxes(constituents["blobs"], blobThreshold);

    var arrowHeadThreshold = document.getElementById('arrowhead-slider').value / 100;
    document.getElementById('arrowhead-score-threshold').innerHTML = arrowHeadThreshold;
    overlayHolder.innerHTML += drawBboxes(constituents["arrowHeads"], arrowHeadThreshold);

    var arrowThreshold = document.getElementById('arrow-slider').value / 100;
    document.getElementById('arrow-score-threshold').innerHTML = arrowThreshold;
    drawArrows(constituents["arrows"], arrowThreshold);

    var textThreshold = document.getElementById('text-slider').value / 100;
    document.getElementById('text-score-threshold').innerHTML = textThreshold;
    overlayHolder.innerHTML += drawBboxes(constituents["text"], textThreshold);

    // overlayHolder.innerHTML += drawBboxes(constituents["arrowHeads"], 0);
    // overlayHolder.innerHTML += drawBboxes(constituents["arrows"]);
    // overlayHolder.innerHTML += drawBboxes(constituents["text"], 0);
}

function drawBboxes(blobs, scoreThreshold) {
    html = "";
    for (var blobId in blobs) {
	if (blobs.hasOwnProperty(blobId)) {
	    var blob = blobs[blobId];
	    if (blob["score"] > scoreThreshold) {
		html += getOverlayHtml(blob["bbox"], blobId);
	    }
	}
    }
    return html;
}

function drawArrows(arrows, scoreThreshold) {
    var elt = document.getElementById('arrow-canvas');
    elt.width = imgWidth * IMG_SCALE;
    elt.height = imgHeight * IMG_SCALE;
    var c = elt.getContext("2d");
    c.clearRect(0, 0, elt.width, elt.height);
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

function getOverlayHtml(bbox, id) {
    topleft = bbox["topleftyx"];
    bottomright = bbox["bottomrightyx"];

    var top = topleft[0] * IMG_SCALE;
    var left = topleft[1] * IMG_SCALE;
    var height = (bottomright[0] - topleft[0]) * IMG_SCALE;
    var width = (bottomright[1] - topleft[1]) * IMG_SCALE;

    style = "position: absolute; left: " + left + "px; top: " + top + "px; "
    style += "width: " + width + "px; height: " + height + "px;"
    
    return "<div class=\"bbox\" style=\"" + style + "\">" + id + "</div>";
}


// global parameters
var IMG_SCALE=2;

// Main code that runs on page load.

// ultra hacky way to read GET parameters
var filename = window.location.search.replace("?", "").split("&")[0].split("=")[1];

var jsonFilename = ("diagram_candidates/" + filename + ".json").trim();
var imageFilename = ("images/" + filename).trim();

// Read the image and display its natural dimensions
var imgWidth = 0;
var imgHeight = 0;
var imgElt = document.getElementById('file-image');
imgElt.src = imageFilename;
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
