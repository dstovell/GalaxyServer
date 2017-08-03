"use strict";

var util = require('util');
var AIBaseState = require("./base").AIBaseState;

function AITravelSolarState(options) {
	var self = this;

	AIBaseState.call(self, "travel_solar", options);
}

util.inherits(AITravelSolarState, AIBaseState);

AITravelSolarState.prototype.getName = function(){
	return "Solar System Travel";
};

AITravelSolarState.prototype._getAllowedStateChanges = function(){
	return ["idle", "travel_interstellar"];
};

AITravelSolarState.prototype._setupEntities = function(){
	var self = this;

	AIBaseState.prototype._setupEntities.call(self);

	self.entities.moveTarget =  {
		type:"orbitable",
		params: {},
		func: function(brain, params, cb){
			return cb(null, {});
		}
	};
};

exports.create = function(options) { return new AITravelSolarState(options); };
