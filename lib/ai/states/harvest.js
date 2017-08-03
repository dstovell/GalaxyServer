"use strict";

var util = require('util');
var AIBaseState = require("./base").AIBaseState;

function AIHarvestState(options) {
	var self = this;

	AIBaseState.call(self, "harvest", options);
}

util.inherits(AIHarvestState, AIBaseState);

AIHarvestState.prototype.getName = function(){
	return "Harvest";
};

AIHarvestState.prototype._getAllowedStateChanges = function(){
	return ["idle", "travel_solar", "harvest"];
};

AIHarvestState.prototype._setupEntities = function(){
	var self = this;

	AIBaseState.prototype._setupEntities.call(self);

	self.entities.harvestTarget =  {
		type:"orbital",
		params: {},
		func: function(brain, params, cb){
			return cb(null, {});
		}
	};
};

exports.create = function(options) { return new AIHarvestState(options); };
