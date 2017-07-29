"use strict";

var util = require('util');
var AIBaseState = require("./base").AIBaseState;

function AIBuildState(options) {
	var self = this;

	AIBaseState.call(self, "build", options);
}

util.inherits(AIBuildState, AIBaseState);

AIBuildState.prototype.getName = function(){
	return "Build";
};

AIBuildState.prototype._stepStateValueAssignment = function(brain, options, cb){
	console.log("AIIdleState.prototype._stepStateValueAssignment");
	return cb();
};

AIBuildState.prototype._stepStateAction = function(brain, options, cb){
	console.log("AIIdleState.prototype._stepStateAction");
	return cb();
};

AIBuildState.prototype._stepStateChange = function(brain, options, cb){
	console.log("AIIdleState.prototype._stepStateChange");

	return cb();
};

AIBuildState.prototype._entity_buildTask = function(brain, options, cb){
	return cb();
};

exports.create = function(options) { return new AIBuildState(options); };
