"use strict";

var util = require('util');
var AIBaseState = require("./base").AIBaseState;

function AIIdleState(options) {
	var self = this;
	self.options = options;

	self.stepCount = 0;
	self.brains = [];
}

util.inherits(AIIdleState, AIBaseState);

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
