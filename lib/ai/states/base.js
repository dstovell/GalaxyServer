"use strict";

function AIBaseState(name, options) {
	var self = this;

	self.options = options;

	self.name = name;

	self.entities = {};
	self._setupEntities();

	self.ai_conditional_evaluator = require("../ai_conditional_evaluator").create(options);

	self.stepState = {setGoalValues:true, act:true, stateChange:true};
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

AIBaseState.prototype._stepState_helper = function(async, stageName, brain, entities, options, cb){
	var self = this;

	var baseData = brain.userBrain.base || {};
	var baseConditionals = baseData[stageName] || [];
	var stateData = brain.userBrain[self.name] || {};
	var stateConditionals = stateData[stageName] || [];

	var totalConditionals = baseConditionals.concat(stateConditionals);

	entities = entities || {};
	if (entities.self == null) {
		entities.self = brain;
	}
	//console.log(self.name + " _stepState_" + stageName + " entities:", entities);

	self.ai_conditional_evaluator.evaluateConditionalsAndCallActions(async, totalConditionals, entities, options, function(err, actionResults) {
		console.log(self.name + " _stepState_" + stageName + " actionResults:", actionResults);

		actionResults = actionResults || [];
		var totalLog = [];
		for (var i=0; i<actionResults.length; i++) {
			var log = actionResults[i].log || [];
			totalLog = totalLog.concat(log);
		}

		return cb(err, totalLog);
	});
};

AIBaseState.prototype._stepState_setGoalValues = function(async, brain, options, cb){
	var self = this;

	var entities = {};
	return self._stepState_helper(async, "setGoalValues", brain, entities, options, cb);
};

AIBaseState.prototype._stepState_act = function(async, brain, options, cb){
	var self = this;

	var entities = {};
	return self._stepState_helper(async, "act", brain, entities, options, cb);
};

AIBaseState.prototype._stepState_stateChange = function(async, brain, options, cb){
	var self = this;

	var baseData = brain.userBrain.base || {};
	var baseConditionals = baseData.stateChange || [];
	var stateData = brain.userBrain[self.name] || {};
	var stateConditionals = stateData.stateChange || [];

	var totalConditional = baseConditionals.concat(stateConditionals);

	//console.log(self.name + " _stepState_stateChange totalConditional:", totalConditional);
	var newState = null;
	return cb(null, newState, []);
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
	var stages = {};

	stages.setGoalValues = {text:"Set Goal Values"};
	if (!self.stepState.setGoalValues) {
		stages.setGoalValues.actions = [];
	}

	stages.act = {text:"Act"};
	if (!self.stepState.act) {
		stages.act.actions = [];
	}

	stages.stateChange = {text:"Change State", params:false, actions:[]};
	var stateChanges = self._getAllowedStateChanges();
	for (var i=0; i<stateChanges.length; i++) {
		stages.stateChange.actions.push({text:("Change to " + stateChanges[i]), value:stateChanges[i]});
	}

	return stages;
};

AIBaseState.prototype._getAllowedStateChanges = function(){
	return [];
};

AIBaseState.prototype.step = function(async, brain, options, cb){
	var self = this;

	var stepLog = [];

	self._stepState_setGoalValues(async, brain, options, function(err, log) {
		if (err) {
			return cb(err);
		}

		stepLog = stepLog.concat(log||[]);

		self._stepState_act(async, brain, options, function(err, log) {
			if (err) {
				return cb(err);
			}

			stepLog = stepLog.concat(log||[]);

			self._stepState_stateChange(async, brain, options, function(err, newState, log) {
				if (err) {
					return cb(err);
				}

				stepLog.concat(log||[]);

				return cb(null, {newState:newState, log:stepLog});
			});
		});
	});
};

exports.create = function(options) { return new AIBaseState("base", options); };
exports.AIBaseState = AIBaseState;
