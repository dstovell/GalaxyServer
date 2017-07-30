"use strict";

var util = require('util');
var AIBaseEntity = require("./base").AIBaseEntity;

function AIBrainEntity(state, brainConfig, options) {
	var self = this;

	AIBaseEntity.call(self, "brain", options);

	self.stats.health = 1;
	self.stats.max_health = 1;
	self.stats.acceleration = 1;
	self.stats.max_speed = 1;

	self.changeState(state);

	self.owner = brainConfig.owner || "";
	self.userBrain = brainConfig.userBrain || {};
}

util.inherits(AIBrainEntity, AIBaseEntity);

AIBrainEntity.prototype.getName = function(){
	return "Brain";
};

AIBrainEntity.prototype.changeState = function(newState){
	var self = this;
	self.currentState = newState;
};

AIBrainEntity.prototype._setupChecks = function(){
	var self = this;
	AIBaseEntity.prototype._setupChecks.call(self);

	self.checks.isState =  {
		params: {},
		ret: "bool",
		func: function(params){
			return (self.currentState.name === params[0]);
		}
	};
};

AIBrainEntity.prototype._setupActions = function(){
	var self = this;

	self.actions.selfDestruct =  {
		params: {},
		func: function(params, cb){
			console.log("[AIBaseEntity] " + self.name + " selfDestruct");
			return cb();
		}
	};
};

AIBrainEntity.prototype.step = function(options, cb){
	var self = this;

	self.stepCount++;

	self.currentState.step( self, options, function(err, result) {
		return cb(err, result);
	});
};

exports.create = function(state, brainConfig, options) { return new AIBrainEntity(state, brainConfig, options); };
exports.createStub = function(options) { return new AIBrainEntity({}, {}, options); };
exports.AIBrainEntity = AIBrainEntity;
