"use strict";

var util = require('util');
var AIBaseEntity = require("./base").AIBaseEntity;

function AIStarEntity(starConfig, options) {
	var self = this;

	AIBaseEntity.call(self, "star", options);

	self.stats.health = 1;
	self.stats.max_health = 1;
	self.stats.acceleration = 0;
	self.stats.max_speed = 0;
}

util.inherits(AIStarEntity, AIBaseEntity);

AIStarEntity.prototype.getName = function(){
	return "Star";
};

AIStarEntity.prototype._setupChecks = function(){
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

exports.create = function(starConfig, options) { return new AIStarEntity(starConfig, options); };
exports.createStub = function(options) { return new AIStarEntity({}, options); };
exports.AIStarEntity = AIStarEntity;
