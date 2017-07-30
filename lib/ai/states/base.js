"use strict";

function AIBaseState(name, options) {
	var self = this;

	self.options = options;

	self.name = name;

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

AIBaseState.prototype._stepState_setGoalValues = function(brain, options, cb){
	var self = this;

	var baseData = brain.userBrain.base || {};
	var baseConditionals = baseData.setGoalValues || [];
	var stateData = brain.userBrain[self.name] || {};
	var stateConditionals = stateData.setGoalValues || [];

	var totalConditional = baseConditionals.concat(stateConditionals);

	console.log(self.name + " _stepState_setGoalValues totalConditional:", totalConditional);
	return cb();
};

AIBaseState.prototype._stepState_act = function(brain, options, cb){
	var self = this;

	var baseData = brain.userBrain.base || {};
	var baseConditionals = baseData.act || [];
	var stateData = brain.userBrain[self.name] || {};
	var stateConditionals = stateData.act || [];

	var totalConditional = baseConditionals.concat(stateConditionals);

	console.log(self.name + " _stepState_act totalConditional:", totalConditional);
	return cb();
};

AIBaseState.prototype._stepState_stateChange = function(brain, options, cb){
	var self = this;

	var baseData = brain.userBrain.base || {};
	var baseConditionals = baseData.stateChange || [];
	var stateData = brain.userBrain[self.name] || {};
	var stateConditionals = stateData.stateChange || [];

	var totalConditional = baseConditionals.concat(stateConditionals);

	console.log(self.name + " _stepState_stateChange totalConditional:", totalConditional);
	var newState = null;
	return cb(null, newState);
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

	stages.act = {text:"Act"};

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

AIBaseState.prototype.step = function(brain, options, cb){
	var self = this;

	var stepLog = [];

	self._stepState_setGoalValues(brain, options, function(err) {
		if (err) {
			return cb(err);
		}

		self._stepState_act(brain, options, function(err) {
			if (err) {
				return cb(err);
			}

			self._stepState_stateChange(brain, options, function(err, newState) {
				if (err) {
					return cb(err);
				}

				return cb(null, {newState:newState, log:stepLog});
			});
		});
	});
};

exports.create = function(options) { return new AIBaseState("base", options); };
exports.AIBaseState = AIBaseState;
