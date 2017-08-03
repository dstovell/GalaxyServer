"use strict";

var util = require('util');
var AIBaseEntity = require("./base").AIBaseEntity;

function AIBuildableEntity(name, options) {
	var self = this;

	AIBaseEntity.call(self, name, options);

	self.stats.health = 1;
	self.stats.max_health = 1;
	self.stats.acceleration = 0;
	self.stats.max_speed = 0;
}

util.inherits(AIBuildableEntity, AIBaseEntity);

AIBuildableEntity.prototype.getName = function(){
	return "Buildable";
};

AIBuildableEntity.prototype._setupChecks = function(){
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

exports.create = function(name, options) { return new AIBuildableEntity(name, options); };
exports.createStub = function(options) { return new AIBuildableEntity("buildable", options); };
exports.AIBuildableEntity = AIBuildableEntity;
