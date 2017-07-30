"use strict";

var async = require("async");
var BrainApi = require("./brain");

function AIStateMachine(options) {
	var self = this;
	self.options = options;

	self.stepCount = 0;
	self.brains = [];

	self.states = {};
}

AIStateMachine.prototype.loadStates = function(states, options) {
	var self = this;
	options = options || {};

	self.states = states;	
	console.log("self.states=" + JSON.stringify(self.states));
};

AIStateMachine.prototype.getStates = function(options) {
	var self = this;
	options = options || {};

	var stateList = [];
	for (var k in self.states) {
		var state = self.states[k];
		var name = state.getName();
		var stages = state.getStepStages();
		var entities = state.getEntities();
		stateList.push({id:k, name:name, stages:stages, entities:entities});
	}	

	return stateList;
};

AIStateMachine.prototype.loadBrains = function(brainApi, brainConfigs, options) {
	var self = this;

	for (var i=0; i<brainConfigs.length; i++) {
		var bc = brainConfigs[i];
		var initState = bc.initState || "idle";

		var brain = brainApi.create(self.states[initState], options);
		self.brains.push(brain);
	}
	console.log("self.brains=" + JSON.stringify(self.brains));
};

AIStateMachine.prototype.runSimulation = function(async, steps, options, cb){
	var self = this;

	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	var stepWaitMs = options.stepWaitMs || 0;

	console.log("runSimulation steps=" + steps + " stepWaitMs=" + stepWaitMs);

	async.timesLimit(steps, 1, function(stepNumber, next){
    	self.stepSimulation(async, options, function(err){
    		if (err) {
    			return next(err);
    		}

    		if (stepWaitMs <= 0) {
    			return next();
    		}

    		setTimeout(function () {
				return next();
    		}, stepWaitMs);
    	});
	}, function(err) {
		console.log("runSimulation self.stepCount=" + self.stepCount);
		return cb(err);
	});
};

AIStateMachine.prototype.stepSimulation = function(async, options, cb){
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

AIStateMachine.prototype._stepState = function(brain, options, cb){
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

AIStateMachine.prototype._stepStateValueAssignment = function(brain, options, cb){
	return cb();
};

AIStateMachine.prototype._stepStateAction = function(brain, options, cb){
	return cb();
};

AIStateMachine.prototype._stepStateChange = function(brain, options, cb){
	return cb();
};

exports.create = function(options) {
	return new AIStateMachine(options);
};
