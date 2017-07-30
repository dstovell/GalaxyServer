"use strict";

function AIBaseState(name, options) {
	var self = this;

	self.options = options;

	self.name = name;
	self.stepCount = 0;
	self.brains = [];

	self.entities = {};
	self._setupEntities();
}

AIBaseState.prototype._setupEntities = function(){
	var self = this;

	self.entities.self =  {
		type:"brain",
		params: {},
		func: function(brain, params, cb){
			return cb(null, brain ? brain.entity : null);
		}
	};
};

AIBaseState.prototype._stepStateValueAssignment = function(brain, options, cb){
	return cb();
};

AIBaseState.prototype._stepStateAction = function(brain, options, cb){
	return cb();
};

AIBaseState.prototype.getName = function(){
	var self = this;
	return self.name;
};


//======================== Utilties ========================

AIBaseState.prototype.getEntities = function(){
	var self = this;

	var ents = [];
	for (var k in self.entities) {
		var type = self.entities[k].type;
		var text = k + " (" + type + ")";
		ents.push({value:k, text:text, type:type});
	}
	return ents;
};

AIBaseState.prototype.hasEntity = function(name){
	var self = this;
	return (self.entities[name] != null);
};

AIBaseState.prototype.getEntity = function(name, brain, params, cb){
	var self = this;
	if (!self.hasEntity(name)) {
		return false;
	}
	return self.entities[name].call(self, brain, params, cb);
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

exports.create = function(options) { return new AIBaseState("base", options); };
exports.AIBaseState = AIBaseState;
