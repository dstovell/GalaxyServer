"use strict";

var util = require('util');
var AIBaseEntity = require("./base").AIBaseEntity;

function AIOrbitableEntity(name, options) {
	var self = this;

	AIBaseEntity.call(self, name, options);

	self.stats.health = 1;
	self.stats.max_health = 1;
	self.stats.acceleration = 0;
	self.stats.max_speed = 0;
}

util.inherits(AIOrbitableEntity, AIBaseEntity);

AIOrbitableEntity.prototype.getName = function(){
	return "Orbitable";
};

AIOrbitableEntity.prototype._setupChecks = function(){
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

exports.create = function(name, options) { return new AIOrbitableEntity(name, options); };
exports.createStub = function(options) { return new AIOrbitableEntity("orbitable", options); };
exports.AIOrbitableEntity = AIOrbitableEntity;
