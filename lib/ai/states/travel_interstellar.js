"use strict";

var util = require('util');
var AIBaseState = require("./base").AIBaseState;

function AITravelInterstellarState(options) {
	var self = this;

	AIBaseState.call(self, "travel_interstellar", options);
}

util.inherits(AITravelInterstellarState, AIBaseState);

AITravelInterstellarState.prototype.getName = function(){
	return "Interstellar Travel";
};

AITravelInterstellarState.prototype._getAllowedStateChanges = function(){
	return ["travel_solar"];
};

AITravelInterstellarState.prototype._setupEntities = function(){
	var self = this;

	AIBaseState.prototype._setupEntities.call(self);

	self.entities.moveTarget =  {
		type:"star",
		params: {},
		func: function(brain, params, cb){
			return cb(null, {});
		}
	};
};

exports.create = function(options) { return new AITravelInterstellarState(options); };
