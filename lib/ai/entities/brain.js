"use strict";

var util = require('util');
var AIBaseEntity = require("./base").AIBaseEntity;

function AIBrainEntity(state, options) {
	var self = this;

	AIBaseEntity.call(self, "brain", options);

	self.stats.health = 1;
	self.stats.max_health = 1;
	self.stats.acceleration = 1;
	self.stats.max_speed = 1;

	self.changeState(state);

	self.owner = "";
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

AIBaseEntity.prototype._setupActions = function(){
	var self = this;

	self.actions.selfDestruct =  {
		params: {},
		func: function(params, cb){
			console.log("[AIBaseEntity] " + self.name + " selfDestruct");
			return cb();
		}
	};
};

exports.create = function(state, options) { return new AIBrainEntity(state, options); };
exports.AIBrainEntity = AIBrainEntity;
