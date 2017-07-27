"use strict";

function AIBaseState(options) {
	var self = this;
	self.options = options;

	self.stepCount = 0;
	self.brains = [];
}

AIBaseState.prototype.step = function(brain, options, cb){
	var self = this;

	self._stepStateValueAssignment(brain, options, function(err) {
		if (err) {
			return cb(err);
		}

		self._stepStateAction(brain, options, function(err) {
			if (err) {
				return cb(err);
			}

			self._stepStateChange(brain, options, function(err) {
				if (err) {
					return cb(err);
				}

				return cb();
			});
		});
	});
};

AIBaseState.prototype._stepStateValueAssignment = function(brain, options, cb){
	return cb();
};

AIBaseState.prototype._stepStateAction = function(brain, options, cb){
	return cb();
};

AIBaseState.prototype._stepStateChange = function(brain, options, cb){
	return cb();
};

exports.AIBaseState = AIBaseState;
