"use strict";

function AIBaseEntity(name, options) {
	var self = this;

	self.options = options;

	self.name = name;
	self.stepCount = 0;
	self.stats = {};

	self.checks = {};
	self._setupChecks();
	self.actions = {};
	self._setupActions();

	self.stats.health = 1;
	self.stats.max_health = 1;
	self.stats.acceleration = 0;
	self.stats.max_speed = 0;
}

AIBaseEntity.prototype._setupChecks = function(){
	var self = this;

	self.checks.isAlive =  {
		params: {},
		ret: "bool",
		func: function(){
			return (self.stats.health > 0);
		}
	};

	self.checks.isDead =  {
		params: {},
		ret: "bool",
		func: function(){
			return (self.stats.health <= 0);
		}
	};

	self.checks.isDamaged =  {
		params: {},
		ret: "bool",
		func: function(){
			return (self.stats.health < self.stats.max_health);
		}
	};

	self.checks.canMove =  {
		params: {},
		ret: "bool",
		func: function(){
			return (self.stats.acceleration > 0);
		}
	};
};

AIBaseEntity.prototype._setupActions = function(){
	var self = this;

	self.actions.selfDestruct =  {
		params: {},
		func: function(params, cb){
			return cb("AIBaseEntity cannot selfDestruct");
		}
	};
};

AIBaseEntity.prototype.getName = function(){
	var self = this;
	return self.name;
};

AIBaseEntity.prototype._isValidFunc = function(obj, name){
	return ((obj[name] != null) && (typeof obj[name] === 'function'));
};

AIBaseEntity.prototype.getValues = function(obj){
	var self = this;

	var allData = [];
	for (var k in obj) {
		if (self._isValidFunc(obj[k].func)) {
			continue;
		}

		var data = {value:k, text:k, params:obj[k].params};
		if (obj[k].ret != null) {
			data.ret = obj[k].ret;
		}
		allData.push(data);
	}
	return allData;
};

AIBaseEntity.prototype.getChecks = function(){
	var self = this;
	return self.getValues(self.checks);
};

AIBaseEntity.prototype.getActions = function(){
	var self = this;
	return self.getValues(self.actions);
};

AIBaseEntity.prototype.hasCheck = function(name){
	var self = this;
	return (self.checks[name] != null);
};

AIBaseEntity.prototype.hasAction = function(name){
	var self = this;
	return (self.actions[name] != null);
};

AIBaseEntity.prototype.runCheck = function(name, params){
	var self = this;
	if (!self.hasCheck(name)) {
		return false;
	}
	return self.checks[name].call(self, params);
};

AIBaseEntity.prototype.runAction = function(name, params, cb){
	var self = this;
	if (!self.hasAction(name)) {
		return false;
	}
	return self.actions[name].call(self, params, cb);
};

exports.create = function(options) { return new AIBaseEntity("base", options); };
exports.AIBaseEntity = AIBaseEntity;
