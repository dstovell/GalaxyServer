"use strict";

function galaxyManager() {
	var self = this;
	
	self.getGalaxy = function(cb) {
		jQuery.get( "/api/galaxy/getGalaxy",
		function( result ) {
			self.galaxy = result.result.galaxy;
			self.config = result.result.config;

			return cb( result.err, self.galaxy, self.config );
		});
	};

	self.getStar = function(starId, cb) {
		jQuery.get( "/api/galaxy/getStar/" + starId,
		function( result ) {
			console.log("result=" + JSON.stringify(result));
			return cb( result );
		});
	};
}

var GalaxyManager = new galaxyManager();
