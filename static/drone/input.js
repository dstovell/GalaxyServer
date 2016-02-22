"use strict";

function InputModule(_pgame)
{
	var self = this;
	self.pgame = _pgame;

	self.init = function() {
		if (self.pgame.input.mouse) {
			self.pgame.input.mouse.mouseWheelCallback = self.onMouseWheel;
		}

		self.worldScale = 1.0;
		self.rotationRate = 0.0;
	};

	self.moveCameraTo = function(x, y) {
		var cam = self.pgame.camera;
		cam.follow(null);
		self.pgame.add.tween(cam).to(	{ x: x - (cam.width / 2), y: y - (cam.height / 2) }, 
									750, Phaser.Easing.Quadratic.InOut, true );
	};

	self.updateCamera = function() {
		if (!self.pgame) {
			return;
		}

		if (self._wasTouching1 && self._wasTouching2) {

		}
		else if (self._wasTouching1) {
	   		self.pgame.world.pivot.x += self._dX1/(self.pgame.world.scale.x*1);
	   		self.pgame.world.pivot.y += self._dY1/(self.pgame.world.scale.y*1);
	   	}
	};

	self.zoom = function(amount) {
		self.worldScale += amount * self.worldScale;
		self.worldScale = Math.max(self.worldScale, 1.0);
		self.worldScale = Math.min(self.worldScale, 40.0);
		self.pgame.world.scale.set(self.worldScale);
	};

	self.updateTouch = function() {
		if (!self.pgame) {
			return;
		}

		var touch1 = null;
		var touch2 = null;
	    if (self.pgame.input.mousePointer && self.pgame.input.mousePointer.isDown) {
	    	touch1 = self.pgame.input.mousePointer;
	    }
	    
	    if (self.pgame.input.pointer1 && self.pgame.input.pointer1.isDown) {
	    	touch1 = self.pgame.input.pointer1;
	    }

	    if (self.pgame.input.pointer2 && self.pgame.input.pointer2.isDown) {
	    	touch2 = self.pgame.input.pointer2;
	    }

	    if (touch1 && touch2) {
	    	var dist = galaxy_math.getDistance({x:touch1.clientX, y:touch1.clientY}, {x:touch2.clientX, y:touch2.clientY});

	    	if (!self._wasTouching1 || !self._wasTouching2) {
	    		self._dis = dist;
	    		self._wasTouching1 = true;
	    		self._wasTouching2 = true;
	    	}
	    	else if (dist > self._dis) {
	    		self.zoom(0.1);
	    	}
	    	else if (dist < self._dis) {
	    		self.zoom(-0.1);
	    	}

	    	self._dis = dist;
	    }
	    else if (touch1) {
	    	if (!self._wasTouching1) {
	    		self._wasTouching1 = true;
	    		self._dX1 = 0;
	    		self._dY1 = 0;
	    	}
	    	else {
	    		self._dX1 = self._lastTouchX1 - touch1.clientX;
	    		self._dY1 = self._lastTouchY1 - touch1.clientY;
	    	}

	    	self._lastTouchX1 = touch1.clientX;
	    	self._lastTouchY1 = touch1.clientY;
	    	//return {x:self._lastTouchX, y:self._lastTouchY, dX:self._dX, dY:self._dY};
	    }
	    else {
	    	self._wasTouching1 = false;
	    	self._wasTouching2 = false;
	    	self._dX1 = 0;
	    	self._dY1 = 0;
	    	self._dis = 0;
	    }

	    return;
	};

	self.setRotationRate = function(rate) {
		self.rotationRate = rate;
	};

	self.onMouseWheel = function(event) { 
    	if (self.pgame.input.mouse.wheelDelta > 0) {
    		self.zoom(-0.03);
    	} else if (self.pgame.input.mouse.wheelDelta < 0) {
    		self.zoom(0.03);
    	} 
    };

	self.update = function() {
		self.updateTouch();
		self.updateCamera();

		if (self.rotationRate) {
			self.pgame.world.rotation += self.rotationRate;
		}
	};

	self.init();
}