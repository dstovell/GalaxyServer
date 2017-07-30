"use strict";

var async = require("async");
var BrainApi = require("./brain");

function AIController(options) {
	var self = this;
	self.options = options;

	self.stateMachine = require("./ai_state_machine").create(options);

	self.userBrainsCollectionName = "user_brains";
	self.userBrainsCollection = options.db.collection(self.userBrainsCollectionName);
	//self.userBrainsCollection.ensureIndex({starId: 1}, {unique: true}, function() {});
}

AIController.prototype.getBrain = function(id, cb) {
	var self = this;

	self.userBrainsCollection.findOne({_id:id}, function( err, brain ) {
		return cb(err, brain, self.userBrainsCollectionName);
	});
};

AIController.prototype.loadStates = function(options) {
	var self = this;

	var states = {};
	function loadState(name) {
		var path = "../../lib/ai/states/"+name;
		console.log("loadState: " + name + " path: " + path);
		states[name] = require(path).create(options);
	}

	loadState("base");
	loadState("idle");
	loadState("build");

	return self.stateMachine.loadStates(states, options);
};

AIController.prototype.getStates = function(options) {
	var self = this;
	return self.stateMachine.getStates(options);
};

AIController.prototype.loadBrains = function(brainConfigs, options) {
	var self = this;
	return self.stateMachine.loadBrains(BrainApi, brainConfigs, options);
};

AIController.prototype.runSimulation = function(steps, options, cb){
	var self = this;
	return self.stateMachine.runSimulation(async, steps, options, cb);
};



var instance = null;
exports.create = function(options) {
	if( instance == null ) {
		instance = new AIController(options);
	}
	return instance;
};

