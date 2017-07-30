"use strict";

var util = require('util');
var AIBaseState = require("./base").AIBaseState;

function AIBuildState(options) {
	var self = this;

	AIBaseState.call(self, "build", options);
}

util.inherits(AIBuildState, AIBaseState);

AIBuildState.prototype.getName = function(){
	return "Build";
};

AIBuildState.prototype._setupEntities = function(){
	var self = this;

	AIBaseState.prototype._setupEntities.call(self);

	self.entities.buildTask =  {
		type:"buildable",
		params: {},
		func: function(brain, params, cb){
			return cb(null, brain ? brain.entity : null);
		}
	};
};

AIBuildState.prototype._entity_buildTask = function(brain, options, cb){
	return cb();
};

exports.create = function(options) { return new AIBuildState(options); };
