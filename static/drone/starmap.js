"use strict";

function Star(starMap, data, config, graphics)
{
	var self = this;

	this.init = function() {
		this.data = data;
		this.starObj = null;
		this.graphics = graphics;

		var pos = starMap.galaxyToDisplayCoords(this.data);
		this.x = pos.x;
		this.y = pos.y;

		this.drawStar();
	};

	this.drawStar = function() {
		var isSpecial = false;
		var size = galaxy_math.getStarRadius(this.data.M);
	    //this.starObj = new Phaser.Circle(this.x, this.y, size);
	    //this.starObj.gameObject = this;
	    var color = isSpecial ? "rgba(255,0,0,1)" : config.stars.classes[this.data.c].color;

	    graphics.beginFill(parseInt(color, 16), 1.0);
	    graphics.drawRect(this.x, this.y, size, size);
	    graphics.endFill();
	};
	
	this.contains = function(point) {
		if (this.starObj.contains(point)) {
			return true;
		}
		return false;
	};

	this.init();

	return this;
}

function StarMap(_pgame, config, galaxy, viewportWidth, viewportHeight)
{
	var self = this;
	this.pgame = _pgame;

	this.init = function() {
		console.log('StarMap');
		this.mapRender = { stars:[], links:[] };
		this.selectedStar = null;
		this.selectionCursor = null;

		//Input
		this.wasTouching = false;
	    this.lastTouchX = 0;
	    this.lastTouchY = 0;
	    this.selectMode = 'select';

	    this.circleMenu = null;

		this.graphics = this.pgame.add.graphics(0, 0);

		this.input = new InputModule(this.pgame);

		var minDim = Math.min(viewportWidth, viewportHeight);
		this.xCoordScale = minDim/galaxy.aabb.x.size;
		this.yCoordScale = minDim/galaxy.aabb.y.size;
		console.log("xCoordScale=" + this.xCoordScale + " yCoordScale=" + this.yCoordScale);

		var centerPos = this.galaxyToDisplayCoords({x:0,y:0});

		 //  Our BitmapData (same size as our canvas)
	    var bmd = this.pgame.make.bitmapData(viewportWidth, viewportHeight);

	    //  Add it to the world or we can't see it
	    bmd.addToWorld(-1*viewportWidth/2, -1*viewportHeight/2, 0, 0);

	    var coreSize = config.coreSize * (minDim/900) * 1.5;

		var gradient = bmd.ctx.createRadialGradient(viewportWidth/2, viewportHeight/2, 
													coreSize*0.2, viewportWidth/2, viewportHeight/2, coreSize*0.8);
			gradient.addColorStop(0, 'rgba(200,200,200,1.0)');
			gradient.addColorStop(1, 'transparent');

		bmd.cls();
		bmd.circle(viewportWidth/2, viewportHeight/2, coreSize, gradient);

		this.spirals = galaxy_math.generateSpirals({x:0, y:0}, config.spirals);

		for (var sp=0; sp<this.spirals.length; sp++) {
			var arc = this.spirals[sp];

			var width = 25;
			for (var i=1; i<arc.length; i++) {
				var lastPos = this.galaxyToDisplayCoords(arc[i-1]);
				var nextPos = this.galaxyToDisplayCoords(arc[i]);

				var color = 'FFFFFF';
				this.graphics.lineStyle(width, parseInt(color, 16), 0.1);
	    		this.graphics.moveTo(lastPos.x, lastPos.y);
	    		this.graphics.lineTo(nextPos.x, nextPos.y);
	    		width -= 0.1;
			}
		}

		/*for (var i in galaxy.links) {
			var starA_id = map.links[i][0];
			var starB_id = map.links[i][1];
			//Fix these, never rely on id order.
			var starA = map.stars[starA_id-1];
			var starB = map.stars[starB_id-1];

			var points = getPoints(starA.pos, starB.pos, this.starRingRadius);

			var color = 'FFFFFF';

			//var link = new Path.Line({
			    from: [points[0].x, points[0].y],
			    to: [points[1].x, points[1].y],
			    strokeColor: color,
			    strokeWidth: this.linkWidth
			});

			this.graphics.lineStyle(this.linkWidth, parseInt(color, 16));
			this.graphics.moveTo(points[0].x, points[0].y);
			this.graphics.lineTo(points[1].x, points[1].y);
		}*/

		this.graphics.lineStyle(0);
		
		for (var j in galaxy.stars) {
			var data = galaxy.stars[j];

			var star = new Star(this, data, config, this.graphics);
		    this.mapRender.stars.push(star);
		}

		this.pgame.camera.x = (this.pgame.width * -0.5);
		this.pgame.camera.y = (this.pgame.height * -0.5);

		console.log(this.mapRender.stars.length + " stars loaded");
	};

	this.galaxyToDisplayCoords = function(obj) {
		var gPos = {x:obj.x, y:obj.y};
		var dPos = {};
		dPos.x = this.xCoordScale * gPos.x;
		dPos.y = this.yCoordScale * gPos.y;
		//console.log("galaxyToDisplayCoords " + JSON.stringify(gPos) + " -> " + JSON.stringify(dPos));
		return dPos;
	};

	this.displayToGalaxyCoords = function(obj) {
		var dPos = {x:obj.x, y:obj.y};
		var gPos = {};
		gPos.x = (dPos.x / this.xCoordScale);
		gPos.y = (dPos.y / this.yCoordScale);
		console.log("displayToGalaxyCoords " + JSON.stringify(dPos) + " -> " + JSON.stringify(gPos));
		return gPos;
	};

	this.selectStar = function(star, pointer) {

		//if (this.selectedStar && (this.selectedStar == star)) {
		//	this.openMenu(this.selectedStar, this.selectedFleet);
		//	return;
		//}
		//this.closeMenu();

		this.input.moveCameraTo(star.data.pos.x, star.data.pos.y);

		this.selectedStar = star;

		/*$('#object-details').empty();
		var html = "";
		html += "<div class='row'><div class='col-md-12'><img src='" + type.img + "'/></div></div>";
		html += "<div class='row'><div class='col-md-12'><b>" + star.data.name + "</b></div></div>";
		html += "<div class='row'><div class='col-md-4'><b>Class:</b></div>";
		html += "<div class='col-md-8'>" + type.name + "</div></div>";
		html += "<div class='row'><div class='col-md-4'><b>Faction:</b></div>";
		html += "<div class='col-md-8'>" + star.getFactionName() + " " + (star.isCapital ? "Capital" : "") + "</div></div>";
		if (this.selectedFleet) {
			html += "<div class='row'><div class='col-md-4'><b>Fleet:</b></div>";
			html += "<div class='col-md-8'>" + this.selectedFleet.data.ships[0] + "</div></div>";
		}
		$('#object-details').html( html );

		$('#object-details-panel').removeClass("collapse");*/

		if (this.selectionCursor == null) {
			/*this.selectionCursor = new Path.Circle({
		        center: new Point(star.data.pos.x, star.data.pos.y),
		        radius: this.starRingRadius+4,
		        strokeColor: 'cyan',
		        strokeWidth: this.linkWidth,
		        dashArray: [6, 4],
		    });*/
		}
		else {
			//this.selectionCursor.position = new Point(star.data.pos.x, star.data.pos.y);
		}
	};

	this.addMenuItem = function(text, cb, radius, x, y, finalX, finalY) {
		var item = drawSprite(this.pgame, x, y, 'hex', {scale:0.001, color:'2980B9', alpha:0.4, gameObject:this}, cb);
		var item = drawSprite(this.pgame, x, y, 'outlineHex', {scale:0.001, color:'2980B9', gameObject:this}, cb);

		this.pgame.add.tween(item).to({ x:finalX, y:finalY }, 500, Phaser.Easing.Quadratic.InOut, true);
		this.pgame.add.tween(item.scale).to({ x:0.06, y:0.06}, 500, Phaser.Easing.Quadratic.InOut, true);
		this.pgame.add.tween(itemOutline).to({ x:finalX, y:finalY }, 500, Phaser.Easing.Quadratic.InOut, true);
		this.pgame.add.tween(itemOutline.scale).to({ x:0.06, y:0.06}, 500, Phaser.Easing.Quadratic.InOut, true);

		this.circleMenuItems.push(item);
		this.circleMenuItems.push(itemOutline);

		var text = this.pgame.add.text(x, y, text, { font: "15px Arial", fill: "#ffffff", align: "center" });
		text.scale.setTo(0.001, 0.001);
		text.anchor.setTo(0.5, 0.5);
		this.pgame.add.tween(text).to({ x:finalX, y:finalY }, 500, Phaser.Easing.Quadratic.InOut, true);
		this.pgame.add.tween(text.scale).to({ x:1, y:1}, 500, Phaser.Easing.Quadratic.InOut, true);

		this.circleMenuTexts.push(text);
	};

	this.openMenu = function(star, fleet) {
		if (this.circleMenu != null) {
			return;
		}

		var items = [];
		items.push({name:'Scan', cb:null});
		if (fleet) {
			items.push({name:'Move', cb:setMoveMode});
			items.push({name:'Dock', cb:null});
		}

		this.circleMenu = openCircleMenu(this.pgame, star.data.pos.x, star.data.pos.y, items, {});
	}

	this.closeMenu = function() {
		if (this.circleMenu == null) {
			return;
		}
		closeCircleMenu(this.pgame, this.circleMenu);
		this.circleMenu = null;
	};

	this.update = function() {
		this.updateInput();

		if (this.selectedStar != null) {
			this.selectedStar.selectedUpdate();
		}
	};

	this.updateInput = function() {
		this.input.update();

		var pointer = this.pgame.input.activePointer;
		if (pointer.isDown) {
			var now = (new Date()).getTime();
			if ((this.inputTime == null) || ((this.inputTime + 1000) < now)) {
				this.inputTime = now;
    			/*var stars = this.mapRender.stars;
    			for (var i=0; i<stars.length; i++) {
    				var star = stars[i];
    				if (star.starObj.contains(pointer.x, pointer.y)) {
    					alert(star.data.c);
    				}
    			}*/

    			//var pos = this.displayToGalaxyCoords(pointer);
    			//var sectorCoords = self.getSectorCoordinates(pos, galaxy.aabb);
    			/*if (sectorCoords) {
    				console.log("pointer.isDown sectorCoords=" + JSON.stringify(sectorCoords));
    				var sector = galaxy.sectors[sectorCoords.x][sectorCoords.y];
    				//console.log("sector=" + JSON.stringify(sector));

    				var distFromSpirals = galaxy_math.getDistanceFromArcArray({x:pointer.x, y:pointer.y}, this.spirals);
    				console.log("distFromSpirals=" + distFromSpirals);

    				//this.pgame.add.tween(this.pgame.camera.scale).to({ x: 4.0, y: 4.0}, 500, Phaser.Easing.Linear.None, true);
    				//this.pgame.camera.follow(null)
    				//this.pgame.add.tween(this.pgame.camera).to({ x:pointer.x-0.5*viewportWidth, y:pointer.y-0.5*viewportHeight}, 500, Phaser.Easing.Linear.None, true);
    			}*/
    		}
		}

		//this.pgame.camera.y -= 4;
	};

	this.getStarById = function(starId) {
		for (var i in this.mapRender.stars) {
			if (this.mapRender.stars[i].data.id == starId) {
				return this.mapRender.stars[i];
			}
		}
		return null;
	};

	this.requestWarpFleet = function(fleet, startStar, endStar) {
		var self = this;
		var startPos = startStar.data.pos;
		var endPos = endStar.data.pos;

		/*
		jQuery.post( "/game/bridge/warpfleet", {
			fleetId:fleet.data._id,
			sid:this.sid,
			starId:endStar.data.id
		},
		function( updatedFleet ) {
			var points = getPoints(startPos, endPos, self.starRingRadius);
			var dir = diffVector2(startStar.data.pos, endStar.data.pos);
			var travelAngle = this.pgame.physics.arcade.angleBetween({x:0,y:1}, dir) / (2*Math.PI) * 360;
			fleet.warp(endStar, points[0], points[1], travelAngle, updatedFleet.dest.travelTime, updatedFleet.dest.arrivalTime);
		});
		*/
	};

	this.init();
	return this;
}