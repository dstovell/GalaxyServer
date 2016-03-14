"use strict";

var GalaxyHelper = function() {
	var self = this;

	self.config = require('../../lib/galaxy/galaxy_config').galaxy;
	self.math = require('../../static/shared/galaxy_math');

	self.isObject = function(d) {
		return ( (typeof d === "object") && (d !== null) );
	};

	self.getRandomSeed = function(star) {
		return (star != null) ? (star.id + self.config.randomSeed) : self.config.randomSeed;
	};

	self._randomSeed = 0;

	self.seedRandomNumber = function(seed) {
	    self._randomSeed = seed + 1;
	};

	self.random = function() {
	    var x = Math.sin(self._randomSeed++) * 10000;
	    return x - Math.floor(x);
	};

	self.randomRangeInt = function(min, max) {
		if (min === max) {
			return min;
		}
		return Math.floor((self.random() * (max-min+1)) + min);
	};

	self.randomRangeFloat = function(min, max, fixed) {
		if (min === max) {
			return min;
		}
		var rFloat = ((self.random() * (max-min)) + min);
		return (fixed == null) ? rFloat : parseFloat(rFloat.toFixed(fixed));
	};

	self.randomPick = function(picks) {
		picks = picks || [];
		if (picks.length === 0) {
			return null;
		}

		var total = 0;
		var defaultChance = 1.0/picks.length;
		for (var p=0; p<picks.length; p++) {
			if (!self.isObject(picks[p])) {
				picks[p] = {value:picks[p], chance:defaultChance};
			}
			total += picks[p].chance;
		}

		var val = self.randomRangeFloat(0.0, total);
		var pickTotal = 0;
		for (var pp=0; pp<picks.length; pp++) {
			pickTotal += picks[pp].chance;
			if (pickTotal >= val) {
				return picks[pp].value;
			}
		}

		return null;
	};

	self.getSector = function(sectorTable, sectorCoords) {
		return (sectorTable[sectorCoords.x] != null) ? sectorTable[sectorCoords.x][sectorCoords.y] : null;
	};

	self.getSectorsAround = function(sectorTable, sectorCoords, options) {
		options = options || {};
		options.range = (options.range != null) ? options.range : 1;
		var sectors = [];

		var min = -1*options.range;
		var max = options.range;
		for (var x=min; x<=max; x++) {
			for (var y=min; y<=max; y++) {
				var sector = self.getSector(sectorTable, {x:(sectorCoords.x+x), y:(sectorCoords.y+y)});
				if (sector) {
					sectors.push(sector);
				}
			}
		}

		return sectors;
	};

	self.getSectorCoordinates = function(pos, aabb) {
		var sectorSize = {};
		sectorSize.x = aabb.x.size / aabb.x.secDim;
		sectorSize.y = aabb.y.size / aabb.y.secDim;

		var sectorCoords = {};
		sectorCoords.x = Math.floor(pos.x/sectorSize.x);
		sectorCoords.y = Math.floor(pos.y/sectorSize.y);

		return sectorCoords;
	};

	self.findNearbyStars = function(starTable, sectorTable, aabb, star, options) {
		if (star == null) {
			return [];
		}

		options = options || {};
		options.searchArea = options.searchArea || "sectors-near";
		options.range = (options.range != null) ? options.range : 1;
		var near = [];

		if (options.searchArea == "sector") {
			var sectorCoords = self.getSectorCoordinates(star, aabb);
			var sector = self.getSector(sectorTable, sectorCoords);
			if (sector && sector.stars) {
				near = near.concat(sector.stars);
			}
		}
		else if (options.searchArea == "sectors-near") {
			var sectorCoords2 = self.getSectorCoordinates(star, aabb);
			var sectors = self.getSectorsAround(sectorTable, sectorCoords2, options);
			for (var i=0; i<sectors.length; i++) {
				near = near.concat(sectors[i].stars);
			}
		}
		else if (options.searchArea == "galaxy") {
			near = Object.keys(starTable);
		}

		var selfIndex = near.indexOf(star.id);
		if (selfIndex != -1) {
			console.log("removing " + star.id + " from search results");
			near.splice(selfIndex, 1);
		}

		//console.log("findNearbyStars " + star.id + " count=" + near.length);

		return near;
	};

	self.generateNavGraph = function(starTable, nearStarId, sectorTable, aabb, sectorRange) {
		//generateNavGraph without nearStarId 19ms -> with nearStarId 8ms
		//getNavPath took without nearStarId 673ms -> with nearStarId 16ms

		var graph = require('../../lib/galaxy/dijkstras');

		var start = new Date().getTime();

		var addStar = function(star) {
			if (star == null) {
				return;
			}

			var links = {};
			if (star.lnk && (star.lnk.length > 0)) {
				for (var i=0; i<star.lnk.length; i++) {
					if (Array.isArray(star.lnk[i])) {
						links[star.lnk[i][0]] = star.lnk[i][1];
					}
					else {
						links[star.lnk[i]] = 1;
					}
				}
				graph.addVertex(star.id.toString(), links);
			}
		};
		
		if (nearStarId != null) {
			var nearStar = starTable[nearStarId];
			sectorRange = (sectorRange != null) ? sectorRange : 1;
			var nearbyStars = self.findNearbyStars(starTable, sectorTable, aabb, nearStar, {searchArea:"sectors-near", range:sectorRange});
			for (var j=0; j<nearbyStars.length; j++) {
				addStar( starTable[nearbyStars[j]] );		
			}
		}
		else {
			for (var starId in starTable) {
				addStar(starTable[starId]);			
			}
		}
		console.log("generateNavGraph took " + (new Date().getTime() - start) + "ms");

		return graph;
	};

	self.getNavPath = function(graph, starIdStart, starIdEnd) {
		var start = new Date().getTime();

		var path = graph.shortestPath(starIdStart.toString(), starIdEnd.toString());

		var data = {p:[], td:0.0};
		if (path.length < 2) {
			return data;
		} 

		path.push(starIdStart.toString());
		path.reverse();

		for (var i=1; i<path.length; i++) {
			var thisNode = path[i];
			var lastNode =  path[i-1];
			var dist = graph.vertices[lastNode][thisNode];
			data.p.push( {s:parseInt(lastNode), f:parseInt(thisNode), d:dist} );
			data.td += dist;
		}

		console.log("getNavPath took " + (new Date().getTime() - start) + "ms");

		return data;
	};

	self.generateNavPath = function(starTable, sectorTable, aabb, starIdStart, starIdEnd, sectorRange) {
		var graph = self.generateNavGraph(starTable, starIdStart, sectorTable, aabb, sectorRange);
		return self.getNavPath(graph, starIdStart, starIdEnd);
	};

	self.generateProceduralStarTable = function(aabb, spirals, options) {
		self.seedRandomNumber(self.getRandomSeed());

		options = options || {};
		//var units = options.units || "lightyear";

		var table = {};

		var starClasses = [];
		for (var k in self.config.stars.classes) {
			starClasses.push({value:k, chance:self.config.stars.classes[k].chance});
		}

		//console.log("generateProceduralStarTable self.config.starCount=" + self.config.starCount);
		//console.log("generateProceduralStarTable aabb=" + JSON.stringify(aabb));
		//console.log("generateProceduralStarTable starClasses=" + JSON.stringify(starClasses));

		if (self.config.generateMode == "random") {
			for (var i=0; i<self.config.starCount; i++) {
				var star = {id:i};

				for (var d=0; d<self.math.dimensionKeys.length; d++) {
					var dKey = self.math.dimensionKeys[d];
					if ((aabb[dKey].min !== 0) || (aabb[dKey].min !== 0)) {
						star[dKey] = self.randomRangeInt(aabb[dKey].min, aabb[dKey].max);
					}
				}			

				star.c = self.randomPick( starClasses );
				var classData = self.config.stars.classes[star.c] 
				star.M = self.randomRangeFloat(classData.mass.min, classData.mass.max, 2);
				
				table[star.id] = star;
			}
		}
		else {
			var baseChance = 0.000000000001;//Math.pow(self.config.starCount, 0.0005) / ((aabb.x.max-aabb.x.min) * (aabb.y.max-aabb.y.min));
			if (self.config.generateMode === "gausian") {
				baseChance = 0.000000000001;
			}
			var maxRadius = self.math.getDistance({x:0, y:0}, {x:aabb.x.max, y:aabb.y.max});
			var minRadius = self.config.coreSize;
			var idSeq = 0;
			console.log("baseChance=" + baseChance + " maxRadius=" + maxRadius);
			//console.log(aabb.x.min + " -> " + aabb.x.max);
			//console.log(aabb.y.min + " -> " + aabb.y.max);
			for (var x=aabb.x.min; x<aabb.x.max; x++) {
				for (var y=aabb.y.min; y<aabb.y.max; y++) {
					//for (var z=aabb.z.min; z<aabb.z.max; z++) {
					//}
					var pos = {x:x, y:y};
					var posRadius = self.math.getDistance({x:0, y:0}, pos);
					if (posRadius < minRadius) {
						continue;
					}

					var posChance = 1;
					if ((self.config.generateMode == "gausian") || (self.config.generateMode == "spiral")) {
						var posT = (((maxRadius - minRadius) - (posRadius - minRadius)) / (maxRadius - minRadius));
						posChance = 1 + 30000000000*posT*posT*posT*posT*posT;
						posChance = Math.max(posChance, 1.0);
					}
					
					//console.log("spiralDist=" + spiralDist + " spiralChance=" + spiralChance);
					
					var chance = baseChance*posChance;
					var diceRoll = self.randomRangeFloat(0.0, 1.0);
					/*if (posRadius < 200) {
						console.log("baseChance=" + baseChance);
						console.log("posRadius=" + posRadius);
						console.log("posChance=" + posChance);
						console.log("posT=" + posT);
						console.log("chance=" + chance);
						console.log("diceRoll=" + diceRoll);
					}*/
					/*if ((diceRoll + chance) >= 1.0) {
						//console.log("success!");
						var star = {id:idSeq, x:x, y:y};

						star.c = self.randomPick( starClasses );
						var classData = self.config.stars.classes[star.c] 
						star.M = self.randomRangeFloat(classData.mass.min, classData.mass.max, 2);
					
						table[star.id] = star;
						idSeq++;

						if (idSeq % 5000 === 0) {
							console.log("StarCount has reached " + idSeq);
						}
					}*/
					//console.log("====================");
				}
			}

			console.log("GausianStars=" + idSeq);

			if (self.config.generateMode == "spiral") {
				for (var s=0; s<spirals.length; s++) {
					var arc = spirals[s];
					//console.log("arc.length=" + arc.length);
					for (var arcT=1; arcT<arc.length; arcT++) {
						
						var lastPos = arc[arcT-1];
						var nextPos = arc[arcT];
						//console.log("lastPos=" + JSON.stringify(lastPos));
						//console.log("nextPos=" + JSON.stringify(nextPos));
						for (var segmentT=0.1; segmentT<=1.0; segmentT+=0.1) {
							var midPoint = self.math.interpolatePointsInt(lastPos, nextPos, segmentT);
							//console.log("midPoint=" + JSON.stringify(midPoint));

							var posRadius = self.math.getDistance({x:0, y:0}, midPoint);
							if (posRadius < self.config.coreSize) {
								continue;
							}

							var ka = Math.pow( 1, 2 );
							var kb = Math.pow( 1, 2 );
							var kk = ((nextPos.y-lastPos.y) * (midPoint.x-lastPos.x) - (nextPos.x-lastPos.x) * (midPoint.y-lastPos.y)) / (ka + kb);
							//console.log("kk=" + kk);

							var perpPos = {};
							perpPos.x = midPoint.x - kk * (nextPos.y-lastPos.y);
							perpPos.y = midPoint.y + kk * (nextPos.x-lastPos.x);
							//console.log("perpPos=" + JSON.stringify(perpPos));

							for (var dist=0; dist<5; dist++) {
								var randomDist = self.randomRangeInt(-1.5, 1.5);
								randomDist = (dist >= 0) ? randomDist+0.2 : randomDist-0.2;
								var randomPos = self.math.interpolatePointsInt(midPoint, perpPos, randomDist);
								//console.log("randomPos=" + JSON.stringify(randomPos));

								var star = {id:idSeq, x:randomPos.x, y:randomPos.y};

								star.c = self.randomPick( starClasses );
								var classData = self.config.stars.classes[star.c] 
								star.M = self.randomRangeFloat(classData.mass.min, classData.mass.max, 2);
							
								table[star.id] = star;
								idSeq++;

								if (idSeq % 5000 === 0) {
									console.log("StarCount has reached " + idSeq);
								}
							}
						}
					}
				}
			}

			console.log("TotalStars=" + idSeq);
		}

		return table;
	};

	self.generateStarPosition = function(arcIndex) {
		var spiralConfig = self.config.spirals;

		var randomT = self.randomRangeFloat(0.2, 1.0);
		randomT = randomT*randomT;

		//console.log("spiralConfig.count=" + spiralConfig.count);
		var spiralInc = 2*Math.PI/spiralConfig.count;
		var arcPos = self.math.getPositionOnSpiral({x:0, y:0}, spiralConfig.openingRate, spiralConfig.arcLength, arcIndex*spiralInc, randomT);

		var dimSize = 150.0 - 100.0*Math.pow(randomT, 3);
		var heightSize = 50.0 - 45.0*Math.pow(randomT, 3);

		var tx = self.randomRangeFloat(-1.0, 1.0);
		var dx = Math.pow(tx, 3) * dimSize;
		var ty = self.randomRangeFloat(-1.0, 1.0);
		var dy = Math.pow(ty, 3) * dimSize;
		var tz = self.randomRangeFloat(-1.0, 1.0);
		var dz = Math.pow(tz, 3) * heightSize;
		var randomPos = {x:arcPos.x+dx, y:arcPos.y+dy, z:dz};

		return randomPos;
	};

	self.generateProceduralStarTable2 = function(aabb, spirals, options) {
		self.seedRandomNumber(self.getRandomSeed());

		options = options || {};
		//var units = options.units || "lightyear";

		var table = {};
		var idSeq = 0;

		var starClasses = [];
		for (var k in self.config.stars.classes) {
			starClasses.push({value:k, chance:self.config.stars.classes[k].chance});
		}

		var spiralConfig = self.config.spirals;

		console.log("generateProceduralStarTable2 self.config.starCount=" + self.config.starCount + " spirals.length=" + spirals.length);
		console.log("generateProceduralStarTable2 aabb=" + JSON.stringify(aabb));
		console.log("generateProceduralStarTable2 starClasses=" + JSON.stringify(starClasses));
		console.log("generateProceduralStarTable2 spiralConfig=" + JSON.stringify(spiralConfig));

		for (var i=0; i<self.config.starCount; i++) {
			//console.log("i=" + i + " mod=" + i%spiralConfig.count + " mod=" + (i+1)%spiralConfig.count + " mod=" + (i+2)%spiralConfig.count);
			var arcIndex = i%spiralConfig.count;

			var randomPos = null;
			for (var rp=0; rp<100; rp++) {
				randomPos = self.generateStarPosition(arcIndex);
				var posRadius = self.math.getDistance({x:0, y:0}, randomPos);
				if (posRadius > self.config.coreSize) {
					break;
				}
			}

			var star = {id:idSeq, x:Math.round(randomPos.x), y:Math.round(randomPos.y), z:Math.round(randomPos.z)};

			star.c = self.randomPick( starClasses );
			var classData = self.config.stars.classes[star.c];
			star.M = self.randomRangeFloat(classData.mass.min, classData.mass.max, 2);
		
			table[star.id] = star;
			idSeq++;
		}

		console.log("TotalStars=" + idSeq);

		return table;
	};

	self.generateSectorTable = function(starTable, aabb, sectorDimentions) {
		starTable = starTable || {};
		sectorDimentions = sectorDimentions || {};
		aabb.x.secDim = sectorDimentions.x || 10;
		aabb.y.secDim = sectorDimentions.y || 10;

		var table = {};

		for (var k in starTable) {
			var star = starTable[k];
			var sectorCoords = self.getSectorCoordinates(star, aabb);
			table[sectorCoords.x] = table[sectorCoords.x] || {};
			table[sectorCoords.x][sectorCoords.y] = table[sectorCoords.x][sectorCoords.y] || {sc:0};

			table[sectorCoords.x][sectorCoords.y].sc++;
			table[sectorCoords.x][sectorCoords.y].stars = table[sectorCoords.x][sectorCoords.y].stars || [];
			table[sectorCoords.x][sectorCoords.y].stars.push(k);
			//star.s = sectorCoords;
		}

		return table;
	};

	self.isUnlinked = function(star) {
		return ((star.lnk == null) || (star.lnk.length === 0));
	};

	self.isStarsLinked = function(star1, star2) {
		star1.lnk = star1.lnk || [];

		for (var i=0; i<star1.lnk.length; i++) {
			if (star1.lnk[i][0] === star2.id) {
				return true;
			}
		}

		return false;
	};

	self.generateLink = function(star1, star2) {
		star1.lnk = star1.lnk || [];
		star2.lnk = star2.lnk || [];

		if (!self.isStarsLinked(star1, star2)) {
			var dist = self.math.getDistance(star1, star2, 2);
			star1.lnk.push([star2.id, dist]);
			star2.lnk.push([star1.id, dist]);
			return true;
		}
		return false;
	};

	self.generateLinks = function(starTable, sectorTable, aabb, options) {
		starTable = starTable || {};
		options = options || {};
		options.maxLinkDist = options.maxLinkDist || 10.0;

		var maxLinkDistSquared = options.maxLinkDist*options.maxLinkDist;

		var linkData = {totalLinkCount:0, maxLinkCount:0, unlinkedCount:Object.keys(starTable).length, searchExpansion1:0, searchExpansion2:0};

		var linkStars = function(s1, s2) {
			var s1Unlinked = self.isUnlinked(s1);
			var s2Unlinked = self.isUnlinked(s2);

			var didLink = self.generateLink(s1, s2);
			if (didLink) {
				linkData.totalLinkCount++;
				linkData.maxLinkCount = Math.max(linkData.maxLinkCount, s1.lnk.length);
				linkData.maxLinkCount = Math.max(linkData.maxLinkCount, s2.lnk.length);
				if (s1Unlinked) {
					linkData.unlinkedCount--;
				}
				if (s2Unlinked) {
					linkData.unlinkedCount--;
				}
			}
		};

		for (var k1 in starTable) {
			var star1 = starTable[k1];
			var closest = {id:-1, dist:Number.MAX_VALUE};
			var nearbyStars = self.findNearbyStars(starTable, sectorTable, aabb, star1, {searchArea:"sectors-near", range:1});
			if (nearbyStars.length === 0) {
				linkData.searchExpansion1++;
				console.log("expanding search to range 4");
				nearbyStars = self.findNearbyStars(starTable, sectorTable, aabb, star1, {searchArea:"sectors-near", range:4});
			}
			if (nearbyStars.length === 0) {
				linkData.searchExpansion2++;
				console.log("expanding search to all");
				nearbyStars = self.findNearbyStars(starTable, sectorTable, aabb, star1, {searchArea:"galaxy"});
			}
			//console.log("nearbyStars=" + JSON.stringify(nearbyStars));
			for (var i=0; i<nearbyStars.length; i++) {
				var star2 = starTable[ nearbyStars[i] ];

				if (k1 == star2.id) {//don't need this
					continue;
				}
				var distSquared = self.math.getDistanceSquared(star1, star2);
				if (closest.dist > distSquared) {
					closest.id = star2.id;
					closest.dist = distSquared;
				}

				if (distSquared < maxLinkDistSquared) {
					linkStars(star1, star2);
				}
			}

			if (self.isUnlinked(star1)) {
				if (closest.id > -1) {
					linkStars(star1, starTable[closest.id]);
				}
			}
		}

		return linkData;
	};

	self.generateGalaxy = function(options) {
		options = options || {};

		var start = 0;
		var startTotal = new Date().getTime();
		var data = {};

		data.units = "lightyear";

		start = new Date().getTime();
		data.aabb = self.math.generateAABB(self.config.dimensions, options);
		console.log("generateAABB took " + (new Date().getTime() - start) + "ms");

		start = new Date().getTime();
		data.spirals = self.math.generateSpirals({x:0, y:0}, self.config.spirals);
		console.log("generateSpirals took " + (new Date().getTime() - start) + "ms");

		start = new Date().getTime();
		data.stars = self.generateProceduralStarTable2(data.aabb, data.spirals, options);
		console.log("generateProceduralStarTable took " + (new Date().getTime() - start) + "ms");

		start = new Date().getTime();
		data.sectors = self.generateSectorTable(data.stars, data.aabb, {x:10, y:10});
		console.log("generateSectorTable took " + (new Date().getTime() - start) + "ms");

		start = new Date().getTime();
		data.links = self.generateLinks(data.stars, data.sectors, data.aabb, options);
		console.log("generateLinks took " + (new Date().getTime() - start) + "ms to generate " + data.links.totalLinkCount + " links"); //28423ms -> 16667ms -> 4535ms -> 15812ms
		
		console.log("==========================================");
		console.log("Total took " + (new Date().getTime() - startTotal) + "ms");

		return data;
	};

	self.generatePlanet = function(star, planetConfig) {
		var planet = {};

		planet.c = self.randomPick( Object.keys(planetConfig.classes) );
		var classData = planetConfig.classes[planet.c];
		planet.od = self.randomRangeFloat( classData.orbitalRange.min, classData.orbitalRange.max, 4 );
		planet.sz = self.randomRangeFloat( classData.sizeRange.min, classData.sizeRange.max, 4 );
		
		var sizePercentage = (planet.sz - classData.sizeRange.min) / (classData.sizeRange.max - classData.sizeRange.min);
		planet.res = {};
		for (var r in (classData.resources||{})) {
			planet.res[r] = self.math.interpolateInt(classData.resources[r].min, classData.resources[r].max, sizePercentage);
		}

		planet.cn = classData.name;

		return planet;
	};

	self.generateSolarSystem = function(star, aabb, options) {
		self.seedRandomNumber(self.getRandomSeed(star));

		var sectorCoords = self.getSectorCoordinates(star, aabb);
		star.s = sectorCoords;

		var planetConfig = self.config.planets;
		var planetCount = self.randomRangeInt(planetConfig.count.min, planetConfig.count.max);
		star.planets = {};
		var planetList = [];
		for (var i=0; i<planetCount; i++) {
			planetList.push( self.generatePlanet(star, planetConfig) );
		}
		planetList.sort(function( a, b ) {
			return a.od - b.od;
		});
		for (var j=0; j<planetList.length; j++) {
			star.planets[j] = planetList[j];
		}
	};
};

module.exports = new GalaxyHelper();
