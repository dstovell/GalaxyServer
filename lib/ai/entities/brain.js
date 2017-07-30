"use strict";

var util = require('util');
var AIBaseEntity = require("./base").AIBaseEntity;

function AIBrainEntity(state, options) {
	var self = this;

	AIBaseEntity.call(self, "brain", state, options);

	self.health = 1;
}

util.inherits(AIBrainEntity, AIBaseEntity);

AIBrainEntity.prototype.getName = function(){
	return "Brain";
};

AIBrainEntity.prototype._check_isAlive = function(){
	var self = this;
	return (self.health > 0);
};

AIBrainEntity.prototype._check_isDead = function(){
	var self = this;
	return !self._check_isAlive();
};

AIBrainEntity.prototype._check_canMove = function(){
	return true;
};

AIBrainEntity.prototype._action_selfDestruct = function(cb){
	var self = this;
	console.log("[AIBaseEntity] " + self.name + " selfDestruct");
	return cb();
};

exports.create = function(state, options) { return new AIBrainEntity(state, options); };
exports.AIBrainEntity = AIBrainEntity;
