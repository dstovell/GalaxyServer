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

exports.create = function(options) { return new AIIdleState(options); };
