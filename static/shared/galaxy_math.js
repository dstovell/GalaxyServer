"use strict";

(function(exports){

    exports.dimensionKeys = ['x', 'y'];

	exports.lightYearsPerParsec = 3.26156;

	exports.secsPerMin = 60;
	exports.secsPerHour = exports.secsPerMin * 60;
	exports.secsPerDay = exports.secsPerHour * 24;

	exports.interpolateFloat = function(min, max, t, fixed) {
		var range = (max - min);
		return min + t*range;
	};

	exports.interpolateInt = function(min, max, t) {
		return Math.floor(exports.interpolateFloat(min, max, t));
	};

	exports.interpolatePointsFloat = function(pos0, pos1, t) {
		var p = {};
		p.x = exports.interpolateFloat(pos0.x, pos1.x, t);
		p.y = exports.interpolateFloat(pos0.y, pos1.y, t);
		return p;
	};

	exports.interpolatePointsInt = function(pos0, pos1, t, fixed) {
		var p = {};
		p.x = Math.floor(exports.interpolateFloat(pos0.x, pos1.x, t, fixed));
		p.y = Math.floor(exports.interpolateFloat(pos0.y, pos1.y, t, fixed));
		return p;
	};

	exports.getDistanceSquared = function(pos1, pos2) {
		var total = 0;
		for (var d=0; d<exports.dimensionKeys.length; d++) {
			var dKey = exports.dimensionKeys[d];
			var delta = (pos2[dKey] - pos1[dKey]);
			total = total + delta*delta;
		}
		return total;
	};

	exports.getDistance = function(pos1, pos2, fixed) {
		var dist = Math.sqrt( exports.getDistanceSquared(pos1, pos2) );
		return (fixed == null) ? dist : parseFloat(dist.toFixed(fixed));
	};


	exports.bvToRgb = function(bv) {    // RGB <0,1> <- BV <-0.4,+2.0> [-]
    	var r;
    	var g;
    	var b;
    	var t;  r=0.0; g=0.0; b=0.0; if (bv<-0.4) bv=-0.4; if (bv> 2.0) bv= 2.0;
		if ((bv>=-0.40)&&(bv<0.00)) { t=(bv+0.40)/(0.00+0.40); r=0.61+(0.11*t)+(0.1*t*t); }
    	else if ((bv>= 0.00)&&(bv<0.40)) { t=(bv-0.00)/(0.40-0.00); r=0.83+(0.17*t)          ; }
    	else if ((bv>= 0.40)&&(bv<2.10)) { t=(bv-0.40)/(2.10-0.40); r=1.00                   ; }
        if ((bv>=-0.40)&&(bv<0.00)) { t=(bv+0.40)/(0.00+0.40); g=0.70+(0.07*t)+(0.1*t*t); }
		else if ((bv>= 0.00)&&(bv<0.40)) { t=(bv-0.00)/(0.40-0.00); g=0.87+(0.11*t)          ; }
		else if ((bv>= 0.40)&&(bv<1.60)) { t=(bv-0.40)/(1.60-0.40); g=0.98-(0.16*t)          ; }
		else if ((bv>= 1.60)&&(bv<2.00)) { t=(bv-1.60)/(2.00-1.60); g=0.82         -(0.5*t*t); }
		if ((bv>=-0.40)&&(bv<0.40)) { t=(bv+0.40)/(0.40+0.40); b=1.00                   ; }
		else if ((bv>= 0.40)&&(bv<1.50)) { t=(bv-0.40)/(1.50-0.40); b=1.00-(0.47*t)+(0.1*t*t); }
		else if ((bv>= 1.50)&&(bv<1.94)) { t=(bv-1.50)/(1.94-1.50); b=0.63         -(0.6*t*t); }

		return {r:r,g:g,b:b};
    };

	exports.rgbToHex = function(red, green, blue) {
        var rgb = blue | (green << 8) | (red << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1);
  	};

  	exports.bvToHex = function(bv) {
  		var colour = exports.bvToRgb(bv);
		return exports.rgbToHex(colour.r, colour.g, colour.b);
  	};

  	exports.getStarRadius = function(M) {
  		if (M === 1.0) {
  			return 1.0;
  		}
  		else if (M < 1.0) {
  			return Math.pow(M, 0.8);
  		}
  		else {
  			return Math.pow(M, 0.5);
  		}
  	};

  	exports.getStarLuminosity = function(M) {
  		return Math.pow(M, 3.5);
  	};

  	exports.getStarTemperature = function(M) {
  		var L = exports.getStarLuminosity(M);
  		var R = exports.getStarRadius(M);
  		return Math.pow( (L/Math.pow(R, 2)), 0.25);
  	};

  	exports.getStarHabitableZone = function(M) {
  		var L = exports.getStarLuminosity(M);
  		var zone = {};
  		zone.min = Math.sqrt( L / 1.1 );
  		zone.max = Math.sqrt( L / 0.53 );
  		return zone;
  	};

  	exports.getStarPlanetZone = function(M) {
  		var zone = {};
  		zone.min = 0.1 * M;
  		zone.max = 40.0 * M;
  		return zone;
  	};

  	exports.getStarFrostPoint = function(M) {
  		var L = exports.getStarLuminosity(M);
  		return 4.85 * Math.sqrt( L );
  	};

})(typeof exports === 'undefined'? this['galaxy_math']={}: exports);