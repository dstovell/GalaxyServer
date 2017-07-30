"use strict";

function AIBaseState(name, options) {
	var self = this;

	self.options = options;

	self.name = name;
	self.stepCount = 0;
	self.brains = [];
}

AIBaseState.prototype.getName = function(){
	var self = this;
	return self.name;
};

AIBaseState.prototype.getFunctions = function(prefix){
	var self = this;
	var funcs = [];
	for (var k in self) {
		if (k.indexOf(prefix) === 0) {
			var name = k.replace(prefix, "");
			funcs.push({value:name, text:name});
		}
	}
	return funcs;
};

AIBaseState.prototype.getEntities = function(){
	var self = this;
	return self.getFunctions("_entity_");
};

AIBaseState.prototype.getStepStages = function(){
	var self = this;
	return self.getFunctions("_stepState");
};

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

AIBaseState.prototype._entity_self = function(brain, options, cb){
	return cb(null, brain);
};

exports.create = function(options) { return new AIBaseState("base", options); };
exports.AIBaseState = AIBaseState;
