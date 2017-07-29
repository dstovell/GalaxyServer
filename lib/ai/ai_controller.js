"use strict";

var async = require("async");
var BrainApi = require("../../lib/ai/brain");

function AIController(options) {
	var self = this;
	self.options = options;

	self.stepCount = 0;
	self.brains = [];

	self.states = {};
}

AIController.prototype.loadStates = function(options) {
	var self = this;

	function loadState(name) {
		var path = "../../lib/ai/states/"+name;
		console.log("loadState: " + name + " path: " + path);
		self.states[name] = require(path).create(options);
	}

	loadState("base");
	loadState("idle");
	loadState("build");
	
	console.log("self.states=" + JSON.stringify(self.states));
};

AIController.prototype.getStates = function(options) {
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

AIController.prototype.loadBrains = function(brainConfigs, options) {
	var self = this;

	for (var i=0; i<brainConfigs.length; i++) {
		var bc = brainConfigs[i];
		var initState = bc.initState || "idle";

		var brain = BrainApi.create(self.states[initState], options);
		self.brains.push(brain);
	}
	console.log("self.brains=" + JSON.stringify(self.brains));
};

AIController.prototype.runSimulation = function(steps, options, cb){
	var self = this;

	console.log("runSimulation steps=" + steps);

	async.times(steps, function(stepNumber, next){
    	self.stepSimulation(options, function(err){
    		return next(err);
    	});
	}, function(err) {
		console.log("runSimulation self.stepCount=" + self.stepCount);
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

