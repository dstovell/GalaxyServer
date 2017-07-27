"use strict";

var async = require("async");
var BrainApi = require("brain");

function AIController(options) {
	var self = this;
	self.options = options;

	self.stepCount = 0;
	self.brains = [];

	self.states = {};
}

AIController.prototype.loadBrains = function(brainConfigs, options) {
	var self = this;

	for (var i=0; i<brainConfigs.length; i++) {
		var bc = brainConfigs[i];
		var initState = bc.initState || "idle";

		var brain = BrainApi.create(self.states[initState], options);
		self.brains.push(brain);
	}
};

AIController.prototype.runSimulation = function(steps, options, cb){
	var self = this;

	async.times(steps, function(stepNumber, next){
    	self.stepSimulation(options, function(err){
    		return next(err);
    	});
	}, function(err) {
		return cb(err);
	});
};

AIController.prototype.stepSimulation = function(options, cb){
	var self = this;

	self.stepCount++;

	async.each(self.brains,function(brain, next){

		brain.step(brain, function(err) {
			return next(err);
		});

	},
	function(err) {
		return cb(err, {});
	});
};

AIController.prototype._stepState = function(brain, options, cb){
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

AIController.prototype._stepStateValueAssignment = function(brain, options, cb){
	return cb();
};

AIController.prototype._stepStateAction = function(brain, options, cb){
	return cb();
};

AIController.prototype._stepStateChange = function(brain, options, cb){
	return cb();
};

var instance = null;
exports.create = function(options) {
	if( instance == null ) {
		instance = new AIController(options);
	}
	return instance;
};

