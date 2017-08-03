"use strict";

var util = require('util');
var AIOrbitableEntity = require("./orbitable").AIOrbitableEntity;

function AIPlanetEntity(planetConfig, options) {
	var self = this;

	AIOrbitableEntity.call(self, "planet", options);

	self.stats.health = 1;
	self.stats.max_health = 1;
	self.stats.acceleration = 0;
	self.stats.max_speed = 0;
}

util.inherits(AIPlanetEntity, AIOrbitableEntity);

AIPlanetEntity.prototype.getName = function(){
	return "Planet";
};

AIPlanetEntity.prototype._setupChecks = function(){
	var self = this;
	AIOrbitableEntity.prototype._setupChecks.call(self);

	self.checks.isState =  {
		params: {},
		ret: "bool",
		func: function(params){
			return (self.currentState.name === params[0]);
		}
	};
};

exports.create = function(planetConfig, options) { return new AIPlanetEntity(planetConfig, options); };
exports.createStub = function(options) { return new AIPlanetEntity({}, options); };
exports.AIPlanetEntity = AIPlanetEntity;
