"use strict";

var util = require('util');
var AIBaseState = require("./base").AIBaseState;

function AIIdleState(options) {
	var self = this;

	AIBaseState.call(self, "idle", options);
}

util.inherits(AIIdleState, AIBaseState);

AIIdleState.prototype.getName = function(){
	return "Idle";
};

AIIdleState.prototype._getAllowedStateChanges = function(){
	return ["build", "harvest", "travel_solar"];
};

exports.create = function(options) { return new AIIdleState(options); };
