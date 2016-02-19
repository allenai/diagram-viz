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

    constituents = j["constituents"];
    blobs = constituents["blobs"];

    var overlayHolder = document.getElementById('overlay-holder');
    overlayHolder.innerHTML = "";
    for (var blobId in blobs) {
	if (blobs.hasOwnProperty(blobId)) {
	    var blob = blobs[blobId];
	    overlayHolder.innerHTML += getOverlayHtml(blob["bbox"], blobId);
	}
    }

    var element = document.getElementById('file-content');
    element.innerHTML = "success";
}

function getOverlayHtml(bbox, id) {
    topleft = bbox["topleftyx"];
    bottomright = bbox["bottomrightyx"];

    style = "position: absolute; left: " + topleft[1] + "px; top: " + topleft[0] + ";"
    
    return "<div style=\"" + style + "\">" + id + "</div>";
}


// Main code that runs on page load.

// ultra hacky way to read GET parameters
var filename = window.location.search.replace("?", "").split("&")[0].split("=")[1];

var jsonFilename = ("diagram_candidates/" + filename + ".json").trim();
var imageFilename = ("images/" + filename).trim();


var imgElt = document.getElementById('file-image');
imgElt.src = imageFilename;

var img = new Image();
img.onload = function() {
    alert(this.width + " " + this.height);
}
img.src = imageFilename;



getFileObject(jsonFilename, function (fileObject) {
    var reader = new FileReader();
    reader.onload = function(e) {
	var contents = e.target.result;
	displayContents(contents);
    };
    reader.readAsText(fileObject);
}); 

