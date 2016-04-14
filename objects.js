
function Blob(id, score, topleft, bottomright) {
    this.id = id;
    this.score = score;
    this.topleft = topleft;
    this.bottomright = bottomright;

    this.type = "blob";
    this.selected = false;

    this.draw = function (c) {
	c.beginPath();

	if (this.selected == true) {
	    c.font = "16px Arial";
	    c.fillStyle = "blue";
	    c.strokeStyle = "blue";
	    c.lineWidth = "3";
	} else {
	    c.font = "12px Arial";
	    c.strokeStyle = "rgba(0, 0, 0, 255)";
	    c.fillStyle = "rgba(0, 0, 0, 255)";
	    c.lineWidth = "1";
	}

	c.rect(topleft[1] * IMG_SCALE, topleft[0]  * IMG_SCALE,
	       (bottomright[1] - topleft[1]) * IMG_SCALE,
	       (bottomright[0] - topleft[0]) * IMG_SCALE);
	c.fillText(this.id, (topleft[1] * IMG_SCALE) + 2, (topleft[0] * IMG_SCALE) + 12);
	c.stroke();
    };
}

function Text(id, score, value, topleft, bottomright) {
    this.id = id;
    this.score = score;
    this.value = value;
    this.topleft = topleft;
    this.bottomright = bottomright;

    this.type = "text";
    this.selected = false;

    this.draw = function (c) {
	c.beginPath();

	if (this.selected == true) {
	    c.font = "16px Arial";
	    c.fillStyle = "blue";
	    c.strokeStyle = "blue";
	    c.lineWidth = "3";
	} else {
	    c.font = "12px Arial";
	    c.strokeStyle = "rgba(0, 0, 0, 255)";
	    c.fillStyle = "rgba(0, 0, 0, 255)";
	    c.lineWidth = "1";
	}

	c.rect(topleft[1] * IMG_SCALE, topleft[0]  * IMG_SCALE,
	       (bottomright[1] - topleft[1]) * IMG_SCALE,
	       (bottomright[0] - topleft[0]) * IMG_SCALE);
	c.fillText(this.id, (topleft[1] * IMG_SCALE) + 2, (topleft[0] * IMG_SCALE) + 12);
	c.stroke();
    };
}

function Arrow(id, score, detection_yx) {
    this.id = id;
    this.score = score;
    this.detection_yx = detection_yx;

    this.type = "arrow";
    this.selected = false;

    this.draw = function (context) {
	if (this.selected == true) {
	    context.font = "16px Arial";
	    context.fillStyle = "blue";
	    context.strokeStyle = "blue";
	    context.lineWidth = "3";
	} else {
	    context.font = "12px Arial";
	    context.fillStyle = "red";
	    context.strokeStyle = "red";
	    context.lineWidth = "1";
	}

	var detection = this.detection_yx;
	if (detection.length > 0) {
	    context.fillText(this.id, detection[0][1] * IMG_SCALE, detection[0][0] * IMG_SCALE);

	    context.beginPath();
	    context.moveTo(detection[0][1] * IMG_SCALE, detection[0][0] * IMG_SCALE);
	    for (var i = 0; i < detection.length; i++) {
		yx = detection[i];
		context.lineTo(yx[1] * IMG_SCALE, yx[0] * IMG_SCALE);
		context.moveTo(yx[1] * IMG_SCALE, yx[0] * IMG_SCALE);
	    }
	    context.stroke();
	}
    };
}

function ArrowHead(id, score, topleft, bottomright, angle) {
    this.id = id;
    this.score = score;
    this.topleft = topleft;
    this.bottomright = bottomright;
    this.angle = angle;

    this.type = "arrowHead";
    this.selected = false;

    this.draw = function (c) {
	if (this.selected == true) {
	    c.font = "16px Arial";
	    c.fillStyle = "blue";
	    c.strokeStyle = "blue";
	    c.lineWidth = "3";
	} else {
	    c.font = "12px Arial";
	    c.strokeStyle = "green";
	    c.fillStyle = "green";
	    c.lineWidth = "1";
	}
	
	var centerx = (this.topleft[1] + this.bottomright[1]) / 2;
	var centery = (this.topleft[0] + this.bottomright[0]) / 2;

	// var centerx = ah["yxCentroid"][1];
	// var centery = ah["yxCentroid"][0];
	
	c.fillText(this.id, centerx * IMG_SCALE + 4, centery * IMG_SCALE - 4);

	// Draw the direction of the arrow:
	var angle = 2 * Math.PI * this.angle / 360;
	var arrowlength = 10;
	var radius = 3;
	var xcomp = Math.cos(angle) * arrowlength;
	var ycomp = Math.sin(angle) * arrowlength;

	c.beginPath();
	c.moveTo(centerx * IMG_SCALE, centery * IMG_SCALE);
	c.arc(centerx * IMG_SCALE, centery * IMG_SCALE, radius, 0, 2 * Math.PI);
	c.fill();
	c.moveTo(centerx * IMG_SCALE, centery * IMG_SCALE);
	c.lineTo( (centerx + xcomp) * IMG_SCALE, (centery + ycomp) * IMG_SCALE);
	c.stroke();
    };
}
