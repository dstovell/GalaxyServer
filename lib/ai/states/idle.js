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

AIIdleState.prototype._stepStateValueAssignment = function(brain, options, cb){
	console.log("AIIdleState.prototype._stepStateValueAssignment");
	return cb();
};

AIIdleState.prototype._stepStateAction = function(brain, options, cb){
	console.log("AIIdleState.prototype._stepStateAction");
	return cb();
};

AIIdleState.prototype._stepStateChange = function(brain, options, cb){
	console.log("AIIdleState.prototype._stepStateChange");

	return cb();
};

exports.create = function(options) { return new AIIdleState(options); };
