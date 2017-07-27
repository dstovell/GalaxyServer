"use strict";

function AIBrain(state, options) {
	var self = this;
	self.options = options;

	self.stepCount = 0;
	self.brains = [];

	self.currentState = state;
}

AIBrain.prototype.step = function(options, cb){
	var self = this;

	self.currentState.step(self, options, function(err) {
		return cb(err);
	});
};

exports.create = function(state, options) { new AIBrain(state, options); };
