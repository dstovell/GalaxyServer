"use strict";

function AIBaseEntity(name, state, options) {
	var self = this;

	self.options = options;

	self.name = name;
	self.currentState = state;
	self.stepCount = 0;
}

AIBaseEntity.prototype.changeState = function(newState){
	var self = this;
	self.currentState = newState;
};

AIBaseEntity.prototype.getName = function(){
	var self = this;
	return self.name;
};

AIBaseEntity.prototype.getFunctions = function(prefix){
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

AIBaseEntity.prototype.getChecks = function(){
	var self = this;
	return self.getFunctions("_checks_");
};

AIBaseEntity.prototype.getActions = function(){
	var self = this;
	return self.getFunctions("_actions_");
};

AIBaseEntity.prototype._check_isAlive = function(){
	return false;
};

AIBaseEntity.prototype._check_isDead = function(){
	return false;
};

AIBaseEntity.prototype._check_canMove = function(){
	return false;
};

AIBaseEntity.prototype._action_selfDestruct = function(cb){
	return cb("AIBaseEntity cannot selfDestruct");
};

exports.create = function(state, options) { return new AIBaseEntity("base", state, options); };
exports.AIBaseEntity = AIBaseEntity;
