"use strict";

function AIBrain(state, options) {
	var self = this;
	self.options = options;

	self.stepCount = 0;

	self.changeState(state);
}

AIBrain.prototype.changeState = function(newState){
	var self = this;
	self.currentState = newState;
};

AIBrain.prototype.step = function(options, cb){
	var self = this;

	self.stepCount++;

	self.currentState.step(self, options, function(err) {
		return cb(err);
	});
};

exports.create = function(state, options) { return new AIBrain(state, options); };
