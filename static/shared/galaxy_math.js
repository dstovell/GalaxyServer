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

    exports.getPositionOnCircle = function(centerPos, radius, theta) {
      var p = {};
      p.x = centerPos.x + radius*Math.cos(theta);
      p.y = centerPos.x + radius*Math.sin(theta);
      return p;
    };

    exports.getPositionOnSpiral = function(startPoint, openingRate, arcLength, startAngle, t) {
      var maxAngle = arcLength * 2 * Math.PI + startAngle;
      var segmentArc = 0.05;
      var r = 10;
      var arc = [];

      var arcT = t*(maxAngle-startAngle) + startAngle;
      r = r + openingRate*(arcT/segmentArc);
      var p = exports.getPositionOnCircle(startPoint, r, arcT);
      
      return p;
    };

    exports.generateSpiral = function(startPoint, openingRate, arcLength, startAngle) {
      var maxAngle = arcLength * 2 * Math.PI + startAngle;
      var segmentArc = 0.05;
      var r = 10;
      var arc = [];
      for (var t=startAngle;t<maxAngle;t+=segmentArc) { 
        var p = exports.getPositionOnCircle(startPoint, r, t);
        arc.push(p);
        r += openingRate;
      }
      return arc;
    };

    exports.generateSpirals = function(center, spiralConfig) {
      var spirals = [];
      var spiralInc = 2*Math.PI/spiralConfig.count;
      for (var i=0; i<spiralConfig.count; i++) {
        var arc = exports.generateSpiral(center, spiralConfig.openingRate, spiralConfig.arcLength, i*spiralInc);
        spirals.push(arc);
      }
      return spirals;
    };

    exports.getPerpendicularSegment = function(lastPos, nextPos, t) {
      /*var midPoint = exports.interpolatePointsFloat(lastPos, nextPos, t);
             
      var ka = Math.pow( 1, 2 );
      var kb = Math.pow( 1, 2 );
      var kk = ((nextPos.y-lastPos.y) * (midPoint.x-lastPos.x) - (nextPos.x-lastPos.x) * (midPoint.y-lastPos.y)) / (ka + kb);
      //console.log("kk=" + kk);

      var perpPos = {};
      perpPos.x = midPoint.x - kk * (nextPos.y-lastPos.y);
      perpPos.y = midPoint.y + kk * (nextPos.x-lastPos.x);*/

      var midPoint = exports.interpolatePointsFloat(lastPos, nextPos, 0.5);
      var x1 = lastPos.x;
      var y1 = lastPos.y;
      var x2 = nextPos.x;
      var y2 = nextPos.y;
      var x3 = midPoint.x;
      var y3 = midPoint.y;

      var k = ((y2-y1) * (x3-x1) - (x2-x1) * (y3-y1)) / ( Math.pow((y2-y1), 2) + Math.pow((x2-x1), 2) );
      var x4 = x3 - k * (y2-y1);
      var y4 = y3 + k * (x2-x1);

      return {start:midPoint, end:{x:x4, y:y4}};
    };

    exports.distToSegmentSquared = function(p, v, w) {
      var l2 = exports.getDistance(v, w);
      if (l2 === 0) {
        return exports.getDistance(p, v);
      }
      var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
      if (t < 0) {
        return exports.getDistance(p, v);
      }
      if (t > 1) {
        return exports.getDistance(p, w);
      }
      return exports.getDistance(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
    };

    exports.getDistanceFromArc = function(pos, arc) {
      arc = arc || [];
      //console.log("getDistanceFromArc arc=" + arc.length);
      var minDist = Number.MAX_VALUE;
      for (var i=1; i<arc.length; i++) {
        var lastPos = arc[i-1];
        var nextPos = arc[i];
        var dist = exports.distToSegmentSquared(pos, lastPos, nextPos);
        //console.log("distToSegmentSquared=" + dist);
        minDist = Math.min(minDist, dist);
      }
      return Math.sqrt(minDist);
    };

    exports.getDistanceFromArcArray = function(pos, arcs) {
      var minDist = Number.MAX_VALUE;
      //var start = new Date().getTime();
      for (var i=0; i<arcs.length; i++) {
        var dist = exports.getDistanceFromArc(pos, arcs[i]);
        minDist = Math.min(minDist, dist);
      }
      //console.log("getDistanceFromArcArray dist=" + minDist + " took " + (new Date().getTime() - start) + "ms");
      return minDist;
    };

    exports.generateAABB = function(dimensions, options) {
      options = options || {};
      var dims = {};

      for (var d=0; d<exports.dimensionKeys.length; d++) {
        var dKey = exports.dimensionKeys[d];
        dims[dKey] = {min:(-1*dimensions[dKey]), max:dimensions[dKey]};
        dims[dKey].size = dims[dKey].max - dims[dKey].min;
      }

      return dims;
    };

    exports.generateAABBFromPoints = function(pointArray, options) {
      pointArray = pointArray || [];
      options = options || {};
      var multiplier = options.coordinateMult || 1;

      var bounds = options.bounds || {}
      for (var d=0; d<exports.dimensionKeys.length; d++) {
        var dKey = exports.dimensionKeys[d];
        bounds[dKey] = bounds[dKey] || Number.MAX_VALUE;
      }

      var dims = {};

      for (var i=0; i<pointArray.length; i++) {
        var point = pointArray[i];
        var insideBounds = true;

        for (var d=0; d<exports.dimensionKeys.length; d++) {
          var dKey = exports.dimensionKeys[d];
          bounds[dKey] = bounds[dKey] || Number.MAX_VALUE;

          if (Math.abs(point[dKey]) > bounds[dKey]) {
            insideBounds = false;
            break;
          }
        }
        if (!insideBounds) {
          continue;
        }

        for (var d=0; d<exports.math.dimensionKeys.length; d++) {
          var dKey = exports.dimensionKeys[d];

          dims[dKey] = dims[dKey] || {min:Number.MAX_VALUE, max:Number.MIN_VALUE};
          dims[dKey].min = Math.min(dims[dKey].min, (point[dKey]*multiplier));
          dims[dKey].max = Math.max(dims[dKey].max, (point[dKey]*multiplier));
          dims[dKey].size = dims[dKey].max - dims[dKey].min;
        }
      }

    return dims;
  };

})(typeof exports === 'undefined'? this['galaxy_math']={}: exports);